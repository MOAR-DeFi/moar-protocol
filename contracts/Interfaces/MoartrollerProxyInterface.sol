// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "../MToken.sol";
import "../Utils/ExponentialNoError.sol";

interface MoartrollerProxyInterface {


    /*** Assets You Are In ***/

    /**
     * @notice Add assets to be included in account liquidity calculation
     * @param mTokens The list of addresses of the mToken markets to be enabled
     * @return Success indicator for whether each corresponding market was entered
     */
    function enterMarkets(
        address[] calldata mTokens
    ) external returns (uint[] memory);

    /**
     * @notice Removes asset from sender's account liquidity calculation
     * @dev Sender must not have an outstanding borrow balance in the asset,
     *  or be providing necessary collateral for an outstanding borrow.
     * @param mTokenAddress The address of the asset to be removed
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     * @return Whether or not the account successfully exited the market
     */
    function exitMarket(
        address mTokenAddress, 
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external returns (uint);

    /*** Policy Hooks ***/

    /**
     * @notice Checks if the account should be allowed to mint tokens in the given market
     * @param mToken The market to verify the mint against
     * @param minter The account which would get the minted tokens
     * @param mintAmount The amount of underlying being supplied to the market in exchange for tokens
     * @return 0 if the mint is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
    function mintAllowed(address mToken, address minter, uint mintAmount) external returns (uint);

    /**
     * @notice Checks if the account should be allowed to redeem tokens in the given market
     * @param mToken The market to verify the redeem against
     * @param redeemer The account which would redeem the tokens
     * @param redeemTokens The number of mTokens to exchange for the underlying asset in the market
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     * @return 0 if the redeem is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
    function redeemAllowed(
        address mToken, 
        address redeemer, 
        uint redeemTokens,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external returns (uint);

    /**
     * @notice Validates redeem and reverts on rejection. May emit logs.
     * @param mToken Asset being redeemed
     * @param redeemer The address redeeming the tokens
     * @param redeemAmount The amount of the underlying asset being redeemed
     * @param redeemTokens The number of tokens being redeemed
     */
    function redeemVerify(address mToken, address redeemer, uint redeemAmount, uint redeemTokens) external;

    /**
     * @notice Checks if the account should be allowed to borrow the underlying asset of the given market
     * @param mToken The market to verify the borrow against
     * @param borrower The account which would borrow the asset
     * @param borrowAmount The amount of underlying the account would borrow
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     * @return 0 if the borrow is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
    function borrowAllowed(
        address mToken, 
        address borrower, 
        uint borrowAmount,
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsPriceValidTo, 
        bytes[] calldata accountAssetsPriceSignatures
    ) external returns (uint);

    /**
     * @notice Checks if the account should be allowed to repay a borrow in the given market
     * @param mToken The market to verify the repay against
     * @param payer The account which would repay the asset
     * @param borrower The account which would borrowed the asset
     * @param repayAmount The amount of the underlying asset the account would repay
     * @return 0 if the repay is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
    function repayBorrowAllowed(
        address mToken,
        address payer,
        address borrower,
        uint repayAmount
    ) external returns (uint);

    /**
     * @notice Checks if the liquidation should be allowed to occur
     * @param mTokenBorrowed Asset which was borrowed by the borrower
     * @param mTokenCollateral Asset which was used as collateral and will be seized
     * @param liquidator The address repaying the borrow and seizing the collateral
     * @param borrower The address of the borrower
     * @param repayAmount The amount of underlying being repaid
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     */
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

    /**
     * @notice Checks if the seizing of assets should be allowed to occur
     * @param mTokenCollateral Asset which was used as collateral and will be seized
     * @param mTokenBorrowed Asset which was borrowed by the borrower
     * @param liquidator The address repaying the borrow and seizing the collateral
     * @param borrower The address of the borrower
     * @param seizeTokens The number of collateral tokens to seize
     */
    function seizeAllowed(
        address mTokenCollateral,
        address mTokenBorrowed,
        address liquidator,
        address borrower,
        uint seizeTokens
    ) external returns (uint);

    /**
     * @notice Checks if the account should be allowed to transfer tokens in the given market
     * @param mToken The market to verify the transfer against
     * @param src The account which sources the tokens
     * @param dst The account which receives the tokens
     * @param transferTokens The number of mTokens to transfer
     * @param mTokenAssets - array of addresses of mToken asset. This assets can be formed by call `function accountAssets(address account)`, where account is address of borrower
     * @param accountAssetsPriceMantissa - the array of prices of each underlying asset of `mTokenAssets`. The prices scaled by 10**18
     * @param accountAssetsPriceValidTo - the timestamp in seconds of prices validity
     * @param accountAssetsPriceSignatures - array of ECDSA signatures of each price in `accountAssetsPriceMantissa`
     * @return 0 if the transfer is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
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

    /**
     * @notice Calculate number of tokens of collateral asset of the given user to seize given an underlying amount
         * this function takes amount of collateral asset that is locked under protection.
     * @param mTokenBorrowed Asset which was borrowed by the borrower
     * @param mTokenCollateral Asset which was used as collateral and will be seized
     * @param actualRepayAmount The amount of underlying being repaid
     * @param account The account to determine liquidity for
     * @param mTokenBorrowedCollateralPrice  - pair of assets prices which were {1) borrowed by the borrower | 2) used as collateral and will be seized } 
     * @param priceValidTo - the timestamp in seconds of prices validity
     * @param mTokenBorrowedCollateralPriceSignature - array of ECDSA signatures of each price in `mTokenBorrowedCollateralPrice`
     * @return (possible errorCode | number of mTokenCollateral tokens to be seized in a liquidation)
     */
    function liquidateCalculateSeizeUserTokens(
         address mTokenBorrowed, 
        address mTokenCollateral,
        uint actualRepayAmount, 
        address account,
        uint256[] calldata mTokenBorrowedCollateralPrice,
        uint256 priceValidTo,
        bytes[] calldata mTokenBorrowedCollateralPriceSignature
    ) external view returns (uint, uint);

    /**
     * @notice Returns the amount of a specific asset that is locked under all c-ops
     * @param asset The MToken address
     * @param account The owner of asset
     * @return The amount of asset locked under c-ops
     */
    function getUserLockedAmount(MToken asset, address account) external view returns(uint);
}
