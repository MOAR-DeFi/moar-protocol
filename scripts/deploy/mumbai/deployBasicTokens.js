const hre = require("hardhat");
const BN = hre.ethers.BigNumber;

const toBN = (num) => BN.from(num);

async function main() {
   
    let name
    let symbol
    let decimals

    const { deploymentMyToken } = require('./myToken/deploymentMyToken.js');
   
    name = "MOAR_test2"
    symbol = "MOAR"
    decimals = 18;
    await deploymentMyToken(name, symbol, decimals);

    name = "USDC_test2 "
    symbol = "USDC"
    decimals = 6;
    await deploymentMyToken(name, symbol, decimals);

    name = "USDT_test2"
    symbol = "USDT"
    decimals = 6;
    await deploymentMyToken(name, symbol, decimals);

    name = "DAI_test2"
    symbol = "DAI"
    decimals = 18;
    await deploymentMyToken(name, symbol, decimals);

    name = "UNN_test2"
    symbol = "UNN"
    decimals = 18;
    await deploymentMyToken(name, symbol, decimals);
    
    name = "LINK_test2"
    symbol = "LINK"
    decimals = 18;
    await deploymentMyToken(name, symbol, decimals);

    name = "WBTC_test2"
    symbol = "WBTC"
    decimals = 8;
    await deploymentMyToken(name, symbol, decimals);

    name = "WETH_test2"
    symbol = "WETH"
    decimals = 18;
    await deploymentMyToken(name, symbol, decimals);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
