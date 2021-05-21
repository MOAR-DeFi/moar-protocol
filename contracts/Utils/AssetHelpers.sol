// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AssetHelpers {
    /**
     * @dev return asset decimals mantissa. Returns 1e18 if ETH
     */
    function getAssetDecimalsMantissa(address assetAddress) public view returns (uint256){
        uint assetDecimals = 1e18;
        if (assetAddress != address(0)) {
            ERC20 token = ERC20(assetAddress);
            assetDecimals = 10 ** uint256(token.decimals());
        }
        return assetDecimals;
    }
}
