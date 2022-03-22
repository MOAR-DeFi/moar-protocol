const hre = require("hardhat");
// const { ethers } = require("ethers");
const BN = hre.ethers.BigNumber;

const toBN = (num) => BN.from(num);

module.exports = {
    deploymentMWeth: async function (
        underlyingAddress,
        priceOracleAddress,
        moartrollerAddress,
        interestRateModelAddress,
        initialExchangeRateMantissa,
        name,
        symbol,
        decimals,
        adminAddress,
        collateralFactor

    ){
        let mweth;
        let mwethAddress;
        let mwethProxy;
        let mwethProxyAddress;


        let moartroller;

        const MWeth = await ethers.getContractFactory('MWeth')
        const MWethProxy = await ethers.getContractFactory('MWethProxy')
        const Moartroller = await ethers.getContractFactory("Moartroller")
        


        console.log("===== Deployment " + name + " =====");
        console.log("\nDeploying MWethProxy");
        mwethProxy = await MWethProxy.deploy(priceOracleAddress, adminAddress);
        await mwethProxy.deployed().then(function(instance){
            console.log("\nTransaction hash: " + instance.deployTransaction.hash);
            console.log("MWethProxyaddress: "+ instance.address + " call constructor with params:");
            console.log("   priceOracle_: "+ priceOracleAddress);
            console.log("   admin_: "+ adminAddress);
            return instance
        })
        mwethProxyAddress = mwethProxy.address;
        console.log("MWethProxy Deployed!");


        console.log("\nDeploying MWeth");
        mweth = await MWeth.deploy(
            mwethProxyAddress,
            underlyingAddress,
            moartrollerAddress,
            interestRateModelAddress,
            initialExchangeRateMantissa,
            name,
            symbol,
            decimals,
            adminAddress
        ).then(function(instance){
            console.log("\nTransaction hash: " + instance.deployTransaction.hash);
            console.log("MWeth "+ instance.address + " call constructor with params:");
            // mwethAddress = instance.address;
            console.log("   mwethProxy_: " + mwethProxyAddress);
            console.log("   underlying_: " + underlyingAddress);
            console.log("   moartroller_: " + moartrollerAddress);
            console.log("   interestRateModel_: " + moartrollerAddress);
            console.log("   initialExchangeRateMantissa_: " + initialExchangeRateMantissa);
            console.log("   name_: " + name);
            console.log("   symbol_: " + symbol);
            console.log("   decimals_: " + decimals);
            console.log("   admin_: " + adminAddress);
            return instance
        });
        mwethAddress = mweth.address;
        // console.log("MWeth Address")
        console.log("MWeth Deployed!");

        console.log("\nSetting MWeth for MWethProxy");
        await mwethProxy.setMWethImplementation(mwethAddress);
        console.log("Contract MWeth with address: "+ mwethAddress+"  set for MWethProxy");


        moartroller = await Moartroller.attach(moartrollerAddress);
        await moartroller._supportMarket(mwethAddress).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("Moartroller "+ moartroller.address +" _supportMarket " + mwethAddress);
            return instance
        });
    
        await moartroller._setCollateralFactor(mwethAddress, collateralFactor).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash);
            console.log("Moartroller "+ moartroller.address +" _setCollateralFactor with params:");
            console.log("   mToken(MWeth): " + mwethAddress);
            console.log("   newCollateralFactorMantissa: " + collateralFactor);
            return instance
        });



        let addresses = {
            mwethProxyAddress : mwethProxyAddress,
            mwethAddress : mwethAddress
        }

        return addresses;
    }
}