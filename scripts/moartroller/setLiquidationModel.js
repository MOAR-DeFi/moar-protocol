const moartrollerAddress        = '0x77E7FA5B12B77A93E5Ad7456Ace11A7beB289407'
const liquidationModelAddress   = '0x48934a0a78A9CE098458EF9e148D2DbA519f4B20'

async function main() {
    const { tokens } = require('./../../test/utils/testHelpers')

    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.attach(moartrollerAddress)

    console.log(`[Moartroller] Setting LiquidationModel...`)
    tx = await moartroller._setLiquidationModel(liquidationModelAddress);
    await tx.wait()
    console.log(`[Moartroller] LiquidationModel set!`)
  
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })