const hre = require("hardhat");
const BN = hre.ethers.BigNumber;

const toBN = (num) => BN.from(num);

async function main() {

    let signers = await hre.ethers.getSigners();
    let admin = signers[0];
   
    const { deploymentMWeth } = require('./deploymentMWeth.js');
    let underlyingAddress = '' 
    let priceOracleAddress = ''
    let moartrollerAddress = ''
    let interestRateModelAddress = ''
    let initialExchangeRateMantissa = ''
    let name = 'MWMatic Token'
    let symbol = 'MWMatic'
    let decimals = '8'
    let adminAddress = admin.address
    let collateralFactor = '750000000000000000'

    await deploymentMWeth(
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
    );
    
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});