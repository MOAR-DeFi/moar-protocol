const { tokens } = require('./../../test/utils/testHelpers')

let moartroller 

// Mainnet addresses
const moartrollerAddress    = '0x802A92B277348299ef766CF6b777921F6a8390Cc'
const mUsdtAddress          = '0xaA6B94A9dfab4CEf95261ea278a399acC73465F7'
const mUsdcAddress          = '0x4aF0E9D987D00B455c40d139ba656BAD19468204'
const mWbtcAddress          = '0xeAA39e249946b8C721891513dF415164B251FaB2'
const mEthAddress           = '0x4e2ec0De2aA600eE2A9320515b4A65D7b4133137'
const mUnnAddress           = '0x18E4C9B5868797808941Bc8119864Ed72135d45D'
const mMoarAddress          = '0x4631cf9Cc44e40A27a3C8b39134828C281662b57'
const mLinkAddress          = '0x2569A1F3490b0B67bBd388578a3470667779A25F'

async function main() {
    [owner, user1, user2, user3, user4] = await ethers.getSigners()

    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.attach(moartrollerAddress)

    await moartroller._setMoarSpeed(mEthAddress,    tokens('0.0005456349206'))
    await moartroller._setMoarSpeed(mUsdtAddress,   tokens('0.005121527778'))
    await moartroller._setMoarSpeed(mUnnAddress,    tokens('0.04714781746'))
    await moartroller._setMoarSpeed(mUsdcAddress,   tokens('0.008531746032'))
    await moartroller._setMoarSpeed(mMoarAddress,   tokens('0.06649305556'))


    // result = await moartroller.moarSpeeds(mmoarAddress)
    // console.log(result.toString())

    // await moartroller.claimMoar(owner.address)
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })