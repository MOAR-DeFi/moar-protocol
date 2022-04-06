// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;

import "./PriceOracle.sol";
import "./MoartrollerInterface.sol";
pragma solidity ^0.6.12;


interface LiquidationModelInterface {
    /**
     * @notice Calculate number of tokens of collateral asset of the given user to seize given an underlying amount
     * this function takes amount of collateral asset that is locked under protection.
     * @param arguments arguments
     * @return (errorCode, number of mTokenCollateral tokens to be seized in a liquidation)
     */
    function liquidateCalculateSeizeUserTokens(LiquidateCalculateSeizeUserTokensArgumentsSet memory arguments) external view returns (uint, uint);
    /**
     * @notice Calculate number of tokens of collateral asset to seize given an underlying amount
     * @dev Used in liquidation (called in mToken.liquidateBorrowFresh)
     * @param arguments arguments
     * @return (errorCode, number of mTokenCollateral tokens to be seized in a liquidation)
     */
    function liquidateCalculateSeizeTokens(LiquidateCalculateSeizeUserTokensArgumentsSet memory arguments) external view returns (uint, uint);

    struct LiquidateCalculateSeizeUserTokensArgumentsSet {
        PriceOracle oracle;
        MoartrollerInterface moartroller;
        address mTokenBorrowed;
        address mTokenCollateral;
        uint actualRepayAmount;
        address accountForLiquidation;
        uint liquidationIncentiveMantissa;
        uint256 mTokenBorrowedPrice;
        uint256 mTokenCollateralPrice;
    }
}
