const { ethers, upgrades } = require('hardhat');

async function main() {
    console.log(`[MProtection] Deploying...`)

    const CopMappingAddress     = '0xBdC9e7a7115edde1132e1B026e84A500e6e7469F'
    const MoartrollerAddress    = '0x802A92B277348299ef766CF6b777921F6a8390Cc'  

    const MProtection = await ethers.getContractFactory("MProtection")
    mprotection = await upgrades.deployProxy(MProtection, [CopMappingAddress, MoartrollerAddress]);
    await mprotection.deployed()

    console.log(`[MProtection] Deployed!\n`)
    console.log(`[MProtection] Transaction hash: ${mprotection.deployTransaction.hash}`)
    console.log(`[MProtection] Contract address: ${mprotection.address}\n`)

    console.log(`[MProtection] Starting verification...\n`)
    try{
        await hre.run("verify:verify", {
            address: (await (await upgrades.admin.getInstance()).functions.getProxyImplementation(mprotection.address))[0],
            constructorArguments: [],
        });
        console.log(`[MProtection] Verified!\n`)

    }
    catch(e){
        console.log(`[MProtection] ${e.message}\n`)
    }
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })