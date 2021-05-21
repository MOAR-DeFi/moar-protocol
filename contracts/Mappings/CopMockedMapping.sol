// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./../Mocks/uUNN.sol";
import "./../Interfaces/CopMappingInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CopMockedMapping is Ownable, CopMappingInterface{
   
    address private _copRegistryAddress;

    constructor(address copRegistryAddress) public{
        _copRegistryAddress = copRegistryAddress;
    }

    function _setCopRegistry(address copRegistryAddress) public onlyOwner {
        _copRegistryAddress = copRegistryAddress;
    }

    function copRegistry() public view returns (uUNN){
        return uUNN(_copRegistryAddress);
    }

    function getTokenAddress() override public view returns (address){
        return _copRegistryAddress;
    }

    function getProtectionData(uint256 underlyingTokenId) override public view returns (address, uint256, uint256, uint256, uint, uint){
        return copRegistry().getProtectionData(underlyingTokenId);
    }

    function getUnderlyingAsset(uint256 underlyingTokenId) override public view returns (address){
        (address underlyingAsset, , , , , ) = copRegistry().getProtectionData(underlyingTokenId);
        return underlyingAsset;
    }

    function getUnderlyingAmount(uint256 underlyingTokenId) override public view returns (uint256){
        ( , uint256 amount, , , , ) = copRegistry().getProtectionData(underlyingTokenId);
        return amount;
    }

    function getUnderlyingStrikePrice(uint256 underlyingTokenId) override public view returns (uint){
        ( , , uint256 strike, , , ) = copRegistry().getProtectionData(underlyingTokenId);
        return strike;
    }

    function getUnderlyingDeadline(uint256 underlyingTokenId) override public view returns (uint){
        ( , , , , , uint deadline) = copRegistry().getProtectionData(underlyingTokenId);
        return deadline;
    }

}