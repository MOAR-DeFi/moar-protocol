
const { deploymentMErc20 } = require("./deploymentMErc20.js");

async function main() {
    let proxyAdminAddress = '0xd3412354C52658C4F19932E348fc3953a8a77Db6'
    let priceOracleAddress = '0xCa4E334d3F7a9CB179875AFfC088c61D442af40c'
    let underlyingAddress = '0xAf6F6b224D6251CD00c357131B3b26A47763FA9B'
    let moartrollerAddress = '0x762809D00DbbCC75a8a545B82f4337e9dcF38315'
    let interestRateModelAddress = '0xAE24ED31E9596463803485322ae02a7aC0E96320'
    let initialExchangeRateMantissa = '20000000000000000'
    let name = "mWrappedEther test2"
    let symbol = "mWETH"
    let decimals = 8
    let adminAddress = '0xC04d245263fF5459CeA78C1800fdc69BD11B4b59'
    let maxProtectionComposition = 500
    let reserveFactor =  '200000000000000000'
    let collateralFactor = '750000000000000000'
    
    await deploymentMErc20(
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
        collateralFactor
    );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
