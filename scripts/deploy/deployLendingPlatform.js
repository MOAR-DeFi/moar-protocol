const { setupToken, setupMToken, setupCEther, setupMaximillion } = require('./../../test/utils/setupContracts')
const { tokens } = require('./../../test/utils/testHelpers')

let owner, user1, user2, user3, user4
let oracle, moartroller, liquidityMathModelV1, cuunn, maximillion, lendingRouter
let cdai, cwbtc, cusdc, cunn, ceth  
let dai, wbtc, usdc, unn, weth

// Rinkeby addresses
const daiAddress = '0x7D8AB70Da03ef8695c38C4AE3942015c540e2439'
const wbtcAddress = '0x19cDab1A0b017dc97f733FC2304Dc7aEC678a5E9'
const usdcAddress = '0x3813a8Ba69371e6DF3A89b78bf18fC72Dd5B43c5'
const unnAddress = '0xc2b2602344d5Ca808F888954f30fCb2B5E13A08F'
const moarAddress = '0x03f2b2B8A3c1F37F1fE304472D4028e395429c52'
const uUnnAddress = '0x4991107eC94e95A961EDDfbE1efD22515Dc447E6'
const wEthAddress = '0xc778417e063141139fce010982780140aa0cd5ab'
const unionRouter = '0x70CBfC1B9E9E50B84b5E8074692ccCbd98a7146e'


// Kovan addresses
// const daiAddress  = '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd'
// const wbtcAddress = '0xd1b98b6607330172f1d991521145a22bce793277'
// const usdcAddress = '0xe22da380ee6b445bb8273c81944adeb6e8450422'
// const unnAddress  = '0xC34fb55FF27DCFA86d3411EaF5Dc1D15ce9dc70c'
// const moarAddress = '0x7C363eb9e3b5d3666286deb3E4708dfD1C3b8202'
// const uUnnAddress = '0xB7b6f5743a7EA725729C3d67FD536feA0DDE9050'
// const wEthAddress = '0xd0a1e359811322d97991e03f863a0c30c2cf029c'
// const unionRouter = '0x0BbB37dc258b11eb0CDb2b5758AA3Cd4037c90c2'


