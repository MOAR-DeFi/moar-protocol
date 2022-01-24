// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract SMoarAnchor is ReentrancyGuard, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for ERC20;

    ERC20 stable;
    ERC20 sMoar;

    uint256 public stableRate;
    uint256 public sMoarRate;

    event SetStableRatePerSMoar(uint256 oldStableRate, uint256 newStableRate);
    event SetSMoarRatePerStable(uint256 oldSMoarRate, uint256 newSMoarRate);

    constructor(address _stable, address _sMoar) public Ownable() {
        stable = ERC20(_stable);
        sMoar = ERC20(_sMoar);
        sMoarRate = 99;
        stableRate = 101;
    }

    function setStableRatePerSMoar(uint256 _rate) public onlyOwner{
        emit SetStableRatePerSMoar(stableRate, _rate);
        stableRate = _rate;
    }

    function setSMoarRatePerStable(uint256 _rate) public onlyOwner{
        emit SetSMoarRatePerStable(sMoarRate, _rate);
        sMoarRate = _rate;
    }

    function rescueToken(address token, uint256 amountToken) public onlyOwner{
        ERC20(token).safeTransfer(owner(), amountToken);
    }

    function getReserves() public view returns(uint256, uint256) {
    	return ( sMoar.balanceOf(address(this)), stable.balanceOf(address(this)) );
    }

    function swapFrom(uint256 amount) public nonReentrant {
    	require(amount!=0, "swapFrom: invalid amount");
    	require(sMoar.balanceOf(address(this))!=0, "swapFrom: Not enough sMoar in reserves");

	    // for every 1.01 stable we get 1.00 sMoar
	    	// 1010000000000000000 we get 1000000000000000000
        uint256 stabilization = 100;
	    uint256 amountToSend = amount.mul(stabilization).div(stableRate);

	    require(sMoar.balanceOf(address(this)) >= amountToSend, "swapFrom: Not enough stable in reserves");

	    stable.safeTransferFrom(msg.sender, address(this), amount);
	    sMoar.safeTransfer(msg.sender, amountToSend);
	}

    function swapTo(uint256 amount) public nonReentrant {
    	require(amount!=0, "swapTo: invalid amount");
    	require(stable.balanceOf(address(this))!=0, "swapTo: Not enough stable in reserves");
	    // for every 1.00 sMoar we get 0.99 stable
	    	// 1000000000000000000 we get 990000000000000000
        uint256 stabilization = 100;
	    uint256 amountToSend = amount.mul(sMoarRate).div(stabilization);

	    require(stable.balanceOf(address(this)) >= amountToSend, "swapTo: Not enough sMoar in reserves");

	    // Tranfer tokens from sender to this contract
	    sMoar.safeTransferFrom(msg.sender, address(this), amount);
	    // Transfer amount minus fees to sender
	    stable.safeTransfer(msg.sender, amountToSend);
	}
}