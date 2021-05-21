const { setupToken, setupMToken, setupCEther, setupMaximillion  } = require('../utils/setupContracts')
const { tokens } = require('../utils/testHelpers')


const setupAll = async function () {
    [owner, user1, user2, user3, user4] = await ethers.getSigners()

    // ATTACH BASIC TOKENS
    dai  = await setupToken('Dai', 18, '10000000', '10000', [(await ethers.provider.getNetwork()).chainId])

    wbtc = await setupToken('WBTC', 8, '10000000', '10000', [])

    usdc = await setupToken('FiatTokenV2', 6, '10000000', '10000', [], async (token) => {
            await token.initialize('USDC', 'USDC', 'USD', 6, owner.address, owner.address, owner.address, owner.address)
            await token.configureMinter(owner.address, '100000000000000000000')
        })

    unn  = await setupToken('TestUnionGovernanceToken', 18, '0', '0', [owner.address, tokens('10040000')], async (token) => {
                await token.setCanTransfer(true)
                await token.setReversion(true)
                await token.transfer(user1.address, tokens('10000'))
                await token.transfer(user2.address, tokens('10000'))
                await token.transfer(user3.address, tokens('10000'))
                await token.transfer(user4.address, tokens('10000'))
            })

    weth = await setupToken('WETH9', 18, '0', '0')

    // PLATFORM CONTRACTS 
    const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle")
    oracle = await SimplePriceOracle.deploy()
    await oracle.deployed()

    const LiquidityMathModelV1 = await ethers.getContractFactory("LiquidityMathModelV1")
    liquidityMathModelV1 = await LiquidityMathModelV1.deploy()
    await liquidityMathModelV1.deployed()

    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.deploy(liquidityMathModelV1.address)
    await moartroller.deployed()

    const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")
    jrmStableCoin = await JumpRateModelV2.deploy('0', '39222804184156400', '3272914755156920000', '800000000000000000', owner.address)
    await jrmStableCoin.deployed()

    jrmEth = await JumpRateModelV2.deploy('0', '95322621997923200', '222330528872230000', '800000000000000000', owner.address)
    await jrmEth.deployed()

    jrmWbtc = await JumpRateModelV2.deploy('0', '262458573636948000', '370843987858870000', '800000000000000000', owner.address)
    await jrmWbtc.deployed()

    jrmUnn = await JumpRateModelV2.deploy('0', '182367147429835000', '2557193424546420000', '800000000000000000', owner.address)
    await jrmUnn.deployed()

    const uUNN = await ethers.getContractFactory("uUNN")
    uunn = await uUNN.deploy()
    await uunn.deployed()

    const CopMapping = await ethers.getContractFactory("CopMockedMapping")
    copMapping = await CopMapping.deploy(uunn.address)
    await copMapping.deployed()

    const cuUNN = await ethers.getContractFactory("MProtection")
    cuunn = await cuUNN.deploy(copMapping.address, moartroller.address)
    await cuunn.deployed()

    // CTOKENS 
    cdai  = await setupMToken('cToken DAI', 'cDAI', 18, '200000000000000000000000000', dai, moartroller, jrmStableCoin)
    cwbtc = await setupMToken('cToken WBTC', 'cWBTC', 18, '20000000000000000', wbtc, moartroller, jrmWbtc)
    cusdc = await setupMToken('cToken USDC', 'cUSDC', 18, '200000000000000', usdc, moartroller, jrmStableCoin)
    cunn  = await setupMToken('cToken TUNN', 'cUNN', 18, '200000000000000000000000000', unn, moartroller, jrmUnn)
    ceth  = await setupCEther('cEther', 'cETH', 18, '200000000000000000000000000', weth,  moartroller, jrmEth)


    // LENDING ROUTER
    const UnnLendingRouter = await ethers.getContractFactory("UnnLendingRouter")
    lendingRouter = await UnnLendingRouter.deploy(uunn.address, cuunn.address, dai.address)
    await lendingRouter.deployed()

    // LOAD SETTINGS
    await cdai._setMaxProtectionComposition(10000);
    await cwbtc._setMaxProtectionComposition(500);
    await cusdc._setMaxProtectionComposition(10000);
    await cunn._setMaxProtectionComposition(2500);
    await ceth._setMaxProtectionComposition(7600);

    await cdai._setReserveFactor(tokens('0.1'))
    await cwbtc._setReserveFactor(tokens('0.2'))
    await cusdc._setReserveFactor(tokens('0.1'))
    await cunn._setReserveFactor(tokens('0.35'))
    await ceth._setReserveFactor(tokens('0.2'))

    await oracle.setUnderlyingPrice(ceth.address, '1750000000000000000000')
    await oracle.setUnderlyingPrice(cwbtc.address, '550000000000000000000000000000000')
    await oracle.setUnderlyingPrice(cusdc.address, '1000000000000000000000000000000')
    await oracle.setUnderlyingPrice(cunn.address, '90000000000000000')

    await moartroller._setPriceOracle(oracle.address)
    await moartroller._setProtection(cuunn.address)
    await moartroller._setLiquidationIncentive(tokens('0.1'))
    await moartroller._setCloseFactor(tokens('0.5'))

    await moartroller._supportMarket(cdai.address)
    await moartroller._supportMarket(cwbtc.address)
    await moartroller._supportMarket(cusdc.address)
    await moartroller._supportMarket(cunn.address)
    await moartroller._supportMarket(ceth.address)

    await moartroller._setCollateralFactor(cdai.address, tokens('0.85'))
    await moartroller._setCollateralFactor(cwbtc.address, tokens('0.75'))
    await moartroller._setCollateralFactor(cusdc.address, tokens('0.85'))
    await moartroller._setCollateralFactor(cunn.address, tokens('1.25'))
    await moartroller._setCollateralFactor(ceth.address, tokens('0.75'))

    await moartroller._addPrivilegedAddress(lendingRouter.address)

    // MAXIMILLION
    maximillion = await setupMaximillion(ceth.address)

    return {
        owner, user1, user2, user3, 
        dai, usdc, wbtc, unn, weth,
        cdai, cwbtc, cusdc, cunn, ceth,
        oracle, liquidityMathModelV1, moartroller, uunn, cuunn, lendingRouter, maximillion
    }
}

module.exports = setupAll
