// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../Interfaces/StrategyInterface.sol";

/**
 * @title MOAR's NoInterestLoan Farm Proxy Base
 * @author MOAR
 */
abstract contract StrategyBase is StrategyInterface, Ownable {

    address public override farmAddress;
    address public farmerAddress;
    address public override underlyingToken;

     constructor(
        address _farmAddress,
        address _underlyingToken
    ) public Ownable() {
        farmAddress = _farmAddress;
        farmerAddress = msg.sender;
        underlyingToken = _underlyingToken;
    }

    function updateFarmer(address _farmerAddress) public override onlyOwner{
        farmerAddress = _farmerAddress;
    }

    modifier onlyFarmer() {
        require(farmerAddress == _msgSender(), "Caller is not the farmer");
        _;
    }
}