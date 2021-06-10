let owner, user1, user2, user3
const { tokens, getEventsFromTransaction } = require('../../test/utils/testHelpers')

const OracleAddress = '0xCffE04EF272d66b2ca355aBF1ad26669Da9b9cdF'

const mDAIAddress = '0x8Df198D262098D60726d5707a6b5131794ecE8Ee'
const mUSDCAddress = '0xB5FCd17D889639967312aF2801ff22fe1bd7Be3A'
const mEthAddress = '0xcEB89905e0bC867E96B7A7b2d60B888fd029Eb87'
const mWbtcAddress = '0x71fd3BDec0CbC3F4637383c403613CCA0B09F81c'
const mUnnAddress = '0x02aBCD298b56C2767D59061Aee329e933696fa81'



let moartroller, oracle

async function setupAccounts(){
    [owner, user1, user2, user3] = await ethers.getSigners(13)
}

async function attachOracle(){
    const Oracle = await ethers.getContractFactory("SimplePriceOracle")
    oracle = await Oracle.attach(OracleAddress)

    return oracle
}

async function main() {

    await setupAccounts()
    await attachOracle()

    // await oracle.setUnderlyingPrice(mWbtcAddress, '550000000000000000000000000000000')
    // await oracle.setUnderlyingPrice(mUSDCAddress,  '1000000000000000000000000000000')
    await oracle.setUnderlyingPrice(mDAIAddress,   '1000000000000000000')
    // await oracle.setUnderlyingPrice(mUnnAddress,     '90000000000000000')
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })