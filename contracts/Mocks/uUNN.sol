// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract uUNN is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct ProtectionData{
        address underlyingAsset;
        uint256 amount;
        uint256 strike;
        uint256 premium;
        uint issueTime;
        uint expirationTime;
    }

    mapping (uint256 => ProtectionData) private protectionStorage;

    constructor() public ERC721("uUNN OC-Protection", "uUNN") {}

    function createProtection(address owner, address underlyingAsset, uint256 amount, uint256 strikePrice, uint256 premium) public returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(owner, newItemId);
        _setProtection(newItemId, underlyingAsset, amount, strikePrice, premium);
    
        return newItemId;
    }

    function _setProtection(uint256 tokenId, address underlyingAsset, uint256 amount, uint256 strikePrice, uint256 premium) private{
        protectionStorage[tokenId] = ProtectionData(underlyingAsset, amount, strikePrice, premium, now, (now + 604800));
    }

    function getProtectionData(uint256 tokenId) public view returns (address, uint256, uint256, uint256, uint, uint){
        return (
            protectionStorage[tokenId].underlyingAsset,
            protectionStorage[tokenId].amount,
            protectionStorage[tokenId].strike,
            protectionStorage[tokenId].premium,
            protectionStorage[tokenId].issueTime,
            protectionStorage[tokenId].expirationTime
        );
    }
}