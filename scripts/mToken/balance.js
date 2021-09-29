const { toTokens, tokens } = require("../../test/utils/testHelpers")

const mTokenAddress    = '0x87C5840189C420E50fb37166C0daB773650019B7'

async function main() {
    const [owner, user1, user2, user3, user4] = await ethers.getSigners(13)
    const mToken = await ethers.getContractAt("MErc20", mTokenAddress)
    console.log((await mToken.balanceOf(user1.address)).toString())
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })