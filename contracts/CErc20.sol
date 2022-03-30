// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;

import "./MToken.sol";
import "./Interfaces/MErc20Interface.sol";
import "./Moartroller.sol";
import "./InterestRateModel/AbstractInterestRateModel.sol";
import "./Interfaces/EIP20Interface.sol";
import "./Utils/SafeEIP20.sol";

/**
 * @title MOAR's MErc20 Contract
 * @notice MTokens which wrap an EIP-20 underlying
 */
contract MErc20 is MToken, MErc20Interface {

    using SafeEIP20 for EIP20Interface;

    address public merc20Proxy;
    
    /**
     * @notice Initialize the new money market
     * @param underlying_ The address of the underlying asset
     * @param moartroller_ The address of the Moartroller
     * @param interestRateModel_ The address of the interest rate model
     * @param initialExchangeRateMantissa_ The initial exchange rate, scaled by 1e18
     * @param name_ ERC-20 name of this token
     * @param symbol_ ERC-20 symbol of this token
     * @param decimals_ ERC-20 decimal precision of this token
     */
    function initialize (
        address merc20Proxy_,
        address underlying_,
        Moartroller moartroller_,
        AbstractInterestRateModel interestRateModel_,
        uint initialExchangeRateMantissa_,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address payable admin_
    ) public {
        admin = msg.sender;
        merc20Proxy = merc20Proxy_;
        // MToken initialize does the bulk of the work
        super.init(moartroller_, interestRateModel_, initialExchangeRateMantissa_, name_, symbol_, decimals_);

        // Set underlying and sanity check it
        underlying = underlying_;
        //EIP20Interface(underlying).totalSupply();

        admin = admin_;
    }

    /*** User Interface ***/

    /**
     * @notice Sender supplies assets into the market and receives mTokens in exchange
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param mintAmount The amount of the underlying asset to supply
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function mint(address minter, uint mintAmount) external override returns (uint) {
        require(msg.sender == merc20Proxy, "1");
        (uint err,) = mintInternal(minter, mintAmount);
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
    ) external override returns (uint) {
        require(msg.sender == merc20Proxy, "1");
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
    ) external override returns (uint) {
        require(msg.sender == merc20Proxy, "1");
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
    ) external override returns (uint) {
        require(msg.sender == merc20Proxy, "1");
        return borrowInternal(borrower, borrowAmount, accountAssetsPriceMantissa);
    }

    function borrowFor(
        address payable borrower, 
        uint borrowAmount,
        uint256[] memory accountAssetsPriceMantissa
    ) external override returns (uint) {
        require(moartroller.privilegedAddresses(msg.sender) == 1, "0");
        //require(msg.sender == merc20Proxy, "-");
        return borrowForInternal(borrower, borrowAmount, accountAssetsPriceMantissa);
    }

    /**
     * @notice Sender repays their own borrow
     * @param repayAmount The amount to repay
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function repayBorrow(
        address repayer,
        uint repayAmount
    ) external override returns (uint) {
        require(msg.sender == merc20Proxy, "1");
        (uint err,) = repayBorrowInternal(repayer,repayAmount);
        return err;
    }

    /**
     * @notice Sender repays a borrow belonging to borrower.
     * @param borrower the account with the debt being payed off
     * @param repayAmount The amount to repay
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function repayBorrowBehalf(
        address repayer,
        address borrower, 
        uint repayAmount
    ) external override returns (uint) {
        require(msg.sender == merc20Proxy, "1");
        (uint err,) = repayBorrowBehalfInternal(repayer, borrower, repayAmount);
        return err;
    }

    /**
     * @notice The sender liquidates the borrowers collateral.
     *  The collateral seized is transferred to the liquidator.
     * @param borrower The borrower of this mToken to be liquidated
     * @param repayAmount The amount of the underlying borrowed asset to repay
     * @param mTokenCollateral The market in which to seize collateral from the borrower
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function liquidateBorrow(
        address liquidator,
        address borrower,
        uint repayAmount, 
        MToken mTokenCollateral,
        uint256[] calldata accountAssetsPriceMantissa,
        uint256[] calldata mTokenBorrowedCollateralPrice
    ) external override returns (uint) {
        require(msg.sender == merc20Proxy, "1");
        (uint err,) = liquidateBorrowInternal(
            liquidator,
            borrower, 
            repayAmount, 
            mTokenCollateral, 
            accountAssetsPriceMantissa,
            mTokenBorrowedCollateralPrice
        );
        return err;
    }

    /**
     * @notice A public function to sweep accidental ERC-20 transfers to this contract. Tokens are sent to admin (timelock)
     * @param token The address of the ERC-20 token to sweep
     */
    function sweepToken(EIP20Interface token) override external {
    	require(address(token) != underlying, "2");
    	uint256 balance = token.balanceOf(address(this));
    	token.safeTransfer(admin, balance);
    }

    /**
     * @notice The sender adds to reserves.
     * @param addAmount The amount fo underlying token to add as reserves
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _addReserves(uint addAmount) external override returns (uint) {
        return _addReservesInternal(addAmount);
    }

    /*** Safe Token ***/

    /**
     * @notice Gets balance of this contract in terms of the underlying
     * @dev This excludes the value of the current message, if any
     * @return The quantity of underlying tokens owned by this contract
     */
    function getCashPrior() internal override view returns (uint) {
        EIP20Interface token = EIP20Interface(underlying);
        return token.balanceOf(address(this));
    }

    /**
     * @dev Similar to EIP20 transfer, except it handles a False result from `transferFrom` and reverts in that case.
     *      This will revert due to insufficient balance or insufficient allowance.
     *      This function returns the actual amount received,
     *      which may be less than `amount` if there is a fee attached to the transfer.
     *`
     *      Note: This wrapper safely handles non-standard ERC-20 tokens that do not return a value.
     *            See here: https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca
     */
    function doTransferIn(address from, uint amount) internal override returns (uint) {
        EIP20Interface token = EIP20Interface(underlying);
        uint balanceBefore = token.balanceOf(address(this));
        token.safeTransferFrom(from, address(this), amount);

        // Calculate the amount that was *actually* transferred
        uint balanceAfter = token.balanceOf(address(this));
        require(balanceAfter >= balanceBefore, "3");
        return balanceAfter - balanceBefore;   // underflow already checked above, just subtract
    }

    /**
     * @dev Similar to EIP20 transfer, except it handles a False success from `transfer` and returns an explanatory
     *      error code rather than reverting. If caller has not called checked protocol's balance, this may revert due to
     *      insufficient cash held in this contract. If caller has checked protocol's balance prior to this call, and verified
     *      it is >= amount, this should not revert in normal conditions.
     *
     *      Note: This wrapper safely handles non-standard ERC-20 tokens that do not return a value.
     *            See here: https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca
     */
    function doTransferOut(address payable to, uint amount) internal override {
        EIP20Interface token = EIP20Interface(underlying);
        token.safeTransfer(to, amount);
    }
}
