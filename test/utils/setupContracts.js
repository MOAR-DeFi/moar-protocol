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
    mtoken = await upgrades.deployProxy(MToken, [underlyingAsset.address, moartroller.address, interestRateModel.address, exchangeRate, name, symbol, decimals, owner.address]);
    await mtoken.deployed()

    return mtoken
}

const setupMEther = async function (name, symbol, decimals, exchangeRate, underlyingAsset, moartroller, interestRateModel){
    const [owner] = await ethers.getSigners(13)
    const MWeth = await ethers.getContractFactory("MWeth")
    mether = await MWeth.deploy(underlyingAsset.address, moartroller.address, interestRateModel.address, exchangeRate, name, symbol, decimals, owner.address)
    await mether.deployed()

    return mether
}

const setupAllMTokens = async function (tokensAddresses, platformAddresses) {
    const [owner] = await ethers.getSigners(13)
    return {
        mdai: await setupMToken('mToken DAI', 'mDAI', 18, tokens('0.02'), tokensAddresses.dai, platformAddresses.moartroller, platformAddresses.interestRateModel),
        mwbtc: await setupMToken('mToken WBTC', 'mWBTC', 8, tokens('0.02'), tokensAddresses.wbtc, platformAddresses.moartroller, platformAddresses.interestRateModel),
        musdc: await setupMToken('mToken USDC', 'mUSDC', 6, tokens('0.02'), tokensAddresses.usdc, platformAddresses.moartroller, platformAddresses.interestRateModel),
        munn: await setupMToken('mToken TUNN', 'mUNN', 18, tokens('0.02'), tokensAddresses.unn, platformAddresses.moartroller, platformAddresses.interestRateModel),
        meth: await setupMEther('mEther', 'mETH', 18, tokens('0.02'), tokensAddresses.weth, platformAddresses.moartroller, platformAddresses.interestRateModel)
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

    const LiquidationModelV1 = await ethers.getContractFactory("LiquidationModelV1")
    liquidationModelV1 = await LiquidationModelV1.deploy()
    await liquidationModelV1.deployed()


    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await upgrades.deployProxy(Moartroller, [liquidityMathModelV1.address, liquidationModelV1.address]);
    await moartroller.deployed()

    const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")
    jumpRateModelV2 = await JumpRateModelV2.deploy(tokens('1'), tokens('1'), 1, 1, owner.address)
    await jumpRateModelV2.deployed()

    const CopMapping = await ethers.getContractFactory("CopMapping")
    copMapping = await CopMapping.deploy(uUnnAddress)
    await copMapping.deployed()

    const muUNN = await ethers.getContractFactory("MProtection")
    muunn = await upgrades.deployProxy(muUNN, [copMapping.address, moartroller.address]);
    await muunn.deployed()

    const LendingRouter = await ethers.getContractFactory("LendingRouter")
    lendingRouter = await LendingRouter.deploy(uunn.address, muunn.address, tokensAddresses.dai.address)
    await lendingRouter.deployed()

    return {
        oracle: oracle,
        moartroller: moartroller,
        interestRateModel: jumpRateModelV2,
        liquidityMathModel: liquidityMathModelV1,
        liquidationModel: liquidationModelV1,
        lendingRouter: lendingRouter,
        uunn: uunn,
        muunn: muunn
    }
}

const setupMaximillion = async function(mEtherAddress){
    const Maximillion = await ethers.getContractFactory("Maximillion")
    maximillion = await Maximillion.deploy(mEtherAddress)
    await maximillion.deployed()

    return maximillion
}

const loadDefaultSettings = async function (platformContracts, allTokens, allMTokens) {
    await platformContracts.oracle.setUnderlyingPrice(allMTokens.meth.address, '1750000000000000000000')
    await platformContracts.oracle.setUnderlyingPrice(allMTokens.mwbtc.address, '550000000000000000000000000000000')
    await platformContracts.oracle.setUnderlyingPrice(allMTokens.musdc.address, '1000000000000000000000000000000')
    await platformContracts.oracle.setUnderlyingPrice(allMTokens.munn.address, '90000000000000000')

    await platformContracts.moartroller._setPriceOracle(platformContracts.oracle.address)
    await platformContracts.moartroller._setProtection(platformContracts.muunn.address)

    await allMTokens.mdai._setMaxProtectionComposition(2500);
    await allMTokens.mwbtc._setMaxProtectionComposition(2500);
    await allMTokens.musdc._setMaxProtectionComposition(2500);
    await allMTokens.munn._setMaxProtectionComposition(2500);
    await allMTokens.meth._setMaxProtectionComposition(2500);

    await platformContracts.moartroller._supportMarket(allMTokens.mdai.address)
    await platformContracts.moartroller._supportMarket(allMTokens.mwbtc.address)
    await platformContracts.moartroller._supportMarket(allMTokens.musdc.address)
    await platformContracts.moartroller._supportMarket(allMTokens.munn.address)
    await platformContracts.moartroller._supportMarket(allMTokens.meth.address)

    await platformContracts.moartroller._setCollateralFactor(allMTokens.mdai.address, tokens('0.9'))
    await platformContracts.moartroller._setCollateralFactor(allMTokens.mwbtc.address, tokens('0.6'))
    await platformContracts.moartroller._setCollateralFactor(allMTokens.musdc.address, tokens('0.9'))
    await platformContracts.moartroller._setCollateralFactor(allMTokens.munn.address, tokens('0.4'))
    await platformContracts.moartroller._setCollateralFactor(allMTokens.meth.address, tokens('0.5'))
}

module.exports = {
    setupToken,
    setupAllTokens,
    setupMToken,
    setupMEther,
    setupAllMTokens,
    setupPlatformContracts,
    loadDefaultSettings,
    setupMaximillion
}
