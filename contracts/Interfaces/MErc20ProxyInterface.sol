// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "../MToken.sol";
import "./EIP20Interface.sol";

interface MErc20ProxyInterface {
    /*** User contract ***/
    /**
     * @notice Sender supplies assets into the market and receives mTokens in exchange
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param mintAmount The amount of the underlying asset to supply
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function mint(uint mintAmount) external returns (uint);
    
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
    ) external returns (uint);

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
    ) external returns (uint);

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
    ) external returns (uint);

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
    ) external returns (uint);

    /**
     * @notice Sender repays their own borrow
     * @param repayAmount The amount to repay
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function repayBorrow(uint repayAmount) external returns (uint);
    /**
     * @notice Sender repays a borrow belonging to borrower.
     * @param borrower the account with the debt being payed off
     * @param repayAmount The amount to repay
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function repayBorrowBehalf(address borrower, uint repayAmount) external returns (uint);

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
    ) external returns (uint);

    /**
     * @notice A public function to sweep accidental ERC-20 transfers to this contract. Tokens are sent to admin (timelock)
     * @param token The address of the ERC-20 token to sweep
     */
    function sweepToken(EIP20Interface token) external;
    /*** Admin Functions ***/

    /**
     * @notice The sender adds to reserves.
     * @param addAmount The amount fo underlying token to add as reserves
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _addReserves(uint addAmount) external returns (uint);
}