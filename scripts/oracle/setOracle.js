let owner, user1, user2, user3
const { tokens, getEventsFromTransaction } = require('../../test/utils/testHelpers')

const MoartrollerAddress = '0x57395de137a41d68F0D143DCac3Fb418e54DC030'
const OracleAddress = '0xE346a8bB88d4004B5838873F7E044f3a5Db31Ea1'

let moartroller

async function setupAccounts(){
    [owner, user1, user2, user3] = await ethers.getSigners(13)
}


async function main() {

    await setupAccounts()
    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.attach(MoartrollerAddress)

    tx = await moartroller._setPriceOracle(OracleAddress)
    await tx.wait()

    console.log('Done')
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })