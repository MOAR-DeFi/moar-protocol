const ERCFundAddress        = '0xB5Dd62D986af10494f7dc90479174b32E2C50Bb7'
const AssetAddress          = '0x3813a8Ba69371e6DF3A89b78bf18fC72Dd5B43c5'

async function main() {
    const ERCFund = await ethers.getContractFactory("ERCFund")
    ercFund = await ERCFund.attach(ERCFundAddress)
    // const t1 = await ercFund.convertAndNotify(AssetAddress)
    const t1 = await ercFund.notifyFeeDistribution(AssetAddress)

    await t1.wait()
  
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })