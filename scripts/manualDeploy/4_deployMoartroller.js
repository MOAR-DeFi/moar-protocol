const { ethers, upgrades } = require('hardhat');

async function main() {
    console.log(`[Moartroller] Deploying...`)

    const LiquidityMathModelV1Address  = '0x71e12c098CBA5ADF1076155102F2198A6cc592d7';
    const LiquidationModelV1Address    = '0xc5c6b5fE4c9f71735b47E2CC4E83c356446A6b5d';

    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await upgrades.deployProxy(Moartroller, [LiquidityMathModelV1Address, LiquidationModelV1Address]);
    await moartroller.deployed()

    console.log(`[Moartroller] Deployed!\n`)
    console.log(`[Moartroller] Transaction hash: ${moartroller.deployTransaction.hash}`)
    console.log(`[Moartroller] Contract address: ${moartroller.address}`)

    console.log(`[Moartroller] Starting verification...\n`)
    try{
        await hre.run("verify:verify", {
            address: (await (await upgrades.admin.getInstance()).functions.getProxyImplementation(moartroller.address))[0],
            constructorArguments: [],
        });
        console.log(`[Moartroller] Verified!\n`)

    }
    catch(e){
        console.log(`[Moartroller] ${e.message}\n`)
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })