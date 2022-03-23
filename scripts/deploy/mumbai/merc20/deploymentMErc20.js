const hre = require("hardhat");
const BN = hre.ethers.BigNumber;

const toBN = (num) => BN.from(num);

module.exports = {

    deploymentMErc20 : async function (
        proxyAdminAddress,
        priceOracleAddress,
        underlyingAddress,
        moartrollerAddress,
        interestRateModelAddress,
        initialExchangeRateMantissa,
        name,
        symbol,
        decimals,
        adminAddress,
        maxProtectionComposition,
        reserveFactor,
        collateralFactor,
    ) {

        let merc20Proxy_proxy
        let merc20Proxy

        let merc20_proxy
        let merc20

        let moartroller

        let merc20ProxyMasterCopyAddress
        let merc20ProxyAddress
        let merc20MasterCopyAddress
        let merc20Address

        const TransparentUpgradeableProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
        const MErc20Proxy = await ethers.getContractFactory('MErc20Proxy')
        const MErc20 = await ethers.getContractFactory('MErc20')
        const Moartroller = await ethers.getContractFactory("Moartroller")
        
        console.log("===== Deployment " + name + " =====");
        console.log("\nDeploying MErc20Proxy");
        merc20Proxy = await MErc20Proxy.deploy();
        await merc20Proxy.deployed().then(function(instance){
            console.log("\nTransaction hash: " + instance.deployTransaction.hash);
            console.log("MErc20Proxy master copy address: "+ instance.address);
            return instance
        });
        merc20ProxyMasterCopyAddress = merc20Proxy.address;
    
        merc20Proxy_proxy = await TransparentUpgradeableProxy.deploy(
            merc20ProxyMasterCopyAddress,
            proxyAdminAddress,
            "0x"
        );
        await merc20Proxy_proxy.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("MErc20Proxy proxy address: " + instance.address);
            return instance;
        });
        merc20ProxyAddress = merc20Proxy_proxy.address;
        merc20Proxy = await MErc20Proxy.attach(merc20ProxyAddress);
        console.log("MErc20Proxy deployed!");
    
        console.log("\nDeploying MErc20");
        merc20 = await MErc20.deploy();
        await merc20.deployed().then(function(instance){
            console.log("\nTransaction hash: " + instance.deployTransaction.hash);
            console.log("MErc20 master copy address: "+ instance.address);
            return instance
        });
        merc20MasterCopyAddress = merc20.address;
    
        merc20_proxy = await TransparentUpgradeableProxy.deploy(
            merc20MasterCopyAddress,
            proxyAdminAddress,
            "0x"
        );
        await merc20_proxy.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("MErc20 proxy address: " + instance.address);
            return instance;
        });
        merc20Address = merc20_proxy.address;
        merc20 = await MErc20.attach(merc20Address);
        console.log("MErc20 deployed!");
    
        await merc20Proxy.initialize(
            merc20Address,
            priceOracleAddress
        ).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("MErc20Proxy "+ merc20Proxy.address + " call initialize with params:");
            console.log("   _merc20: " + merc20Address);
            console.log("   _priceOracle: " + priceOracleAddress);
        });
    
        await merc20.initialize(
            merc20ProxyAddress,
            underlyingAddress,
            moartrollerAddress,
            interestRateModelAddress,
            initialExchangeRateMantissa,
            name,
            symbol,
            decimals,
            adminAddress
        ).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("MErc20 "+ merc20.address + " call initialize with params:");
            console.log("   merc20Proxy_: " + merc20ProxyAddress);
            console.log("   underlying_: " + underlyingAddress);
            console.log("   moartroller_: " + moartrollerAddress);
            console.log("   interestRateModel_: " + moartrollerAddress);
            console.log("   initialExchangeRateMantissa_: " + initialExchangeRateMantissa);
            console.log("   name_: " + name);
            console.log("   symbol_: " + symbol);
            console.log("   decimals_: " + decimals);
            console.log("   admin_" + adminAddress);
        });
    
        await merc20._setMaxProtectionComposition(maxProtectionComposition).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("mErc20 "+ merc20.address +" _setMaxProtectionComposition " + maxProtectionComposition);
            return instance
        });
        
        await merc20._setReserveFactor(reserveFactor).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("mErc20 "+ merc20.address +" _setReserveFactor " + reserveFactor);
            return instance
        });
    
        moartroller = await Moartroller.attach(moartrollerAddress);
        await moartroller._supportMarket(merc20Address).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("Moartroller "+ moartroller.address +" _supportMarket " + merc20Address);
            return instance
        });
    
        await moartroller._setCollateralFactor(merc20Address, collateralFactor).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("Moartroller "+ moartroller.address +" _setCollateralFactor with params:");
            console.log("   mToken(MErc20): " + merc20Address);
            console.log("   newCollateralFactorMantissa: " + collateralFactor);
            return instance
        });
        
        let addresses = {
            merc20ProxyAddress : merc20ProxyAddress,
            merc20Address : merc20Address,
        }

        return addresses;
    }
}