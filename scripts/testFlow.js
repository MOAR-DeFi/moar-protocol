let owner, user1, user2, user3
const { to } = require('mathjs')
const { tokens, getEventsFromTransaction, fromWei, increaseTime } = require('./../test//utils/testHelpers')

let moartroller, oracle, jumpRateModelV2, dai, cdai, cether, cuunn, uunn, cunn, liquidityMathModel

async function setupAccounts(){
    [owner, user1, user2, user3] = await ethers.getSigners(13)
}

async function setupDai(){
    const Dai = await ethers.getContractFactory("Dai")
    dai = await Dai.deploy((await ethers.provider.getNetwork()).chainId)
    await dai.deployed()

    await dai.mint(owner.address, tokens('10000000'))
    // await dai.mint(user1.address, tokens('10000'))
    await dai.mint(user2.address, tokens('1000000'))
    await dai.mint(user3.address, tokens('1000000'))
}

async function setupUnn(){
    const TUnn = await ethers.getContractFactory("TestUnionGovernanceToken")
    unn = await TUnn.deploy(owner.address, tokens('1000000000'))
    await unn.deployed()
    await unn.setCanTransfer(true)
    await unn.setReversion(true)
    await unn.transfer(user1.address, tokens('500000'))
    await unn.transfer(user2.address, tokens('500000'))
    await unn.transfer(user3.address, tokens('500000'))

    return unn.address
}

async function setupCDai(){
    const MErc20Immutable = await ethers.getContractFactory("MErc20Immutable")
    cdai = await MErc20Immutable.deploy(dai.address, moartroller.address, jumpRateModelV2.address, tokens('0.02'), 'cToken DAI', 'cDAI', 18, owner.address)
    await cdai.deployed()
}

async function setupCUnn(){
    const MErc20Immutable = await ethers.getContractFactory("MErc20Immutable")
    cunn = await MErc20Immutable.deploy(unn.address, moartroller.address, jumpRateModelV2.address, tokens('0.02'), 'cToken UNN', 'cUNN', 18, owner.address)
    await cunn.deployed()

    return cunn.address
}

async function setupCEther(){
    const CEther = await ethers.getContractFactory("CEther")
    cether = await CEther.deploy(moartroller.address, jumpRateModelV2.address, tokens('0.02'), 'cEther', 'cETH', 18, owner.address)
    await cether.deployed()
}

async function setupOracle(){
    const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle")
    oracle = await SimplePriceOracle.deploy()
    await oracle.deployed()
}

async function setupLiquidityMathModel(){
    const LiquidityMathModel = await ethers.getContractFactory("LiquidityMathModelV1");
    liquidityMathModel = await LiquidityMathModel.deploy();
    await liquidityMathModel.deployed();
}

async function setupMoartroller(){
    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.deploy(liquidityMathModel.address)
    await moartroller.deployed()
}

async function setupJumpRateModelV2(){
    const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")
    jumpRateModelV2 = await JumpRateModelV2.deploy(tokens('1'), tokens('1'), 1, 1, owner.address)
    await jumpRateModelV2.deployed()
}

async function setupUUNN(){
    const uUNN = await ethers.getContractFactory("uUNN")
    uunn = await uUNN.deploy()
    await uunn.deployed()
}

async function setupCUUNN(){
    const cuUNN = await ethers.getContractFactory("MProtection")
    cuunn = await cuUNN.deploy(uunn.address, moartroller.address)
    await cuunn.deployed()
}

