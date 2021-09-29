const { ethers, upgrades } = require('hardhat');

const MoartrollerAddress = '0x802A92B277348299ef766CF6b777921F6a8390Cc'
const PriceOracleAddress = '0xf7c80137c930ea5ef7208fd74857f71fe81f0037'

async function main() {
    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.attach(MoartrollerAddress)

    console.log(`[Moartroller] Setting PriceOracle token...`)
    tx = await moartroller._setPriceOracle(PriceOracleAddress)
    await tx.wait()
    console.log(`[Moartroller] PriceOracle set!`)
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })