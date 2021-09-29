const { ethers, upgrades } = require('hardhat');

const moarAddress = '0x03f2b2B8A3c1F37F1fE304472D4028e395429c52';

async function main() {
    console.log(`[Vesting] Deploying...`)

    // const MultiFeeDistribution = await ethers.getContractFactory("MultiFeeDistribution")
    // vesting = await MultiFeeDistribution.deploy(moarAddress, [])
    // await vesting.deployed()
    
    // console.log(`[Vesting] Deployed!\n`)
    // console.log(`[Vesting] Transaction hash: ${vesting.deployTransaction.hash}`)
    // console.log(`[Vesting] Contract address: ${vesting.address}\n`)

    console.log(`[Vesting] Starting verification...\n`)
    await hre.run("verify:verify", {
        address: '0x2994579DbA0251d18544C0eB9CCaA560aE6aA11c',
        constructorArguments: [moarAddress, [], '70'],
    });
    console.log(`[Vesting] Verified!\n`)
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })  
  
  
