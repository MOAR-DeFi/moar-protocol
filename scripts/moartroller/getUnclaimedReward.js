const moartrollerAddress        = '0xd66Ef5F365aE7fd41750c78925e1BCA4e47Ae4Ca'

async function main() {
    const { tokens, fromTokens } = require('./../../test/utils/testHelpers')

    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.attach(moartrollerAddress)

    await moartroller._setRewardClaimEnabled(true);

    enabled = await moartroller.rewardClaimEnabled();
    console.log(`Reward claiming is enabled: ${enabled}`);

    reward = await moartroller.callStatic.updateMoarReward('0xf85efeD12Fa085FdcA9cf6B2709Ad979Ef53c4bE');
    console.log(`Account has unclaimed ${fromTokens(reward.toString(), 18)} MOAR tokens`)
    console.log(`Claiming...`)
    const t1 = await moartroller.claimMoarReward('0xf85efeD12Fa085FdcA9cf6B2709Ad979Ef53c4bE');
    await t1.wait()
    console.log(`Tokens claimed!`)
  
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })