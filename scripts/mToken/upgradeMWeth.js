// Rinkeby addresses
const mwethAddress    = '0xa31D13C84c1c90200D716fb062D879d572825116'

async function main() {
    const MWEth = await ethers.getContractFactory("MWeth")
    await upgrades.upgradeProxy(mwethAddress, MWEth);
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })