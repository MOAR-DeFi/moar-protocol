const { tokens } = require('./../../test/utils/testHelpers')

let moartroller 

// Rinkeby addresses
const moartrollerAddress    = '0x546C3808e15CcFE569a1A626B30d080F4903D266'
const mUSDCAddress          = '0x87C5840189C420E50fb37166C0daB773650019B7'
const mUsdtAddress          = '0x5c37307E7314886C82Ea04F3F40d7A9b54a16A25'
const mEthAddress           = '0x2CA4F6224f24FedfF750D0F3d58C5A6FB41f6204'
const mWbtcAddress          = '0x1A7B059ec553A5d29411b23a2CF8feeC8b9BED8A'
const mMoarAddress          = '0x0e4cCFEfdEd2aE4f614368f17767D0C93E3edF37'
const mUnnAddress           = '0x9366Ad5c86918D695a694fF0989757584A3c5F9B'
const mLinkAddress          = '0x2A475CfB95eC78472492D8A20E73d6c2F90f17a2'

async function main() {

    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.attach(moartrollerAddress)


    console.log("Setting Collateral Factors")
    tx = await moartroller._setCollateralFactor(mUSDCAddress, tokens('0.85'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(mUsdtAddress, tokens('0.85'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(mEthAddress, tokens('0.75'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(mWbtcAddress, tokens('0.75'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(mMoarAddress, tokens('1.25'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(mUnnAddress, tokens('0.75'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(mLinkAddress, tokens('0.75'))
    await tx.wait()
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })