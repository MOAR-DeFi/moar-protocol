const hre = require("hardhat");
const BN = hre.ethers.BigNumber;

const toBN = (num) => BN.from(num);

async function main() {

    let name = "WrappedMatic"
    let symbol = "WMatic"
    let decimals = 18;
    const { deploymentWMatic } = require('./deploymentWMatic.js');
    await deploymentWMatic(name, symbol, decimals);
    
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
