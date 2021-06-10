const { tokens } = require('./../../test/utils/testHelpers')

let moartroller 

// Rinkeby addresses
const moartrollerAddress    = '0xFD853DEb3a1f7b230DB982352B621f9D6962A656'
const mdaiAddress           = '0x8Df198D262098D60726d5707a6b5131794ecE8Ee'
const mwbtcAddress          = '0xd06Fa1291d62bc7E13F5e2606aa156f8CC6fD7a5'
const musdcAddress          = '0xe117e8ECcef0397C90BD18d02c23963874cfCF97'
const munnAddress           = '0x6Ba7673b857F2527523e942007d6B93012456bAF'
const mmoarAddress          = '0xbB88229e2f3bB72b5215bE569d664BE414B29F35'
const methAddress           = '0x14b1373c4A4eB7807621504739ddC19F164dAE29'

async function main() {

    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.attach(moartrollerAddress)


    console.log("Setting Collateral Factors")
    tx = await moartroller._setCollateralFactor(mdaiAddress, tokens('0.85'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(mwbtcAddress, tokens('0.75'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(musdcAddress, tokens('0.85'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(munnAddress, tokens('1'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(mmoarAddress, tokens('1.25'))
    await tx.wait()
    tx = await moartroller._setCollateralFactor(methAddress, tokens('0.75'))
    await tx.wait()
   

}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })