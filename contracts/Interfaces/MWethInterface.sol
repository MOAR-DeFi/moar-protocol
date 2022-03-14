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

    function mint(address minter) external payable returns(uint);

    function redeem(
        address redeemer,
        uint redeemTokens,
        uint256[] memory accountAssetsPriceMantissa
    ) external returns (uint);

    function redeemUnderlying(
        address redeemer,
        uint redeemAmount,
        uint256[] memory accountAssetsPriceMantissa
    ) external returns (uint);

    function borrow(
        address borrower,
        uint borrowAmount,
        uint256[] memory accountAssetsPriceMantissa
    ) external returns (uint);

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
