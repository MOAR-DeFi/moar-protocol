// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MoarMockToken is ERC20, Ownable {
    constructor(uint256 initialSupply) public ERC20("MOAR Finance (TEST)", "MOAR") {
        _setupDecimals(18);
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) onlyOwner public virtual {
        _mint(to, amount);
    }
}
