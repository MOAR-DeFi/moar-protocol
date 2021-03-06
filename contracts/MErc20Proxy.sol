// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "./MToken.sol";
import "./Interfaces/MErc20ProxyInterface.sol";
import "./Interfaces/MErc20Interface.sol";
import "./CErc20.sol";
import "./Moartroller.sol";
import "./InterestRateModel/AbstractInterestRateModel.sol";
import "./Interfaces/EIP20Interface.sol";
import "./Utils/SafeEIP20.sol";

/**
 * @title MOAR's MErc20 Contract
 * @notice MTokens which wrap an EIP-20 underlying
 */
contract MErc20Proxy is MErc20ProxyInterface, Initializable{

    using SafeEIP20 for EIP20Interface;

    MErc20 public merc20;

    /**
     * @notice 
     * @param _merc20 The address of merc20 asset
    
     */
    function initialize (
        address _merc20
    ) public initializer {
        merc20 = MErc20(_merc20);
    }

    /*** User Interface ***/

    /**
     * @notice Sender supplies assets into the market and receives mTokens in exchange
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param mintAmount The amount of the underlying asset to supply
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function mint(uint mintAmount) external override returns (uint) {
        return merc20.mint(msg.sender, mintAmount);
    }

    /**
     * @notice Sender redeems mTokens in exchange for the underlying asset
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param redeemTokens The number of mTokens to redeem into underlying
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function redeem(
        uint redeemTokens,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external override returns (uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = PriceOracle(Moartroller(merc20.moartroller()).oracle()).getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return merc20.redeem(msg.sender, redeemTokens, _accountAssetsPriceMantissa);
    }

    /**
     * @notice Sender redeems mTokens in exchange for a specified amount of underlying asset
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param redeemAmount The amount of underlying to redeem
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function redeemUnderlying(
        uint redeemAmount,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external override returns (uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = PriceOracle(Moartroller(merc20.moartroller()).oracle()).getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return merc20.redeemUnderlying(msg.sender, redeemAmount, _accountAssetsPriceMantissa);
    }

    /**
      * @notice Sender borrows assets from the protocol to their own address
      * @param borrowAmount The amount of the underlying asset to borrow
      * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
      * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
      * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
      * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
      * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
      */
    function borrow(
        uint borrowAmount,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external override returns (uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = PriceOracle(Moartroller(merc20.moartroller()).oracle()).getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return merc20.borrow(msg.sender, borrowAmount, _accountAssetsPriceMantissa);
    }

    /**
      * @notice Sender borrows assets from the protocol to somebodies address
      * @param borrower The address of assets receiver 
      * @param borrowAmount The amount of the underlying asset to borrow
      * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
      * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
      * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
      * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
      * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
      */
    function borrowFor(
        address payable borrower, 
        uint borrowAmount,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external override returns (uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = PriceOracle(Moartroller(merc20.moartroller()).oracle()).getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return merc20.borrowFor(borrower, borrowAmount, _accountAssetsPriceMantissa);
    }

    /**
     * @notice Sender repays their own borrow
     * @param repayAmount The amount to repay
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function repayBorrow(uint repayAmount) external override returns (uint) {
        return merc20.repayBorrow(msg.sender, repayAmount);
    }

    /**
     * @notice Sender repays a borrow belonging to borrower.
     * @param borrower the account with the debt being payed off
     * @param repayAmount The amount to repay
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function repayBorrowBehalf(address borrower, uint repayAmount) external override returns (uint) {
        return merc20.repayBorrowBehalf(msg.sender, borrower, repayAmount);
    }

 
    /**
     * @notice The sender liquidates the borrowers collateral.
     *  The collateral seized is transferred to the liquidator.
     * @param borrower The borrower of this mToken to be liquidated
     * @param repayAmount The amount of the underlying borrowed asset to repay
     * @param mTokenCollateral The market in which to seize collateral from the borrower
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function liquidateBorrow(
        address borrower, 
        uint repayAmount, 
        MToken mTokenCollateral,
        address[] calldata mTokenAssets, 
        uint256[] calldata accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external override returns (uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length-2);    
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length - 2; i++){
            _accountAssetsPriceMantissa[i] = PriceOracle(Moartroller(merc20.moartroller()).oracle()).getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        uint256[] memory _mTokenPriceBorrowedCollateral = new uint256[](2);
        uint256 length = mTokenAssets.length;
        _mTokenPriceBorrowedCollateral[0] = PriceOracle(Moartroller(merc20.moartroller()).oracle()).getUnderlyingPriceSigned(mTokenAssets[length - 2], accountAssetsPriceMantissa[length - 2], accountAssetsPriceValidTo, accountAssetsPriceSignatures[length - 2]);
        _mTokenPriceBorrowedCollateral[1] = PriceOracle(Moartroller(merc20.moartroller()).oracle()).getUnderlyingPriceSigned(mTokenAssets[length - 1], accountAssetsPriceMantissa[length - 1], accountAssetsPriceValidTo, accountAssetsPriceSignatures[length - 1]);
        
        return _liquidateBorrow(
            borrower, 
            repayAmount, 
            mTokenCollateral,
            _accountAssetsPriceMantissa,
            _mTokenPriceBorrowedCollateral
        );
    }

    /**
     * @notice The sender liquidates the borrowers collateral.
     *  The collateral seized is transferred to the liquidator.
     * @param borrower The borrower of this mToken to be liquidated
     * @param repayAmount The amount of the underlying borrowed asset to repay
     * @param mTokenCollateral The market in which to seize collateral from the borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of (array of addresses of mToken asset). The prices scaled by 10**18
     * @param mTokenPriceBorrowedCollateral  - pair of assets prices which were {1) borrowed by the borrower | 2) used as collateral and will be seized } 
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _liquidateBorrow(
        address borrower, 
        uint repayAmount, 
        MToken mTokenCollateral,
        uint256[] memory accountAssetsPriceMantissa, 
        uint256[] memory mTokenPriceBorrowedCollateral
    ) private returns (uint) {

        return merc20.liquidateBorrow(
            msg.sender,
            borrower, 
            repayAmount, 
            mTokenCollateral,
            accountAssetsPriceMantissa,
            mTokenPriceBorrowedCollateral
        );
    }

    /**
     * @notice A public function to sweep accidental ERC-20 transfers to this contract. Tokens are sent to admin (timelock)
     * @param token The address of the ERC-20 token to sweep
     */
    function sweepToken(EIP20Interface token) override external {
        return merc20.sweepToken(token);
    }

    /**
     * @notice The sender adds to reserves.
     * @param addAmount The amount fo underlying token to add as reserves
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _addReserves(uint addAmount) external override returns (uint) {
        // return _addReservesInternal(addAmount);
        return merc20._addReserves(addAmount);
    }

}
