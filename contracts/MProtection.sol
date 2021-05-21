// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Interfaces/CopMappingInterface.sol";
import "./Moartroller.sol";
import "./Utils/ExponentialNoError.sol";
import "./Utils/ErrorReporter.sol";
import "./Utils/AssetHelpers.sol";
import "./MToken.sol";

contract MProtection is ERC721, Ownable, ExponentialNoError, AssetHelpers {
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.UintSet;

    event Mint(address minter, uint tokenId, uint underlyingTokenId, address asset, uint amount, uint strikePrice, uint expirationTime);
    event Redeem(address redeemer, uint tokenId, uint underlyingTokenId);
    event LockValue(uint tokenId, uint underlyingTokenId, uint optimizationValue);
    event MaturityWindowUpdated(uint newMaturityWindow);

    Counters.Counter private _tokenIds;
    address private _copMappingAddress;
    address private _moartrollerAddress;
    mapping (uint256 => uint256) private _underlyingProtectionTokensMapping;
    mapping (uint256 => uint256) private _underlyingProtectionLockedValue;
    mapping (address => mapping (address => EnumerableSet.UintSet)) private _protectionCurrencyMapping;
    uint256 public _maturityWindow;

    struct ProtectionMappedData{
        address pool;
        address underlyingAsset;
        uint256 amount;
        uint256 strike;
        uint256 premium;
        uint256 lockedValue;
        uint256 totalValue;
        uint issueTime;
        uint expirationTime;
        bool isProtectionAlive;
    }

    constructor(address copMappingAddress, address moartrollerAddress) public ERC721("c-uUNN OC-Protection", "c-uUNN") {
        _copMappingAddress = copMappingAddress;
        _moartrollerAddress = moartrollerAddress;
        _setMaturityWindow(10800); // 3 hours default
    }

    function copMapping() private view returns (CopMappingInterface){
        return CopMappingInterface(_copMappingAddress);
    }

    function mint(uint256 underlyingTokenId) public returns (uint256)
    {
        return mintFor(underlyingTokenId, msg.sender);
    }

    function mintFor(uint256 underlyingTokenId, address receiver) public returns (uint256)
    {
        CopMappingInterface copMappingInstance = copMapping();
        ERC721(copMappingInstance.getTokenAddress()).transferFrom(msg.sender, address(this), underlyingTokenId);
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(receiver, newItemId);
        addUProtectionIndexes(receiver, newItemId, underlyingTokenId);
        emit Mint(
            receiver,
            newItemId,
            underlyingTokenId,
            copMappingInstance.getUnderlyingAsset(underlyingTokenId),
            copMappingInstance.getUnderlyingAmount(underlyingTokenId),
            copMappingInstance.getUnderlyingStrikePrice(underlyingTokenId),
            copMappingInstance.getUnderlyingDeadline(underlyingTokenId)
        );
        
        return newItemId;
    }

    function redeem(uint256 tokenId) external returns (uint256) {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "cuUNN: caller is not owner nor approved");
        uint256 underlyingTokenId = getUnderlyingProtectionTokenId(tokenId);
        ERC721(copMapping().getTokenAddress()).transferFrom(address(this), msg.sender, underlyingTokenId);
        removeProtectionIndexes(tokenId);
        _burn(tokenId);
        emit Redeem(msg.sender, tokenId, underlyingTokenId);

        return underlyingTokenId;
    }

    function getMappedProtectionData(uint256 tokenId) public view returns (ProtectionMappedData memory){
        ProtectionMappedData memory data;
        (address pool, uint256 amount, uint256 strike, uint256 premium, uint issueTime , uint expirationTime) = getProtectionData(tokenId);
        data = ProtectionMappedData(pool, getUnderlyingAsset(tokenId), amount, strike, premium, getUnderlyingProtectionLockedValue(tokenId), getUnderlyingProtectionTotalValue(tokenId), issueTime, expirationTime, isProtectionAlive(tokenId));
        return data;
    }

    function getUnderlyingProtectionTokenId(uint256 tokenId) public view returns (uint256){
        return _underlyingProtectionTokensMapping[tokenId];
    }

    function getUserUnderlyingProtectionTokenIdByCurrencySize(address owner, address currency) public view returns (uint256){
        return _protectionCurrencyMapping[owner][currency].length();
    }

    function getUserUnderlyingProtectionTokenIdByCurrency(address owner, address currency, uint256 index) public view returns (uint256){
        return _protectionCurrencyMapping[owner][currency].at(index);
    }

    function isUserProtection(address owner, uint256 tokenId) public view returns(bool) {
        if(Moartroller(_moartrollerAddress).isPrivilegedAddress(msg.sender)){
            return true;
        }
        return owner == ownerOf(tokenId);
    }

    function isProtectionAlive(uint256 tokenId) public view returns(bool) {
       uint256 deadline = getUnderlyingDeadline(tokenId);
       return (deadline - _maturityWindow) > now;
    }

    function addUProtectionIndexes(address owner, uint256 tokenId, uint256 underlyingTokenId) private{
        address currency = copMapping().getUnderlyingAsset(underlyingTokenId);
        _underlyingProtectionTokensMapping[tokenId] = underlyingTokenId;
        _protectionCurrencyMapping[owner][currency].add(tokenId);
    }

    function removeProtectionIndexes(uint256 tokenId) private{
        address owner = ownerOf(tokenId);
        address currency = getUnderlyingAsset(tokenId);
        _underlyingProtectionTokensMapping[tokenId] = 0;
        _protectionCurrencyMapping[owner][currency].remove(tokenId);
    }

    function getUnderlyingProtectionTotalValue(uint256 tokenId) public view returns(uint256){
        address underlyingAsset = getUnderlyingAsset(tokenId);
        uint256 assetDecimalsMantissa = getAssetDecimalsMantissa(underlyingAsset);

        return div_(
            mul_(
                getUnderlyingStrikePrice(tokenId),
                getUnderlyingAmount(tokenId)
            ),
            assetDecimalsMantissa
        );
    }

    function getUnderlyingProtectionLockedValue(uint256 tokenId) public view returns(uint256){
        return _underlyingProtectionLockedValue[tokenId];
    }

    /**
     * @notice get the amount of underlying asset that is locked
     * @param tokenId CProtection tokenId
     * @return amount locked
     */
    function getUnderlyingProtectionLockedAmount(uint256 tokenId) public view returns(uint256){
        address underlyingAsset = getUnderlyingAsset(tokenId);
        uint256 assetDecimalsMantissa = getAssetDecimalsMantissa(underlyingAsset);

        // calculates total protection value
        uint256 protectionValue = div_(
            mul_(
                getUnderlyingAmount(tokenId),
                getUnderlyingStrikePrice(tokenId)
            ),
            assetDecimalsMantissa
        );

        // return value is lockedValue / totalValue * amount
        return div_(
            mul_(
                getUnderlyingAmount(tokenId),
                div_(
                    mul_(
                        _underlyingProtectionLockedValue[tokenId],
                        1e18
                    ),
                    protectionValue
                )
            ),
            assetDecimalsMantissa
        );
    }

    /**
     * @notice Locks the given protection value as collateral optimization
     * @param tokenId The CProtection token id
     * @param value The value in stablecoin of protection to be locked as collateral optimization. 0 = max available optimization
     * @return locked protection value
     * TODO: convert semantic errors to standarized error codes
     */
    function lockProtectionValue(uint256 tokenId, uint value) external returns(uint) {
        //check if the protection belongs to the caller
        require(isUserProtection(msg.sender, tokenId), "ERROR: CALLER IS NOT THE OWNER OF PROTECTION");

        address currency = getUnderlyingAsset(tokenId);

        Moartroller moartroller = Moartroller(_moartrollerAddress);
        MToken cToken = moartroller.tokenAddressToCToken(currency);
        require(moartroller.oracle().getUnderlyingPrice(cToken) <= getUnderlyingStrikePrice(tokenId), "ERROR: C-OP STRIKE PRICE IS LOWER THAN ASSET SPOT PRICE");

        uint protectionTotalValue = getUnderlyingProtectionTotalValue(tokenId);
        uint maxOptimizableValue = moartroller.getMaxOptimizableValue(cToken, ownerOf(tokenId));

        // add protection locked value if any
        uint protectionLockedValue = getUnderlyingProtectionLockedValue(tokenId);
        if ( protectionLockedValue > 0) {
            maxOptimizableValue = add_(maxOptimizableValue, protectionLockedValue);
        }

        uint valueToLock;

        if (value != 0) {
            // check if lock value is at most max optimizable value
            require(value <= maxOptimizableValue, "ERROR: VALUE TO BE LOCKED EXCEEDS ALLOWED OPTIMIZATION VALUE");
            // check if lock value is at most protection total value
            require( value <= protectionTotalValue, "ERROR: VALUE TO BE LOCKED EXCEEDS PROTECTION TOTAL VALUE");
            valueToLock = value;
        } else {
            // if we want to lock maximum protection value let's lock the value that is at most max optimizable value
            if (protectionTotalValue > maxOptimizableValue) {
                valueToLock = maxOptimizableValue;
            } else {
                valueToLock = protectionTotalValue;
            }
        }

        _underlyingProtectionLockedValue[tokenId] = valueToLock;
        emit LockValue(tokenId, getUnderlyingProtectionTokenId(tokenId), valueToLock);
        return valueToLock;
    }

    function _setCopMapping(address newMapping) public onlyOwner {
        _copMappingAddress = newMapping;
    }

    function _setMoartroller(address newMoartroller) public onlyOwner {
        _moartrollerAddress = newMoartroller;
    }

    function _setMaturityWindow(uint256 maturityWindow) public onlyOwner {
        emit MaturityWindowUpdated(maturityWindow);
        _maturityWindow = maturityWindow;
    }


    // MAPPINGS 
    function getProtectionData(uint256 tokenId) public view returns (address, uint256, uint256, uint256, uint, uint){
        uint256 underlyingTokenId = getUnderlyingProtectionTokenId(tokenId);
        return copMapping().getProtectionData(underlyingTokenId);
    }

    function getUnderlyingAsset(uint256 tokenId) public view returns (address){
        uint256 underlyingTokenId = getUnderlyingProtectionTokenId(tokenId);
        return copMapping().getUnderlyingAsset(underlyingTokenId);
    }

    function getUnderlyingAmount(uint256 tokenId) public view returns (uint256){
        uint256 underlyingTokenId = getUnderlyingProtectionTokenId(tokenId);
        return copMapping().getUnderlyingAmount(underlyingTokenId);
    }

    function getUnderlyingStrikePrice(uint256 tokenId) public view returns (uint){
        uint256 underlyingTokenId = getUnderlyingProtectionTokenId(tokenId);
        return copMapping().getUnderlyingStrikePrice(underlyingTokenId);
    }

    function getUnderlyingDeadline(uint256 tokenId) public view returns (uint){
        uint256 underlyingTokenId = getUnderlyingProtectionTokenId(tokenId);
        return copMapping().getUnderlyingDeadline(underlyingTokenId);
    }

}