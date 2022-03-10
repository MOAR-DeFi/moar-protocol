// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "./MToken.sol";
import "./Moartroller.sol";
import "./InterestRateModel/AbstractInterestRateModel.sol";
import "./Interfaces/WETHInterface.sol";
import "./Interfaces/EIP20Interface.sol";
import "./Utils/SafeEIP20.sol";

/**
 * @title MOAR's MEther Contract
 * @notice MToken which wraps Ether
 * @author MOAR
 */
contract MWeth is MToken {

    using SafeEIP20 for EIP20Interface;

    address public mwethProxy;
    /**
     * @notice Construct a new MEther money market
     * @param underlying_ The address of the underlying asset
     * @param moartroller_ The address of the Moartroller
     * @param interestRateModel_ The address of the interest rate model
     * @param initialExchangeRateMantissa_ The initial exchange rate, scaled by 1e18
     * @param name_ ERC-20 name of this token
     * @param symbol_ ERC-20 symbol of this token
     * @param decimals_ ERC-20 decimal precision of this token
     * @param admin_ Address of the administrator of this token
     */
    constructor(
        address mwethProxy_,
        address underlying_,
        Moartroller moartroller_,
        AbstractInterestRateModel interestRateModel_,
        uint initialExchangeRateMantissa_,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address payable admin_
    ) public {
        mwethProxy = mwethProxy_;

        // Creator of the contract is admin during initialization
        admin = msg.sender;

        init(moartroller_, interestRateModel_, initialExchangeRateMantissa_, name_, symbol_, decimals_);

        // Set underlying and sanity check it
        underlying = underlying_;
        WETHInterface(underlying).totalSupply();

        // Set the proper admin now that initialization is done
        admin = admin_;
    }


    /*** User Interface ***/

    /**
     * @notice Sender supplies assets into the market and receives mTokens in exchange
     * @dev Reverts upon any failure
     */
    function mint() external payable returns(uint){
        WETHInterface(underlying).deposit{value : msg.value}();
        (uint err,) = mintInternal(msg.sender,msg.value);
        return err;
    }

    /**
     * @notice Sender redeems mTokens in exchange for the underlying asset
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param redeemTokens The number of mTokens to redeem into underlying
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function redeem(
        address redeemer,
        uint redeemTokens,
        uint256[] memory accountAssetsPriceMantissa
    ) external returns (uint) {
        require(msg.sender == mwethProxy, "access denied");
        return redeemInternal(redeemer, redeemTokens, accountAssetsPriceMantissa);
    }

    /**
     * @notice Sender redeems mTokens in exchange for a specified amount of underlying asset
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param redeemAmount The amount of underlying to redeem
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function redeemUnderlying(
        address redeemer,
        uint redeemAmount,
        uint256[] memory accountAssetsPriceMantissa
    ) external returns (uint) {
        require(msg.sender == mwethProxy, "access denied");
        return redeemUnderlyingInternal(redeemer, redeemAmount, accountAssetsPriceMantissa);
    }

    /**
      * @notice Sender borrows assets from the protocol to their own address
      * @param borrowAmount The amount of the underlying asset to borrow
      * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
      */
    function borrow(
        address borrower,
        uint borrowAmount,
        uint256[] memory accountAssetsPriceMantissa
    ) external returns (uint) {
        require(msg.sender == mwethProxy, "access denied");
        return borrowInternal(borrower, borrowAmount, accountAssetsPriceMantissa);
    }

    function borrowFor(
        address payable borrower, 
        uint borrowAmount,
        uint256[] memory accountAssetsPriceMantissa
    ) external returns (uint) {
        require(msg.sender == mwethProxy, "access denied");
        return borrowForInternal(borrower, borrowAmount, accountAssetsPriceMantissa);
    }

    /**
     * @notice Sender repays their own borrow
     * @dev Reverts upon any failure
     */
    function repayBorrow(
        address repayer
    ) external payable returns (uint) {
        require(msg.sender == mwethProxy, "access denied");
        WETHInterface(underlying).deposit{value : msg.value}();
        (uint err,) = repayBorrowInternal(repayer, msg.value);
        return err;
    }

    /**
     * @notice Sender repays a borrow belonging to borrower
     * @dev Reverts upon any failure
     * @param borrower the account with the debt being payed off
     */
    function repayBorrowBehalf(
        address repayer,
        address borrower
        ) external  payable returns (uint) {
        require(msg.sender == mwethProxy,"access denied");
        WETHInterface(underlying).deposit{value : msg.value}();
        (uint err,) = repayBorrowBehalfInternal(repayer, borrower, msg.value);
        // requireNoError(err, "repayBorrowBehalf failed");
        return err;
    }

    /**
     * @notice The sender liquidates the borrowers collateral.
     *  The collateral seized is transferred to the liquidator.
     * @dev Reverts upon any failure
     * @param borrower The borrower of this mToken to be liquidated
     * @param mTokenCollateral The market in which to seize collateral from the borrower
     */
    function liquidateBorrow(
        address liquidator,
        address borrower, 
        // uint repayAmount,
        MToken mTokenCollateral,
        uint256[] calldata accountAssetsPriceMantissa, 
        uint256[] calldata mTokenBorrowedCollateralPriceMantissa
    ) external payable returns (uint) {
        require(msg.sender == mwethProxy, "access denied");
        WETHInterface(underlying).deposit{value : msg.value}();        
        (uint err,) = liquidateBorrowInternal(
            liquidator,
            borrower, 
            msg.value,
            // repayAmount,
            mTokenCollateral,
            accountAssetsPriceMantissa,
            mTokenBorrowedCollateralPriceMantissa
        );
        return err;
    }

    /**
     * @notice The sender adds to reserves.
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _addReserves() external payable returns (uint) {
        WETHInterface(underlying).deposit{value : msg.value}();
        return _addReservesInternal(msg.value);
    }

    /**
     * @notice Send Ether to MEther to mint
     */
    receive () external payable {
        //there are not recommended to implement some code, because tranfer costs 2300 gas and extra code increases this amount 
    }

    /**
     * @notice A public function to sweep accidental ERC-20 transfers to this contract. Tokens are sent to admin (timelock)
     * @param token The address of the ERC-20 token to sweep
     */
    function sweepToken(EIP20Interface token) external override {
    	require(address(token) != underlying, "MErc20::sweepToken: can not sweep underlying token");
    	uint256 balance = token.balanceOf(address(this));
    	token.safeTransfer(admin, balance);
    }

    /*** Safe Token ***/

    /**
     * @notice Gets balance of this contract in terms of the underlying
     * @dev This excludes the value of the current message, if any
     * @return The quantity of underlying tokens owned by this contract
     */
    function getCashPrior() internal override view returns (uint) {
        EIP20Interface token = EIP20Interface(underlying);
        (MathError err, uint startingBalance) = subUInt(token.balanceOf(address(this)), msg.value);
        require(err == MathError.NO_ERROR);
        return startingBalance;
    }

    /**
     * @notice Perform the actual transfer in, which is a no-op
     * @param from Address sending the Ether
     * @param amount Amount of Ether being sent
     * @return The actual amount of Ether transferred
     */
    function doTransferIn(address from, uint amount) internal override returns (uint) {
        // Sanity checks
        require(msg.sender == from, "sender mismatch");
        require(msg.value == amount, "value mismatch");
        return amount;
    }

    /**
     * @notice Perform the transfer out
     * @param to Reciever address
     * @param amount Amount of Ether being sent
     */
    function doTransferOut(address payable to, uint amount) internal override {
        /* Send the Ether, with minimal gas and revert on failure */
        WETHInterface(underlying).withdraw(amount);
        to.transfer(amount);
    }

    // function requireNoError(uint errCode, string memory message) internal pure {
    //     if (errCode == uint(Error.NO_ERROR)) {
    //         return;
    //     }

    //     bytes memory fullMessage = new bytes(bytes(message).length + 5);
    //     uint i;

    //     for (i = 0; i < bytes(message).length; i++) {
    //         fullMessage[i] = bytes(message)[i];
    //     }

    //     fullMessage[i+0] = byte(uint8(32));
    //     fullMessage[i+1] = byte(uint8(40));
    //     fullMessage[i+2] = byte(uint8(48 + ( errCode / 10 )));
    //     fullMessage[i+3] = byte(uint8(48 + ( errCode % 10 )));
    //     fullMessage[i+4] = byte(uint8(41));

    //     require(errCode == uint(Error.NO_ERROR), string(fullMessage));
    // }
}
