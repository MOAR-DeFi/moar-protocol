// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20{

    constructor(string memory name_, string memory symbol_) public ERC20(name_, symbol_) {

    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

}

