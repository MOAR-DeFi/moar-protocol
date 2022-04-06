// SPDX-License-Identifier: BSD-3-Clause
// Thanks to Compound for their foundational work in DeFi and open-sourcing their code from which we build upon.

pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;
// import "hardhat/console.sol";

import "@openzeppelin/contracts/proxy/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/TransparentUpgradeableProxy.sol";

import "./MToken.sol";
import "./Utils/ErrorReporter.sol";
import "./Utils/ExponentialNoError.sol";
import "./Interfaces/PriceOracle.sol";
import "./Interfaces/MoartrollerProxyInterface.sol";
import "./Interfaces/MProxyInterface.sol";
import "./Moartroller.sol";
import "./Governance/UnionGovernanceToken.sol";
import "./MProtection.sol";
import "./Interfaces/LiquidityMathModelInterface.sol";
import "./LiquidityMathModelV1.sol";
import "./Utils/SafeEIP20.sol";
import "./Interfaces/EIP20Interface.sol";
import "./Interfaces/LiquidationModelInterface.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title MOAR's Moartroller Contract
 * @author MOAR
 */
contract MoartrollerProxy is MoartrollerProxyInterface, Initializable, OwnableUpgradeable {

    using SafeEIP20 for EIP20Interface;

    Moartroller public moartroller;
    PriceOracle public priceOracle;

    /// @notice Indicator that this is a Moartroller contract (for inspection)

    // Custom initializer
    function initialize(
        address _moartroller,
        address _priceOracle
    ) public initializer {
        __Ownable_init();
        moartroller = Moartroller(_moartroller);
        priceOracle = PriceOracle(_priceOracle);
    }

    /*** Owner functions ***/

    function setMoartroller(address newMoartroller) public onlyOwner {
        require(newMoartroller != address(0), "invalidNewMoartroller");
        moartroller = Moartroller(newMoartroller);
    }

    function setPriceOracle(address newPriceOracle) public onlyOwner {
        require(newPriceOracle != address(0), "invalidNewPriceOracle");
        priceOracle = PriceOracle(newPriceOracle);
    }
    /*** Assets You Are In ***/

    /**
     * @notice Returns the assets an account has entered
     * @param account The address of the account to pull assets for
     * @return A dynamic list with the assets the account has entered
     */
    function getAssetsIn(address account) external view returns (MToken[] memory) {
        return moartroller.getAssetsIn(account);
    }

    /**
     * @notice Returns whether the given account is entered in the given asset
     * @param account The address of the account to check
     * @param mToken The mToken to check
     * @return True if the account is in the asset, otherwise false.
     */
    function checkMembership(address account, MToken mToken) external view returns (bool) {
        return moartroller.checkMembership(account, mToken);
    }

    /**
     * @notice Add assets to be included in account liquidity calculation
     * @param mTokens The list of addresses of the mToken markets to be enabled
     * @return Success indicator for whether each corresponding market was entered
     */
    function enterMarkets(address[] memory mTokens) public override returns (uint[] memory) {

        return moartroller.enterMarkets(msg.sender, mTokens);
    }

    /**
     * @notice Removes asset from sender's account liquidity calculation
     * @dev Sender must not have an outstanding borrow balance in the asset,
     *  or be providing necessary collateral for an outstanding borrow.
     * @param mTokenAddress The address of the asset to be removed
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     * @return Whether or not the account successfully exited the market
     */
    function exitMarket(
        address mTokenAddress, 
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external override returns (uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = priceOracle.getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return moartroller.exitMarket(msg.sender, mTokenAddress, _accountAssetsPriceMantissa);
    }

    // /*** Policy Hooks ***/

    /**
     * @notice Checks if the account should be allowed to mint tokens in the given market
     * @param mToken The market to verify the mint against
     * @param minter The account which would get the minted tokens
     * @param mintAmount The amount of underlying being supplied to the market in exchange for tokens
     * @return 0 if the mint is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
    function mintAllowed(
        address mToken, 
        address minter, 
        uint mintAmount
    ) external override returns (uint) {
        return moartroller.mintAllowed(mToken, minter, mintAmount);
    }

    /**
     * @notice Checks if the account should be allowed to redeem tokens in the given market
     * @param mToken The market to verify the redeem against
     * @param redeemer The account which would redeem the tokens
     * @param redeemTokens The number of mTokens to exchange for the underlying asset in the market
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     * @return 0 if the redeem is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
    function redeemAllowed(
        address mToken, 
        address redeemer, 
        uint redeemTokens,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external override returns (uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = priceOracle.getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return moartroller.redeemAllowed(mToken, redeemer, redeemTokens, _accountAssetsPriceMantissa);
    }

    /**
     * @notice Validates redeem and reverts on rejection. May emit logs.
     * @param mToken Asset being redeemed
     * @param redeemer The address redeeming the tokens
     * @param redeemAmount The amount of the underlying asset being redeemed
     * @param redeemTokens The number of tokens being redeemed
     */
    function redeemVerify(address mToken, address redeemer, uint redeemAmount, uint redeemTokens) external override {
        return moartroller.redeemVerify(mToken, redeemer, redeemAmount, redeemTokens);
    }

    /**
     * @notice Checks if the account should be allowed to borrow the underlying asset of the given market
     * @param mToken The market to verify the borrow against
     * @param borrower The account which would borrow the asset
     * @param borrowAmount The amount of underlying the account would borrow
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     * @return 0 if the borrow is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
    function borrowAllowed(
        address mToken, 
        address borrower, 
        uint borrowAmount,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external override returns (uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = priceOracle.getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return moartroller.borrowAllowed(mToken, borrower, borrowAmount, _accountAssetsPriceMantissa);
    }

    /**
     * @notice Checks if the account should be allowed to repay a borrow in the given market
     * @param mToken The market to verify the repay against
     * @param payer The account which would repay the asset
     * @param borrower The account which would borrowed the asset
     * @param repayAmount The amount of the underlying asset the account would repay
     * @return 0 if the repay is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
    function repayBorrowAllowed(
        address mToken,
        address payer,
        address borrower,
        uint repayAmount
    ) external override returns (uint) {
       return moartroller.repayBorrowAllowed(mToken, payer, borrower, repayAmount);
    }

    /**
     * @notice Checks if the liquidation should be allowed to occur
     * @param mTokenBorrowed Asset which was borrowed by the borrower
     * @param mTokenCollateral Asset which was used as collateral and will be seized
     * @param liquidator The address repaying the borrow and seizing the collateral
     * @param borrower The address of the borrower
     * @param repayAmount The amount of underlying being repaid
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     */
    function liquidateBorrowAllowed(
        address mTokenBorrowed,
        address mTokenCollateral,
        address liquidator,
        address borrower,
        uint repayAmount,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external override returns (uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = priceOracle.getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return moartroller.liquidateBorrowAllowed(mTokenBorrowed, mTokenCollateral, liquidator, borrower, repayAmount, _accountAssetsPriceMantissa);
    }

    /**
     * @notice Checks if the seizing of assets should be allowed to occur
     * @param mTokenCollateral Asset which was used as collateral and will be seized
     * @param mTokenBorrowed Asset which was borrowed by the borrower
     * @param liquidator The address repaying the borrow and seizing the collateral
     * @param borrower The address of the borrower
     * @param seizeTokens The number of collateral tokens to seize
     */
    function seizeAllowed(
        address mTokenCollateral,
        address mTokenBorrowed,
        address liquidator,
        address borrower,
        uint seizeTokens
    ) external override returns (uint) {
        return moartroller.seizeAllowed(mTokenCollateral, mTokenBorrowed, liquidator, borrower, seizeTokens);
    }

    /**
     * @notice Checks if the account should be allowed to transfer tokens in the given market
     * @param mToken The market to verify the transfer against
     * @param src The account which sources the tokens
     * @param dst The account which receives the tokens
     * @param transferTokens The number of mTokens to transfer
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     * @return 0 if the transfer is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
    function transferAllowed(
        address mToken, 
        address src, 
        address dst,
        uint transferTokens,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external override returns (uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = priceOracle.getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return moartroller.transferAllowed(mToken, src, dst, transferTokens, _accountAssetsPriceMantissa);
    }

    // /*** Liquidity/Liquidation Calculations ***/

    /**
     * @notice Determine the current account liquidity wrt collateral requirements
     * @param account The account to determine liquidity for
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     * @return (possible error code (semi-opaque),
                account liquidity in excess of collateral requirements,
     *          account shortfall below collateral requirements)
     */
    function getAccountLiquidity(
        address account,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) public view returns (uint, uint, uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = priceOracle.getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return moartroller.getAccountLiquidity(account, _accountAssetsPriceMantissa);
    }

    /**
     * @notice Determine what the account liquidity would be if the given amounts were redeemed/borrowed
     * @param mTokenModify The market to hypothetically redeem/borrow in
     * @param account The account to determine liquidity for
     * @param redeemTokens The number of tokens to hypothetically redeem
     * @param borrowAmount The amount of underlying to hypothetically borrow
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     * @return (possible error code (semi-opaque),
                hypothetical account liquidity in excess of collateral requirements,
     *          hypothetical account shortfall below collateral requirements)
     */
    function getHypotheticalAccountLiquidity(
        address account,
        address mTokenModify,
        uint redeemTokens,
        uint borrowAmount,
         address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) public view returns (uint, uint, uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = priceOracle.getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return moartroller.getHypotheticalAccountLiquidity(account, mTokenModify, redeemTokens, borrowAmount, _accountAssetsPriceMantissa);
    }

    /**
     * @notice Returns the value of possible optimization left for asset
     * @param asset The MToken address
     * @param account The owner of asset
     * @param assetPrice the price multiplied by 10**18
     * @param assetPriceValidTo the timestamp in seconds that define the valid to period
     * @param assetPriceSignature the sign of trusted thirdparty
     * @return The value of possible optimization
     */
    function getMaxOptimizableValue(
        MToken asset,
        address account,
        uint256 assetPrice,
        uint256 assetPriceValidTo,
        bytes calldata assetPriceSignature
    ) public view returns(uint){
        uint256 _assetPrice = priceOracle.getUnderlyingPriceSigned(address(asset), assetPrice, assetPriceValidTo, assetPriceSignature);
        return moartroller.getMaxOptimizableValue(asset, account, _assetPrice);
    }

    /**
     * @notice Returns the value of hypothetical optimization (ignoring existing optimization used) for asset
     * @param asset The MToken address
     * @param account The owner of asset
     * @param assetPrice the price multiplied by 10**18
     * @param assetPriceValidTo the timestamp in seconds that define the valid to period
     * @param assetPriceSignature the sign of trusted thirdparty
     * @return The amount of hypothetical optimization
     */
    function getHypotheticalOptimizableValue(
        MToken asset, 
        address account,
        uint256 assetPrice,
        uint256 assetPriceValidTo,
        bytes calldata assetPriceSignature
    ) public view returns(uint){
        uint256 _assetPrice = priceOracle.getUnderlyingPriceSigned(address(asset), assetPrice, assetPriceValidTo, assetPriceSignature);
        return moartroller.getHypotheticalOptimizableValue(asset, account, _assetPrice);
    }

    /**
     * @notice Calculate number of tokens of collateral asset of the given user to seize given an underlying amount
         * this function takes amount of collateral asset that is locked under protection.
     * @param mTokenBorrowed Asset which was borrowed by the borrower
     * @param mTokenCollateral Asset which was used as collateral and will be seized
     * @param actualRepayAmount The amount of underlying being repaid
     * @param account The account to determine liquidity for
     * @param mTokenBorrowedCollateralPrice  - pair of assets prices which were {1) borrowed by the borrower | 2) used as collateral and will be seized } 
     * @param priceValidTo - the timestamp in seconds of prices validity
     * @param mTokenBorrowedCollateralPriceSignature - array of ECDSA signatures of each price in `mTokenBorrowedCollateralPrice`
     * @return (possible errorCode | number of mTokenCollateral tokens to be seized in a liquidation)
     */
    function liquidateCalculateSeizeUserTokens(
        address mTokenBorrowed, 
        address mTokenCollateral,
        uint actualRepayAmount, 
        address account,
        uint256[] calldata mTokenBorrowedCollateralPrice,
        uint256 priceValidTo,
        bytes[] calldata mTokenBorrowedCollateralPriceSignature
    ) external override view returns (uint, uint) {
        uint256[] memory _mTokenBorrowedCollateralPrice = new uint256[](2);
        _mTokenBorrowedCollateralPrice[0] = priceOracle.getUnderlyingPriceSigned(mTokenBorrowed, mTokenBorrowedCollateralPrice[0], priceValidTo, mTokenBorrowedCollateralPriceSignature[0]);
        _mTokenBorrowedCollateralPrice[1] = priceOracle.getUnderlyingPriceSigned(mTokenCollateral, mTokenBorrowedCollateralPrice[1], priceValidTo, mTokenBorrowedCollateralPriceSignature[1]);
        
        return moartroller.liquidateCalculateSeizeUserTokens(
            mTokenBorrowed, 
            mTokenCollateral, 
            actualRepayAmount, 
            account,
            _mTokenBorrowedCollateralPrice
        );
    }


    /**
     * @notice Returns the amount of a specific asset that is locked under all c-ops
     * @param asset The MToken address
     * @param account The owner of asset
     * @return The amount of asset locked under c-ops
     */
    function getUserLockedAmount(MToken asset, address account) public override view returns(uint) {
        return moartroller.getUserLockedAmount(asset, account);
    }

    // /*** MOAR Distribution ***/

    /**
     * @notice Calculate additional accrued MOAR for a contributor since last accrual
     * @param contributor The address to calculate contributor rewards for
     */
    function updateContributorRewards(address contributor) public {
        return moartroller.updateContributorRewards(contributor);
    }

    /**
     * @notice Claim all the MOAR accrued by holder in all markets
     * @param holder The address to claim MOAR for
     */
    function claimMoarReward(address holder) public {
        return moartroller.claimMoarReward(holder);
    }

    function updateMoarReward(address holder) public returns (uint256){
        return moartroller.updateMoarReward(holder);
    }

    /**
     * @notice Claim all the MOAR accrued by holder in the specified markets
     * @param holder The address to claim MOAR for
     * @param mTokens The list of markets to claim MOAR in
     */
    function claimMoar(address holder, MToken[] memory mTokens) public {
        return moartroller.claimMoar(holder, mTokens);
    }

    function updateClaimMoar(address[] memory holders, MToken[] memory mTokens, bool borrowers, bool suppliers) public {
        return moartroller.updateClaimMoar(holders, mTokens, borrowers, suppliers);
    }

    /**
     * @notice Claim all MOAR accrued by the holders
     * @param holders The addresses to claim MOAR for
     * @param mTokens The list of markets to claim MOAR in
     * @param borrowers Whether or not to claim MOAR earned by borrowing
     * @param suppliers Whether or not to claim MOAR earned by supplying
     */
    function claimMoar(address[] memory holders, MToken[] memory mTokens, bool borrowers, bool suppliers) public {
        return moartroller.claimMoar(holders, mTokens, borrowers, suppliers);
    }

    // /*** MOAR Distribution Admin ***/

    /**
     * @notice Transfer MOAR to the recipient
     * @dev Note: If there is not enough MOAR, we do not perform the transfer all.
     * @param recipient The address of the recipient to transfer MOAR to
     * @param amount The amount of MOAR to (possibly) transfer
     */
    function _grantMoar(address recipient, uint amount) public {
        return moartroller._grantMoar(recipient, amount);
    }

    /**
     * @notice Set MOAR speed for a single market
     * @param mToken The market whose MOAR speed to update
     * @param moarSpeed New MOAR speed for market
     */
    function _setMoarSpeed(MToken mToken, uint moarSpeed) public {
        return moartroller._setMoarSpeed(mToken, moarSpeed);
    }

    /**
     * @notice Set MOAR speed for a single contributor
     * @param contributor The contributor whose MOAR speed to update
     * @param moarSpeed New MOAR speed for contributor
     */
    function _setContributorMoarSpeed(address contributor, uint moarSpeed) public {
        return moartroller._setContributorMoarSpeed(contributor, moarSpeed);
    }

    /**
     * @notice Set liquidity math model implementation
     * @param mathModel the math model implementation
     */
    function _setLiquidityMathModel(LiquidityMathModelInterface mathModel) public {
        return moartroller._setLiquidityMathModel(mathModel);
    }

    /**
     * @notice Set liquidation model implementation
     * @param newLiquidationModel the liquidation model implementation
     */
    function _setLiquidationModel(LiquidationModelInterface newLiquidationModel) public {
        return moartroller._setLiquidationModel(newLiquidationModel);
    }

    function _setMoarToken(address moarTokenAddress) public {
        return moartroller._setMoarToken(moarTokenAddress);
    }

    function _setMProxy(address mProxyAddress) public {
        return moartroller._setMProxy(mProxyAddress);
    }

    /**
     * @notice Add new privileged address 
     * @param privilegedAddress address to add
     */
    function _addPrivilegedAddress(address privilegedAddress) public {
        return moartroller._addPrivilegedAddress(privilegedAddress);
    }

    /**
     * @notice Remove privileged address 
     * @param privilegedAddress address to remove
     */
    function _removePrivilegedAddress(address privilegedAddress) public {
        return moartroller._removePrivilegedAddress(privilegedAddress);
    }

    /**
     * @notice Check if address if privileged
     * @param privilegedAddress address to check
     */
    function isPrivilegedAddress(address privilegedAddress) public view returns (bool) {
        return moartroller.privilegedAddresses(privilegedAddress) == 1;
    }
    
    /**
     * @notice Return all of the markets
     * @dev The automatic getter may be used to access an individual market.
     * @return The list of market addresses
     */
    function getAllMarkets() public view returns (MToken[] memory) {
        return moartroller.getAllMarkets();
    }

    // function getBlockNumber() public view returns (uint) {
    //     return block.number;
    // }

    // /**
    //  * @notice Return the address of the MOAR token
    //  * @return The address of MOAR
    //  */
    // function getMoarAddress() public view returns (address) {
    //     return moartroller.getMoarAddress();
    // }

    // function getContractVersion() external view returns(string memory){
    //     return moartroller.getContractVersion();
    // }
}
