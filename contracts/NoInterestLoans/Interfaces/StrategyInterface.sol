// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

interface StrategyInterface{
    function updateFarmer(address _farmerAddress) external;

    function deposit(uint amount) external returns (uint256);
    function withdraw(uint amount) external returns (uint256);
    function balance() view external returns (uint);
    function underlyingBalance() view external returns (uint);
    function underlyingToken() view external returns (address);
    function farmAddress() view external returns (address);
}