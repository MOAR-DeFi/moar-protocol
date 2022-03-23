const hre = require("hardhat");
const BN = hre.ethers.BigNumber;

const toBN = (num) => BN.from(num);

module.exports = {

    deploymentWMatic : async function (
        name,
        symbol,
        decimals
    ) {
        let signers = await hre.ethers.getSigners();
        let deployMaster = signers[0];
        console.log("DeployMaster: " + deployMaster.address);

        let WETH9 = await hre.ethers.getContractFactory("WETH9");
        
        let weth = await WETH9.connect(deployMaster).deploy(
            name,
            symbol,
            decimals
        );
        await weth.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("MyToken deployed: "+ instance.address + " with params");
            console.log("   name: " + name)
            console.log("   symbol: " + symbol)
            console.log("   decimals: " + decimals)
            return instance
        });
        let wethAddress = weth.address
        
        let addresses = {
            wethAddress : wethAddress
        }

        console.log(addresses)

        return addresses
            
    }
}