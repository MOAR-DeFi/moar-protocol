// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../Interfaces/Farms/BeefyVaultV6Farm.sol";
import "../Interfaces/Pools/aTriCrypto3Pool.sol";
import "./StrategyBase.sol";
import "hardhat/console.sol";

/**
 * @title MOAR's NoInterestLoan Farm Proxy
 * @author MOAR
 */
contract aTriCrypto3BeefyVaultV6 is StrategyBase {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address poolAddress;
    uint256 assetIndex;
    uint256 slippageMantissa = 1e16; //default 1%

    constructor(
        address _poolAddress,
        address _farmAddress,
        address _underlyingToken,
        uint256 _assetIndex
    ) public StrategyBase(_farmAddress, _underlyingToken) {
        poolAddress = _poolAddress;
        assetIndex = _assetIndex;
    }

    function deposit(uint _amount) public override onlyFarmer returns (uint256){
        IERC20(underlyingToken).safeTransferFrom(msg.sender, address(this), _amount);
        
        aTriCrypto3Pool pool = aTriCrypto3Pool(poolAddress);
        uint256[5] memory amounts;
        amounts[assetIndex] = _amount;
        uint256 estimatedMinAmount = pool.calc_token_amount(amounts, true).mul(1e18 - slippageMantissa).div(1e18);
        IERC20(underlyingToken).approve(poolAddress, _amount);
        pool.add_liquidity(amounts, estimatedMinAmount);

        uint256 lpBalance = IERC20(pool.token()).balanceOf(address(this));
        IERC20(pool.token()).approve(farmAddress, lpBalance);

        uint256 farmBalanceBefore = IERC20(farmAddress).balanceOf(address(this));

        BeefyVaultV6Farm farm = BeefyVaultV6Farm(farmAddress);
        farm.deposit(lpBalance);

        return IERC20(farmAddress).balanceOf(address(this)).sub(farmBalanceBefore);
    }

    function withdraw(uint _amount) public override onlyFarmer returns (uint256){
        BeefyVaultV6Farm farm = BeefyVaultV6Farm(farmAddress);
        farm.withdraw(_amount);

        aTriCrypto3Pool pool = aTriCrypto3Pool(poolAddress);
        uint256 lpBalance = IERC20(pool.token()).balanceOf(address(this));

        uint256 estimatedMinAmount = pool.calc_withdraw_one_coin(lpBalance, assetIndex).mul(1e18 - slippageMantissa).div(1e18);

        IERC20(pool.token()).approve(poolAddress, lpBalance);
        uint256 assetBalanceBefore = IERC20(underlyingToken).balanceOf(address(this));
        pool.remove_liquidity_one_coin(lpBalance, assetIndex, estimatedMinAmount);
        uint256 withdrawnAssetAmount = IERC20(underlyingToken).balanceOf(address(this)).sub(assetBalanceBefore);

        IERC20(underlyingToken).safeTransfer(msg.sender, withdrawnAssetAmount);

        return withdrawnAssetAmount;
    }

    function balance() public view override returns (uint) {
        BeefyVaultV6Farm farm = BeefyVaultV6Farm(farmAddress);
        return farm.balanceOf(address(this));
    }

    function underlyingBalance() public view override returns (uint) {
        BeefyVaultV6Farm farm = BeefyVaultV6Farm(farmAddress);
        aTriCrypto3Pool pool = aTriCrypto3Pool(poolAddress);

        uint256 farmUnderlyingBalance = farm.balance().mul(farm.balanceOf(address(this))).div(farm.totalSupply());
        if(farmUnderlyingBalance > 0){
            return pool.calc_withdraw_one_coin(farmUnderlyingBalance, assetIndex);
        }
        else{
            return 0;
        }
    }

}