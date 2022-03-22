
const hre = require("hardhat");
const BN = hre.ethers.BigNumber;

const toBN = (num) => BN.from(num);

let myTokenAddress = '0xAf6F6b224D6251CD00c357131B3b26A47763FA9B'
let accountAddress = '0xC04d245263fF5459CeA78C1800fdc69BD11B4b59'
let amount = toBN('9999999999999999999999')

async function main() {
   
    let signers = await hre.ethers.getSigners();
    let deployMaster = signers[0];
    console.log("DeployMaster: " + deployMaster.address);

    let MyToken = await hre.ethers.getContractFactory("MyToken");
    
    let myToken = await MyToken.attach(myTokenAddress).connect(deployMaster)
    await myToken.mint(accountAddress, amount).then(function(instance){
        console.log("\nTransaction hash: " + instance.hash);
        console.log("MyToken "+ myToken.address +" mint with params");
        console.log("   account: " + accountAddress)
        console.log("   amount: " + amount)
        return instance
    });

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
