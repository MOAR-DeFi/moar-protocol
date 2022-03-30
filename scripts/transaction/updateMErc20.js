
const hre = require("hardhat");
const { ethers, upgrades } = require('hardhat');

async function main() {
    let proxyAdminAddress = '0x1d9dEB50fff672e5497bb40C666D16C3CC0db845'

    let mmoarAddress = '0xc4F147182136a7F2ca71C464e1e260B160a4cA3a'
    let musdcAddress = '0x9c6aD6c1E23d6678F2bC2b24c1069C2EB1D17dCE'
    let musdtAddress = '0x339a1768fF933Be9d4E3b3E4629C94e02B894706'
    let mdaiAddress = '0xE976087630C667cF66a3cf7e9fDf829c099AA203'
    let munnAddress = '0x1Dd7be41F61519427B468EBef2C15E20E2fe9EE3'
    let mlinkAddress = '0xC7E9c8e9cfF36f9421d3355Cf969dD13A7aF385C'
    let mwbtcAddress = '0xa1666E94A9573AA6Bb3f485B8f98D32A10412C33'
    let mwethAddress = '0x34461BD24D0611ea21749Fc1351a58423522cD3f'

    let ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
    let MErc20 = await ethers.getContractFactory('MErc20')

    let signers = await ethers.getSigners()
    let owner = signers[0]

    let proxyAdmin = await ProxyAdmin.attach(proxyAdminAddress).connect(owner)

    let merc20 = await MErc20.deploy();
    await merc20.deployed().then(function(instance){
        console.log("\nTransaction hash: " + instance.deployTransaction.hash);
        console.log("MErc20 master copy address: "+ instance.address);
        return instance
    });
    let merc20Address = merc20.address

    let mtokens = [mmoarAddress, musdcAddress, musdtAddress, mdaiAddress, munnAddress, mlinkAddress, mwbtcAddress, mwethAddress]
    for(var mtoken of mtokens){
        // console.log(mtoken)
        await proxyAdmin.upgrade(mtoken, merc20Address).then(function(instance){
            console.log("\nTransaction hash: " + instance.hash)
            console.log("ProxyAdmin upgraded " + mtoken +" to "+ merc20Address)
        })
    }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
