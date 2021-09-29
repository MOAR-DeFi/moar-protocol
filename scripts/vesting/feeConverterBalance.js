const ERCFundAddress        =   '0xB5Dd62D986af10494f7dc90479174b32E2C50Bb7'
const AssetsAddresses       = [
                                '0x03f2b2B8A3c1F37F1fE304472D4028e395429c52',
                                '0x3813a8Ba69371e6DF3A89b78bf18fC72Dd5B43c5',
                                '0xc778417e063141139fce010982780140aa0cd5ab'
                            ]

async function main() {
    const { tokens, fromTokens } = require('./../../test/utils/testHelpers')

    const ERCFund = await ethers.getContractFactory("ERCFund")
    ercFund = await ERCFund.attach(ERCFundAddress)

    for(let x=0; x<AssetsAddresses.length; x++){
        const erc20 = await ethers.getContractAt("EIP20Interface", AssetsAddresses[x])
        const balance = (await erc20.balanceOf(ERCFundAddress)).toString()
        const decimals = (await erc20.decimals()).toString()
        const symbol = (await erc20.symbol()).toString()
    
        console.log(`ERCFund contract has ${fromTokens(balance, decimals)} ${symbol}`)
    }
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })