const { ethers, upgrades } = require('hardhat');

async function main() {
    console.log(`[SimplePriceOracle] Deploying...`)
    const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle")
    oracle = await SimplePriceOracle.deploy()
    await oracle.deployed()
    console.log(`[SimplePriceOracle] Deployed!\n`)
    console.log(`[SimplePriceOracle] Transaction hash: ${oracle.deployTransaction.hash}`)
    console.log(`[SimplePriceOracle] Contract address: ${oracle.address}`)
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })