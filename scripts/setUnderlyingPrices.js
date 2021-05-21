let owner, user1, user2, user3
const { tokens, getEventsFromTransaction } = require('./../test/utils/testHelpers')

const OracleAddress = '0x211cd676fABd0A1f0b84118dcfcd381f4492B407'

const cDAIAddress = '0xEb63f9C61874623E1EaCbD7276Aef9d1913468c0'
const cUSDCAddress = '0xB5FCd17D889639967312aF2801ff22fe1bd7Be3A'
const cEthAddress = '0xcEB89905e0bC867E96B7A7b2d60B888fd029Eb87'
const cWbtcAddress = '0x71fd3BDec0CbC3F4637383c403613CCA0B09F81c'
const cUnnAddress = '0x02aBCD298b56C2767D59061Aee329e933696fa81'



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

    // await oracle.setUnderlyingPrice(cWbtcAddress, '550000000000000000000000000000000')
    // await oracle.setUnderlyingPrice(cUSDCAddress,  '1000000000000000000000000000000')
    await oracle.setUnderlyingPrice(cEthAddress,   '1750000000000000000000')
    // await oracle.setUnderlyingPrice(cUnnAddress,     '90000000000000000')
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })