const { setupMToken, setupMEther } = require('./../../test/utils/setupContracts')
let mToken

const moartrollerAddress    = '0x802A92B277348299ef766CF6b777921F6a8390Cc'
const jumpRateModelAddress  = '0x2569A1F3490b0B67bBd388578a3470667779A25F'
const chosenAsset = 'link'

async function main() {
    const [owner] = await ethers.getSigners()
    const config = require('./config.js')[chosenAsset];

    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.attach(moartrollerAddress)

    const Asset = await ethers.getContractFactory("@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20")
    asset = await Asset.attach(config.assetAddress)

    const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")
    jrm = await JumpRateModelV2.attach(jumpRateModelAddress)

    console.log(`[mToken - ${chosenAsset}] Deploying...`)
    if(chosenAsset === 'eth' || chosenAsset === 'weth'){
        mToken = await setupMEther(config.name, config.symbol, config.decimals, config.initialExchangeRate, asset, moartroller, jrm)
    }
    else{
        mToken = await setupMToken(config.name, config.symbol, config.decimals, config.initialExchangeRate, asset, moartroller, jrm)
    }
    console.log(`[mToken - ${chosenAsset}] Deployed!`)
    console.log(`[mToken - ${chosenAsset}] Transaction hash: ${mToken.deployTransaction.hash}`)
    console.log(`[mToken - ${chosenAsset}] Contract address: ${mToken.address}`)

    console.log(`[mToken - ${chosenAsset}] Setting MaxProtectionComposition...`)
    tx = await mToken._setMaxProtectionComposition(config.mpc);
    await tx.wait()
    console.log(`[mToken - ${chosenAsset}] MaxProtectionComposition set!`)

    console.log(`[mToken - ${chosenAsset}] Setting ReserveFactor...`)
    tx = await mToken._setReserveFactor(config.reserveFactor)
    await tx.wait()
    console.log(`[mToken - ${chosenAsset}] ReserveFactor set!`)

    console.log(`[mToken - ${chosenAsset}] Setting ReserveSplitFactor...`)
    tx = await mToken._setReserveSplitFactor(config.splitReserveFactor)
    await tx.wait()
    console.log(`[mToken - ${chosenAsset}] ReserveSplitFactor set!`)

    console.log(`[mToken - ${chosenAsset}] Enabling market support...`)
    tx = await moartroller._supportMarket(mToken.address)
    await tx.wait()
    console.log(`[mToken - ${chosenAsset}] Market support enabled!`)

    console.log(`[mToken - ${chosenAsset}] Setting CollateralFactor...`)
    tx = await moartroller._setCollateralFactor(mToken.address, config.collateralFactor)
    await tx.wait()
    console.log(`[mToken - ${chosenAsset}] CollateralFactor set!`)

    console.log(`[mToken - ${chosenAsset}] Setting RewardDistribution...`)
    tx = await moartroller._setMoarSpeed(mToken.address, config.rewardDistribution)
    await tx.wait()
    console.log(`[mToken - ${chosenAsset}] RewardDistribution set!`)

    console.log(`[mToken - ${chosenAsset}] Starting verification...\n`)
    try{
        if(chosenAsset === 'eth' || chosenAsset === 'weth'){
            await hre.run("verify:verify", {
                address: mToken.address,
                constructorArguments: [config.assetAddress, moartroller.address, jumpRateModelAddress, config.initialExchangeRate, config.name, config.symbol, config.decimals, owner.address],
            });
        }
        else{
            await hre.run("verify:verify", {
                address: (await (await upgrades.admin.getInstance()).functions.getProxyImplementation(mToken.address))[0],
                constructorArguments: [],
            });
        }
        console.log(`[mToken - ${chosenAsset}] Verified!\n`)

    }
    catch(e){
        console.log(`[mToken - ${chosenAsset}] ${e.message}\n`)
    }
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })