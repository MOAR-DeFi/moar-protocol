// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "../MToken.sol";
import "../InterestRateModel/AbstractInterestRateModel.sol";

import "./EIP20Interface.sol";
import "../Utils/SafeEIP20.sol";


interface MWethInterface {

    using SafeEIP20 for EIP20Interface;





    /*** User Interface ***/

    /**
     * @notice Sender supplies assets into the market and receives mTokens in exchange
     * @dev Reverts upon any failure
     */
    function mint(address minter) external payable returns(uint);

    /**
     * @notice Sender redeems mTokens in exchange for the underlying asset
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param redeemTokens The number of mTokens to redeem into underlying
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of (array of addresses of mToken asset). The prices scaled by 10**18
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function redeem(
        address redeemer,
        uint redeemTokens,
        uint256[] memory accountAssetsPriceMantissa
    ) external returns (uint);

    /**
     * @notice Sender redeems mTokens in exchange for a specified amount of underlying asset
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param redeemAmount The amount of underlying to redeem
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of (array of addresses of mToken asset). The prices scaled by 10**18
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function redeemUnderlying(
        address redeemer,
        uint redeemAmount,
        uint256[] memory accountAssetsPriceMantissa
    ) external returns (uint);

    /**
      * @notice Sender borrows assets from the protocol to their own address
      * @param borrowAmount The amount of the underlying asset to borrow
      * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of (array of addresses of mToken asset). The prices scaled by 10**18
      * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
      */
    function borrow(
        address borrower,
        uint borrowAmount,
        uint256[] memory accountAssetsPriceMantissa
    ) external returns (uint);

    /**
      * @notice Sender borrows assets from the protocol to somebodies address
      * @param borrower The address of assets receiver 
      * @param borrowAmount The amount of the underlying asset to borrow
      * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of (array of addresses of mToken asset). The prices scaled by 10**18
      * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
      */
    function borrowFor(
        address payable borrower, 
        uint borrowAmount,
        uint256[] memory accountAssetsPriceMantissa
    ) external returns (uint);

    /**
     * @notice Sender repays their own borrow
     * @dev Reverts upon any failure
     */
    function repayBorrow(
        address repayer
    ) external payable returns (uint) ;

    /**
     * @notice Sender repays a borrow belonging to borrower
     * @dev Reverts upon any failure
     * @param borrower the account with the debt being payed off
     */
    function repayBorrowBehalf(
        address repayer,
        address borrower
        ) external  payable returns (uint);
    

    /**
     * @notice The sender liquidates the borrowers collateral.
     *  The collateral seized is transferred to the liquidator.
     * @dev Reverts upon any failure
     * @param borrower The borrower of this mToken to be liquidated
     * @param mTokenCollateral The market in which to seize collateral from the borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of (array of addresses of mToken asset). The prices scaled by 10**18
     * @param mTokenBorrowedCollateralPriceMantissa  - pair of assets prices which were {1) borrowed by the borrower | 2) used as collateral and will be seized } 
     */
    function liquidateBorrow(
        address liquidator,
        address borrower, 
        // uint repayAmount,
        MToken mTokenCollateral,
        uint256[] calldata accountAssetsPriceMantissa, 
        uint256[] calldata mTokenBorrowedCollateralPriceMantissa
    ) external payable returns (uint);

    /**
     * @notice The sender adds to reserves.
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _addReserves() external payable returns (uint);



    /**
     * @notice A public function to sweep accidental ERC-20 transfers to this contract. Tokens are sent to admin (timelock)
     * @param token The address of the ERC-20 token to sweep
     */
    function sweepToken(EIP20Interface token) external  ;




}
