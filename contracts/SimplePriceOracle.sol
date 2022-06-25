// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;

import "./Interfaces/PriceOracle.sol";
import "./CErc20.sol";

/**
 * Temporary simple price feed 
 */
contract SimplePriceOracle is PriceOracle {
    /// @notice Indicator that this is a PriceOracle contract (for inspection)
    bool public constant isPriceOracle = true;

    /// @notice price mantissa of underlying assets (scaled by 1e18)
    mapping(address => uint) prices;

    event PricePosted(address asset, uint previousPriceMantissa, uint requestedPriceMantissa, uint newPriceMantissa);

    /**
      * @notice Get the underlying price of a mToken asset
      * @param mToken The mToken to get the underlying price of
      * @return The underlying asset price mantissa (scaled by 1e18).
      *  Zero means the price is unavailable.
      */
    function getUnderlyingPrice(MToken mToken) public override view returns (uint) {
        if (compareStrings(mToken.symbol(), "mDAI")) {
            return 1e18;
        } else {
            return prices[address(MErc20(address(mToken)).underlying())];
        }
    }

    /**
      * @notice Get the underlying price of a mToken asset
      * @param mToken The mToken to get the underlying price of
      * @param priceMantissa the price multiplied by 10**18
      * @param validTo the timestamp in seconds that define the valid to period
      * @param signature the sign of trusted thirdparty
      * @return The underlying asset price mantissa (scaled by 1e18).
      */
    function getUnderlyingPriceSigned(address mToken, uint256 priceMantissa, uint256 validTo, bytes memory signature) public override view returns (uint) {
        mToken; validTo; signature;
        return priceMantissa;
    }

    /**
      * @notice Set the underlying price of a mToken asset
      * @param mToken The mToken to set the underlying price of
      * @param underlyingPriceMantissa the price multiplied by 10**18
      */
    function setUnderlyingPrice(MToken mToken, uint underlyingPriceMantissa) public {
        address asset = address(MErc20(address(mToken)).underlying());
        emit PricePosted(asset, prices[asset], underlyingPriceMantissa, underlyingPriceMantissa);
        prices[asset] = underlyingPriceMantissa;
    }

    // 
    /**
      * @notice sets price for certain asset
      * @param asset The address of asset to set the underlying price of
      * @param price the price multiplied by 10**18
      */
    function setDirectPrice(address asset, uint price) public {
        emit PricePosted(asset, prices[asset], price, price);
        prices[asset] = price;
    }

    // v1 price oracle interface for use as backing of proxy
    function assetPrices(address asset) external view returns (uint) {
        return prices[asset];
    }
    // compares if strings are equal
    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
