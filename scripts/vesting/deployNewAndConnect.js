const MoartrollerAddress                    = '0x802A92B277348299ef766CF6b777921F6a8390Cc'
const VestedAssetAddress                    = '0x03f2b2B8A3c1F37F1fE304472D4028e395429c52'  // MOAR
const RewardAssetAddress_USDC               = '0x3813a8Ba69371e6DF3A89b78bf18fC72Dd5B43c5' 

const RewardAssetAddress_WETH               = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' 
const RewardAssetAddress_USDT               = '0xdAC17F958D2ee523a2206206994597C13D831ec7' 
const RewardAssetAddress_WBTC               = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' 
const RewardAssetAddress_UNN                = '0x226f7b842E0F0120b7E194D05432b3fd14773a9D' 
const RewardAssetAddress_MOAR               = '0x187Eff9690E1F1A61d578C7c492296eaAB82701a' 
const RewardAssetAddress_LINK               = '0x514910771AF9Ca656af840dff83E8264EcF986CA' 

const penalty                               = '70'  // 70%

async function main() {

    console.log('Deploying MultiFeeDistribution')
    const MultiFeeDistribution = await ethers.getContractFactory("MultiFeeDistribution")
    vesting = await MultiFeeDistribution.deploy(VestedAssetAddress, [], penalty)
    await vesting.deployed()
    console.log(`Vesting contract:  ${vesting.address}`)


    console.log('Deploying ERCFund')
    const ERCFund = await ethers.getContractFactory("ERCFund")
    ercFund = await ERCFund.deploy(vesting.address)
    await ercFund.deployed()
    console.log(`ERCFund contract:  ${ercFund.address}`)


    console.log('Deploying MProxyV2')
    const MProxyV2 = await ethers.getContractFactory("MProxyV2")
    mproxyv2 = await MProxyV2.deploy(vesting.address, ercFund.address)
    await mproxyv2.deployed()
    console.log(`MProxyV2 contract: ${mproxyv2.address}`)


    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.attach(MoartrollerAddress)


    console.log('Setting MProxyV2')
    tx = await moartroller._setMProxy(mproxyv2.address)
    await tx.wait()


    console.log('Setting minter')
    tx = await vesting.setMinter(mproxyv2.address, true)
    await tx.wait()

    
    console.log('Adding USDC as reward')
    tx = await vesting.addReward(RewardAssetAddress_USDC, ercFund.address)
    await tx.wait()


    console.log('Done')
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })