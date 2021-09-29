const MultiFeeDistributionAddress           = '0xf68a4f0E24dCC4c066fBAB356B396ab18Ccd9f83'
const MinterAddress                         = '0xbE8c610a112B4d6871C0ce6cEf0Fe0Ec74df48E8'

async function main() {
    const { tokens, fromTokens } = require('./../../test/utils/testHelpers')

    const MultiFeeDistribution = await ethers.getContractFactory("MultiFeeDistribution")
    vesting = await MultiFeeDistribution.attach(MultiFeeDistributionAddress)
   
    const t1 = await vesting.setMinter(MinterAddress, true)
    await t1.wait()
  
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })