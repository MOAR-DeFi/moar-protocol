
const { deploymentMErc20 } = require("./deploymentMErc20.js");

async function main() {
    let proxyAdminAddress
    let priceOracleAddress
    let underlyingAddress
    let moartrollerAddress
    let interestRateModelAddress
    let initialExchangeRateMantissa
    let name
    let symbol
    let decimals
    let adminAddress
    let maxProtectionComposition
    let reserveFactor
    let collateralFactor
    
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
