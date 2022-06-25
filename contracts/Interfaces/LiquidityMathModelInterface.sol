// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.6.12;

import "../MToken.sol";
import "../MProtection.sol";
import "../Interfaces/PriceOracle.sol";

interface LiquidityMathModelInterface {
    struct LiquidityMathArgumentsSet {
        MToken asset;
        address account;
        uint collateralFactorMantissa;
        MProtection cprotection;
        PriceOracle oracle;
        uint256 assetPrice;
    }
    
    /**
     * @notice Returns the value of possible optimization left for asset
     * @return The value of possible optimization
     */
    function getMaxOptimizableValue(LiquidityMathArgumentsSet memory _arguments) external view returns (uint);

    /**
     * @notice Returns the value of hypothetical optimization (ignoring existing optimization used) for asset
     * @return The amount of hypothetical optimization
     */
    function getHypotheticalOptimizableValue(LiquidityMathArgumentsSet memory _arguments) external view returns(uint);

    /**
     * @dev gets all locked protections values with mark to market value. Used by Moartroller.
     */
    function getTotalProtectionLockedValue(LiquidityMathArgumentsSet memory _arguments) external view returns(uint, uint);
}