async function main() {

    [owner, user1, user2, user3, user4] = await ethers.getSigners()

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

    const MoarMockToken = await ethers.getContractFactory("MoarMockToken")
    moar = await MoarMockToken.attach(moarAddress)

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
    jrmUnn = await JumpRateModelV2.deploy('0', '182367147429835000', '3675373581049680000', '800000000000000000', owner.address)
    await jrmUnn.deployed()
    console.log("JumpRateModelV2 deployed!\n")

    // console.log("Deploying uUNN")
    // const uUNN = await ethers.getContractFactory("uUNN")
    // uunn = await uUNN.deploy()
    // await uunn.deployed()
    // console.log("uUNN deployed!\n")

    console.log("Deploying CopMapping")
    const CopMapping = await ethers.getContractFactory("CopMapping")
    copMapping = await CopMapping.deploy(uUnnAddress)
    await copMapping.deployed()
    console.log("CopMapping deployed!\n")

    console.log("Deploying cuUNN")
    const cuUNN = await ethers.getContractFactory("MProtection")
    cuunn = await cuUNN.deploy(copMapping.address, moartroller.address)
    await cuunn.deployed()
    console.log("cuUNN deployed!\n")

    // CTOKENS 
    console.log("Deploying cDAI")
    cdai  = await setupMToken('cToken DAI', 'cDAI', 8, '200000000000000000000000000', dai, moartroller, jrmStableCoin)
    console.log("cDAI deployed!\n")
    
    console.log("Deploying cWBTC")
    cwbtc = await setupMToken('cToken WBTC', 'cWBTC', 8, '20000000000000000', wbtc, moartroller, jrmWbtc)
    console.log("cWBTC deployed!\n")

    console.log("Deploying cUSDC")
    cusdc = await setupMToken('cToken USDC', 'cUSDC', 8, '200000000000000', usdc, moartroller, jrmStableCoin)
    console.log("cUSDC deployed!\n")

    console.log("Deploying cUNN")
    cunn  = await setupMToken('cToken TUNN', 'cUNN', 8, '200000000000000000000000000', unn, moartroller, jrmUnn)
    console.log("cUNN deployed!\n")

    console.log("Deploying cMOAR")
    cmoar  = await setupMToken('cToken MOAR', 'cMOAR', 8, '200000000000000000000000000', moar, moartroller, jrmUnn)
    console.log("cMOAR deployed!\n")

    console.log("Deploying cETH")
    ceth  = await setupCEther('cEther', 'cETH', 8, '200000000000000000000000000', weth,  moartroller, jrmEth)
    console.log("cETH deployed!\n")

    // LENDING ROUTER

    const UnnLendingRouter = await ethers.getContractFactory("UnnLendingRouter")
    lendingRouter = await UnnLendingRouter.deploy(uUnnAddress, cuunn.address, dai.address)
    await lendingRouter.deployed()

    // LOAD SETTINGS

    console.log("Setting MPC")
    tx = await cdai._setMaxProtectionComposition(10000);
    await tx.wait()
    tx = await cwbtc._setMaxProtectionComposition(500);
    await tx.wait()
    tx = await cusdc._setMaxProtectionComposition(10000);
    await tx.wait()
    tx = await cunn._setMaxProtectionComposition(2500);
    await tx.wait()
    tx = await cmoar._setMaxProtectionComposition(2500);
    await tx.wait()
    tx = await ceth._setMaxProtectionComposition(7600);
    await tx.wait()
    console.log("Finished\n")

    console.log("Setting ReserveFactor")
    tx = await cdai._setReserveFactor(tokens('0.1'))
    await tx.wait()
    tx = await cwbtc._setReserveFactor(tokens('0.2'))
    await tx.wait()
    tx = await cusdc._setReserveFactor(tokens('0.1'))
    await tx.wait()
    tx = await cunn._setReserveFactor(tokens('0.35'))
    await tx.wait()
    tx = await cmoar._setReserveFactor(tokens('0.35'))
    await tx.wait()
    tx = await ceth._setReserveFactor(tokens('0.2'))
    await tx.wait()
    console.log("Finished\n")

    console.log("Setting oracle prices")
    tx = await oracle.setUnderlyingPrice(ceth.address, '1750000000000000000000')
    await tx.wait()
    tx = await oracle.setUnderlyingPrice(cwbtc.address, '550000000000000000000000000000000')
    await tx.wait()
    tx = await oracle.setUnderlyingPrice(cusdc.address, '1000000000000000000000000000000')
    await tx.wait()
    tx = await oracle.setUnderlyingPrice(cunn.address, '90000000000000000')
    await tx.wait()
    tx = await oracle.setUnderlyingPrice(cmoar.address, '3000000000000000000')
    await tx.wait()
    console.log("Finished\n")

    console.log("Setting moartroller configuration")
    tx = await moartroller._setPriceOracle(oracle.address)
    await tx.wait()
    tx = await moartroller._setProtection(cuunn.address)
    await tx.wait()
    tx = await moartroller._setLiquidationIncentive(tokens('0.1'))
    await tx.wait()
    tx = await moartroller._setCloseFactor(tokens('0.5'))
    await tx.wait()
    console.log("Finished\n")

    console.log("Setting moartroller supported markets")
    tx = await moartroller._supportMarket(cdai.address)
    await tx.wait()
    tx = await moartroller._supportMarket(cwbtc.address)
    await tx.wait()
    tx = await moartroller._supportMarket(cusdc.address)
    await tx.wait()
    tx = await moartroller._supportMarket(cunn.address)
    await tx.wait()
    tx = await moartroller._supportMarket(cmoar.address)
    await tx.wait()
    tx = await moartroller._supportMarket(ceth.address)
    await tx.wait()
    console.log("Finished\n")

    console.log("Setting Collateral Factors")
    tx = await moartroller._setCollateralFactor(cdai.address, tokens('0.85'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(cwbtc.address, tokens('0.75'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(cusdc.address, tokens('0.85'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(cunn.address, tokens('1'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(cmoar.address, tokens('1.25'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(ceth.address, tokens('0.75'))
    await tx.wait()
    console.log("Finished\n")

    console.log("Setting Privileged Addresses")
    tx = await moartroller._addPrivilegedAddress(lendingRouter.address)
    await tx.wait()
    console.log("Finished\n")


    // MAXIMILLION

    console.log("Deploying Maximillion")
    maximillion = await setupMaximillion(ceth.address)
    console.log("Maximillion deployed!\n")

    console.log('REACT_APP_C_ETHEREUM='+ ceth.address)
    console.log('REACT_APP_W_ETH='+ wEthAddress)
    console.log('REACT_APP_DAI='+ dai.address)
    console.log('REACT_APP_C_DAI='+ cdai.address)
    console.log('REACT_APP_MOAR='+ moar.address)
    console.log('REACT_APP_C_MOAR='+ cmoar.address)
    console.log('REACT_APP_UNION='+ unn.address)
    console.log('REACT_APP_C_UNION='+ cunn.address)
    console.log('REACT_APP_UUNION='+ uUnnAddress)
    console.log('REACT_APP_C_UUNION='+ cuunn.address)
    console.log('REACT_APP_USDC='+ usdc.address)
    console.log('REACT_APP_C_USDC='+ cusdc.address)
    console.log('REACT_APP_WBTC='+ wbtc.address)
    console.log('REACT_APP_C_WBTC='+ cwbtc.address)
    console.log('REACT_APP_MOARTROLLER='+ moartroller.address)
    console.log('REACT_APP_ORACLE='+ oracle.address)
    console.log('REACT_APP_MAXIMILLION='+ maximillion.address)
    console.log('REACT_APP_UNION_ROUTER='+ unionRouter)
    console.log('REACT_APP_LENDING_ROUTER='+ lendingRouter.address)



    // console.log(
    //    {
    //     "DAI address": dai.address,
    //     "WBTC address": wbtc.address,
    //     "USDC address": usdc.address,
    //     "UNN address": unn.address,
    //     "cDAI address": cdai.address,
    //     "cWBTC address": cwbtc.address,
    //     "cUSDC address": cusdc.address,
    //     "cUNN address": cunn.address,
    //     "cEther address": ceth.address,
    //     "uUNN address": uUnnAddress,
    //     "cuUNN address": cuunn.address,
    //     "Moartroller address": moartroller.address,
    //     "Oracle address": oracle.address,
    //     "Maximillion address": maximillion.address,
    //     "LendingRouter address": lendingRouter.address
    //    }
    // )
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })