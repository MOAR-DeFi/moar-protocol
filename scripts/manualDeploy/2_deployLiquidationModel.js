async function main() {
    console.log(`[LiquidationModelV1] Deploying...`)

    const LiquidationModelV1 = await ethers.getContractFactory("LiquidationModelV1")
    liquidationModelV1 = await LiquidationModelV1.deploy()
    await liquidationModelV1.deployed()

    console.log(`[LiquidationModelV1] Deployed!\n`)
    console.log(`[LiquidationModelV1] Transaction hash: ${liquidationModelV1.deployTransaction.hash}`)
    console.log(`[LiquidationModelV1] Contract address: ${liquidationModelV1.address}`)

    console.log(`[LiquidityMathModelV1] Starting verification...\n`)
    await hre.run("verify:verify", {
        address: liquidationModelV1.address,
        constructorArguments: [],
    });
    console.log(`[LiquidationModelV1] Verified!\n`)
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })