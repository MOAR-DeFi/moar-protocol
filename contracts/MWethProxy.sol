// // SPDX-License-Identifier: BSD-3-Clause
// pragma solidity ^0.6.12;
// pragma experimental ABIEncoderV2;

// import "./MToken.sol";
// import "./Moartroller.sol";
// import "./InterestRateModel/AbstractInterestRateModel.sol";
// import "./Interfaces/WETHInterface.sol";
// import "./Interfaces/EIP20Interface.sol";
// import "./Utils/SafeEIP20.sol";
// import "./MWeth.sol";

// /**
//  * @title MOAR's MEther Contract
//  * @notice MToken which wraps Ether
//  * @author MOAR
//  */
// contract MWethProxy {

//     using SafeEIP20 for EIP20Interface;

//     MWeth public mweth;
//     PriceOracle public priceOracle;

//     constructor(
//         address payable mweth_,
//         address priceOracle_
//     ) public {
//         mweth = MWeth(mweth_);
//         priceOracle = PriceOracle(priceOracle_);
//     }

//     /*** User Interface ***/

//     /**
//      * @notice Sender supplies assets into the market and receives mTokens in exchange
//      * @dev Reverts upon any failure
//      */
//     function mint() external payable {
//         mweth.mint{value: msg.value}();
//         // WETHInterface(underlying).deposit{value : msg.value}();
//         // (uint err,) = mintInternal(msg.value);
//         // requireNoError(err, "mint failed");
//     }

//     /**
//      * @notice Sender redeems mTokens in exchange for the underlying asset
//      * @dev Accrues interest whether or not the operation succeeds, unless reverted
//      * @param redeemTokens The number of mTokens to redeem into underlying
//      * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
//      */
//     function redeem(
//         uint redeemTokens,
//         uint256[] memory accountAssetsPriceMantissa
//     ) external returns (uint) {
        
//         return mweth.redeem(redeemTokens, accountAssetsPriceMantissa);
//     }

//     /**
//      * @notice Sender redeems mTokens in exchange for a specified amount of underlying asset
//      * @dev Accrues interest whether or not the operation succeeds, unless reverted
//      * @param redeemAmount The amount of underlying to redeem
//      * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
//      */
//     function redeemUnderlying(
//         uint redeemAmount,
//         uint256[] memory accountAssetsPriceMantissa
//     ) external returns (uint) {
//         // return redeemUnderlyingInternal(redeemAmount, accountAssetsPriceMantissa);
//     }

//     /**
//       * @notice Sender borrows assets from the protocol to their own address
//       * @param borrowAmount The amount of the underlying asset to borrow
//       * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
//       */
//     function borrow(
//         uint borrowAmount,
//         uint256[] memory accountAssetsPriceMantissa
//     ) external returns (uint) {
//         // return borrowInternal(borrowAmount, accountAssetsPriceMantissa);
//     }

//     function borrowFor(
//         address payable borrower, 
//         uint borrowAmount,
//         uint256[] memory accountAssetsPriceMantissa
//     ) external returns (uint) {
//         // return borrowForInternal(borrower, borrowAmount, accountAssetsPriceMantissa);
//     }

//     /**
//      * @notice Sender repays their own borrow
//      * @dev Reverts upon any failure
//      */
//     function repayBorrow() external payable {
//         // WETHInterface(underlying).deposit{value : msg.value}();
//         // (uint err,) = repayBorrowInternal(msg.value);
//         // requireNoError(err, "repayBorrow failed");
//     }

//     /**
//      * @notice Sender repays a borrow belonging to borrower
//      * @dev Reverts upon any failure
//      * @param borrower the account with the debt being payed off
//      */
//     function repayBorrowBehalf(address borrower) external payable {
//         // WETHInterface(underlying).deposit{value : msg.value}();
//         // (uint err,) = repayBorrowBehalfInternal(borrower, msg.value);
//         // requireNoError(err, "repayBorrowBehalf failed");
//     }

//     /**
//      * @notice The sender liquidates the borrowers collateral.
//      *  The collateral seized is transferred to the liquidator.
//      * @dev Reverts upon any failure
//      * @param borrower The borrower of this mToken to be liquidated
//      * @param mTokenCollateral The market in which to seize collateral from the borrower
//      */
//     function liquidateBorrow(
//         address borrower, 
//         MToken mTokenCollateral,
//         uint256[] calldata accountAssetsPriceMantissa, 
//         uint256[] calldata mTokenBorrowedCollateralPriceMantissa
//     ) external payable {
//         // WETHInterface(underlying).deposit{value : msg.value}();        
//         // (uint err,) = liquidateBorrowInternal(
//         //     borrower, 
//         //     msg.value, 
//         //     mTokenCollateral,
//         //     accountAssetsPriceMantissa,
//         //     mTokenBorrowedCollateralPriceMantissa
//         // );
//         // requireNoError(err, "liquidateBorrow failed");
//     }

//     /**
//      * @notice The sender adds to reserves.
//      * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
//      */
//     function _addReserves() external payable returns (uint) {
//         // WETHInterface(underlying).deposit{value : msg.value}();
//         // return _addReservesInternal(msg.value);
//     }

//     /**
//      * @notice Send Ether to MEther to mint
//      */
//     receive () external payable {
//         //there are not recommended to implement some code, because tranfer costs 2300 gas and extra code increases this amount 
//     }

//     /**
//      * @notice A public function to sweep accidental ERC-20 transfers to this contract. Tokens are sent to admin (timelock)
//      * @param token The address of the ERC-20 token to sweep
//      */
//     function sweepToken(EIP20Interface token) external {
//     	// require(address(token) != underlying, "MErc20::sweepToken: can not sweep underlying token");
//     	// uint256 balance = token.balanceOf(address(this));
//     	// token.safeTransfer(admin, balance);
//     }

// }
