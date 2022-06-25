const { expect, assert, use  } = require("chai");
const { expectRevert} = require('@openzeppelin/test-helpers');
const { ethers, waffle } = require("hardhat");
const { deploymentMErc20 } = require('../scripts/deploy/mumbai/merc20/deploymentMErc20.js');
// const {deploymentLendingPlatform} = require('../scripts/deploy/mumbai/lendingPlatform/deploymentLendingPlatform.js');
const {deploymentMWeth} = require('../scripts/deploy/mumbai/mweth/deploymentMWeth');
const hre = require("hardhat");
const { expectEvent, expectNoEvent } = require('./utils/expectAddons');
// const setupAll = require('./utils/setupAllMocked')
// const { tokens, toTokens, advanceBlock, getEventsFromTransaction } = require('./utils/testHelpers')
const BN = hre.ethers.BigNumber;
const toBN = (num) => BN.from(num);


describe("moar test",async function(){



    

    // beforeEach(async()=> {
    it("merc20 ", async()=>{
        const multiplier = toBN(10).pow(toBN(18));
        let provider = waffle.provider;
        let coin, coinAddress
        let ownerAddress
        let priceOracle, moartrollerProxy, moartroller, liquidityMathModelV1, cuunn, maximillion, lendingRouter
        let proxyAdminAddress 
        let priceOracleAddress
        let liquidityMathModelV1Address
        let liquidationModelV1Address
        let moartrollerProxyAddress
        let moartrollerAddress
        // let mproxyv1Address
        let jrmWethAddress, jrmCoinAddress
        let jrmWeth, jrmCoin
        let mwethAddress, mcoinAddress, mwethProxyAddress
        let mweth, mwethProxy
        let liquidationIncentive = '11000000000000000000' // 1.1 * 10**18
        let closeFactor = '500000000000000000' // 0.5 * 10**18
    
    
        let wethAddress = '0xc778417e063141139fce010982780140aa0cd5ab';
    
    
        let signers = await ethers.getSigners();
        // [ownerAddress, user1Address, user2, user3, user4] = await ethers.getSigners();
        ownerAddress = signers[0].address;
        let user1 = signers[1];
        let user1Address = user1.address;
        let user2 = signers[2].address;
        let user3 = signers[3].address;
        console.log("Eth balance of admin = ", (await provider.getBalance(ownerAddress)).toString());

        // Contracts ABI
        const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
        const TransparentUpgradeableProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
        const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle");
        const LiquidityMathModelV1 = await ethers.getContractFactory("LiquidityMathModelV1");
        const LiquidationModelV1 = await ethers.getContractFactory("LiquidationModelV1");
        const MoartrollerProxy = await ethers.getContractFactory("MoartrollerProxy");
        const Moartroller = await ethers.getContractFactory("Moartroller")
        const MProxyV1 = await ethers.getContractFactory("MProxyV1");
        const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")
        const MoarMockToken = await ethers.getContractFactory("MoarMockToken");
        const MWeth = await ethers.getContractFactory("MWeth");
        const MWethProxy = await ethers.getContractFactory("MWethProxy");



        // ========================================= //
        // Coin
        console.log("\nDeploying Coin");
        coin = await MoarMockToken.deploy(toBN(1000).mul(multiplier));
        await coin.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("ProxyAdmin address: " + instance.address);
            return instance;
        } );
        coinAddress = coin.address;
        console.log("Coin deployed!");
        // ========================================= //
        // ProxyAdmin

        console.log("\nDeploying ProxyAdmin");
        let proxyAdmin = await ProxyAdmin.deploy();
        await proxyAdmin.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("ProxyAdmin address: " + instance.address);
            return instance;
        });
        proxyAdminAddress = proxyAdmin.address;
        console.log("ProxyAdmin deployed!");

        // ========================================= //
        // SimplePriceOracle

        console.log("\nDeploying SimplePriceOracle");
        priceOracle = await SimplePriceOracle.deploy();
        await priceOracle.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("SimplePriceOracle address: " + instance.address);
            return instance;
        });
        priceOracleAddress = priceOracle.address;
        console.log("SimplePriceOracle deployed!")

        // ========================================= //
        // LiquidityMathModelV1

        console.log("\nDeploying LiquidityMathModelV1")
        liquidityMathModelV1 = await LiquidityMathModelV1.deploy()
        await liquidityMathModelV1.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("LiquidityMathModelV1 address: " + instance.address);
            return instance;
        });
        liquidityMathModelV1Address = liquidityMathModelV1.address;
        console.log("LiquidityMathModelV1 deployed!")
        
        // ========================================= //
        // LiquidationModelV1

        console.log("\nDeploying LiquidationModelV1")
        liquidationModelV1 = await LiquidationModelV1.deploy()
        await liquidationModelV1.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("LiquidationModelV1 address: " + instance.address);
            return instance;
        });
        liquidationModelV1Address = liquidationModelV1.address;
        console.log("LiquidationModelV1 deployed!");

        // ========================================= //
        // Moartroller and MoartrollerProxy

        console.log("\nDeploying MoartrollerProxy");
        moartrollerProxy = await MoartrollerProxy.deploy();
        await moartrollerProxy.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("MoartrollerProxy master copy address: " + instance.address);
            return instance;
        });
        let moartrollerProxy_masterCopyAddress = moartrollerProxy.address;

        let moartrollerProxy_proxy = await TransparentUpgradeableProxy.deploy(
            moartrollerProxy_masterCopyAddress,
            proxyAdminAddress,
            "0x"
        );
        await moartrollerProxy_proxy.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("MoartrollerProxy proxy address: " + instance.address);
            return instance;
        });
        moartrollerProxyAddress = moartrollerProxy_proxy.address;
        moartrollerProxy = await MoartrollerProxy.attach(moartrollerProxyAddress);
        console.log("MoartrollerProxy deployed!");

        console.log("\nDeploying Moartroller")
        moartroller = await Moartroller.deploy();
        await moartroller.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("Moartroller master copy address: " + instance.address);
            return instance;
        });
        let moartroller_masterCopyAddress = moartroller.address;

        let moartroller_proxy = await TransparentUpgradeableProxy.deploy(
            moartroller_masterCopyAddress,
            proxyAdminAddress,
            "0x"
        );
        await moartroller_proxy.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("Moartroller proxy address: " + instance.address);
            return instance;
        });
        moartrollerAddress = moartroller_proxy.address;
        moartroller = await Moartroller.attach(moartrollerAddress);
        console.log("Moartroller deployed!")

        await moartroller.initialize(
            moartrollerProxyAddress, 
            liquidityMathModelV1Address,
            liquidationModelV1Address
        ).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("Moartroller "+ moartroller.address + " call initialize with params:")
            console.log("   moartrollerProxy: " + moartrollerProxyAddress);
            console.log("   mathModel: " + liquidityMathModelV1Address);
            console.log("   lqdModel: " + liquidationModelV1Address);
        });

        await moartrollerProxy.initialize(
            moartrollerAddress,
            priceOracleAddress
        ).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("MoartrollerProxy "+ moartrollerProxy.address + " call initialize with params:")
            console.log("   _moartroller: " + moartrollerAddress);
            console.log("   _priceOracle: " + priceOracleAddress);
        });

        // ========================================= //
        // MProxyV1
    
        // console.log("\nDeploying MProxyV1")
        // mproxyv1 = await MProxyV1.deploy(ownerAddress)
        // await mproxyv1.deployed().then(function(instance){
        //     console.log("Transaction hash: " + instance.deployTransaction.hash);
        //     console.log("MProxyV1 address: " + instance.address);
        //     return instance;
        // });
        // mproxyv1Address = mproxyv1.address;
        // console.log("MProxyV1 deployed!");


                
        // ========================================= //
        // JumpRateModel for WETH
        
        console.log("\nDeploying JumpRateModelV2 for Weth");
        // (uint baseRatePerYear, uint multiplierPerYear, uint jumpMultiplierPerYear, uint kink_, address owner_) 
        jrmWeth = await JumpRateModelV2.deploy('0', '182367147429835000', '3675373581049680000', '800000000000000000', ownerAddress)
        await jrmWeth.deployed()
        .then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("JumpRateModelV2 address: " + instance.address);
            return instance;
        });
        jrmWethAddress = jrmWeth.address;
        console.log("\nJumpRateModelV2 for Eth deployed!")

        // JumpRateModel for Coin
        console.log("\nDeploying JumpRateModelV2 for Coin");
        jrmCoin = await JumpRateModelV2.deploy('0', '182367147429835000', '3675373581049680000', '800000000000000000', ownerAddress)
        await jrmCoin.deployed()
        .then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("JumpRateModelV2 address: " + instance.address);
            return instance;
        });
        jrmCoinAddress = jrmCoin.address;
        console.log("\nJumpRateModelV2 for Eth deployed!")





        // ========================================= //
        // setting parameters to moartroller

        console.log("\nSetting moartroller configuration");
        
        // await moartroller._setMProxy(mproxyv1Address).then(function(instance){
        //     console.log("Transaction hash: " + instance.hash);
        //     console.log("Moartroller " + moartroller.address + " _setMProxy " + mproxyv1Address);
        //     return instance
        // });

        // await moartroller._setMoarToken(moarAddress).then(function(instance){
        //     console.log("\nTransaction hash: " + instance.hash);
        //     console.log("Moartroller " + moartroller.address + " _setMoarToken " + moarAddress);
        //     return instance
        // });

        await moartroller._setPriceOracle(priceOracleAddress).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("Moartroller " + moartroller.address + " _setPriceOracle " + priceOracleAddress);
            return instance
        });



        await moartroller._setLiquidationIncentive(liquidationIncentive).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("Moartroller " + moartroller.address + " _setLiquidationIncentive " + liquidationIncentive);
            return instance
        });
        
        await moartroller._setCloseFactor(closeFactor).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("Moartroller " + moartroller.address + " _setCloseFactor " + closeFactor);
            return instance
        });


        console.log("Setting moartroller configuration finished!");

        // MTOKENS 
        // ========================================= //
        // MWethProxy and MWeth for WETH 
        let mCoinAddresses = await deploymentMErc20(
            proxyAdminAddress,
            priceOracleAddress,
            coinAddress,//
            moartrollerAddress,
            jrmCoinAddress,
            '20000000000000000',
            'mCoinMockToken',
            'mCoin',
            18,
            ownerAddress,
            '500',
            '200000000000000000',
            '750000000000000000'
        ).then(function(instance){
            console.log("mCoinProxy address: " + instance.merc20ProxyAddress)
            console.log("mCoin address: " + instance.merc20Address)
            return instance
        });

        mCoinAddress = mCoinAddresses.merc20Address;

        let mCoinUnderlyingPrice = '550000000000000000000000000000000'
        await priceOracle.setUnderlyingPrice(mCoinAddress, mCoinUnderlyingPrice).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("PriceOracle "+ priceOracle.address +" setUnderlyingPrice with params");
            console.log("   mToken: " + mCoinAddress)
            console.log("   underlyingPrice: " + mCoinUnderlyingPrice)
            return instance
        });
        // MWethProxy and MWeth for WETH   
        let mwethAddresses = await deploymentMWeth(
            wethAddress,
            priceOracleAddress,
            moartrollerAddress,
            jrmWethAddress,
            '20000000000000000',
            'mToken WETH',
            'mWETH',
            18,
            ownerAddress,
            '800000000000000000'
        ).then(function(instance){
            console.log("mWETHProxy address: " + instance.mwethProxyAddress)
            console.log("mWETH address: " + instance.mwethAddress)
            return instance
        });
        mwethProxyAddress = mwethAddresses.mwethProxyAddress;
        mwethAddress = mwethAddresses.mwethAddress;

        let mwethUnderlyingPrice = '550000000000000000000000000000000'
        await priceOracle.setUnderlyingPrice(mwethAddress, mwethUnderlyingPrice).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("PriceOracle "+ priceOracle.address +" setUnderlyingPrice with params");
            console.log("   mToken: " + mwethAddress)
            console.log("   underlyingPrice: " + mwethUnderlyingPrice)
            return instance
        });

        console.log("Admin Address", ownerAddress);
    
        mweth = await MWeth.attach(mwethAddress);
        mwethProxy = await MWethProxy.attach(mwethProxyAddress);
        let init_amount = toBN(500).mul(multiplier);
    
        console.log("Transfer ")
        // await coin.transferFrom(ownerAddress.address,init_amount,user1Address.address,{from:ownerAddress.address});
        console.log("Balance of admin = ", (await coin.balanceOf(ownerAddress)).toString() );
        console.log("Balance of user1Address = ", (await coin.balanceOf(user1Address)).toString() );
        await coin.transfer(user1Address,init_amount,{from:ownerAddress});
        console.log("Balance of admin = ", (await coin.balanceOf(ownerAddress)).toString() );
        console.log("Balance of user1Address = ", (await coin.balanceOf(user1Address)).toString() );
        expect(await coin.balanceOf(user1Address)).to.be.eq(init_amount);
        

        console.log("Coin balance of MWeth before transactions", (await coin.balanceOf(mwethAddress)).toString())
        expect(await coin.balanceOf(mwethAddress)).to.be.eq(0);
        console.log("Eth balance of admin = ", (await provider.getBalance(ownerAddress)).toString());
        console.log("Eth balance of mweth = ", (await provider.getBalance(mwethAddress)).toString());
        console.log("Eth balance of user  = ", (await provider.getBalance(user1Address)).toString());
        
        await mwethProxy.connect(signers[0]).mint({value: ethers.utils.parseEther("1.0")});
        console.log("Eth balance of mweth = ", (await provider.getBalance(mwethAddress)).toString());
        
        console.log("Coin balance of MWeth before transactions", (await mweth.balanceOf(signers[0].address)).toString())
        // console.log("Eth balance of admin = ", (await provider.getBalance(ownerAddress)).toString());
        // const transactionHash = await owner.sendTransaction({
        //     to: "contract address",
        //     value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
        //   });

        // await mwethProxy._addReserc
    })

    // it("merc20 ", async()=>{
    // })

})
