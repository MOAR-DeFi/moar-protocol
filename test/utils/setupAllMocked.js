const { setupToken, setupMToken, setupMEther, setupMaximillion  } = require('../utils/setupContracts')
const { tokens } = require('../utils/testHelpers')
const { ethers, upgrades } = require('hardhat');


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

    moar  = await setupToken('MoarMockToken', 18, '0', '0', [tokens('10000000000000')], async (token) => {
        await token.transfer(user1.address, tokens('10000'))
        await token.transfer(user2.address, tokens('10000'))
        await token.transfer(user3.address, tokens('10000'))
        await token.transfer(user4.address, tokens('10000'))
    })


    // PLATFORM CONTRACTS 
    const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle")
    oracle = await SimplePriceOracle.deploy()
    await oracle.deployed()

    const LiquidityMathModelV1 = await ethers.getContractFactory("LiquidityMathModelV1")
    liquidityMathModelV1 = await LiquidityMathModelV1.deploy()
    await liquidityMathModelV1.deployed()
    
    const LiquidationModelV1 = await ethers.getContractFactory("LiquidationModelV1")
    liquidationModelV1 = await LiquidationModelV1.deploy()
    await liquidationModelV1.deployed()

    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await upgrades.deployProxy(Moartroller, [liquidityMathModelV1.address, liquidationModelV1.address]);
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

    const muUNN = await ethers.getContractFactory("MProtection")
    muunn = await upgrades.deployProxy(muUNN, [copMapping.address, moartroller.address]);
    await muunn.deployed()

    // MTOKENS 
    mdai  = await setupMToken('mToken DAI', 'mDAI', 8, '200000000000000000000000000', dai, moartroller, jrmStableCoin)
    mwbtc = await setupMToken('mToken WBTC', 'mWBTC', 8, '20000000000000000', wbtc, moartroller, jrmWbtc)
    musdc = await setupMToken('mToken USDC', 'mUSDC', 8, '200000000000000', usdc, moartroller, jrmStableCoin)
    munn  = await setupMToken('mToken TUNN', 'mUNN', 8, '200000000000000000000000000', unn, moartroller, jrmUnn)
    mmoar = await setupMToken('mToken MOAR', 'mMOAR', 8, '200000000000000000000000000', moar, moartroller, jrmUnn)
    meth  = await setupMEther('mEther', 'mETH', 8, '200000000000000000000000000', weth,  moartroller, jrmEth)

    // LENDING ROUTER
    const LendingRouter = await ethers.getContractFactory("LendingRouter")
    lendingRouter = await LendingRouter.deploy(uunn.address, muunn.address, dai.address)
    await lendingRouter.deployed()

    // LOAD SETTINGS
    await mdai._setMaxProtectionComposition(10000);
    await mwbtc._setMaxProtectionComposition(500);
    await musdc._setMaxProtectionComposition(10000);
    await munn._setMaxProtectionComposition(2500);
    await mmoar._setMaxProtectionComposition(2500);
    await meth._setMaxProtectionComposition(7600);

    await mdai._setReserveFactor(tokens('0.1'))
    await mwbtc._setReserveFactor(tokens('0.2'))
    await musdc._setReserveFactor(tokens('0.1'))
    await munn._setReserveFactor(tokens('0.35'))
    await mmoar._setReserveFactor(tokens('0.35'))
    await meth._setReserveFactor(tokens('0.2'))

    await oracle.setUnderlyingPrice(meth.address, '1750000000000000000000')
    await oracle.setUnderlyingPrice(mwbtc.address, '55000000000000000000000')
    await oracle.setUnderlyingPrice(musdc.address, '1000000000000000000')
    await oracle.setUnderlyingPrice(munn.address, '90000000000000000')
    await oracle.setUnderlyingPrice(mmoar.address, '3000000000000000000')

    await moartroller._setMoarToken(moar.address)
    await moartroller._setPriceOracle(oracle.address)
    await moartroller._setProtection(muunn.address)
    await moartroller._setLiquidationIncentive(tokens('1.1'))
    await moartroller._setCloseFactor(tokens('0.5'))

    await moartroller._supportMarket(mdai.address)
    await moartroller._supportMarket(mwbtc.address)
    await moartroller._supportMarket(musdc.address)
    await moartroller._supportMarket(munn.address)
    await moartroller._supportMarket(meth.address)
    await moartroller._supportMarket(mmoar.address)

    await moartroller._setCollateralFactor(mdai.address, tokens('0.85'))
    await moartroller._setCollateralFactor(mwbtc.address, tokens('0.75'))
    await moartroller._setCollateralFactor(musdc.address, tokens('0.85'))
    await moartroller._setCollateralFactor(munn.address, tokens('1.25'))
    await moartroller._setCollateralFactor(meth.address, tokens('0.75'))
    await moartroller._setCollateralFactor(mmoar.address, tokens('1.25'))

    await moartroller._addPrivilegedAddress(lendingRouter.address)

    // MAXIMILLION
    maximillion = await setupMaximillion(meth.address)

    // Vesting
    const MultiFeeDistribution = await ethers.getContractFactory("MultiFeeDistribution")
    vesting = await MultiFeeDistribution.deploy(moar.address, [], '70')
    await vesting.deployed()

    const ERCFund = await ethers.getContractFactory("ERCFund")
    ercFund = await ERCFund.deploy(vesting.address)
    await ercFund.deployed()

    const MProxyV1 = await ethers.getContractFactory("MProxyV1")
    mproxyv1 = await MProxyV1.deploy(owner.address)
    await mproxyv1.deployed()

    const MProxyV2 = await ethers.getContractFactory("MProxyV2")
    mproxyv2 = await MProxyV2.deploy(vesting.address, ercFund.address)
    await mproxyv2.deployed()

    tx = await moartroller._setMProxy(mproxyv2.address)
    await tx.wait()

    tx = await vesting.setMinter(mproxyv2.address, true)
    await tx.wait()

    tx = await vesting.addReward(usdc.address, ercFund.address)
    await tx.wait()

    tx = await vesting.addReward(weth.address, ercFund.address)
    await tx.wait()
    return {
        owner, user1, user2, user3, 
        dai, usdc, wbtc, unn, weth, moar,
        mdai, mwbtc, musdc, munn, meth, mmoar,
        oracle, liquidityMathModelV1, liquidationModelV1, moartroller, uunn, muunn, lendingRouter, maximillion,
        mproxyv1, mproxyv2, vesting,
    }
}

module.exports = setupAll
