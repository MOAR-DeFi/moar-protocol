// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "./MToken.sol";
import "./Moartroller.sol";
import "./InterestRateModel/AbstractInterestRateModel.sol";
import "./Interfaces/WETHInterface.sol";
import "./Interfaces/EIP20Interface.sol";
import "./Utils/SafeEIP20.sol";
import "./Interfaces/MWethInterface.sol";


/**
 * @title MOAR's MEther Contract
 * @notice MToken which wraps Ether
 * @author MOAR
 */
contract MWethProxy {

    using SafeEIP20 for EIP20Interface;

    /// @notice address of MWeth contract 
    address payable public mweth;

    /// @notice PriceOracle contract
    PriceOracle public priceOracle;

    /// @notice contract admin address
    address public admin;

    /**
     * @notice Construct a new MWethProxy contract for MEther money market
     * @param priceOracle_ address of PriceOracle contract
     * @param admin_ contract admin address
     */
    constructor(
        // address payable mweth_,
        address priceOracle_,
        address admin_
    ) public {
        // mweth = MWeth(mweth_);
        priceOracle = PriceOracle(priceOracle_);
        admin = admin_;
    }

    /**
     * @notice Sets the MWeth contract implementation for MWethProxy contract
     * @param mweth_ address of MWeth contract
     */
    function setMWethImplementation(address payable mweth_) external {
        require(msg.sender == admin, "caller is not an admin");
        mweth = mweth_;
    }

    /*** User Interface ***/

    /**
     * @notice Sender supplies assets into the market and receives mTokens in exchange
     * @dev Reverts upon any failure
     */
    function mint() external payable {
        MWethInterface(mweth).mint{value: msg.value}(msg.sender);
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
    ) external returns (uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = priceOracle.getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return MWethInterface(mweth).redeem(msg.sender, redeemTokens, _accountAssetsPriceMantissa);
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
    ) external  returns (uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = priceOracle.getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return MWethInterface(mweth).redeemUnderlying(msg.sender, redeemAmount, _accountAssetsPriceMantissa);
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
    ) external returns (uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = priceOracle.getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return MWethInterface(mweth).borrow(msg.sender, borrowAmount, _accountAssetsPriceMantissa);
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
    ) external returns (uint) {
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length; i++){
            _accountAssetsPriceMantissa[i] = priceOracle.getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        return MWethInterface(mweth).borrowFor(borrower, borrowAmount, _accountAssetsPriceMantissa);
    }

    /**
     * @notice Sender repays their own borrow
     * @dev Reverts upon any failure
     */
    function repayBorrow() external payable returns(uint){
        return MWethInterface(mweth).repayBorrow{value : msg.value}(msg.sender);
    }

    /**
     * @notice Sender repays a borrow belonging to borrower
     * @dev Reverts upon any failure
     * @param borrower the account with the debt being payed off
     */
    function repayBorrowBehalf(address borrower) external payable returns (uint){
        return MWethInterface(mweth).repayBorrowBehalf{value : msg.value}(msg.sender, borrower);
    }

    /**
     * @notice The sender liquidates the borrowers collateral.
     *  The collateral seized is transferred to the liquidator.
     * @dev Reverts upon any failure
     * @param borrower The borrower of this mToken to be liquidated
     * @param mTokenCollateral The market in which to seize collateral from the borrower
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     */
    function liquidateBorrow(
        address borrower, 
        // uint repayAmount,
        MToken mTokenCollateral,
        address[] calldata mTokenAssets, 
        uint256[] calldata accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
        // uint256[] calldata mTokenBorrowedCollateralPriceMantissa
    ) external payable returns (uint){
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length-2);    
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length - 2; i++){
            _accountAssetsPriceMantissa[i] = priceOracle.getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], accountAssetsPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        uint256[] memory _mTokenPriceBorrowedCollateral = new uint256[](2);
        uint256 length = mTokenAssets.length;
        _mTokenPriceBorrowedCollateral[0] = priceOracle.getUnderlyingPriceSigned(mTokenAssets[length - 2], accountAssetsPriceMantissa[length - 2], accountAssetsPriceValidTo, accountAssetsPriceSignatures[length - 2]);
        _mTokenPriceBorrowedCollateral[1] = priceOracle.getUnderlyingPriceSigned(mTokenAssets[length - 1], accountAssetsPriceMantissa[length - 1], accountAssetsPriceValidTo, accountAssetsPriceSignatures[length - 1]);
        
        return _liquidateBorrow(
            // msg.sender,
            borrower, 
            // repayAmount, 
            msg.value,
            mTokenCollateral,
            _accountAssetsPriceMantissa,
            _mTokenPriceBorrowedCollateral
        );
        // return mweth.liquidateBorrow{value : msg.value}(
        //     msg.sender,
        //     borrower, 
        //     // repayAmount, 
        //     mTokenCollateral,
        //     _accountAssetsPriceMantissa,
        //     _mTokenPriceBorrowedCollateral
        // );
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
    ) private  returns (uint) {

        return MWethInterface(mweth).liquidateBorrow{value : repayAmount}(
            msg.sender,
            borrower, 
            // repayAmount,
            // msg.value,
            mTokenCollateral,
            accountAssetsPriceMantissa,
            mTokenPriceBorrowedCollateral
        );
    }

    /**
     * @notice The sender adds to reserves.
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _addReserves() external payable returns (uint) {
        return MWethInterface(mweth)._addReserves{value : msg.value}();
        // WETHInterface(underlying).deposit{value : msg.value}();
        // return _addReservesInternal(msg.value);
    }

    /**
     * @notice Send Ether to MEther to mint
     */
    receive() external payable {

        //there are not recommended to implement some code, because tranfer costs 2300 gas and extra code increases this amount 
    }

    /**
     * @notice A public function to sweep accidental ERC-20 transfers to this contract. Tokens are sent to admin (timelock)
     * @param token The address of the ERC-20 token to sweep
     */
    function sweepToken(EIP20Interface token) external {
        MWethInterface(mweth).sweepToken(token);
    }

}
