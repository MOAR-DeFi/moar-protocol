
const hre = require("hardhat");
const { ethers, upgrades } = require('hardhat');

async function main() {
    let proxyAdminAddress = '0x1d9dEB50fff672e5497bb40C666D16C3CC0db845'

    let lendingRouteProxyAddress = '0x6c8C12ff7f81EC17A4ee15Ad179CB895BE97F514'

    let ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
    let LendingRouter = await ethers.getContractFactory('LendingRouter')

    let lendingRouter

    let lendingRouterMasterCopyAddress

    let signers = await ethers.getSigners()
    let owner = signers[0]

    let proxyAdmin = await ProxyAdmin.attach(proxyAdminAddress).connect(owner)

    lendingRouter = await LendingRouter.deploy();
    await lendingRouter.deployed().then(function(instance){
        console.log("\nTransaction hash: " + instance.deployTransaction.hash);
        console.log("LendingRouter master copy address: "+ instance.address);
        return instance
    });
    lendingRouterMasterCopyAddress = lendingRouter.address;

    await proxyAdmin.upgrade(lendingRouteProxyAddress, lendingRouterMasterCopyAddress).then(function(instance){
        console.log("\nTransaction hash: " + instance.hash)
        console.log("ProxyAdmin upgraded " + lendingRouteProxyAddress +" to "+ lendingRouterMasterCopyAddress)
    })


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
