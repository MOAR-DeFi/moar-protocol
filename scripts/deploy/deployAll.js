async function main() {
    const { setupMToken, setupMEther } = require('./../../test/utils/setupContracts')
    const { tokens } = require('./../../test/utils/testHelpers')
    const [owner] = await ethers.getSigners()
    const config = require('../manualDeploy/config.js');

    const uUnnAddress = ''//ethers.constants.AddressZero
    const vestingPenalty = '70'  // 70%


    // LiquidityMathModelV1
    console.log(`[LiquidityMathModelV1] Deploying...`)

    const LiquidityMathModelV1 = await ethers.getContractFactory("LiquidityMathModelV1")
    liquidityMathModelV1 = await LiquidityMathModelV1.deploy()
    await liquidityMathModelV1.deployed()

    console.log(`[LiquidityMathModelV1] Deployed!`)
    console.log(`[LiquidityMathModelV1] Transaction hash: ${liquidityMathModelV1.deployTransaction.hash}`)
    console.log(`[LiquidityMathModelV1] Contract address: ${liquidityMathModelV1.address}\n`)

    // LiquidationModelV1
    console.log(`[LiquidationModelV1] Deploying...`)
    const LiquidationModelV1 = await ethers.getContractFactory("LiquidationModelV1")
    liquidationModelV1 = await LiquidationModelV1.deploy()
    await liquidationModelV1.deployed()

    console.log(`[LiquidationModelV1] Deployed!`)
    console.log(`[LiquidationModelV1] Transaction hash: ${liquidationModelV1.deployTransaction.hash}`)
    console.log(`[LiquidationModelV1] Contract address: ${liquidationModelV1.address}\n`)

    // MProxyV1
    console.log(`[MProxyV1] Deploying...`)

    const MProxyV1 = await ethers.getContractFactory("MProxyV1")
    mproxyv1 = await MProxyV1.deploy(owner.address)
    await mproxyv1.deployed()

    console.log(`[MProxyV1] Deployed!`)
    console.log(`[MProxyV1] Transaction hash: ${mproxyv1.deployTransaction.hash}`)
    console.log(`[MProxyV1] Contract address: ${mproxyv1.address}\n`)

    // Moartroller
    console.log(`[Moartroller] Deploying...`)

    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await upgrades.deployProxy(Moartroller, [liquidityMathModelV1.address, liquidationModelV1.address]);
    await moartroller.deployed()

    console.log(`[Moartroller] Deployed!`)
    console.log(`[Moartroller] Transaction hash: ${moartroller.deployTransaction.hash}`)
    console.log(`[Moartroller] Contract address: ${moartroller.address}\n`)

    // Set MProxy 
    console.log(`[Moartroller] Setting MProxyAddress...`)
    tx = await moartroller._setMProxy(mproxyv1.address)
    await tx.wait()
    console.log(`[Moartroller] MProxyAddress set!\n`)

    // CopMapping
    console.log(`[CopMapping] Deploying...`)

    const CopMapping = await ethers.getContractFactory("CopMapping")
    copMapping = await CopMapping.deploy(uUnnAddress)
    await copMapping.deployed()

    console.log(`[CopMapping] Deployed!`)
    console.log(`[CopMapping] Transaction hash: ${copMapping.deployTransaction.hash}`)
    console.log(`[CopMapping] Contract address: ${copMapping.address}\n`)
    
    // MProtection
    console.log(`[MProtection] Deploying...`)

    const MProtection = await ethers.getContractFactory("MProtection")
    mprotection = await upgrades.deployProxy(MProtection, [copMapping.address, moartroller.address]);
    await mprotection.deployed()

    console.log(`[MProtection] Deployed!`)
    console.log(`[MProtection] Transaction hash: ${mprotection.deployTransaction.hash}`)
    console.log(`[MProtection] Contract address: ${mprotection.address}\n`)

    // SimplePriceOracle
    // console.log(`[SimplePriceOracle] Deploying...`)

    // const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle")
    // oracle = await SimplePriceOracle.deploy()
    // await oracle.deployed()

    // console.log(`[SimplePriceOracle] Deployed!`)
    // console.log(`[SimplePriceOracle] Transaction hash: ${oracle.deployTransaction.hash}`)
    // console.log(`[SimplePriceOracle] Contract address: ${oracle.address}\n`)

    // Set Oracle
    console.log(`[Moartroller] Setting PriceOracle token...`)
    // tx = await moartroller._setPriceOracle(oracle.address)
    tx = await moartroller._setPriceOracle('0xc775Ed27d8D8bb63884e9A34bb638c0D291A0652')
    await tx.wait()
    console.log(`[Moartroller] PriceOracle set!\n`)

     // JumpRateModelV2
    let jumpRateModels = []
    for(chosenAsset in config){
        console.log(`[JumpRateModelV2 - ${chosenAsset}] Deploying...`)
        const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")
        jrm = await JumpRateModelV2.deploy(
            config[chosenAsset].jumpRateModel.baseRatePerYear, 
            config[chosenAsset].jumpRateModel.multiplierPerYear, 
            config[chosenAsset].jumpRateModel.jumpMultiplierPerYear, 
            config[chosenAsset].jumpRateModel.kink, 
            owner.address
        )
        await jrm.deployed()
        jumpRateModels[chosenAsset] = jrm

        console.log(`[JumpRateModelV2 - ${chosenAsset}] Deployed!`)
        console.log(`[JumpRateModelV2 - ${chosenAsset}] Transaction hash: ${jrm.deployTransaction.hash}`)
        console.log(`[JumpRateModelV2 - ${chosenAsset}] Contract address: ${jrm.address}\n`)
    }

    // MTokens
    const Asset = await ethers.getContractFactory("@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20")
    let mTokens = []
    for(chosenAsset in config){
        asset = await Asset.attach(config[chosenAsset].assetAddress)

        console.log(`[mToken - ${chosenAsset}] Deploying...`)
        // if(chosenAsset === 'eth' || chosenAsset === 'weth'){
        //     mToken = await setupMEther(config.name, config.symbol, config.decimals, config.initialExchangeRate, asset, moartroller, jrm)
        // }
        // else{
            mToken = await setupMToken(
                config[chosenAsset].name, 
                config[chosenAsset].symbol, 
                config[chosenAsset].decimals, 
                config[chosenAsset].initialExchangeRate, 
                asset, 
                moartroller, 
                jumpRateModels[chosenAsset]
            )
        // }

        mTokens[chosenAsset] = mToken
        console.log(`[mToken - ${chosenAsset}] Deployed!`)
        console.log(`[mToken - ${chosenAsset}] Transaction hash: ${mToken.deployTransaction.hash}`)
        console.log(`[mToken - ${chosenAsset}] Contract address: ${mToken.address}`)

        console.log(`[mToken - ${chosenAsset}] Setting MaxProtectionComposition...`)
        tx = await mToken._setMaxProtectionComposition(config[chosenAsset].mpc);
        await tx.wait()
        console.log(`[mToken - ${chosenAsset}] MaxProtectionComposition set!`)

        console.log(`[mToken - ${chosenAsset}] Setting ReserveFactor...`)
        tx = await mToken._setReserveFactor(config[chosenAsset].reserveFactor)
        await tx.wait()
        console.log(`[mToken - ${chosenAsset}] ReserveFactor set!`)

        console.log(`[mToken - ${chosenAsset}] Setting ReserveSplitFactor...`)
        tx = await mToken._setReserveSplitFactor(config[chosenAsset].splitReserveFactor)
        await tx.wait()
        console.log(`[mToken - ${chosenAsset}] ReserveSplitFactor set!`)

        console.log(`[mToken - ${chosenAsset}] Enabling market support...`)
        tx = await moartroller._supportMarket(mToken.address)
        await tx.wait()
        console.log(`[mToken - ${chosenAsset}] Market support enabled!`)

        console.log(`[mToken - ${chosenAsset}] Setting CollateralFactor...`)
        tx = await moartroller._setCollateralFactor(mToken.address, config[chosenAsset].collateralFactor)
        await tx.wait()
        console.log(`[mToken - ${chosenAsset}] CollateralFactor set!`)

        console.log(`[mToken - ${chosenAsset}] Setting RewardDistribution...`)
        tx = await moartroller._setMoarSpeed(mToken.address, config[chosenAsset].rewardDistribution)
        await tx.wait()
        console.log(`[mToken - ${chosenAsset}] RewardDistribution set!\n`)
    }

    // LendingRouter
    console.log(`[LendingRouter] Deploying...`)

    const LendingRouter = await ethers.getContractFactory("LendingRouter")
    lendingRouter = await LendingRouter.deploy(uUnnAddress, mprotection.address, config['usdc'].assetAddress)
    await lendingRouter.deployed()

    console.log(`[LendingRouter] Deployed!`)
    console.log(`[LendingRouter] Transaction hash: ${lendingRouter.deployTransaction.hash}`)
    console.log(`[LendingRouter] Contract address: ${lendingRouter.address}\n`)

    // Moartroller settings
    console.log(`[Moartroller] Setting MOAR token...`)
    tx = await moartroller._setMoarToken(config['moar'].assetAddress)
    await tx.wait()
    console.log(`[Moartroller] MOAR token set!`)

    console.log(`[Moartroller] Setting MProtection...`)
    tx = await moartroller._setProtection(mprotection.address)
    await tx.wait()
    console.log(`[Moartroller] MProtection set!`)

    console.log(`[Moartroller] Setting LendingRouter as privileged address...`)
    tx = await moartroller._addPrivilegedAddress(lendingRouter.address)
    await tx.wait()
    console.log(`[Moartroller] Privileged address set!`)
  
    console.log(`[Moartroller] Setting LiquidationIncentive...`)
    tx = await moartroller._setLiquidationIncentive(tokens('1.1'))
    await tx.wait()
    console.log(`[Moartroller] LiquidationIncentive set!`)
  
    console.log(`[Moartroller] Setting CloseFactor...`)
    tx = await moartroller._setCloseFactor(tokens('0.5'))
    await tx.wait()
    console.log(`[Moartroller] CloseFactor set!\n`)

    // Maxmillion
    // console.log(`[Maximillion] Deploying...`)

    // const Maximillion = await ethers.getContractFactory("Maximillion")
    // maximillion = await Maximillion.deploy(mTokens['eth'].address)
    // await maximillion.deployed()

    // console.log(`[Maximillion] Deployed!\n`)
    // console.log(`[Maximillion] Transaction hash: ${maximillion.deployTransaction.hash}`)
    // console.log(`[Maximillion] Contract address: ${maximillion.address}\n`)

    // Vesting
    console.log('Deploying MultiFeeDistribution')
    const MultiFeeDistribution = await ethers.getContractFactory("MultiFeeDistribution")
    vesting = await MultiFeeDistribution.deploy(config['moar'].assetAddress, [], vestingPenalty)
    await vesting.deployed()
    console.log(`Vesting contract:  ${vesting.address}`)

    console.log('Deploying ERCFund')
    const ERCFund = await ethers.getContractFactory("ERCFund")
    ercFund = await ERCFund.deploy(vesting.address)
    await ercFund.deployed()
    console.log(`ERCFund contract:  ${ercFund.address}`)

    console.log('Deploying MProxyV2')
    const MProxyV2 = await ethers.getContractFactory("MProxyV2")
    mproxyv2 = await MProxyV2.deploy(vesting.address, ercFund.address)
    await mproxyv2.deployed()
    console.log(`MProxyV2 contract: ${mproxyv2.address}`)

    console.log('Setting MProxyV2')
    tx = await moartroller._setMProxy(mproxyv2.address)
    await tx.wait()

    console.log('Setting minter')
    tx = await vesting.setMinter(mproxyv2.address, true)
    await tx.wait()

    console.log('Adding USDC as reward')
    tx = await vesting.addReward(config['usdc'].assetAddress, ercFund.address)
    await tx.wait()

    console.log('All done')
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })