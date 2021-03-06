// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./Interfaces/NilPoolInterface.sol";
import "./Interfaces/StrategyInterface.sol";
import "./Interfaces/PriceOracle.sol";
import "./Interfaces/Uniswap/IUniswapV2Router02.sol";
import "./NilController.sol";
import "hardhat/console.sol";

/**
 * @title MOAR's NilPool Contract
 * @notice Base for NilPools
 * @author MOAR
 */
contract NilPool is NilPoolInterface, ReentrancyGuard, Ownable {

    using SafeMath for uint256;
    using SafeERC20 for ERC20;

    /* ========== STATE VARIABLES ========== */

    PriceOracle                             public oracle;
    ERC20                                   public inputAsset;
    StrategyInterface                       public strategy;
    NilController                           public nilController;           
    IUniswapV2Router02                      private swapRouter;     
    address[]                               private swapPath;           // path from inputAsset to stableMoar
    uint256                                 public collateralFactor;    // [collateralFactor] = 1 / 10**18
    uint256                                 public closeFactor;         // [closeFactor] = 1 / 10**18
    uint256                                 public liquidationIncentive;// [liquidationIncentive] = 1
    uint256                                 public performanceFee;      // [performanceFee] = 1
    uint256                                 public totalDeposits;       // [totalDeposits] = inputAsset;
    uint256                                 public totalShares;         // [totalShares] = lpToken
    uint256                                 public totalBorrows;        // [totalBorrows]
    mapping(address => UserData)            public userData;

    /* ========== DATA STRUCTURES ========= */

    struct UserData {
        uint256 deposit;    // [deposit] = inputAsset
        uint256 shares;     // [shares] = lpToken
        uint256 borrow;     // [borrow] = 
    }

    /* ========== EVENTS ========== */

    event Deposit(address user, uint assetAmount);
    event Withdraw(address user, uint assetAmount);
    event Borrow(address user, uint sMoarAmount);
    event Repay(address user, uint sMoarAmount);
    event Liquidation(address liquidator, address userToLiquidate, uint256 amount, uint256 incentive);

    event Claim(address user, uint rewardAmount);

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _strategy,
        address _inputAsset,
        address _nilController,
        address _oracle,
        uint256 _collateralFactor,
        uint256 _closeFactor,
        uint256 _liquidationIncentive,
        uint256 _performanceFee,
        address _swapRouter,
        address[] memory _swapPath
    ) public Ownable() {
        oracle = PriceOracle(_oracle);
        inputAsset = ERC20(_inputAsset);
        strategy = StrategyInterface(_strategy);
        nilController = NilController(_nilController);
        swapRouter = IUniswapV2Router02(_swapRouter);
        swapPath = _swapPath;
        collateralFactor = _collateralFactor;
        liquidationIncentive = _liquidationIncentive;
        closeFactor = _closeFactor;
        performanceFee = _performanceFee;
    }

    /* ========== NIL MUTATIVE ========== */

    /**
     * @dev Deposit inputAssset and stake it to farming
     */
    function deposit(uint amount) external override nonReentrant {
        updateState();
        inputAsset.safeTransferFrom(msg.sender, address(this), amount);
        depositInternal(msg.sender, amount);
    }

    function depositInternal(address user, uint amount) internal {
        require(amount > 0, "Cannot deposit 0");

        inputAsset.approve(address(strategy), amount);
        uint256 recivedLp = strategy.deposit(amount);

        userData[user].shares = userData[user].shares.add(recivedLp);
        totalShares = totalShares.add(recivedLp);
        userData[user].deposit = underlyingBalanceOf(user);

        emit Deposit(user, amount);
    }

    /**
     * @dev Withdraw inputAsset and unstake it from farming
     */
    function withdraw(uint amount) public override nonReentrant {
        updateState();
        withdrawInternal(msg.sender, amount);
    }

    /**
     * @dev A helper function to call withdraw() with all the sender's funds.
     */
    function withdrawAll() external override nonReentrant { 
        updateState();
        withdrawInternal(msg.sender, userData[msg.sender].shares);
    }

    function withdrawInternal(address user, uint amount) internal {
        require(amount > 0, "Cannot withdraw 0");

        uint256 withdrawnUnderlying = strategy.withdraw(amount);

        userData[user].shares = userData[user].shares.sub(amount, "Withdraw amount too big");
        totalShares = totalShares.sub(amount);
        userData[user].deposit = underlyingBalanceOf(user);

        (uint256 collateral, uint256 shorfall) = liquidityOf(user);
        require(collateral >= 0 && shorfall == 0, "Insufficient liquidity");
        inputAsset.safeTransfer(user, withdrawnUnderlying);

        emit Withdraw(user, withdrawnUnderlying);
    }
    
    /**
     * @dev Borrow the stableMoar
     */
    function borrow(uint amount) external override nonReentrant {
        updateState();
        borrowInternal(msg.sender, amount);
    }

    function borrowInternal(address user, uint amount) internal {
        require(amount > 0, "Cannot borrow 0");
        
        (uint256 collateral, ) = liquidityOf(user);
        require(collateral >= amount, "Insufficient liquidity");

        userData[user].deposit = underlyingBalanceOf(user);
        userData[user].borrow = userData[user].borrow.add(amount);
        totalBorrows = totalBorrows.add(amount);

        nilController.mintStableMoar(user, amount);
        
        emit Borrow(user, amount);
    }

    /**
     * @dev Repay the stableMoar
     */
    function repay(uint amount) public override nonReentrant {
        updateState();
        repayInternal(msg.sender, amount);
    }

    /** 
     * @dev A helper function to call repay() with all the sender's borrow balance.
     */
    function repayAll() external override {
        updateState();
        repayInternal(msg.sender, userData[msg.sender].borrow.mul(uint256(1e18).add(performanceFee)).div(1e18));
    }

    function repayInternal(address user, uint amount) internal {
        require(amount > 0, "Cannot repay 0");
        require(amount <= userData[msg.sender].borrow.mul(uint256(1e18).add(performanceFee)).div(1e18), "Repay amount too big");
        
        nilController.burnStableMoar(user, amount);

        uint256 amountAfterFee = amount.mul(1e18).div(uint256(1e18).add(performanceFee));

        userData[user].borrow = userData[user].borrow.sub(amountAfterFee);
        totalBorrows = totalBorrows.sub(amountAfterFee);    

        emit Repay(user, amountAfterFee);
    }

    /**
     * @dev Liquidate the inputAsset by providing stableMoar
     */
    function liquidate(address userToLiquidate, uint amount) external override nonReentrant { 
        liquidateInternal(msg.sender, userToLiquidate, amount);
    }

    function liquidateInternal(address liquidator, address userToLiquidate, uint amount) internal {
        (uint256 collateral, uint256 shortfall) = liquidityOf(userToLiquidate);
        require(collateral == 0 && shortfall > 0, "User has positive liquidity");

        uint256 maxAmount = userData[userToLiquidate].borrow.mul(closeFactor).div(1e18);
        require(amount <= maxAmount, "Amount too big");

        uint256 depositToLiquidate = amount.mul(liquidationIncentive).div(oracle.getAssetPrice(address(inputAsset)));
        uint256 underlyingBalanceOfUserToLiquidate = underlyingBalanceOf(userToLiquidate);
        if(depositToLiquidate > underlyingBalanceOfUserToLiquidate){
            depositToLiquidate = underlyingBalanceOfUserToLiquidate;
        }

        nilController.burnStableMoar(liquidator, amount);
        userData[userToLiquidate].borrow = userData[userToLiquidate].borrow.sub(amount);
        totalBorrows = totalBorrows.sub(amount);    

        uint256 sharesToWithdraw = userData[userToLiquidate].shares.mul(depositToLiquidate).div(underlyingBalanceOfUserToLiquidate);
        uint256 withdrawnUnderlying = strategy.withdraw(sharesToWithdraw);
                
        userData[userToLiquidate].shares = userData[userToLiquidate].shares.sub(sharesToWithdraw);
        totalShares = totalShares.sub(sharesToWithdraw);
        userData[userToLiquidate].deposit = underlyingBalanceOf(userToLiquidate);

        inputAsset.safeTransfer(liquidator, withdrawnUnderlying);

        emit Liquidation(liquidator, userToLiquidate, amount, withdrawnUnderlying);
    }

    /**
     * @dev Claim
     */
    function claim() public nonReentrant {
       updateState();
    }

    function updateState() internal {
        if(userData[msg.sender].borrow > 0){
            uint256 underlyingBalanceOfUser = underlyingBalanceOf(msg.sender); // [underlyingBalanceOfUser] = inputAsset
            if(underlyingBalanceOfUser > userData[msg.sender].deposit){
                uint256 dust = 10**12;
                uint256 diff = underlyingBalanceOfUser.sub(userData[msg.sender].deposit); //diff is yield earned in farming, [diff] = inputAsset
               

                uint256 sharesToWithdraw = userData[msg.sender].shares.mul(diff).div(underlyingBalanceOfUser); // [sharesToWithdraw] = lpToken
                userData[msg.sender].shares = userData[msg.sender].shares.sub(sharesToWithdraw);
                totalShares = totalShares.sub(sharesToWithdraw);

                uint256 balanceBefore = inputAsset.balanceOf(address(this));        // [balanceBefore] = inputAsset
                uint256 withdrawnUnderlying = strategy.withdraw(sharesToWithdraw);  // [withdrawnUnderlying] = inputAsset

                uint256 diffInStableMoar = swapRouter.getAmountsOut(withdrawnUnderlying, swapPath)[swapPath.length - 1]; // [diffInStableMoar] = stableMoar
                if(diffInStableMoar > userData[msg.sender].borrow){ //diffInStableMoar cant be more that borrow
                    diffInStableMoar = userData[msg.sender].borrow;
                }
                if(diffInStableMoar > 0){
                    require(diff > dust && withdrawnUnderlying > dust, "Diff or withdrawnUnderlying is less than 10**12");
                    inputAsset.approve(address(swapRouter), withdrawnUnderlying); // give permission to transferFrom inputAsset to uniswapRouter
                    swapRouter.swapTokensForExactTokens(diffInStableMoar, withdrawnUnderlying, swapPath, msg.sender, now.add(1800)); // msg.sender receives stableMoar

                    repayInternal(msg.sender, diffInStableMoar);
                    
                    uint256 excess = inputAsset.balanceOf(address(this)).sub(balanceBefore);
                    if(excess > 0){
                        depositInternal(msg.sender, excess);
                    }
                }
            }
        }
    }

    /* ========== VIEWS ========== */

    function rewardToken() public view override returns (ERC20) {
        return ERC20(swapPath[swapPath.length - 1]);
    }

    function underlyingBalanceOf(address user) public view override returns (uint256) {
        require(totalShares != 0, "totalShares == 0");
        return strategy.underlyingBalance().mul(userData[user].shares).div(totalShares);
    }

    function collateralValue(uint256 assetAmount) public view override returns (uint256) {
        return oracle.getAssetPrice(address(inputAsset))
            .mul(assetAmount)
            .mul(collateralFactor)
            .div(1e18)
            .div(10 ** uint256(inputAsset.decimals()));
    }

    function collateralValueToAssetAmount(uint256 value) public view override returns (uint256) { 
        return value
        .mul(1e18)
        .mul(10 ** uint256(inputAsset.decimals()))
        .div(collateralFactor)
        .div(oracle.getAssetPrice(address(inputAsset)));
    }

    function liquidityOf(address user) public view override returns (uint256, uint256) {
        uint256 collateral = collateralValue(underlyingBalanceOf(user));
        if(collateral > userData[user].borrow){
            return (collateral.sub(userData[user].borrow), 0);
        }
        else{
            return (0, userData[user].borrow.sub(collateral));
        }
    }
       
    /* ========== ADMIN CONFIGURATION ========== */

    function setCollateralFactor(uint256 _collateralFactor) external onlyOwner {
        require(_collateralFactor <= 10**18, "Invalid collateral factor");
        emit SetCollateralFactor(collateralFactor, _collateralFactor);
        collateralFactor = _collateralFactor;
    }

    function setCloseFactor(uint256 _closeFactor) external onlyOwner {
        require(_closeFactor <= 10**18, "Invalid collateral factor");
        emit SetCloseFactor(closeFactor, _closeFactor);
        closeFactor = _closeFactor;
    }

    function setLiquidationIncentive(uint256 _liquidationIncentive) external onlyOwner {
        require(_liquidationIncentive >= 10**18, "Invalid liquidationIncective");
        emit SetLiquidationIncentive(liquidationIncentive, _liquidationIncentive);
        liquidationIncentive = _liquidationIncentive;
    }

    function setPerformanceFee(uint256 _performanceFee) external onlyOwner {
        emit SetPerformanceFee(performanceFee, _performanceFee);
        performanceFee = _performanceFee;
    }

    event SetCollateralFactor(uint256 oldColateralFactor, uint256 newColateralFactor);
    event SetCloseFactor(uint256 oldCloseFactor, uint256 newCloseFactor);
    event SetLiquidationIncentive(uint256 oldLiquidationIncentive, uint256 newLiquidationIncentive);
    event SetPerformanceFee(uint256 oldPerformanceFee, uint256 newPerformanceFee);
} 