
const hre = require("hardhat");
const BN = hre.ethers.BigNumber;

const toBN = (num) => BN.from(num);

async function main() {
   
    let signers = await hre.ethers.getSigners();
    let deployMaster = signers[0];
    console.log("DeployMaster: " + deployMaster.address);

    let MyToken = await hre.ethers.getContractFactory("MyToken");
    
    let name = "WrappedEther"
    let symbol = "WETH"
    let myToken = await MyToken.connect(deployMaster).deploy(
        name,
        symbol
    );
    await myToken.deployed().then(function(instance){
        console.log("Transaction hash: " + instance.deployTransaction.hash);
        console.log("MyToken deployed: "+ instance.address);
        return instance
    })

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
