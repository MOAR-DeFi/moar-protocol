const { tokens } = require('./../../test/utils/testHelpers')

let moartroller 

// Rinkeby addresses
const moartrollerAddress    = '0x072dCb0b6f7e124C6B21A16803Daf5baB69abAFd'

async function main() {
    [owner, user1, user2, user3, user4] = await ethers.getSigners()

    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.attach(moartrollerAddress)


    result = await moartroller.getAccountLiquidity('0xb7F919dd8CBF9fA6Bf8A9f254D2055A126b77ABF')
    console.log(result.toString())

}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })