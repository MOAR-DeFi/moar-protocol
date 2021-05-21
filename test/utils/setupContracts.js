const { tokens } = require('./testHelpers')
const { create, all, bignumber } = require('mathjs')
const config = {}
const mathjs = create(all, config)

const setupToken = async function (name, decimals, adminSupply, userSupply, deployParams = [], callAfterDeploy = async (tokenInstance) => { }) {
    const [owner, user1, user2, user3, user4] = await ethers.getSigners(13)
    const decimalsFactor = mathjs.pow(10, decimals)
    adminSupply = mathjs.format(mathjs.multiply(adminSupply, decimalsFactor), { notation: 'fixed' })
    userSupply = mathjs.format(mathjs.multiply(userSupply, decimalsFactor), { notation: 'fixed' })

    const Token = await ethers.getContractFactory(name)
    token = await Token.deploy(...deployParams)
    await callAfterDeploy(token)
    await token.deployed()

    if(bignumber(adminSupply).gt(0)){
        tx = await token.mint(owner.address, adminSupply)
        await tx.wait()
    }
    if(bignumber(userSupply).gt(0)){
        tx = await token.mint(user1.address, userSupply)
        await tx.wait()
        tx = await token.mint(user2.address, userSupply)
        await tx.wait()
        tx = await token.mint(user3.address, userSupply)
        await tx.wait()
        tx = await token.mint(user4.address, userSupply)
        await tx.wait()
    }

    return token
}

const setupAllTokens = async function () {
    const [owner, user1, user2, user3, user4] = await ethers.getSigners(13)
    return {
        dai: await setupToken('Dai', 18, '10000000', '10000', [(await ethers.provider.getNetwork()).chainId]),
        wbtc: await setupToken('WBTC', 8, '10000000', '10000', []),
        usdc: await setupToken('FiatTokenV2', 6, '10000000', '10000', [], async (token) => {
            await token.initialize('USDC', 'USDC', 'USD', 6, owner.address, owner.address, owner.address, owner.address)
            await token.configureMinter(owner.address, '100000000000000000000')
        }),
        unn: await setupToken('TestUnionGovernanceToken', 18, '0', '0', [owner.address, tokens('10040000')], async (token) => {
            await token.setCanTransfer(true)
            await token.setReversion(true)
            await token.transfer(user1.address, tokens('10000'))
            await token.transfer(user2.address, tokens('10000'))
            await token.transfer(user3.address, tokens('10000'))
            await token.transfer(user4.address, tokens('10000'))
        }),
        weth: await setupToken('WETH9')
    }
}

const setupMToken = async function (name, symbol, decimals, exchangeRate, underlyingAsset, moartroller, interestRateModel) {
    const [owner] = await ethers.getSigners(13)
    const MToken = await ethers.getContractFactory('MErc20Immutable')
    ctoken = await MToken.deploy(underlyingAsset.address, moartroller.address, interestRateModel.address, exchangeRate, name, symbol, decimals, owner.address)
    await ctoken.deployed()

    return ctoken
}

const setupCEther = async function (name, symbol, decimals, exchangeRate, underlyingAsset, moartroller, interestRateModel){
    const [owner] = await ethers.getSigners(13)
    const MWeth = await ethers.getContractFactory("MWeth")
    cether = await MWeth.deploy(underlyingAsset.address, moartroller.address, interestRateModel.address, exchangeRate, name, symbol, decimals, owner.address)
    await cether.deployed()

    return cether
}

const setupAllMTokens = async function (tokensAddresses, platformAddresses) {
    const [owner] = await ethers.getSigners(13)
    return {
        cdai: await setupMToken('cToken DAI', 'cDAI', 18, tokens('0.02'), tokensAddresses.dai, platformAddresses.moartroller, platformAddresses.interestRateModel),
        cwbtc: await setupMToken('cToken WBTC', 'cWBTC', 8, tokens('0.02'), tokensAddresses.wbtc, platformAddresses.moartroller, platformAddresses.interestRateModel),
        cusdc: await setupMToken('cToken USDC', 'cUSDC', 6, tokens('0.02'), tokensAddresses.usdc, platformAddresses.moartroller, platformAddresses.interestRateModel),
        cunn: await setupMToken('cToken TUNN', 'cUNN', 18, tokens('0.02'), tokensAddresses.unn, platformAddresses.moartroller, platformAddresses.interestRateModel),
        ceth: await setupCEther('cEther', 'cETH', 18, tokens('0.02'), tokensAddresses.weth, platformAddresses.moartroller, platformAddresses.interestRateModel)
    }
}

const setupPlatformContracts = async function (tokensAddresses) {
    const [owner] = await ethers.getSigners(13)

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
    jumpRateModelV2 = await JumpRateModelV2.deploy(tokens('1'), tokens('1'), 1, 1, owner.address)
    await jumpRateModelV2.deployed()

    const CopMapping = await ethers.getContractFactory("CopMapping")
    copMapping = await CopMapping.deploy(uUnnAddress)
    await copMapping.deployed()

    const cuUNN = await ethers.getContractFactory("MProtection")
    cuunn = await cuUNN.deploy(copMapping.address, moartroller.address)
    await cuunn.deployed()

    const UnnLendingRouter = await ethers.getContractFactory("UnnLendingRouter")
    lendingRouter = await UnnLendingRouter.deploy(uunn.address, cuunn.address, tokensAddresses.dai.address)
    await lendingRouter.deployed()

    return {
        oracle: oracle,
        moartroller: moartroller,
        interestRateModel: jumpRateModelV2,
        liquidityMathModel: liquidityMathModelV1,
        lendingRouter: lendingRouter,
        uunn: uunn,
        cuunn: cuunn
    }
}

const setupMaximillion = async function(cEtherAddress){
    const Maximillion = await ethers.getContractFactory("Maximillion")
    maximillion = await Maximillion.deploy(cEtherAddress)
    await maximillion.deployed()

    return maximillion
}

const loadDefaultSettings = async function (platformContracts, allTokens, allMTokens) {
    await platformContracts.oracle.setUnderlyingPrice(allMTokens.ceth.address, '1750000000000000000000')
    await platformContracts.oracle.setUnderlyingPrice(allMTokens.cwbtc.address, '550000000000000000000000000000000')
    await platformContracts.oracle.setUnderlyingPrice(allMTokens.cusdc.address, '1000000000000000000000000000000')
    await platformContracts.oracle.setUnderlyingPrice(allMTokens.cunn.address, '90000000000000000')

    await platformContracts.moartroller._setPriceOracle(platformContracts.oracle.address)
    await platformContracts.moartroller._setProtection(platformContracts.cuunn.address)

    await allMTokens.cdai._setMaxProtectionComposition(2500);
    await allMTokens.cwbtc._setMaxProtectionComposition(2500);
    await allMTokens.cusdc._setMaxProtectionComposition(2500);
    await allMTokens.cunn._setMaxProtectionComposition(2500);
    await allMTokens.ceth._setMaxProtectionComposition(2500);

    await platformContracts.moartroller._supportMarket(allMTokens.cdai.address)
    await platformContracts.moartroller._supportMarket(allMTokens.cwbtc.address)
    await platformContracts.moartroller._supportMarket(allMTokens.cusdc.address)
    await platformContracts.moartroller._supportMarket(allMTokens.cunn.address)
    await platformContracts.moartroller._supportMarket(allMTokens.ceth.address)

    await platformContracts.moartroller._setCollateralFactor(allMTokens.cdai.address, tokens('0.9'))
    await platformContracts.moartroller._setCollateralFactor(allMTokens.cwbtc.address, tokens('0.6'))
    await platformContracts.moartroller._setCollateralFactor(allMTokens.cusdc.address, tokens('0.9'))
    await platformContracts.moartroller._setCollateralFactor(allMTokens.cunn.address, tokens('0.4'))
    await platformContracts.moartroller._setCollateralFactor(allMTokens.ceth.address, tokens('0.5'))
}

module.exports = {
    setupToken,
    setupAllTokens,
    setupMToken,
    setupCEther,
    setupAllMTokens,
    setupPlatformContracts,
    loadDefaultSettings,
    setupMaximillion
}
