const vestingAddress = '0xf68a4f0E24dCC4c066fBAB356B396ab18Ccd9f83';
const feeConverter = '0xeC2AF93D09f654841052D01C7Fe3c11Fe45E4269'

async function main() {
    console.log(`[MProxyV2] Deploying...`)

    const [owner] = await ethers.getSigners()
    const MProxyV2 = await ethers.getContractFactory("MProxyV2")
    mproxyv2 = await MProxyV2.deploy(vestingAddress, feeConverter)
    await mproxyv2.deployed()

    console.log(`[MProxyV2] Deployed!\n`)
    console.log(`[MProxyV2] Transaction hash: ${mproxyv2.deployTransaction.hash}`)
    console.log(`[MProxyV2] Contract address: ${mproxyv2.address}`)

    console.log(`[MProxyV2] Starting verification...\n`)
    await hre.run("verify:verify", {
        address: mproxyv2.address,
        constructorArguments: [vestingAddress, feeConverter],
    });
    console.log(`[MProxyV2] Verified!\n`)
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })