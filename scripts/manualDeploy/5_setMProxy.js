
const moartrollerAddress    = '0x802A92B277348299ef766CF6b777921F6a8390Cc'
const MProxyAddress         = '0x24e182A9Cf5CEe71b3bF63f889eb039d666B98c8'

async function main() {
    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.attach(moartrollerAddress)

    console.log(`[Moartroller] Setting MProxyAddress...`)
    tx = await moartroller._setMProxy(MProxyAddress)
    await tx.wait()
    console.log(`[Moartroller] MProxyAddress set!`)

}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })