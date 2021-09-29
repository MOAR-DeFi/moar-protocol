const MultiFeeDistributionAddress           = '0x2994579DbA0251d18544C0eB9CCaA560aE6aA11c'
const DistributorAddress                    = '0x766e8b5dafb12281F58BD109154E4742e10f5285'
const RewardAssetAddress                    = '0xc778417e063141139fce010982780140aa0cd5ab'

async function main() {
    const { tokens, fromTokens } = require('./../../test/utils/testHelpers')

    const MultiFeeDistribution = await ethers.getContractFactory("MultiFeeDistribution")
    vesting = await MultiFeeDistribution.attach(MultiFeeDistributionAddress)
   
    const t1 = await vesting.addReward(RewardAssetAddress, DistributorAddress)
    await t1.wait()
  
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })