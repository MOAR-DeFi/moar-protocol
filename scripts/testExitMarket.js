const axios = require('axios');
const { tokens, toTokens, fromTokens, fromWei, increaseTime } = require('./../test/utils/testHelpers')
const { setupToken, setupMToken, setupCEther, setupMaximillion } = require('./../test/utils/setupContracts');


let owner, user1, user2, user3, user4
let oracle, moartroller, liquidityMathModelV1, cuunn, maximillion, lendingRouter, unionRouter
let cdai, cwbtc, cusdc, cunn, ceth  
let dai, wbtc, usdc, unn

// Rinkeby addresses
const daiAddress = '0x7D8AB70Da03ef8695c38C4AE3942015c540e2439'
const wbtcAddress = '0x19cDab1A0b017dc97f733FC2304Dc7aEC678a5E9'
const usdcAddress = '0x3813a8Ba69371e6DF3A89b78bf18fC72Dd5B43c5'
const unnAddress = '0xc2b2602344d5Ca808F888954f30fCb2B5E13A08F'
const uUnnAddress = '0x4991107eC94e95A961EDDfbE1efD22515Dc447E6'
const wEthAddress = '0xc778417e063141139fce010982780140aa0cd5ab'


const IUnionRouterAddress = '0x70CBfC1B9E9E50B84b5E8074692ccCbd98a7146e'
const IUUNNRegistryAddress = '0x4991107eC94e95A961EDDfbE1efD22515Dc447E6'

async function setupLendingPlatform(){
    // ATTACH BASIC TOKENS

    const Dai = await ethers.getContractFactory("Dai")
    dai = await Dai.attach(daiAddress)

    const WBTC = await ethers.getContractFactory("WBTC")
    wbtc = await WBTC.attach(wbtcAddress)

    const FiatTokenV2 = await ethers.getContractFactory("FiatTokenV2")
    usdc = await FiatTokenV2.attach(usdcAddress)

    const TestUnionGovernanceToken = await ethers.getContractFactory("TestUnionGovernanceToken")
    unn = await TestUnionGovernanceToken.attach(unnAddress)
    
    const WETH9 = await ethers.getContractFactory("WETH9")
    weth = await WETH9.attach(wEthAddress)

    // PLATFORM CONTRACTS 

    console.log("Deploying SimplePriceOracle")
    const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle")
    oracle = await SimplePriceOracle.deploy()
    await oracle.deployed()
    console.log("SimplePriceOracle deployed!\n")

    console.log("Deploying LiquidityMathModelV1")
    const LiquidityMathModelV1 = await ethers.getContractFactory("LiquidityMathModelV1")
    liquidityMathModelV1 = await LiquidityMathModelV1.deploy()
    await liquidityMathModelV1.deployed()
    console.log("liquidityMathModelV1 deployed!\n")

    console.log("Deploying Moartroller")
    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.deploy(liquidityMathModelV1.address)
    await moartroller.deployed()
    console.log("Moartroller deployed!\n")

    console.log("Deploying JumpRateModelV2")
    const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")
    jrmStableCoin = await JumpRateModelV2.deploy('0', '39222804184156400', '3272914755156920000', '800000000000000000', owner.address)
    await jrmStableCoin.deployed()
    console.log("JumpRateModelV2 deployed!\n")

    console.log("Deploying JumpRateModelV2")
    jrmEth = await JumpRateModelV2.deploy('0', '95322621997923200', '222330528872230000', '800000000000000000', owner.address)
    await jrmEth.deployed()
    console.log("JumpRateModelV2 deployed!\n")

    console.log("Deploying JumpRateModelV2")
    jrmWbtc = await JumpRateModelV2.deploy('0', '262458573636948000', '370843987858870000', '800000000000000000', owner.address)
    await jrmWbtc.deployed()
    console.log("JumpRateModelV2 deployed!\n")

    console.log("Deploying JumpRateModelV2")
    jrmUnn = await JumpRateModelV2.deploy('0', '182367147429835000', '2557193424546420000', '800000000000000000', owner.address)
    await jrmUnn.deployed()
    console.log("JumpRateModelV2 deployed!\n")

    console.log("Deploying cuUNN")
    const cuUNN = await ethers.getContractFactory("MProtection")
    cuunn = await cuUNN.deploy(uUnnAddress, moartroller.address)
    await cuunn.deployed()
    console.log("cuUNN deployed!\n")

    // CTOKENS 
    console.log("Deploying cDAI")
    cdai  = await setupMToken('cToken DAI', 'cDAI', 18, '200000000000000000000000000', dai, moartroller, jrmStableCoin)
    console.log("cDAI deployed!\n")
    
    console.log("Deploying cWBTC")
    cwbtc = await setupMToken('cToken WBTC', 'cWBTC', 18, '20000000000000000', wbtc, moartroller, jrmWbtc)
    console.log("cWBTC deployed!\n")

    console.log("Deploying cUSDC")
    cusdc = await setupMToken('cToken USDC', 'cUSDC', 18, '200000000000000', usdc, moartroller, jrmStableCoin)
    console.log("cUSDC deployed!\n")

    console.log("Deploying cUNN")
    cunn  = await setupMToken('cToken TUNN', 'cUNN', 18, '200000000000000000000000000', unn, moartroller, jrmUnn)
    console.log("cUNN deployed!\n")

    console.log("Deploying cETH")
    ceth  = await setupCEther('cEther', 'cETH', 18, '200000000000000000000000000', weth,  moartroller, jrmEth)
    console.log("cETH deployed!\n")

    // LENDING ROUTER

    const UnnLendingRouter = await ethers.getContractFactory("UnnLendingRouter")
    lendingRouter = await UnnLendingRouter.deploy(uUnnAddress, cuunn.address, dai.address)
    await lendingRouter.deployed()

    // LOAD SETTINGS

    console.log("Setting MPC")
    await cdai._setMaxProtectionComposition(10000);
    await cwbtc._setMaxProtectionComposition(500);
    await cusdc._setMaxProtectionComposition(10000);
    await cunn._setMaxProtectionComposition(2500);
    await ceth._setMaxProtectionComposition(7600);
    console.log("Finished\n")

    console.log("Setting ReserveFactor")
    await cdai._setReserveFactor(tokens('0.1'))
    await cwbtc._setReserveFactor(tokens('0.2'))
    await cusdc._setReserveFactor(tokens('0.1'))
    await cunn._setReserveFactor(tokens('0.35'))
    await ceth._setReserveFactor(tokens('0.2'))
    console.log("Finished\n")

    console.log("Setting oracle prices")
    await oracle.setUnderlyingPrice(ceth.address, '1750000000000000000000')
    await oracle.setUnderlyingPrice(cwbtc.address, '550000000000000000000000000000000')
    await oracle.setUnderlyingPrice(cusdc.address, '1000000000000000000000000000000')
    await oracle.setUnderlyingPrice(cunn.address, '90000000000000000')
    console.log("Finished\n")

    console.log("Setting moartroller configuration")
    await moartroller._setPriceOracle(oracle.address)
    await moartroller._setProtection(cuunn.address)
    await moartroller._setLiquidationIncentive(tokens('0.1'))
    await moartroller._setCloseFactor(tokens('0.5'))
    console.log("Finished\n")

    console.log("Setting moartroller supported markets")
    await moartroller._supportMarket(cdai.address)
    await moartroller._supportMarket(cwbtc.address)
    await moartroller._supportMarket(cusdc.address)
    await moartroller._supportMarket(cunn.address)
    await moartroller._supportMarket(ceth.address)
    console.log("Finished\n")

    console.log("Setting Collateral Factors")
    await moartroller._setCollateralFactor(cdai.address, tokens('0.85'))
    await moartroller._setCollateralFactor(cwbtc.address, tokens('0.75'))
    await moartroller._setCollateralFactor(cusdc.address, tokens('0.85'))
    await moartroller._setCollateralFactor(cunn.address, tokens('1.25'))
    await moartroller._setCollateralFactor(ceth.address, tokens('0.75'))
    console.log("Finished\n")

    console.log("Setting Privileged Addresses")
    await moartroller._addPrivilegedAddress(lendingRouter.address)
    console.log("Finished\n")


    // MAXIMILLION

    console.log("Deploying Maximillion")
    maximillion = await setupMaximillion(ceth.address)
    console.log("Maximillion deployed!\n")
}


async function setupAccounts(){
    [owner, user1, user2, user3] = await ethers.getSigners(13)
}

async function attachUnionRouter(){
    unionRouter = await ethers.getContractAt("IUnionRouter", IUnionRouterAddress)
    return unionRouter
}

async function attachUUnnRegistry(){
    uunnnRegistry = await ethers.getContractAt("IUUNNRegistry", IUUNNRegistryAddress)
    return uunnnRegistry
}

async function makeDeposits(value, user, cToken, token = null){
    if(token == null){
        await cToken.connect(user).mint({value})
    }else{
        await token.connect(user).approve(cToken.address, value)
        await cToken.connect(user).mint(value)
    }
}


async function main() {

    await setupAccounts()
    await attachUnionRouter()
    await attachUUnnRegistry()
    await setupLendingPlatform()

    let buyer = user1

    console.log('Making deposits')
    await makeDeposits(tokens('0.5'), buyer, ceth)
    await makeDeposits(tokens('2'), buyer, cdai, dai)
    console.log(`User liquidity: ${fromTokens((await moartroller.getAccountLiquidity(buyer.address))[1], 18, true)} $`)

    console.log('---')
    console.log('Enterning markets')
    await moartroller.connect(buyer).enterMarkets([ceth.address, cdai.address])
    console.log(`User liquidity: ${fromTokens((await moartroller.getAccountLiquidity(buyer.address))[1], 18, true)} $`)

    console.log('---')
    console.log('Exiting market')
    await moartroller.connect(buyer).exitMarket(ceth.address)
    console.log('exited!')
    console.log(`User liquidity: ${fromTokens((await moartroller.getAccountLiquidity(buyer.address))[1], 18, true)} $`)

}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
