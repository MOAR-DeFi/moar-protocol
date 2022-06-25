// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

// import "@openzeppelin/contracts/token/ERC20/IERC20Upgradeable.sol";
// import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

import "../Interfaces/Vesting/uniswap/IUniswapV2Pair.sol";
import "../Interfaces/Vesting/uniswap/IUniswapRouterV2.sol";
import "../Interfaces/Vesting/IMultiFeeDistribution.sol";

//Contract where the fees are sent to before they are converted and sent to the feeDistributor contract
contract ERCFund is Initializable, OwnableUpgradeable {
    // using SafeERC20 for IERC20;
    // using SafeMath for uint256;

    using SafeERC20Upgradeable for IERC20Upgradeable;
    using SafeMathUpgradeable for uint256;

    // address public constant weth = 0xc778417E063141139Fce010982780140Aa0cD5Ab; //weth 
    // address public currentRouter = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D; //Uniswap/Quickswap router
    // address public defaultConversion = 0x3813a8Ba69371e6DF3A89b78bf18fC72Dd5B43c5; //USDC address
    // address public feeDistributor;

    /// @notice address of WETH contract
    address public weth;

    /// @notice address of current router contract
    address public currentRouter;

    /// @notice address of default conversion contract
    address public defaultConversion;

    /// @notice address of fee distributor contract
    address public feeDistributor;


    /// @notice fee sharing enable indicator
    bool public feeSharingEnabled = false;


    uint256 public fee = 200;
    uint256 public feeMAX = 10000;

    event SetFeeDistributor(address indexed oldFeeDistributor, address indexed newFeeDistributor);
    event SetFeeSharingEnabled(bool enabled);
    event SetDefaultConversionAsset(address indexed oldDefaultConversionAsset, address indexed newDefaultConversionAsset);
    event SetFee(uint256 oldFee, uint256 newFee);

    // constructor(address distributor) public {
    //     feeDistributor = distributor;
    // }

    /**
     * @notice Initializer of ERCFund contruct
     * @param _weth address of WETH contract
     * @param _currentRouter address of UniswapRouterV2 contract
     * @param _defaultConversion of default conversion contract
     * @param _feeDistributor of fee distributor contract
     */
    function initialize(
        address _weth,
        address _currentRouter,
        address _defaultConversion,
        address _feeDistributor
    ) public initializer{
        __Ownable_init();
        weth = _weth;
        currentRouter = _currentRouter;
        defaultConversion = _defaultConversion;
        feeDistributor = _feeDistributor;
    }

    /**
     * @notice converts definite amount of token on Uniswap and feeDistributor notifies reward amount
     * @param token address of certain token
     */
    function convertAndNotify(address token) public {
        uint256 balance = IERC20Upgradeable(token).balanceOf(address(this));
        if (balance > 0) {
            _swapUniswap(token, defaultConversion, balance);
        }
        notifyFeeDistribution(defaultConversion);
        emit Notified(token);
    }

    /**
     * @notice feeDistributor notifies reward amount
     * @param token address of certain token
     */
    function notifyFeeDistribution(address token) public {
        uint256 balance = IERC20Upgradeable(token).balanceOf(address(this));

        IERC20Upgradeable(token).safeApprove(feeDistributor, 0);
        IERC20Upgradeable(token).safeApprove(feeDistributor, balance);
        IMultiFeeDistribution(feeDistributor).notifyRewardAmount(token, balance);
        emit Notified(token);
    }
    
    //Doesn't support Fee on Transfer tokens, convert those to something else first
    //Transfer token from sender, then transfers it to the fee distributor
    function depositToFeeDistributor(address token, uint256 amount) public {
        IERC20Upgradeable(token).safeTransferFrom(msg.sender, address(this), amount);

        IERC20Upgradeable(token).safeApprove(feeDistributor, 0);
        IERC20Upgradeable(token).safeApprove(feeDistributor, amount);
        IMultiFeeDistribution(feeDistributor).notifyRewardAmount(token, amount);
        emit Notified(token);
    }

    /* ========== VIEW FUNCTIONS ========== */

    /**
     * @return feeSharingEnabled indicator enabled or not
     */
    function feeShareEnabled() external view returns (bool) {
        return feeSharingEnabled;
    }
    
    /**
     * @return fee amount
     */
    function getFee() external view returns (uint256) {
        return fee;
    }

    /* ========== CONVERSION FUNCTIONS ========== */

    /**
     * @param token_in address of token which will be converted 
     * @param token_out address of token which will be received 
     */
    function convertFees(address token_in, address token_out) public onlyOwner {
        uint256 balance = IERC20Upgradeable(token_in).balanceOf(address(this));
        if (balance > 0) {
            _swapUniswap(token_in, token_out, balance);
        }
    }

    /**
     * @param token_in address of token which will be converted 
     * @param token_out address of token which will be received 
     */
    function convertFeesWithPath(address token_in, address token_out) public onlyOwner {
        uint256 balance = IERC20Upgradeable(token_in).balanceOf(address(this));
        if (balance > 0) {
            address[] memory pair = new address[](2);
            pair[0] = token_in;
            pair[1] = token_out;
            _swapUniswapWithPath(pair, balance);
        }
    }

    /**
     * @param token_in address of token which will be converted 
     * @param token_out address of token which will be received 
     */
    function convertFeesWithPathForFeeOnTransferTokens(address token_in, address token_out) public onlyOwner {
        uint256 balance = IERC20Upgradeable(token_in).balanceOf(address(this));
        if (balance > 0) {
            address[] memory pair = new address[](2);
            pair[0] = token_in;
            pair[1] = token_out;
            _swapUniswapWithPathForFeeOnTransferTokens(pair, balance);
        }
    }

    /* ========== SETTER FUNCTIONS ========== */

    function setFeeDistributor(address distributor) public onlyOwner {
        emit SetFeeDistributor(feeDistributor, distributor);
        feeDistributor = distributor;
    }

    function setFeeSharingEnabled(bool enabled) public onlyOwner {
        emit SetFeeSharingEnabled(enabled);
        feeSharingEnabled = enabled;
    }

    function setDefaultConversionAsset(address asset) public onlyOwner {
        SetDefaultConversionAsset(defaultConversion, asset);
        defaultConversion = asset;
    }

    function setFee(uint256 _fee) public onlyOwner {
        require(_fee <= feeMAX,"ERCFund: input _fee exceeded feeMAX");
        emit SetFee(fee, _fee);
        fee = _fee;
    }

    /* ========== EMERGENCY FUNCTIONS ========== */

    /**
     * @notice owner sends all amount of definite token to his/her own address
     * @param token address of token to be recovered 
     */
    function recover(address token) public onlyOwner {
        uint256 _token = IERC20Upgradeable(token).balanceOf(address(this));
        if (_token > 0) {
            IERC20Upgradeable(token).safeTransfer(msg.sender, _token);
        }
        emit Recovered(token);
    }

    /* ========== UNISWAP FUNCTIONS ========== */

    /**
     * @param _from address of token to be swapped
     * @param _to address of token to be received
     * @param _amount amount of tokens to be swapped
     */
    function _swapUniswap(
        address _from,
        address _to,
        uint256 _amount
    ) internal {
        require(_to != address(0),"ERCFund: input _to is address(0)");

        // Swap with uniswap
        IERC20Upgradeable(_from).safeApprove(currentRouter, 0);
        IERC20Upgradeable(_from).safeApprove(currentRouter, _amount);

        address[] memory path;

        if (_from == weth || _to == weth) {
            path = new address[](2);
            path[0] = _from;
            path[1] = _to;
        } else {
            path = new address[](3);
            path[0] = _from;
            path[1] = weth;
            path[2] = _to;
        }

        IUniswapRouterV2(currentRouter).swapExactTokensForTokens(
            _amount,
            0,
            path,
            address(this),
            now.add(60)
        );
    }

    /**
     * @param path pair of token addresses to be swapped
     * @param _amount amount of tokens to be swapped
     */
    function _swapUniswapWithPath(
        address[] memory path,
        uint256 _amount
    ) internal {
        require(path[1] != address(0),"ERCFund: input path[1] is address(0)");

        // Swap with uniswap
        IERC20Upgradeable(path[0]).safeApprove(currentRouter, 0);
        IERC20Upgradeable(path[0]).safeApprove(currentRouter, _amount);

        IUniswapRouterV2(currentRouter).swapExactTokensForTokens(
            _amount,
            0,
            path,
            address(this),
            now.add(60)
        );
    }

    /**
     * @param path pair of token addresses to be swapped
     * @param _amount amount of tokens to be swapped
     */
    function _swapUniswapWithPathForFeeOnTransferTokens(
        address[] memory path,
        uint256 _amount
    ) internal {
        require(path[1] != address(0),"ERCFund: input path[1] is address(0)");

        // Swap with uniswap
        IERC20Upgradeable(path[0]).safeApprove(currentRouter, 0);
        IERC20Upgradeable(path[0]).safeApprove(currentRouter, _amount);

        IUniswapRouterV2(currentRouter).swapExactTokensForTokensSupportingFeeOnTransferTokens(
            _amount,
            0,
            path,
            address(this),
            now.add(60)
        );
    }

    // **** Events **** // (forgot to put these in the live version)
    event Recovered(address indexed tokenWithdrew);
    event Notified(address indexed tokenDeposited);
}