const { toTokens, tokens } = require("../../test/utils/testHelpers")

const assetAddress    = '0xA583D0D1d05345670D3B71c8993003c785daBE5f'
const mTokenAddress    = '0x5c37307E7314886C82Ea04F3F40d7A9b54a16A25'

async function main() {
    const [owner, user1, user2, user3, user4] = await ethers.getSigners(13)

    const erc20 = await ethers.getContractAt("EIP20Interface", assetAddress)
    const t1 = await erc20.connect(user1).approve(mTokenAddress, tokens('4'))

    const mToken = await ethers.getContractAt("MErc20", mTokenAddress)
    const t2 = await mToken.connect(user1).mint(toTokens('4', '6'))
    const t2r = await t2.wait()
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })