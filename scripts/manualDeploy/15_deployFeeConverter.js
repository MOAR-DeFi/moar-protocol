const { ethers, upgrades } = require('hardhat');

const vestingContractAddress = '0xf68a4f0E24dCC4c066fBAB356B396ab18Ccd9f83';

async function main() {
    console.log(`[ERCFund] Deploying...`)

    const ERCFund = await ethers.getContractFactory("ERCFund")
    ercFund = await ERCFund.deploy(vestingContractAddress)
    await ercFund.deployed()
    
    console.log(`[ERCFund] Deployed!\n`)
    console.log(`[ERCFund] Transaction hash: ${ercFund.deployTransaction.hash}`)
    console.log(`[ERCFund] Contract address: ${ercFund.address}\n`)
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })  
  
  
