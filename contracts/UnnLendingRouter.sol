// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./Interfaces/Cop/IOCProtectionSeller.sol";
import "./Interfaces/Cop/IUUNNRegistry.sol";
import "./Interfaces/MErc20Interface.sol";
import "./Interfaces/EIP20Interface.sol";
import "./MProtection.sol";
import "hardhat/console.sol";

contract UnnLendingRouter is IERC721Receiver, Ownable{

    event ProtectionReceived(address operator, address from, uint256 tokenId);

    IUUNNRegistry private protectionToken;
    MProtection private cProtectionToken;
    EIP20Interface private baseCurrency;

    constructor(address _protectionToken, address _cProtectionToken, address _baseCurrency) public {
        protectionToken = IUUNNRegistry(_protectionToken);
        cProtectionToken = MProtection(_cProtectionToken);
        baseCurrency = EIP20Interface(_baseCurrency);
    }

    function setProtection(address _protectionToken) onlyOwner public {
        protectionToken = IUUNNRegistry(_protectionToken);
    }

    function setCProtection(address _cProtectionToken) onlyOwner public {
        cProtectionToken = MProtection(_cProtectionToken);
    }

    function setBaseCurrency(address _baseCurrency) onlyOwner public {
        baseCurrency = EIP20Interface(_baseCurrency);
    }

    function rescueBaseCurrency(address to, uint256 amount) onlyOwner public {
        baseCurrency.transfer(to, amount);
    }

    function purchaseProtectionAndMakeBorrow(IOCProtectionSeller protectionSeller, MErc20Interface cerc20Token, uint256 borrowAmount, address pool, uint256 validTo, uint256 amount, uint256 strike, uint256 deadline, uint256[11] memory data, bytes memory signature) public {
        baseCurrency.transferFrom(msg.sender, address(this), data[1]);
        baseCurrency.approve(address(protectionSeller), data[1]);
        protectionSeller.create(pool, validTo, amount, strike, deadline, data, signature);
        uint256 underlyingTokenId = data[0];
        protectionToken.approve(address(cProtectionToken), underlyingTokenId);
        
        uint cProtectionId = cProtectionToken.mintFor(underlyingTokenId, msg.sender);
        cProtectionToken.lockProtectionValue(cProtectionId, 0);
        cerc20Token.borrowFor(msg.sender, borrowAmount);
    }

    function depositProtectionAndOptimize(uint256 underlyingTokenId) public {
        require(protectionToken.ownerOf(underlyingTokenId) == msg.sender, "Only owner of C-OP can call this action");
        protectionToken.transferFrom(msg.sender, address(this), underlyingTokenId);
        protectionToken.approve(address(cProtectionToken), underlyingTokenId);
        uint cProtectionId = cProtectionToken.mintFor(underlyingTokenId, msg.sender);
        cProtectionToken.lockProtectionValue(cProtectionId, 0);
    }

    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external override returns (bytes4){
        emit ProtectionReceived(operator, from, tokenId);
        return this.onERC721Received.selector;
    }

}