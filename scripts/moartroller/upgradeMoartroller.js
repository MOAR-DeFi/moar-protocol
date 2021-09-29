// Rinkeby addresses
const moartrollerAddress    = '0x77E7FA5B12B77A93E5Ad7456Ace11A7beB289407'

async function main() {
    const Moartroller = await ethers.getContractFactory("Moartroller")
    await upgrades.upgradeProxy(moartrollerAddress, Moartroller);
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })