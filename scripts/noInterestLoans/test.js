const { tokens, advanceBlock, toTokens, fromTokens } = require('./../../test/utils/testHelpers')

// Polygon adresses
quickswapFactory =  '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32'
quickswapRouter =   '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'
poolAddress =       '0x1d8b86e3D88cDb2d34688e87E72F388Cb541B7C8'
farmAddress =       '0x5A0801BAd20B6c62d86C566ca90688A6b9ea1d3f'
underlyingToken =   '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
rewardToken =       '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
assetIndex =        '4'

async function setFarmBalance(amount){
    await network.provider.send("hardhat_setStorageAt", [
        '0xdad97f7713ae9437fa9249920ec8507e5fbb23d3',
        "0x8940e1ddb4bf7054da2fe17fdc2392cca8db408c9193bf11c7925206718614c3",
        ethers.utils.hexZeroPad(ethers.utils.hexValue(ethers.BigNumber.from(tokens(amount))), 32)
    ]);
}

async function setEthInWallet(){
    await network.provider.send("hardhat_setStorageAt", [
        underlyingToken,
        "0xaf84e4aacc3903ad2a204489edf87608a290622a644b61db108cc253cfd65795",
        "0x000000000000000000000000000000000000000000000005F68E8131ECF80000",
    ]);
    await network.provider.send("hardhat_setStorageAt", [
        underlyingToken,
        "0xc91a4932a43ab79d2a1e28f39b920a8d5c397c8c7d17a78b61eccb90e2ec1db5",
        "0x0000000000000000000000000000000000000000000000008AC7230489E80000",
    ]);
    await network.provider.send("hardhat_setStorageAt", [
        underlyingToken,
        "0x3036234283448f365a0b1621e6daa560ac23f60a261d7a171afb4d710347e00a",
        "0x0000000000000000000000000000000000000000000000008AC7230489E80000",
    ]);
    await network.provider.send("hardhat_setStorageAt", [
        underlyingToken,
        "0x5df57b0f1aa3602986eb67515784680ea3894eb7dead76e0c38b7a6f753cd61",
        "0x0000000000000000000000000000000000000000000000008AC7230489E80000",
    ]);
}

async function main() {
    const [owner, user1, user2, user3, user4] = await ethers.getSigners()

    const ERC20 = await ethers.getContractFactory("@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20")
    weth = await ERC20.attach(underlyingToken)    
    usdc = await ERC20.attach(rewardToken)    

    await setEthInWallet()

    const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle")
    oracle = await SimplePriceOracle.deploy()
    await oracle.deployed()
    await oracle.setDirectPrice(underlyingToken, tokens('50'))

    const MoarStableToken = await ethers.getContractFactory("MoarStableToken")
    moarStable = await MoarStableToken.deploy()
    await moarStable.deployed()

    const NilController = await ethers.getContractFactory("NilController")
    nilController = await NilController.deploy(moarStable.address)
    await nilController.deployed()
    await moarStable.updatePrivileged(nilController.address, true)
    await moarStable.updatePrivileged(owner.address, true)
    await moarStable.mint(owner.address, tokens('100000000'))
    await moarStable.mint(user2.address, tokens('500'))

    const qsFactory = await ethers.getContractAt("contracts/Interfaces/Uniswap/IUniswapV2Factory.sol:IUniswapV2Factory", quickswapFactory)
    await qsFactory.createPair(underlyingToken, moarStable.address)

    await weth.approve(quickswapRouter, tokens('100'))
    await moarStable.approve(quickswapRouter, tokens('100'))

    const qsRouter = await ethers.getContractAt("IUniswapV2Router02", quickswapRouter)
    await qsRouter.addLiquidity(underlyingToken, moarStable.address, tokens('100'), tokens('100'), tokens('10'), tokens('10'), owner.address, 4097994694)

    const aTriCrypto3BeefyVaultV6 = await ethers.getContractFactory("aTriCrypto3BeefyVaultV6")
    strategy = await aTriCrypto3BeefyVaultV6.deploy(
            poolAddress,
            farmAddress,
            underlyingToken,
            assetIndex
        )

    const NilPool = await ethers.getContractFactory("NilPool")
    nilPool = await NilPool.deploy(
        strategy.address,
        underlyingToken,
        nilController.address,
        oracle.address,
        tokens('0.8'),
        tokens('0.5'),
        tokens('1.1'),
        tokens('0.005'),
        quickswapRouter,
        [
            underlyingToken,
            moarStable.address
        ]
    )

    await strategy.updateFarmer(nilPool.address)
    await nilController.addMarket(nilPool.address, true)

    farm = await ethers.getContractAt("BeefyVaultV6Farm", farmAddress)
    await farm.balance();

    await weth.connect(owner).approve(nilPool.address, tokens('1'))
    await nilPool.connect(owner).deposit(tokens('1'))
    await setFarmBalance('10000')

    await nilPool.connect(owner).borrow(tokens('1'));

    await weth.connect(user1).approve(nilPool.address, tokens('1'))
    await nilPool.connect(user1).deposit(tokens('1'))
    await nilPool.connect(user1).borrow((await nilPool.liquidityOf(user1.address))[0].toString());
    await setFarmBalance('20000')

    await oracle.setDirectPrice(underlyingToken, tokens('5'))

    await weth.connect(user2).approve(nilPool.address, tokens('1'))
    await nilPool.connect(user2).deposit(tokens('1'))
    await setFarmBalance('50000')

    // console.log("liqidity - owner", fromTokens((await nilPool.liquidityOf(owner.address)).toString()))
    // console.log("liqidity - user1", fromTokens((await nilPool.liquidityOf(user1.address)).toString()))
    // console.log("liqidity - user2", fromTokens((await nilPool.liquidityOf(user2.address)).toString()))

    await nilPool.connect(user2).liquidate(user1.address, tokens('15'))

    await moarStable.approve(nilPool.address, tokens('2'))
    await nilPool.connect(owner).repayAll()

    console.log("liq", (await nilPool.liquidityOf(owner.address))[0].toString())
    console.log("borrow", (await nilPool.userData(owner.address))['borrow'].toString())



    await nilPool.connect(owner).withdrawAll();
    // await nilPool.connect(user1).withdrawAll();
    await nilPool.connect(user2).withdrawAll();

    // console.log("strategy balance - after withdraw all", fromTokens((await farm.balanceOf(strategy.address)).toString()))


    console.log("user wallet balance - owner", fromTokens((await weth.balanceOf(owner.address)).toString()), 'ETH')
    console.log("user wallet balance - user1", fromTokens((await weth.balanceOf(user1.address)).toString()), 'ETH')
    console.log("user wallet balance - user2", fromTokens((await weth.balanceOf(user2.address)).toString()), 'ETH')


    console.log('done')
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })