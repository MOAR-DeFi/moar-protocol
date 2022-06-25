// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;

import "../MToken.sol";

interface MErc20Interface {
    /*** User contract ***/

    /**
     * @notice Sender supplies assets into the market and receives mTokens in exchange
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param mintAmount The amount of the underlying asset to supply
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function mint(
        address minter,
        uint mintAmount
    ) external returns (uint);

    /**
     * @notice Sender redeems mTokens in exchange for the underlying asset
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param redeemTokens The number of mTokens to redeem into underlying
     * @param priceMantissa - the array of prices of each underlying asset of (array of addresses of mToken asset). The prices scaled by 10**18
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function redeem(
        address redeemer,
        uint redeemTokens,
        uint256[] memory priceMantissa
    ) external returns (uint);

    /**
     * @notice Sender redeems mTokens in exchange for a specified amount of underlying asset
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param redeemAmount The amount of underlying to redeem
     * @param priceMantissa - the array of prices of each underlying asset of (array of addresses of mToken asset). The prices scaled by 10**18
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function redeemUnderlying(
        address redeemer,
        uint redeemAmount,
        uint256[] memory priceMantissa
    ) external returns (uint);

    /**
      * @notice Sender borrows assets from the protocol to their own address
      * @param borrower user who borrows assets from the protocol to their own address
      * @param borrowAmount The amount of the underlying asset to borrow
      * @param priceMantissa - the array of prices of each underlying asset of (array of addresses of mToken asset). The prices scaled by 10**18
      * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
      */
    function borrow(
        address borrower,
        uint borrowAmount,
        uint256[] memory priceMantissa
    ) external returns (uint);

    /**
      * @notice Sender borrows assets from the protocol to somebodies address
      * @param borrower The address of assets receiver 
      * @param borrowAmount The amount of the underlying asset to borrow
      * @param priceMantissa - the array of prices of each underlying asset of (array of addresses of mToken asset). The prices scaled by 10**18
      * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
      */
    function borrowFor(
        address payable borrower, 
        uint borrowAmount,
        uint256[] memory priceMantissa
    ) external returns (uint);

    /**
     * @notice Sender repays their own borrow
     * @param repayer user who repays their own borrow
     * @param repayAmount The amount to repay
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function repayBorrow(
        address repayer,
        uint repayAmount
    ) external returns (uint);

    /**
     * @notice Sender repays a borrow belonging to borrower.
     * @param repayer user who repays a borrow belonging to borrower
     * @param borrower the account with the debt being payed off
     * @param repayAmount The amount to repay
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function repayBorrowBehalf(
        address repayer,
        address borrower, 
        uint repayAmount
    ) external returns (uint);

    /**
     * @notice The sender liquidates the borrowers collateral.
     *  The collateral seized is transferred to the liquidator.
     * @param borrower The borrower of this mToken to be liquidated
     * @param repayAmount The amount of the underlying borrowed asset to repay
     * @param mTokenCollateral The market in which to seize collateral from the borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of (array of addresses of mToken asset). The prices scaled by 10**18
     * @param mTokenBorrowedCollateralPrice  - pair of assets prices which were {1) borrowed by the borrower | 2) used as collateral and will be seized } 
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function liquidateBorrow(
        address liquidator,
        address borrower, 
        uint repayAmount, 
        MToken mTokenCollateral,
        uint256[] calldata accountAssetsPriceMantissa,
        uint256[] calldata mTokenBorrowedCollateralPrice
    ) external returns (uint);

    /*** Admin Functions ***/
    /**
     * @notice The sender adds to reserves.
     * @param addAmount The amount fo underlying token to add as reserves
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _addReserves(uint addAmount) external returns (uint);
}