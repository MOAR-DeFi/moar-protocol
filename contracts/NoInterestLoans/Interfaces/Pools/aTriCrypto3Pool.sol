// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

interface aTriCrypto3Pool{
    function add_liquidity(uint256[5] memory _amounts, uint256 _min_mint_amount) external;
    function remove_liquidity(uint256 _amounts, uint256[5] memory _min_amounts) external;
    function remove_liquidity_one_coin(uint256 token_amount, uint256 i, uint256 min_amount) external;
    function calc_token_amount(uint256[5] memory _amounts, bool _is_deposit) external view returns (uint256);
    function calc_withdraw_one_coin(uint256 token_amount, uint256 i) external view returns (uint256);
    function token() external view returns (address);
}


