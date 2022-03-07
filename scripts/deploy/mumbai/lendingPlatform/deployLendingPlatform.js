
const { deploymentLendingPlatform } = require("./deploymentLendingPlatform.js");

async function main() {
    
    await deploymentLendingPlatform();

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
