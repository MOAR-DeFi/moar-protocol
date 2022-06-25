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
    let decimals = 18;
    const { deploymentMyToken } = require('./deploymentMyToken.js');
    await deploymentMyToken(name, symbol, decimals);
    
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
