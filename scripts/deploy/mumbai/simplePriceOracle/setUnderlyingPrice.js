
const hre = require("hardhat");
const BN = hre.ethers.BigNumber;

const toBN = (num) => BN.from(num);

let simplePriceOracleAddress = '0xCa4E334d3F7a9CB179875AFfC088c61D442af40c'

async function main() {
   
    let signers = await hre.ethers.getSigners();
    let deployMaster = signers[0];
    console.log("DeployMaster: " + deployMaster.address);

    const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle");

    let priceOracle = await SimplePriceOracle.attach(simplePriceOracleAddress).connect(deployMaster);

    let mwethAddress = '0x313933f8b1c53e40274b84b89d08a18be18130ea'
    let mwethUnderlyingPrice = '55000000000000000000000'
    await priceOracle.setUnderlyingPrice(mwethAddress, mwethUnderlyingPrice).then(function(instance){
        console.log("\nTransaction hash: " + instance.hash);
        console.log("PriceOracle "+ priceOracle.address +" setUnderlyingPrice with params");
        console.log("   mToken: " + mwethAddress)
        console.log("   underlyingPrice: " + mwethUnderlyingPrice)
        return instance
    });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
