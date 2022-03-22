const hre = require("hardhat");
const { ethers, upgrades } = require('hardhat');
const { deploymentMErc20 } = require('../merc20/deploymentMErc20.js');

// const BN = hre.ethers.BigNumber;
// const toBN = (num) => BN.from(num);

module.exports = {

    deploymentLendingPlatform : async function () {

        console.log("Network: " + hre.network.name);
        let owner, user1, user2, user3, user4
        let ownerAddress
        let priceOracle, moartrollerProxy, moartroller, liquidityMathModelV1, cuunn, maximillion, lendingRouter
        let mdai, mwbtc, musdc, munn, meth
        let dai, wbtc, usdc, unn, weth

        let proxyAdminAddress 
        let priceOracleAddress
        let liquidityMathModelV1Address
        let liquidationModelV1Address
        let moartrollerProxyAddress
        let moartrollerAddress
        let mproxyv1Address
        let jrmStableCoinAddress
        let jrmEthAddress
        let jrmWbtcAddress
        let jrmUnnAddress
        let copMappingAddress
        let cuUNNAddress
        let lendingRouterAddress

        let mmoarAddress
        let musdcAddress
        let musdtAddress
        let mdaiAddress
        let munnAddress
        let mlinkAddress
        let mwbtcAddress
        let mwethAddress

        let mmoarProxyAddress
        let musdcProxyAddress
        let musdtProxyAddress
        let mdaiProxyAddress
        let munnProxyAddress
        let mlinkProxyAddress
        let mwbtcProxyAddress
        let mwethProxyAddress

        let liquidationIncentive = '11000000000000000000' // 1.1 * 10**18
        let closeFactor = '500000000000000000' // 0.5 * 10**18

        // Rinkeby addresses

        let moarAddress = '0x35aA0E792e3749Fc1E883AD8644D731B032b626B'
        let usdcAddress = '0x8fb197E7d9e37C4f745B4ed657AFe406C494DD60'
        let usdtAddress = '0x8bA824e5Ba48aaF0Ac13CFc3471F7C1de552B31b'
        let daiAddress = '0x781f83e1f7c563F03D0F08a0455971a414D7f6f4'
        let unnAddress = '0x43fC4C12e2D9a6a6204D8c8376979Ad5c27227A7' // Union ERC20 token address
        let linkAddress = '0x40EA2e5c5b2104124944282d8db39C5D13ac6770'
        let wbtcAddress = '0x807E84Ad87Cfd0A621a164b6F6F762871bB6c98F'
        let wethAddress = '0x2402d58c435b874a5EEa3deDB4E2B53f08Fd6b20'
        
        let uUnnAddress = '0x655e549f97eDbfcf693bA9c9Db71F6D2ab6F8fD8' // protection ERC721 address
        let unionRouter = '0x52668E7f627367C8AFd4f4fD7c6529268aA6425A'

        let signers = await ethers.getSigners();
        ownerAddress = signers[0].address;

        // PLATFORM CONTRACTS ABI

        const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
        const TransparentUpgradeableProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
        const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle");
        const LiquidityMathModelV1 = await ethers.getContractFactory("LiquidityMathModelV1");
        const LiquidationModelV1 = await ethers.getContractFactory("LiquidationModelV1");
        const MoartrollerProxy = await ethers.getContractFactory("MoartrollerProxy");
        const Moartroller = await ethers.getContractFactory("Moartroller")
        const MProxyV1 = await ethers.getContractFactory("MProxyV1");
        const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")
        const CopMapping = await ethers.getContractFactory("CopMapping")
        const MProtection = await ethers.getContractFactory("MProtection")
        const LendingRouter = await ethers.getContractFactory("LendingRouter");
        const MErc20Proxy = await ethers.getContractFactory('MErc20Proxy');
        const MErc20 = await ethers.getContractFactory('MErc20')
    
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
    
        console.log("\nDeploying MProxyV1")
        mproxyv1 = await MProxyV1.deploy(/**ownerAddress*/)
        await mproxyv1.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("MProxyV1 masterCopy address: " + instance.address);
            return instance;
        });
        let mproxyv1MasterCopyAddress = mproxyv1.address
        
        let mproxyv1_proxy = await TransparentUpgradeableProxy.deploy(
            mproxyv1MasterCopyAddress,
            proxyAdminAddress,
            "0x"
        );
        await mproxyv1_proxy.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("LendingRouter proxy address: " + instance.address);
            return instance;
        });
        mproxyv1Address =  mproxyv1_proxy.address;

        mproxyv1 = await MProxyV1.attach(mproxyv1Address);
        await mproxyv1.initialize(ownerAddress).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("MProxyV1 "+ mproxyv1.address + " call initialize with params:")
            console.log("   _reservesReceiver: " + ownerAddress);
            return instance
        });

        console.log("MProxyV1 deployed!")
        
        // ========================================= //
        // JumpRateModel for stableCoins, ETH, WBTC, UNN

        console.log("\nDeploying JumpRateModelV2 for stableCoin")
        jrmStableCoin = await JumpRateModelV2.deploy('0', '39222804184156400', '3272914755156920000', '800000000000000000', ownerAddress)
        await jrmStableCoin.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("JumpRateModelV2 address: " + instance.address);
            return instance;
        });
        jrmStableCoinAddress = jrmStableCoin.address;
        console.log("JumpRateModelV2 for stableCoin deployed!")

        console.log("\nDeploying JumpRateModelV2 for Eth");
        jrmEth = await JumpRateModelV2.deploy('0', '95322621997923200', '222330528872230000', '800000000000000000', ownerAddress)
        await jrmEth.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("JumpRateModelV2 address: " + instance.address);
            return instance;
        });
        jrmEthAddress = jrmEth.address;
        console.log("JumpRateModelV2 for Eth deployed!")

        console.log("\nDeploying JumpRateModelV2 for Wbtc");
        jrmWbtc = await JumpRateModelV2.deploy('0', '262458573636948000', '370843987858870000', '800000000000000000', ownerAddress)
        await jrmWbtc.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("JumpRateModelV2 address: " + instance.address);
            return instance;
        });
        jrmWbtcAddress = jrmWbtc.address;
        console.log("JumpRateModelV2 for Wbtc deployed!")

        console.log("\nDeploying JumpRateModelV2 for Unn")
        jrmUnn = await JumpRateModelV2.deploy('0', '182367147429835000', '3675373581049680000', '800000000000000000', ownerAddress)
        await jrmUnn.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("JumpRateModelV2 address: " + instance.address);
            return instance;
        });
        jrmUnnAddress = jrmUnn.address;
        console.log("JumpRateModelV2 for Unn deployed!")

        // ========================================= //
        // uUNN

        // console.log("\nDeploying uUNN")
        // const uUNN = await ethers.getContractFactory("uUNN")
        // uunn = await uUNN.deploy()
        // await uunn.deployed()
        // console.log("uUNN deployed!\n")

        // ========================================= //
        // CopMapping

        console.log("\nDeploying CopMapping")
        copMapping = await CopMapping.deploy(uUnnAddress)
        await copMapping.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("CopMapping address: " + instance.address);
            return instance;
        });
        copMappingAddress = copMapping.address;
        console.log("CopMapping deployed!");
    
        // ========================================= //
        // MProtection

        console.log("\nDeploying cuUNN(MProtection)")
        cuunn = await MProtection.deploy(); //await upgrades.deployProxy(cuUNN, [copMapping.address, moartroller.address]);
        await cuunn.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("cuUNN(MProtection) master copy address: " + instance.address);
            return instance;
        });
        let cuUNNMasterCopyAddress = cuunn.address;
        console.log("cuUNN(MProtection) deployed!")

        let cuUNN_proxy = await TransparentUpgradeableProxy.deploy(
            cuUNNMasterCopyAddress,
            proxyAdminAddress,
            "0x"
        );
        await cuUNN_proxy.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("cuUNN(MProtection) proxy address: " + instance.address);
            return instance;
        });
        cuUNNAddress = cuUNN_proxy.address;
        cuunn = await MProtection.attach(cuUNNAddress);
        console.log("cuUNN(MProtection) deployed!")

        await cuunn.initialize(
            copMappingAddress, 
            moartrollerAddress
        ).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("cuUNN(MProtection) "+ cuunn.address + " call initialize with params:")
            console.log("   copMappingAddress: " + copMappingAddress);
            console.log("   moartrollerAddress: " + moartrollerAddress);
        });
        
        // ========================================= //
        // LendingRouter

        console.log("\nDeploying LendingRouter");
        lendingRouter = await LendingRouter.deploy();
        await lendingRouter.deployed().then(function(instance){
            console.log("\nTransaction hash: " + instance.deployTransaction.hash);
            console.log("LendingRouter master copy address: "+ instance.address);
            return instance
        });
        let lendingRouterMasterCopyAddress = lendingRouter.address;

        let lendingRouter_proxy = await TransparentUpgradeableProxy.deploy(
            lendingRouterMasterCopyAddress,
            proxyAdminAddress,
            "0x"
        );
        await lendingRouter_proxy.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("LendingRouter proxy address: " + instance.address);
            return instance;
        });
        lendingRouterAddress = lendingRouter_proxy.address;
        lendingRouter = await LendingRouter.attach(lendingRouterAddress);
        console.log("LendingRouter deployed");

        await lendingRouter.initialize(
            uUnnAddress,
            cuUNNAddress,
            usdcAddress,
            moartrollerAddress
        ).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("LendingRouter "+ lendingRouter.address + " call initialize with params:")
            console.log("   _protectionToken: " + uUnnAddress);
            console.log("   _cProtectionToken: " + cuUNNAddress);
            console.log("   _baseCurrency: " + usdcAddress);
            console.log("   _moartroller: " + moartrollerAddress);
        });

        // ========================================= //
        // setting parameters to moartroller

        console.log("\nSetting moartroller configuration");
        
        await moartroller._setMProxy(mproxyv1Address).then(function(instance){
            console.log("Transaction hash: " + instance.hash);
            console.log("Moartroller " + moartroller.address + " _setMProxy " + mproxyv1Address);
            return instance
        });

        await moartroller._setMoarToken(moarAddress).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("Moartroller " + moartroller.address + " _setMoarToken " + moarAddress);
            return instance
        });

        await moartroller._setPriceOracle(priceOracleAddress).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("Moartroller " + moartroller.address + " _setPriceOracle " + priceOracleAddress);
            return instance
        });

        await moartroller._setProtection(cuUNNAddress).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("Moartroller " + moartroller.address + " _setProtection " + cuUNNAddress);
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

        await moartroller._addPrivilegedAddress(lendingRouterAddress).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("Moartroller " + moartroller.address + " _addPrivilegedAddress " + lendingRouterAddress);
            return instance
        });
        console.log("Setting moartroller configuration finished!");

        // MTOKENS 
        // ========================================= //
        // MErc20 for MOAR

        let mmoarAddresses = await deploymentMErc20(
            proxyAdminAddress,
            priceOracleAddress,
            moarAddress,
            moartrollerAddress,
            jrmUnnAddress,
            '200000000000000000000000000',
            'mToken MOAR',
            'mMOAR',
            8,
            ownerAddress,
            '2500',
            '350000000000000000',
            '1250000000000000000'
        ).then(function(instance){
            console.log("mMOARProxy address: " + instance.merc20ProxyAddress)
            console.log("mMOAR address: " + instance.merc20Address)
            return instance
        });

        mmoarAddress = mmoarAddresses.merc20Address;
        mmoarProxyAddress = mmoarAddresses.merc20ProxyAddress;

        let mmoarUnderlyingPrice = '3000000000000000000'
        await priceOracle.setUnderlyingPrice(mmoarAddress, mmoarUnderlyingPrice).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("PriceOracle "+ priceOracle.address +" setUnderlyingPrice with params");
            console.log("   mToken: " + mmoarAddress)
            console.log("   underlyingPrice: " + mmoarUnderlyingPrice)
            return instance
        });

        // ========================================= //
        // MErc20 for USDC

        let musdcAddresses = await deploymentMErc20(
            proxyAdminAddress,
            priceOracleAddress,
            usdcAddress,
            moartrollerAddress,
            jrmStableCoinAddress,
            '20000000000000000',
            'mToken USDC',
            'mUSDC',
            8,
            ownerAddress,
            '10000',
            '100000000000000000',
            '850000000000000000'
        ).then(function(instance){
            console.log("mUSDCProxy address: " + instance.merc20ProxyAddress)
            console.log("mUSDC address: " + instance.merc20Address)
            return instance
        });

        musdcAddress = musdcAddresses.merc20Address;
        musdcProxyAddress = musdcAddresses.merc20ProxyAddress;

        let musdcUnderlyingPrice = '1000000000000000000000000000000'
        await priceOracle.setUnderlyingPrice(musdcAddress, musdcUnderlyingPrice).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("PriceOracle "+ priceOracle.address +" setUnderlyingPrice with params");
            console.log("   mToken: " + musdcAddress)
            console.log("   underlyingPrice: " + musdcUnderlyingPrice)
            return instance
        });

        // ========================================= //
        // MErc20 for USDT

        let musdtAddresses = await deploymentMErc20(
            proxyAdminAddress,
            priceOracleAddress,
            usdcAddress,
            moartrollerAddress,
            jrmStableCoinAddress,
            '20000000000000000',
            'mToken USDT',
            'mUSDT',
            8,
            ownerAddress,
            '10000',
            '100000000000000000',
            '850000000000000000'
        ).then(function(instance){
            console.log("mUSDTProxy address: " + instance.merc20ProxyAddress)
            console.log("mUSDT address: " + instance.merc20Address)
            return instance
        });

        musdtAddress = musdtAddresses.merc20Address;
        musdtProxyAddress = musdtAddresses.merc20ProxyAddress;

        let musdtUnderlyingPrice = '1000000000000000000000000000000'
        await priceOracle.setUnderlyingPrice(musdtAddress, musdtUnderlyingPrice).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("PriceOracle "+ priceOracle.address +" setUnderlyingPrice with params");
            console.log("   mToken: " + musdtAddress)
            console.log("   underlyingPrice: " + musdtUnderlyingPrice)
            return instance
        });

        // ========================================= //
        // MErc20 for DAI

        let mdaiAddresses = await deploymentMErc20(
            proxyAdminAddress,
            priceOracleAddress,
            daiAddress,
            moartrollerAddress,
            jrmStableCoinAddress,
            '20000000000000000',
            'mToken DAI',
            'mDAI',
            8,
            ownerAddress,
            '10000',
            '100000000000000000',
            '850000000000000000'
        ).then(function(instance){
            console.log("mDAIProxy address: " + instance.merc20ProxyAddress)
            console.log("mDAI address: " + instance.merc20Address)
            return instance
        });

        mdaiAddress = mdaiAddresses.merc20Address;
        mdaiProxyAddress = mdaiAddresses.merc20ProxyAddress;

        let mdaiUnderlyingPrice = '1000000000000000000000000000000'
        await priceOracle.setUnderlyingPrice(mdaiAddress, mdaiUnderlyingPrice).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("PriceOracle "+ priceOracle.address +" setUnderlyingPrice with params");
            console.log("   mToken: " + mdaiAddress)
            console.log("   underlyingPrice: " + mdaiUnderlyingPrice)
            return instance
        });

        // ========================================= //
        // MErc20 for UNN governance token

        let munnAddresses = await deploymentMErc20(
            proxyAdminAddress,
            priceOracleAddress,
            unnAddress,
            moartrollerAddress,
            jrmUnnAddress,
            '200000000000000000000000000',
            'mToken UNN',
            'mUNN',
            8,
            ownerAddress,
            '2500',
            '350000000000000000',
            '1000000000000000000'
        ).then(function(instance){
            console.log("mUNNProxy address: " + instance.merc20ProxyAddress)
            console.log("mUNN address: " + instance.merc20Address)
            return instance
        });

        munnAddress = munnAddresses.merc20Address;
        munnProxyAddress = munnAddresses.merc20ProxyAddress;

        let munnUnderlyingPrice = '90000000000000000'
        await priceOracle.setUnderlyingPrice(munnAddress, munnUnderlyingPrice).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("PriceOracle "+ priceOracle.address +" setUnderlyingPrice with params");
            console.log("   mToken: " + munnAddress)
            console.log("   underlyingPrice: " + munnUnderlyingPrice)
            return instance
        });

        // ========================================= //
        // MErc20 for LINK

        let mlinkAddresses = await deploymentMErc20(
            proxyAdminAddress,
            priceOracleAddress,
            linkAddress,
            moartrollerAddress,
            jrmUnnAddress,
            '200000000000000000000000000',
            'mToken LINK',
            'mLINK',
            8,
            ownerAddress,
            '2500',
            '350000000000000000',
            '1000000000000000000'
        ).then(function(instance){
            console.log("mLINKProxy address: " + instance.merc20ProxyAddress)
            console.log("mLINK address: " + instance.merc20Address)
            return instance
        });

        mlinkAddress = mlinkAddresses.merc20Address;
        mlinkProxyAddress = mlinkAddresses.merc20ProxyAddress;

        let mlinkUnderlyingPrice = '90000000000000000'
        await priceOracle.setUnderlyingPrice(mlinkAddress, mlinkUnderlyingPrice).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("PriceOracle "+ priceOracle.address +" setUnderlyingPrice with params");
            console.log("   mToken: " + mlinkAddress)
            console.log("   underlyingPrice: " + mlinkUnderlyingPrice)
            return instance
        });

        // ========================================= //
        // MErc20Proxy and MErc20 for WBTC    
        let mwbtcAddresses = await deploymentMErc20(
            proxyAdminAddress,
            priceOracleAddress,
            wbtcAddress,
            moartrollerAddress,
            jrmWbtcAddress,
            '20000000000000000',
            'mToken WBTC',
            'mWBTC',
            8,
            ownerAddress,
            '500',
            '200000000000000000',
            '750000000000000000'
        ).then(function(instance){
            console.log("mWBTCProxy address: " + instance.merc20ProxyAddress)
            console.log("mWBTC address: " + instance.merc20Address)
            return instance
        });

        mwbtcAddress = mwbtcAddresses.merc20Address;
        mwbtcProxyAddress = mwbtcAddresses.merc20ProxyAddress;

        let mwbtcUnderlyingPrice = '550000000000000000000000000000000'
        await priceOracle.setUnderlyingPrice(mwbtcAddress, mwbtcUnderlyingPrice).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("PriceOracle "+ priceOracle.address +" setUnderlyingPrice with params");
            console.log("   mToken: " + mwbtcAddress)
            console.log("   underlyingPrice: " + mwbtcUnderlyingPrice)
            return instance
        });

        // ========================================= //
        // MErc20Proxy and MErc20 for WETH    
        let mwethAddresses = await deploymentMErc20(
            proxyAdminAddress,
            priceOracleAddress,
            wbtcAddress,
            moartrollerAddress,
            jrmWbtcAddress,
            '20000000000000000',
            'mToken WETH',
            'mWETH',
            8,
            ownerAddress,
            '500',
            '200000000000000000',
            '750000000000000000'
        ).then(function(instance){
            console.log("mWETHProxy address: " + instance.merc20ProxyAddress)
            console.log("mWETH address: " + instance.merc20Address)
            return instance
        });

        mwethAddress = mwethAddresses.merc20Address;
        mwethProxyAddress = mwethAddresses.merc20ProxyAddress;

        let mwethUnderlyingPrice = '550000000000000000000000000000000'
        await priceOracle.setUnderlyingPrice(mwethAddress, mwethUnderlyingPrice).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("PriceOracle "+ priceOracle.address +" setUnderlyingPrice with params");
            console.log("   mToken: " + mwethAddress)
            console.log("   underlyingPrice: " + mwethUnderlyingPrice)
            return instance
        });

        // ========================================= //

        

        let addresses = {
            proxyAdminAddress : proxyAdminAddress,
            priceOracleAddress : priceOracleAddress,
            liquidityMathModelV1Address : liquidityMathModelV1Address,
            liquidationModelV1Address : liquidationModelV1Address,
            moartrollerProxyAddress : moartrollerProxyAddress,
            moartrollerAddress : moartrollerAddress,
            mproxyv1Address : mproxyv1Address,
            jrmStableCoinAddress : jrmStableCoinAddress,
            jrmEthAddress : jrmEthAddress,
            jrmWbtcAddress : jrmWbtcAddress,
            jrmUnnAddress : jrmUnnAddress,
            copMappingAddress : copMappingAddress,
            cuUNNAddress : cuUNNAddress,
            lendingRouterAddress : lendingRouterAddress,

            mmoarAddress : mmoarAddress,
            mmoarProxyAddress : mmoarProxyAddress,

            musdcAddress : musdcAddress,
            musdcProxyAddress : munnProxyAddress,

            musdtAddress : musdtAddress,
            musdtProxyAddress : musdtProxyAddress,

            mdaiAddress : mdaiAddress,
            mdaiProxyAddress: mdaiProxyAddress,
    
            munnAddress : munnAddress,
            munnProxyAddress : munnProxyAddress,

            mlinkAddress : mlinkAddress,
            mlinkProxyAddress : mlinkProxyAddress,

            mwbtcAddress : mwbtcAddress,
            mwbtcProxyAddress : mwbtcProxyAddress,

            mwethAddress : mwethAddress,
            mwethProxyAddress : mwethProxyAddress
        }

        console.log(addresses);

        // console.log('REACT_APP_M_ETHEREUM='+ meth.address)
        // console.log('REACT_APP_W_ETH='+ wEthAddress)
        // console.log('REACT_APP_MAXIMILLION='+ maximillion.address)

        console.log('REACT_APP_MOAR='+ moarAddress)
        console.log('REACT_APP_M_MOAR='+ mmoarAddress)
        console.log('REACT_APP_M_MOAR_PROXY='+ mmoarProxyAddress)
        console.log()
        console.log('REACT_APP_USDC='+ usdcAddress)
        console.log('REACT_APP_M_USDC='+ musdcAddress)
        console.log('REACT_APP_M_USDC_PROXY='+ musdcProxyAddress)
        console.log()
        console.log('REACT_APP_USDT='+ usdtAddress)
        console.log('REACT_APP_M_USDT='+ musdtAddress)
        console.log('REACT_APP_M_USDT_PROXY='+ musdtProxyAddress)
        console.log()
        console.log('REACT_APP_DAI='+ daiAddress)
        console.log('REACT_APP_M_DAI='+ mdaiAddress)
        console.log('REACT_APP_M_DAI_PROXY='+ mdaiProxyAddress)
        console.log()
        console.log('REACT_APP_UNION='+ unnAddress)
        console.log('REACT_APP_M_UNION='+ munnAddress)
        console.log('REACT_APP_M_UNION_PROXY='+ munnProxyAddress)
        console.log()
        console.log('REACT_APP_LINK='+ linkAddress)
        console.log('REACT_APP_M_LINK='+ mlinkAddress)
        console.log('REACT_APP_M_LINK_PROXY='+ mlinkProxyAddress)
        console.log()
        console.log('REACT_APP_WBTC='+ wbtcAddress)
        console.log('REACT_APP_M_WBTC='+ mwbtcAddress)
        console.log('REACT_APP_M_WBTC_PROXY='+ mwbtcProxyAddress)
        console.log()
        console.log('REACT_APP_WETH='+ wethAddress)
        console.log('REACT_APP_M_WETH='+ mwethAddress)
        console.log('REACT_APP_M_WETH_PROXY='+ mwethProxyAddress)
        console.log()
        console.log('REACT_APP_MOARTROLLER='+ moartrollerAddress)
        console.log('REACT_APP_MOARTROLLER_PROXY='+ moartrollerProxyAddress)
        console.log()
        console.log('REACT_APP_ORACLE='+ priceOracleAddress)
        console.log()
        console.log('REACT_APP_UUNION='+ uUnnAddress)
        console.log('REACT_APP_M_UUNION='+ cuUNNAddress)
        console.log('REACT_APP_UNION_ROUTER='+ unionRouter)
        console.log('REACT_APP_LENDING_ROUTER='+ lendingRouterAddress)
        
        return addresses;

    }


}