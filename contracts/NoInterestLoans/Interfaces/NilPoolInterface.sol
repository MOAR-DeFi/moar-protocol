// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface NilPoolInterface{
    function deposit(uint amount) external;
    function withdraw(uint amount) external;
    function withdrawAll() external;
    function borrow(uint amount) external;
    function repay(uint amount) external;
    function repayAll() external;
    function liquidate(address userToLiquidate, uint amount) external;
    function rewardToken() external view returns (ERC20);
    function underlyingBalanceOf(address user) external view returns (uint256);
    function collateralValue(uint256 assetAmount) external view returns (uint256);
    function collateralValueToAssetAmount(uint256 value) external view returns (uint256);
    function liquidityOf(address user) external view returns (uint256, uint256);
}