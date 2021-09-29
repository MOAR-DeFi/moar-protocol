const { ethers, upgrades } = require('hardhat');

async function main() {
    console.log(`[LendingRouter] Deploying...`)

    const uUnnAddress = "0x4991107eC94e95A961EDDfbE1efD22515Dc447E6"
    const MProtectionAddress = "0x3740b7c6d133441DFA342339673B0c4C3603616D"
    const BaseAssetAddress = "0x3813a8Ba69371e6DF3A89b78bf18fC72Dd5B43c5" // USDC? 

    const LendingRouter = await ethers.getContractFactory("LendingRouter")
    lendingRouter = await LendingRouter.deploy(uUnnAddress, MProtectionAddress, BaseAssetAddress)
    await lendingRouter.deployed()

    console.log(`[LendingRouter] Deployed!\n`)
    console.log(`[LendingRouter] Transaction hash: ${lendingRouter.deployTransaction.hash}`)
    console.log(`[LendingRouter] Contract address: ${lendingRouter.address}\n`)

    console.log(`[LendingRouter] Starting verification...\n`)
    await hre.run("verify:verify", {
        address: lendingRouter.address,
        constructorArguments: [uUnnAddress, MProtectionAddress, BaseAssetAddress],
    });
    console.log(`[LendingRouter] Verified!\n`)

}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })