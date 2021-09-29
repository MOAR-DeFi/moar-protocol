const moartrollerAddress        = '0x072dCb0b6f7e124C6B21A16803Daf5baB69abAFd'
const moarAddress               = '0x03f2b2B8A3c1F37F1fE304472D4028e395429c52'

async function main() {
    const { tokens, fromTokens } = require('./../../test/utils/testHelpers')

    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.attach(moartrollerAddress)

    const Moar = await ethers.getContractFactory("MoarMockToken")
    moar = await Moar.attach(moarAddress)

    balance = await moar.balanceOf(moartrollerAddress);
    console.log(`Moartroller has ${fromTokens(balance.toString(), 18)} MOAR tokens`)

    // await moartroller._grantMoar('0x60410067b0BdB607f4d8f50B8a2282892199712F', balance);
  
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })