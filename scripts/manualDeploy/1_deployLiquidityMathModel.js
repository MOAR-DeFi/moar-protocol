async function main() {
    console.log(`[LiquidityMathModelV1] Deploying...`)

    const LiquidityMathModelV1 = await ethers.getContractFactory("LiquidityMathModelV1")
    liquidityMathModelV1 = await LiquidityMathModelV1.deploy()
    await liquidityMathModelV1.deployed()

    console.log(`[LiquidityMathModelV1] Deployed!\n`)
    console.log(`[LiquidityMathModelV1] Transaction hash: ${liquidityMathModelV1.deployTransaction.hash}`)
    console.log(`[LiquidityMathModelV1] Contract address: ${liquidityMathModelV1.address}`)

    console.log(`[LiquidityMathModelV1] Starting verification...\n`)
    await hre.run("verify:verify", {
        address: liquidityMathModelV1.address,
        constructorArguments: [],
    });
    console.log(`[LiquidityMathModelV1] Verified!\n`)

}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })