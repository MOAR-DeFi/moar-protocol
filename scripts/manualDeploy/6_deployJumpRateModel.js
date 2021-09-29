const chosenAsset = 'link'

async function main() {
    const [owner] = await ethers.getSigners()
    const config = require('./config.js')[chosenAsset].jumpRateModel;

    console.log(`[JumpRateModelV2 - ${chosenAsset}] Deploying...`)
    const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")
    jrm = await JumpRateModelV2.deploy(config.baseRatePerYear, config.multiplierPerYear, config.jumpMultiplierPerYear, config.kink, owner.address)
    await jrm.deployed()
    console.log(`[JumpRateModelV2 - ${chosenAsset}] Deployed!\n`)
    console.log(`[JumpRateModelV2 - ${chosenAsset}] Transaction hash: ${jrm.deployTransaction.hash}`)
    console.log(`[JumpRateModelV2 - ${chosenAsset}] Contract address: ${jrm.address}`)

    console.log(`[JumpRateModelV2 - ${chosenAsset}] Starting verification...\n`)
    await hre.run("verify:verify", {
        address: jrm.address,
        constructorArguments: [config.baseRatePerYear, config.multiplierPerYear, config.jumpMultiplierPerYear, config.kink, owner.address],
    });
    console.log(`[JumpRateModelV2 - ${chosenAsset}] Verified!\n`)
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })