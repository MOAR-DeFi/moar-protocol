async function main() {
    console.log(`[MProxyV1] Deploying...`)

    const [owner] = await ethers.getSigners()
    const MProxyV1 = await ethers.getContractFactory("MProxyV1")
    mproxyv1 = await MProxyV1.deploy(owner.address)
    await mproxyv1.deployed()

    console.log(`[MProxyV1] Deployed!\n`)
    console.log(`[MProxyV1] Transaction hash: ${mproxyv1.deployTransaction.hash}`)
    console.log(`[MProxyV1] Contract address: ${mproxyv1.address}`)

    console.log(`[MProxyV1] Starting verification...\n`)
    await hre.run("verify:verify", {
        address: mproxyv1.address,
        constructorArguments: [owner.address],
    });
    console.log(`[MProxyV1] Verified!\n`)
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })