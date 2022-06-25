const hre = require("hardhat");
const BN = hre.ethers.BigNumber;

const toBN = (num) => BN.from(num);

module.exports = {

    deploymentMyToken : async function (
        name,
        symbol,
        decimals
    ) {
        let signers = await hre.ethers.getSigners();
        let deployMaster = signers[0];
        console.log("DeployMaster: " + deployMaster.address);

        let MyToken = await hre.ethers.getContractFactory("MyToken");
        
        let myToken = await MyToken.connect(deployMaster).deploy(
            name,
            symbol,
            decimals
        );
        await myToken.deployed().then(function(instance){
            console.log("Transaction hash: " + instance.deployTransaction.hash);
            console.log("MyToken deployed: "+ instance.address + " with params");
            console.log("   name: " + name)
            console.log("   symbol: " + symbol)
            console.log("   decimals: " + decimals)
            return instance
        });
        let myTokenAddress = myToken.address
        
        let addresses = {
            tokenAddress : myTokenAddress
        }

        console.log(addresses)

        return addresses
            
    }
}