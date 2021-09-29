// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;

import "../Interfaces/EIP20Interface.sol";
import "../Interfaces/MProxyInterface.sol";
import "../Utils/SafeEIP20.sol";
import "../Interfaces/Vesting/IMultiFeeDistribution.sol";
import "../Interfaces/Vesting/IERCFund.sol";

contract MProxyV2 is MProxyInterface{

    using SafeEIP20 for EIP20Interface;

    address vestingContract;
    address reservesReceiver;

    constructor(address _vestingContract, address _reservesReceiver) public {
        vestingContract = _vestingContract;
        reservesReceiver = _reservesReceiver;
    }

    function proxyClaimReward(address asset, address recipient, uint amount) override external{
        EIP20Interface(asset).safeTransferFrom(msg.sender, address(this), amount);
        EIP20Interface(asset).approve(vestingContract, amount);
        IMultiFeeDistribution(vestingContract).mint(recipient, amount);
    }

    function proxySplitReserves(address asset, uint amount) override external{
        EIP20Interface(asset).safeTransferFrom(msg.sender, reservesReceiver, amount);
    }

}