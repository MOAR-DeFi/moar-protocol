// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "../MToken.sol";
import "./EIP20Interface.sol";

interface MErc20ProxyInterface {
    /*** User contract ***/
    function mint(uint mintAmount) external returns (uint);
   function redeem(
        uint redeemTokens,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external returns (uint);
    function redeemUnderlying(
        uint redeemAmount,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external returns (uint);
    function borrow(
        uint borrowAmount,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external returns (uint);
    function borrowFor(
        address payable borrower, 
        uint borrowAmount,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external returns (uint);
    function repayBorrow(uint repayAmount) external returns (uint);
    function repayBorrowBehalf(address borrower, uint repayAmount) external returns (uint);
    function liquidateBorrow(
        address borrower, 
        uint repayAmount, 
        MToken mTokenCollateral,
        address[] calldata mTokenAssets, 
        uint256[] calldata accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external returns (uint);
    function sweepToken(EIP20Interface token) external;
    /*** Admin Functions ***/
    function _addReserves(uint addAmount) external returns (uint);
}