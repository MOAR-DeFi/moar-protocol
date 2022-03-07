// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";
import "./Interfaces/Cop/IOCProtectionSeller.sol";
import "./Interfaces/Cop/IUUNNRegistry.sol";
import "./Interfaces/MErc20Interface.sol";
import "./Interfaces/EIP20Interface.sol";
import "./MProtection.sol";
import "./Utils/SafeEIP20.sol";
import "./Moartroller.sol";

/**
 * @title MOAR's LendingRouter Contract
 * @notice Helps to buy C-OP, deposit it and make a borrow in one transaction
 * @author MOAR
 */
contract LendingRouter is Initializable, OwnableUpgradeable, IERC721ReceiverUpgradeable {

    using SafeEIP20 for EIP20Interface;

    /**
     * @notice Event emitted when C-OP is received by LendingRouter contract
     */
    event ProtectionReceived(address operator, address from, uint256 tokenId);

    IUUNNRegistry private protectionToken;
    MProtection private cProtectionToken;
    EIP20Interface private baseCurrency;
    Moartroller private moartroller;

    // /**
    //  * @notice LendingRouter constructor 
    //  * @param _protectionToken Address of C-OP contract
    //  * @param _cProtectionToken Address of MProtection contract
    //  * @param _baseCurrency Address of base token contract used to pay premium
    //  */
    // constructor(address _protectionToken, address _cProtectionToken, address _baseCurrency, address _moartroller) public {
    //     protectionToken = IUUNNRegistry(_protectionToken);
    //     cProtectionToken = MProtection(_cProtectionToken);
    //     baseCurrency = EIP20Interface(_baseCurrency);
    //     moartroller = Moartroller(_moartroller);
    // }

    function initialize(
        address _protectionToken, 
        address _cProtectionToken, 
        address _baseCurrency, 
        address _moartroller
    ) public initializer {
        __Ownable_init();
        protectionToken = IUUNNRegistry(_protectionToken);
        cProtectionToken = MProtection(_cProtectionToken);
        baseCurrency = EIP20Interface(_baseCurrency);
        moartroller = Moartroller(_moartroller);
    }

    /**
     * @notice Set new C-OP contract address
     * @param _protectionToken Address of C-OP contract
     */
    function setProtection(address _protectionToken) onlyOwner public {
        protectionToken = IUUNNRegistry(_protectionToken);
    }

    /**
     * @notice Set new MProtection contract address
     * @param _cProtectionToken Address of MProtection contract
     */
    function setCProtection(address _cProtectionToken) onlyOwner public {
        cProtectionToken = MProtection(_cProtectionToken);
    }

    /**
     * @notice Set new base token contract address
     * @param _baseCurrency Address of base token contract
     */
    function setBaseCurrency(address _baseCurrency) onlyOwner public {
        baseCurrency = EIP20Interface(_baseCurrency);
    }

    /**
     * @notice Allows admin to rescue tokens lost on LendingRouter contract (which shoundn't happen)
     * @param to Address of base token contract
     * @param amount Amount of token to rescue
     */
    function rescueBaseCurrency(address to, uint256 amount) onlyOwner public {
        baseCurrency.safeTransfer(to, amount);
    }

    /**
     * @notice Allows admin to rescue tokens lost on LendingRouter contract (which shoundn't happen)
     * @param protectionSeller Address of C-OP Protection Seller contract
     * @param merc20Token MToken synthetic of token that should be borrowed
     * @param borrowAmount Amount of tokens to borrow
     * param pool Address of pool passed to Protection Seller contract
     * param validTo Lifetime period passed to Protection Seller contract
     * param amount Amount of tokens that will be covered by C-OP 
     * param strike Strike price passed to C-OP Protection Seller contract
     * param deadline Expiration time of C-OP passed to Protection Seller contract
     * @param data Additional data passed to Protection Seller contract
     * @param signature Signature used to validate data passed to Protection Seller contract
     */
     function purchaseProtectionAndMakeBorrow(
        IOCProtectionSeller protectionSeller, 
        MErc20Interface merc20Token, 
        uint256 borrowAmount, 
        uint256[11] memory data, 
        bytes memory signature,
        // =====
        address[] calldata mTokenAssets,
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsValidTo,
        bytes[] calldata accountAssetsPriceSignatures
    ) public {

        baseCurrency.safeTransferFrom(msg.sender, address(this), data[1]);
        baseCurrency.safeApprove(address(protectionSeller), data[1]);
        protectionSeller.create(address(data[6]), data[3], data[4], data[5], data[10], data, signature);
        // uint256 underlyingTokenId = data[0];
        protectionToken.approve(address(cProtectionToken), /**underlyingTokenId*/ data[0]);
       
        _purchaseProtectionAndMakeBorrow(
            merc20Token, 
            borrowAmount, 
            data[0], 
            // =====
            mTokenAssets, 
            accountAssetsPriceMantissa, 
            accountAssetsValidTo,
            accountAssetsPriceSignatures
        );
    }

    function _purchaseProtectionAndMakeBorrow(
        MErc20Interface merc20Token, 
        uint256 borrowAmount, 
        uint256 tokenId,
        // =====
        address[] calldata mTokenAssets, 
        uint256[] memory accountAssetsPriceMantissa, 
        uint256 accountAssetsValidTo,
        bytes[] calldata accountAssetsPriceSignatures
    ) private {
        uint cProtectionId = cProtectionToken.mintFor(tokenId, msg.sender);
        uint256 mTokenPrice = accountAssetsPriceMantissa[accountAssetsPriceMantissa.length - 1];
        uint256 mTokenPriceValidTo = accountAssetsValidTo;
        bytes memory mTokenPriceSignature = accountAssetsPriceSignatures[accountAssetsPriceSignatures.length - 1];

        cProtectionToken.lockProtectionValue(cProtectionId, 0, mTokenPrice, mTokenPriceValidTo, mTokenPriceSignature);
        uint256[] memory _accountAssetsPriceMantissa = new uint256[](accountAssetsPriceMantissa.length - 1);
        for(uint256 i = 0; i < _accountAssetsPriceMantissa.length - 1; i++){
            _accountAssetsPriceMantissa[i] = moartroller.oracle().getUnderlyingPriceSigned(mTokenAssets[i], accountAssetsPriceMantissa[i], mTokenPriceValidTo, accountAssetsPriceSignatures[i]);
        }
        merc20Token.borrowFor(msg.sender, borrowAmount, _accountAssetsPriceMantissa);
    }

    /**
     * @notice Deposits C-OP, mints MProtection token and optimizes it
     * @param underlyingTokenId Id of C-OP token that will be deposited
     */
    function depositProtectionAndOptimize(
        uint256 underlyingTokenId,
        uint256 mTokenPrice,
        uint256 validToPrice,
        bytes calldata priceSignature
    ) public {
        require(protectionToken.ownerOf(underlyingTokenId) == msg.sender, "Only owner of C-OP can call this action");
        protectionToken.transferFrom(msg.sender, address(this), underlyingTokenId);
        protectionToken.approve(address(cProtectionToken), underlyingTokenId);
        uint cProtectionId = cProtectionToken.mintFor(underlyingTokenId, msg.sender);
        cProtectionToken.lockProtectionValue(cProtectionId, 0, mTokenPrice, validToPrice, priceSignature);
    }

    /**
     * @notice Called when contract receives ERC-721 token
     */
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external override returns (bytes4){
        data;
        emit ProtectionReceived(operator, from, tokenId);
        return this.onERC721Received.selector;
    }

}