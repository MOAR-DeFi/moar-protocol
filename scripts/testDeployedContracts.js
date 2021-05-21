let owner, user1, user2, user3, user4
const { tokens, getEventsFromTransaction } = require('./../test/utils/testHelpers')

const MoartrollerAddress = '0x0ae7752d91850B648333d858E15ab72F59F2d0AC'
const OracleAddress = '0xd7c4587bB72346d0C2F95B5C14c166A84E86BF80'

const cDAIAddress = '0x1A6517f9dFF6bE95bD09cE476416Fd3A4f5BfCE2'
const DAIAddress = '0x7D8AB70Da03ef8695c38C4AE3942015c540e2439'

const USDCAddress = '0x3813a8Ba69371e6DF3A89b78bf18fC72Dd5B43c5'
const cUSDCAddress = '0xd67F9906C82c24586c65Bfcf426c41C3009F5204'

const cWBTCAddress = '0xe24344E69032eF0ECe6448E29BE2f6043C54AaA0'
const interestRateModelforCWBTC = '0x2f50e488cf0c2e72d3d2a8e37b21e063e1d122fb'

const cEthAddress = '0x0262329E43a44e4A142A95A5Fa0001fc64d1C9fC'
const wethAddress = '0xE701a43CC24a70713f9bF2a4D9d708b1c90CF3a2'

const uUNNAddress = '0x5C9B2c5BFf3Cdc860F421E92430e938a24f7F2fD'
const MProtectionAddress = '0x5Cc1f80246C5650bac02EBf82eE6C817E8A9350C'


let moartroller, oracle, cerc20, ceth, weth

async function setupAccounts(){
    [owner, user1, user2, user3, user4] = await ethers.getSigners(13)
}

async function attachMoartroller(){
    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.attach(MoartrollerAddress)

    return moartroller
}

async function attachOracle(){
    const Oracle = await ethers.getContractFactory("SimplePriceOracle")
    oracle = await Oracle.attach(OracleAddress)

    return oracle
}

async function attachMToken(address){
    const MErc20Immutable = await ethers.getContractFactory("MErc20Immutable")
    cerc20 = await MErc20Immutable.attach(address)

    return cerc20
}

async function attachCEth(address){
    const MWeth = await ethers.getContractFactory("MWeth")
    ceth = await MWeth.attach(address)

    return ceth
}

async function attachJumpRateModel(address){
    const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")
    jrm2 = await JumpRateModelV2.attach(address)

    return jrm2
}

async function attachDai(address){
    const Dai = await ethers.getContractFactory("Dai")
    cerc20 = await Dai.attach(address)

    return cerc20
}

async function attachWeth(address){
    const WETH9 = await ethers.getContractFactory("WETH9")
    weth = await WETH9.attach(address)

    return weth
}

async function attachUsdc(address){
    const Usdc = await ethers.getContractFactory("FiatTokenV2")
    cerc20 = await Usdc.attach(address)

    return cerc20
}

async function attachUUnn(address){
    const uUNN = await ethers.getContractFactory("uUNN")
    uunn = await uUNN.attach(address)

    return uunn
}

async function attachMProtection(address){
    const MProtection = await ethers.getContractFactory("MProtection")
    cuunn = await MProtection.attach(address)

    return cuunn
}

async function attachAssetPool(address){
    let assetPool = await ethers.getContractAt("IAssetPool", address)
    return assetPool
}

const COP_1 = {
    amount: tokens('1'),
    strike: tokens('2200'),
    premium: tokens('30')
  }

async function main() {

    await setupAccounts()
    // await attachMoartroller()


    // cDai = await attachMToken(cDAIAddress)
    // dai = await attachDai(DAIAddress)
    usdc = await attachUsdc(USDCAddress)
    // weth = await attachWeth(wethAddress)
    cUsdc = await attachMToken(cUSDCAddress)
// await dai.mint(owner.address, tokens('5000000000000'))
    // ceth = await attachCEth(cEthAddress)
    // cWBTC = await attachMToken(cWBTCAddress)
    jrm2 = await attachJumpRateModel(interestRateModelforCWBTC)
    console.log((await jrm2.multiplierPerBlock()).toString())
    // uunn = await attachUUnn(uUNNAddress)
    // cuunn = await attachMProtection(MProtectionAddress)
  
    // assetPool = await attachAssetPool('0x5e29382c02028bea009e74e546101723edc8cf16')
    // let q = await moartroller.getHypotheticalOptimizableValue(cEthAddress, '0xf85efeD12Fa085FdcA9cf6B2709Ad979Ef53c4bE')
    // console.log('getHypotheticalOptimizableValue', q.toString())

    // q = await moartroller.getMaxOptimizableValue(cEthAddress, '0xf85efeD12Fa085FdcA9cf6B2709Ad979Ef53c4bE')
    // console.log('getMaxOptimizableValue         ', q.toString())

    // console.log((await cUsdc.decimals()).toString())
    // console.log((await cUsdc.totalSupply()).toString())

    // console.log(await cuunn._maturityWindow())
    // await ceth.connect(user1).mint({value: tokens('0.05')})
    // await ceth.connect(user2).mint({value: tokens('0.1')})
    // await moartroller.connect(user1).enterMarkets([ceth.address])
    // await moartroller.connect(user2).enterMarkets([ceth.address])
    // await ceth.connect(user2).redeemUnderlying(tokens('0.01'))

    // await uunn.createProtection(user1.address, weth.address, COP_1.amount, COP_1.strike, COP_1.premium)
    // await uunn.connect(user1).approve(cuunn.address, 2)
    // await cuunn.connect(user1).mint(2)

    // await cuunn.connect(user1).lockProtectionValue(2, 0)

    // console.log(await assetPool.getAssetToken())
    // console.log("ceth balance", (await ceth.balanceOf(user1.address)).toString())
    // console.log("ceth balance of underlying", (await ceth.balanceOfUnderlying(user1.address)).toString())
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })

    50000000000