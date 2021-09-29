const { ethers, upgrades } = require('hardhat');

async function main() {
    console.log(`[CopMapping] Deploying...`)

    const uUnnAddress = "0x4991107eC94e95A961EDDfbE1efD22515Dc447E6"

    const CopMapping = await ethers.getContractFactory("CopMapping")
    copMapping = await CopMapping.deploy(uUnnAddress)
    await copMapping.deployed()

    console.log(`[CopMapping] Deployed!\n`)
    console.log(`[CopMapping] Transaction hash: ${copMapping.deployTransaction.hash}`)
    console.log(`[CopMapping] Contract address: ${copMapping.address}\n`)

    console.log(`[CopMapping] Starting verification...\n`)
    await hre.run("verify:verify", {
        address: copMapping.address,
        constructorArguments: [uUnnAddress],
    });
    console.log(`[CopMapping] Verified!\n`)

}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })