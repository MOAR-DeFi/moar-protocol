// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "../MToken.sol";
import "../Utils/ExponentialNoError.sol";

interface MoartrollerProxyInterface {


    /*** Assets You Are In ***/

    function enterMarkets(
        address[] calldata mTokens
    ) external returns (uint[] memory);

    function exitMarket(
        address mTokenAddress, 
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external returns (uint);

    /*** Policy Hooks ***/

    function mintAllowed(address mToken, address minter, uint mintAmount) external returns (uint);

    function redeemAllowed(
        address mToken, 
        address redeemer, 
        uint redeemTokens,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external returns (uint);

    function redeemVerify(address mToken, address redeemer, uint redeemAmount, uint redeemTokens) external;

    function borrowAllowed(
        address mToken, 
        address borrower, 
        uint borrowAmount,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external returns (uint);

    function repayBorrowAllowed(
        address mToken,
        address payer,
        address borrower,
        uint repayAmount
    ) external returns (uint);

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
    ) external returns (uint);

    function seizeAllowed(
        address mTokenCollateral,
        address mTokenBorrowed,
        address liquidator,
        address borrower,
        uint seizeTokens
    ) external returns (uint);

    function transferAllowed(
        address mToken, 
        address src, 
        address dst,
        uint transferTokens,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external returns (uint);

    /*** Liquidity/Liquidation Calculations ***/

    function liquidateCalculateSeizeUserTokens(
         address mTokenBorrowed, 
        address mTokenCollateral,
        uint actualRepayAmount, 
        address account,
        uint256[] calldata mTokenBorrowedCollateralPrice,
        uint256 priceValidTo,
        bytes[] calldata mTokenBorrowedCollateralPriceSignature
    ) external view returns (uint, uint);

    function getUserLockedAmount(MToken asset, address account) external view returns(uint);
}
