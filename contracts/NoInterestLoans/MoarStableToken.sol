// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/drafts/ERC20Permit.sol";

contract MoarStableToken is ERC20, Ownable, ERC20Permit {
    
    mapping(address => bool) private privileged;

    constructor()
        ERC20("MOAR Stable Token", "sMOAR")
        ERC20Permit("MOAR Stable Token")
    public {
        updatePrivileged(_msgSender(), true);
    }

    function mint(address to, uint256 amount) public onlyPrivileged {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public onlyPrivileged {
        _burn(from, amount);
    }

    function updatePrivileged(address account, bool enabled) public onlyOwner {
        privileged[account] = enabled;
    }

    modifier onlyPrivileged() {
        require(privileged[_msgSender()] == true, "Caller is not privileged");
        _;
    }
    
}