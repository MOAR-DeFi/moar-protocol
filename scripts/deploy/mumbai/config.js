const hre = require("hardhat");
const BN = hre.ethers.BigNumber;

const toBN = (num) => BN.from(num);


module.exports = {

    liquidationIncentive : '11000000000000000000',
    closeFactor : '500000000000000000',

    priceOracleAddress : '0x6E02e57c03ef1B433de5ae138343bAF8a4097d40',
    moarAddress : '0xe171bab47F29D3E083c85815e83489c0EcA0F506',
    usdcAddress : '0xBcbC9F8404b1993F11b1f64Fcba9F486a7d36A91',
    usdtAddress : '0xc87b137FCCCe47C9Af64EA730543843965f5856F',
    daiAddress : '0x69d4e0F24567C2FED7F8422C1de9e70d84553Df3',
    unnAddress : '0x49211BfCaE6e6E15fA92599F25D611B670dF7825',
    linkAddress : '0x6588a9A3A1f2BeEAa79D88E46Cb8E2D7E041050D',
    wbtcAddress : '0x79BaA6466413D11996E298E2e92Fe325EC0c7936',
    wethAddress : '0x004e3E2EA6DDF729090C1aB127c0e8E2DB40c16d',
    wmaticAddress : '0xd9be1D078074e233392838124EEB6E593516A82',
    uUnnAddress : '0x655e549f97eDbfcf693bA9c9Db71F6D2ab6F8fD8',
    unionRouter : '0x52668E7f627367C8AFd4f4fD7c6529268aA6425A'
    
}