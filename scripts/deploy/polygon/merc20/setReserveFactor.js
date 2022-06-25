const hre = require("hardhat");
const BN = hre.ethers.BigNumber;

const toBN = (num) => BN.from(num);

let merc20Address = ''
let reserveFactor = ''

async function main() {
    
    let MErc20 = await hre.ethers.getContractFactory("MErc20")

    let merc20 = await MErc20.attach(merc20Address);

    await merc20._setReserveFactor(reserveFactor).then(function(instance){
        console.log("\nTransaction hash: " + instance.hash);
        console.log("mErc20 "+ merc20.address +" _setReserveFactor " + reserveFactor);
        return instance
    });
   
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
