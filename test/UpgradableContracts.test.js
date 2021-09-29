const setupAll = require('./utils/setupAllMocked')
const { expectRevert } = require('./utils/expectAddons');
const { ethers, upgrades } = require('hardhat');
const { expect } = require("chai");

let app

/**
 * Test cases for contract proxy upgrades
 */
describe("Upgradeable contracts tests", () => {

    beforeEach(async () => {
        app = await setupAll()
    })

    it("Disallow second initialization", async () => {
        expectRevert(
            app.moartroller.initialize(app.liquidityMathModelV1.address, app.liquidationModelV1.address),
            `reverted with reason string 'Initializable: contract is already initialized`
        )
    })

    it("Test Moartroller upgrade", async () => {
        expect(await app.moartroller.getContractVersion()).to.equal("V1");
        const Moartroller = await ethers.getContractFactory("MoartrollerV2")
        await upgrades.upgradeProxy(app.moartroller.address, Moartroller);
        expect(await app.moartroller.getContractVersion()).to.equal("V2");
    })

    it("Test MErc20Immutable proxy", async () => {
        expect(await app.mdai.getContractVersion()).to.equal("V1");
        expect(await app.mdai.symbol()).to.equal("mDAI");
        const MTokenV2 = await ethers.getContractFactory('MErc20ImmutableV2')
        await upgrades.upgradeProxy(app.mdai.address, MTokenV2);
        expect(await app.mdai.getContractVersion()).to.equal("V2");
        expect(await app.mdai.symbol()).to.equal("mDAI");

    })

    it("Test MProtection proxy", async () => {
        expect(await app.muunn.getContractVersion()).to.equal("V1");
        const MTokenV2 = await ethers.getContractFactory('MProtectionV2')
        await upgrades.upgradeProxy(app.muunn.address, MTokenV2);
        expect(await app.muunn.getContractVersion()).to.equal("V2");
    })

})
