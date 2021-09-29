const { toTokens, tokens } = require("../../test/utils/testHelpers")

// Rinkeby addresses
const mTokenAddress    = '0xa31D13C84c1c90200D716fb062D879d572825116'

async function main() {
    const mToken = await ethers.getContractAt("MToken", mTokenAddress)
    await mToken._setReserveSplitFactor(tokens('0.5'))
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })