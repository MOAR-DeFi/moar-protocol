const { ethers, upgrades } = require('hardhat');

async function main() {
    console.log(`[Maximillion] Deploying...`)

    const MWEthereumAddress = '0x4631cf9Cc44e40A27a3C8b39134828C281662b57'

    const Maximillion = await ethers.getContractFactory("Maximillion")
    maximillion = await Maximillion.deploy(MWEthereumAddress)
    await maximillion.deployed()

    console.log(`[Maximillion] Deployed!\n`)
    console.log(`[Maximillion] Transaction hash: ${maximillion.deployTransaction.hash}`)
    console.log(`[Maximillion] Contract address: ${maximillion.address}\n`)

    console.log(`[Maximillion] Starting verification...\n`)
    await hre.run("verify:verify", {
        address: maximillion.address,
        constructorArguments: [MWEthereumAddress],
    });
    console.log(`[Maximillion] Verified!\n`)
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })