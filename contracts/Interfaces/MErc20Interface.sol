// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;

import "../MToken.sol";

interface MErc20Interface {
    /*** User contract ***/
    function mint(
        address minter,
        uint mintAmount
    ) external returns (uint);
    function redeem(
        address redeemer,
        uint redeemTokens,
        uint256[] memory priceMantissa
    ) external returns (uint);
    function redeemUnderlying(
        address redeemer,
        uint redeemAmount,
        uint256[] memory priceMantissa
    ) external returns (uint);
    function borrow(
        address borrower,
        uint borrowAmount,
        uint256[] memory priceMantissa
    ) external returns (uint);
    function borrowFor(
        address payable borrower, 
        uint borrowAmount,
        uint256[] memory priceMantissa
    ) external returns (uint);
    function repayBorrow(
        address repayer,
        uint repayAmount
    ) external returns (uint);
    function repayBorrowBehalf(
        address repayer,
        address borrower, 
        uint repayAmount
    ) external returns (uint);
    function liquidateBorrow(
        address liquidator,
        address borrower, 
        uint repayAmount, 
        MToken mTokenCollateral,
        uint256[] calldata accountAssetsPriceMantissa,
        uint256[] calldata mTokenBorrowedCollateralPrice
    ) external returns (uint);

    /*** Admin Functions ***/
    function _addReserves(uint addAmount) external returns (uint);
}