async function main() {
    /**
     * SETUP THE CONTRACTS
     */
    await setupAccounts()

    await setupLiquidityMathModel()
    await setupMoartroller()
    await setupJumpRateModelV2()
    await setupOracle()

    await setupDai()
    await setupUnn()
    await setupCDai()
    await setupCUnn()
    await setupCEther()

    await setupUUNN();
    await setupCUUNN();


    /**
     * SETUP ORACLE
     */
    const initPrice = '1000'
    console.log(`Initial price of ETH = ${initPrice} DAI`)
    await oracle.setUnderlyingPrice(cether.address, tokens(initPrice))
    await moartroller._setPriceOracle(oracle.address)


    /**
     * SETUP MOARTROLLER TO SUPPORT ASSETS
     */
    await moartroller._supportMarket(cdai.address)
    await moartroller._supportMarket(cether.address)

    await moartroller._setCollateralFactor(cdai.address, tokens('0.1'))
    await moartroller._setCollateralFactor(cether.address, tokens('0.5'))

    /**
     * SETUP MOARTROLLER TO ALLOW MPROTECTION
     */
    await moartroller._setProtection(cuunn.address);


    /**
     * OPTIONALLY SETUP NON-DEFAULT MPC VALUES
     */
    await cdai._setMaxProtectionComposition(5000);
    await cether._setMaxProtectionComposition(2500);

    /**
     * BALANCES CHECK AND MINTING ASSETS
     */

    // console.log("Balance of UNN before: ", (await unn.balanceOf(user1.address)).toString())
    // console.log("Balance of cUNN before: ", (await cunn.balanceOf(user1.address)).toString())
    // console.log("Balance of DAI before: ", (await dai.balanceOf(user1.address)).toString())
    // console.log("Balance of cDAI before: ", (await cdai.balanceOf(user1.address)).toString())
    // console.log("Balance of Ether before: ", (await ethers.provider.getBalance(user1.address)).toString())
    // console.log("Balance of cEther before: ", (await cether.balanceOf(user1.address)).toString())

    // await dai.connect(user1).approve(cdai.address, tokens('100'))
    // await cdai.connect(user1).mint(tokens('100'))
    await cether.connect(user1).mint({value: tokens('2')})

    await dai.connect(user2).approve(cdai.address, tokens('15000'))
    await cdai.connect(user2).mint(tokens('15000'))
    await cether.connect(user2).mint({value: tokens('3')})

    await dai.connect(user3).approve(cdai.address, tokens('30000'))
    await cdai.connect(user3).mint(tokens('30000'))
    await cether.connect(user3).mint({value: tokens('12.5')})


    // console.log("Balance of UNN after: ", (await unn.balanceOf(user1.address)).toString())
    // console.log("Balance of cUNN after: ", (await cunn.balanceOf(user1.address)).toString())
    // console.log("Balance of DAI after: ", (await dai.balanceOf(user1.address)).toString())
    // console.log("Balance of cDAI after: ", (await cdai.balanceOf(user1.address)).toString())
    // console.log("Balance of Ether after: ", (await ethers.provider.getBalance(user1.address)).toString())
    // console.log("Balance of cEther after: ", (await cether.balanceOf(user1.address)).toString())

    await moartroller.connect(user1).enterMarkets([cdai.address, cether.address])
    // await moartroller.connect(user1).enterMarkets([cether.address])
    await moartroller.connect(user2).enterMarkets([cdai.address, cether.address])
    // await moartroller.connect(user2).enterMarkets([cether.address])
    await moartroller.connect(user3).enterMarkets([cdai.address, cether.address])
    // await moartroller.connect(user3).enterMarkets([cether.address])

    let liquidity1 = await moartroller.getAccountLiquidity(user1.address)
    let liquidity2 = await moartroller.getAccountLiquidity(user2.address)
    let liquidity3 = await moartroller.getAccountLiquidity(user3.address)

    console.log(`Initial user liquidity: ${fromWei(liquidity1[1].toString())} DAI`)
    const u1daiBalance = (await dai.balanceOf(user1.address)).toString()
    console.log(`Initial user DAI balance: ${fromWei(u1daiBalance)} DAI `)
    // console.log(`Initial user1 balance: ${fromWei()} DAI`)
    // console.log("User2 account Liquidity: ", liquidity2[1].toString())
    // console.log("User3 account Liquidity: ", liquidity3[1].toString())


    /**
     * MINT FIRST PROTECTIONS FOR THE USER
     */
    await uunn.createProtection(user1.address, ethers.constants.AddressZero, tokens('0.5'), tokens('1500'));
    await uunn.connect(user1).approve(cuunn.address, 1)
    await cuunn.connect(user1).mint(1)
    await cuunn.connect(user1).lockProtectionValue(1, tokens("0"))

    // await uunn.createProtection(user1.address, ethers.constants.AddressZero, tokens('1'), tokens('650'));
    // await uunn.connect(user1).approve(cuunn.address, 2)
    // await cuunn.connect(user1).mint(2)

    const cop1Liqidity = await moartroller.getAccountLiquidity(user1.address)
    console.log(`After 1st C-Op user liquidity: ${fromWei(cop1Liqidity[1].toString())} DAI`)
    const u1daiBalanceWithOCP = (await dai.balanceOf(user1.address)).toString()
    console.log(`After 1st C-Op user DAI balance: ${fromWei(u1daiBalanceWithOCP)} DAI `)


    /**
     * PERFORM A BORROW
     */
    // await cdai.connect(user1).borrow(tokens('1000'))


    let liquidity1ab = await moartroller.getAccountLiquidity(user1.address)
    console.log(`After 1st borrow user liqidity: ${fromWei(liquidity1ab[1].toString())} DAI`)
    const u1daiBalanceAfter1Borrow = (await dai.balanceOf(user1.address)).toString()
    console.log(`After 1st borrow user DAI balance: ${fromWei(u1daiBalanceAfter1Borrow)} DAI `)
    // console.log("Balance of cDAI after: ", (await cdai.balanceOf(user1.address)).toString())
    // console.log("Balance of Ether after: ", (await ethers.provider.getBalance(user1.address)).toString())
    // console.log("Balance of cEther after: ", (await cether.balanceOf(user1.address)).toString())
    // console.log("Balance of Ether after borrow: ", (await ethers.provider.getBalance(user1.address)).toString())
    // console.log("Balance of cEther after borrow: ", (await cether.balanceOf(user1.address)).toString())


    const newPrice = '2000';
    console.log(`The new price of ETH = ${newPrice} DAI`)
    await oracle.setUnderlyingPrice(cether.address, tokens(newPrice));

    const priceChangeLiquidity = await moartroller.getAccountLiquidity(user1.address)
    console.log(`After price change user liquidity: ${fromWei(priceChangeLiquidity[1].toString())} DAI`)
    const priceChangeDaiBalance = (await dai.balanceOf(user1.address)).toString()
    console.log(`After price change user DAI balance: ${fromWei(priceChangeDaiBalance)} DAI `)

    /**
     * MINITNG SECOND PROTECTION
     */
    // await uunn.createProtection(user1.address, ethers.constants.AddressZero, tokens('10'), tokens('1500'));
    // await uunn.connect(user1).approve(cuunn.address, 2)
    // await cuunn.connect(user1).mint(2)

    let cop2liquidity = await moartroller.getAccountLiquidity(user1.address)
    console.log(`After 2nd C-Op user liqidity: ${fromWei(cop2liquidity[1].toString())} DAI`)
    const cop2daiBalance = (await dai.balanceOf(user1.address)).toString()
    console.log(`After 2nd C-Op DAI balance: ${fromWei(cop2daiBalance)} DAI `)

    // await cdai.connect(user1).borrow(tokens('500'))
    let liquidity1ab2 = await moartroller.getAccountLiquidity(user1.address)
    console.log(`After 2nd borrow user liquidity: ${fromWei(liquidity1ab2[1].toString())} DAI`)
    console.log(`After 2nd borrow DAI balance: ${fromWei((await dai.balanceOf(user1.address)).toString())} DAI `)


    /**
     * REDEEM SOME ETHER
     */
    const redeemAmount = 1.7;
    console.log("Redeeming %s ETH", redeemAmount);
    console.log((await cether.connect(user1).redeemUnderlying(tokens(`${redeemAmount}`))).toString());
    let liquidity1ab3 = await moartroller.getAccountLiquidity(user1.address);
    console.log(`After redeem user liquidity: ${fromWei(liquidity1ab3[1].toString())} DAI`)
    console.log(`After redeem DAI balance: ${fromWei((await dai.balanceOf(user1.address)).toString())} DAI `)

    console.log(ethers.constants.MaxUint256.toString());
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })