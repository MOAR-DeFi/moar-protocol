let owner, user1, user2, user3
const { tokens, getEventsFromTransaction } = require('../../test/utils/testHelpers')

const OracleAddress = '0xf7c80137c930ea5ef7208fd74857f71fe81f0037'

const mUSDCAddress  = '0x87C5840189C420E50fb37166C0daB773650019B7'
const mUsdtAddress  = '0x5c37307E7314886C82Ea04F3F40d7A9b54a16A25'
const mEthAddress   = '0x586778e1e447e66c717537aE41769675Cd1B6c49'
const mWbtcAddress  = '0x1A7B059ec553A5d29411b23a2CF8feeC8b9BED8A'
const mMoarAddress  = '0x0e4cCFEfdEd2aE4f614368f17767D0C93E3edF37'
const mUnnAddress   = '0x18E4C9B5868797808941Bc8119864Ed72135d45D'
const mLinkAddress  = '0x2A475CfB95eC78472492D8A20E73d6c2F90f17a2'



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


    // await oracle.setUnderlyingPrice(mUSDCAddress,       tokens('1'))
    // await oracle.setUnderlyingPrice(mUsdtAddress,       tokens('200'))
    // await oracle.setUnderlyingPrice(mEthAddress,        tokens('1850'))
    // await oracle.setUnderlyingPrice(mWbtcAddress,       tokens('12'))
    // await oracle.setUnderlyingPrice(mMoarAddress,       tokens('0.92'))
    await oracle.setUnderlyingPrice(mUnnAddress,        tokens('0.5'))
    // await oracle.setUnderlyingPrice(mLinkAddress,       tokens('0.5'))

}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })