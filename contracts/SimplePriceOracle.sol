// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;

import "./Interfaces/PriceOracle.sol";
import "./CErc20.sol";

contract SimplePriceOracle is PriceOracle {
    /// @notice Indicator that this is a PriceOracle contract (for inspection)
    bool public constant isPriceOracle = true;

    mapping(address => uint) prices;

    event PricePosted(address asset, uint previousPriceMantissa, uint requestedPriceMantissa, uint newPriceMantissa);

    function getUnderlyingPrice(MToken cToken) public override view returns (uint) {
        if (compareStrings(cToken.symbol(), "cDAI")) {
            return 1e18;
        } else {
            return prices[address(MErc20(address(cToken)).underlying())];
        }
    }

    function setUnderlyingPrice(MToken cToken, uint underlyingPriceMantissa) public {
        address asset = address(MErc20(address(cToken)).underlying());
        emit PricePosted(asset, prices[asset], underlyingPriceMantissa, underlyingPriceMantissa);
        prices[asset] = underlyingPriceMantissa;
    }

    function setDirectPrice(address asset, uint price) public {
        emit PricePosted(asset, prices[asset], price, price);
        prices[asset] = price;
    }

    // v1 price oracle interface for use as backing of proxy
    function assetPrices(address asset) external view returns (uint) {
        return prices[asset];
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
