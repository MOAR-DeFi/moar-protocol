const { tokens, getEventsFromTransaction, toTokens} = require('./utils/testHelpers')
const setupAll = require('./utils/setupAllMocked')
const { expectEvent, expectNoEvent } = require('./utils/expectAddons');
const { expect } = require("chai");

let app

const COP_WETH = {
    amount: tokens("2"), // 2 WETH with 18 decimals
    strike: tokens('2000'),
    premium: tokens('70')
}
const COP_DAI = {
    amount: tokens("2"), // 2 DAI with 18 decimals
    strike: tokens('1.1'),
    premium: tokens('70')
}
const COP_WBTC = {
    amount: "200000000", // 2 WBTC with 8 decimals
    strike: tokens('60000'),
    premium: tokens('70')
}
const COP_USDC = {
    amount: "2000000", // 2 USDC with 6 decimals
    strike: tokens('1.1'),
    premium: tokens('70')
}

/**
 * Test cases for liquidity calculations - scenario 1
 */
describe("Liquidity calculations for different assets", () => {

    beforeEach(async () => {
        app = await setupAll()
        await app.moartroller._setCollateralFactor(app.mdai.address, tokens('0.9'))
        await app.moartroller._setCollateralFactor(app.mwbtc.address, tokens('0.6'))
        await app.moartroller._setCollateralFactor(app.musdc.address, tokens('0.8'))
        await app.moartroller._setCollateralFactor(app.meth.address, tokens('0.5'))

        await app.mdai._setMaxProtectionComposition(5000);
        await app.mwbtc._setMaxProtectionComposition(5000);
        await app.musdc._setMaxProtectionComposition(5000);
        await app.meth._setMaxProtectionComposition(5000);
    })

    it("Deposits WETH (18 decimals) and gets liquidity", async () => {
        await app.meth.connect(app.user2).mint({value: tokens('1')})
        await app.moartroller.connect(app.user2).enterMarkets([app.meth.address])
        const liquidity = (await app.moartroller.getAccountLiquidity(app.user2.address))[1]

        expect(liquidity.toString()).to.equal(tokens('875'))

        // Now let's add a c-op
        await app.uunn.createProtection(app.user2.address, app.weth.address, COP_WETH.amount, COP_WETH.strike, COP_WETH.premium)
        expect(await app.uunn.balanceOf(app.user2.address)).to.equal(1)
        await app.uunn.connect(app.user2).approve(app.muunn.address, 1)
        await app.muunn.connect(app.user2).mint(1)
        await app.muunn.connect(app.user2).lockProtectionValue(1, 0);
        expect(await app.muunn.getUnderlyingProtectionLockedAmount(1)).to.equal(tokens('0.4375'))
        expect(await app.muunn.getUnderlyingProtectionLockedValue(1)).to.equal(tokens('875'))

        const liquidity2 = (await app.moartroller.getAccountLiquidity(app.user2.address))[1]
        expect(liquidity2.toString()).to.equal(tokens('1312.5'))
    })

    it("Deposits DAI (18 decimals) and gets liquidity", async () => {
        await app.dai.connect(app.user2).approve(app.mdai.address, tokens('1'))
        await app.mdai.connect(app.user2).mint(tokens('1'))
        await app.moartroller.connect(app.user2).enterMarkets([app.mdai.address])
        const liquidity = (await app.moartroller.getAccountLiquidity(app.user2.address))[1]
        expect(liquidity.toString()).to.equal(tokens('0.9'))

        // Now let's add a c-op
        await app.uunn.createProtection(app.user2.address, app.dai.address, COP_DAI.amount, COP_DAI.strike, COP_DAI.premium)
        expect(await app.uunn.balanceOf(app.user2.address)).to.equal(1)
        await app.uunn.connect(app.user2).approve(app.muunn.address, 1)
        await app.muunn.connect(app.user2).mint(1)
        await app.muunn.connect(app.user2).lockProtectionValue(1, 0);
        expect(await app.muunn.getUnderlyingProtectionLockedAmount(1)).to.equal(tokens('0.454545454545454544'))
        expect(await app.muunn.getUnderlyingProtectionLockedValue(1)).to.equal(tokens('0.5'))

        const liquidity2 = (await app.moartroller.getAccountLiquidity(app.user2.address))[1]
        expect(liquidity2.toString()).to.equal(tokens('0.95'))
    })

    it("Deposits WBTC (8 decimals) and gets liquidity", async () => {
        await app.wbtc.connect(app.user2).approve(app.mwbtc.address, toTokens('1', 8))
        await app.mwbtc.connect(app.user2).mint(toTokens('1', 8))
        await app.moartroller.connect(app.user2).enterMarkets([app.mwbtc.address])
        const liquidity = (await app.moartroller.getAccountLiquidity(app.user2.address))[1]
        expect(liquidity.toString()).to.equal(tokens('33000'))

        // Now let's add a c-op
        await app.uunn.createProtection(app.user2.address, app.wbtc.address, COP_WBTC.amount, COP_WBTC.strike, COP_WBTC.premium)
        expect(await app.uunn.balanceOf(app.user2.address)).to.equal(1)
        await app.uunn.connect(app.user2).approve(app.muunn.address, 1)
        await app.muunn.connect(app.user2).mint(1)
        await app.muunn.connect(app.user2).lockProtectionValue(1, 0);
        expect(await app.muunn.getUnderlyingProtectionLockedValue(1)).to.equal(tokens('27500'))
        expect(await app.muunn.getUnderlyingProtectionLockedAmount(1)).to.equal(toTokens('0.45833333',8))

        const liquidity2 = (await app.moartroller.getAccountLiquidity(app.user2.address))[1]
        expect(liquidity2.toString()).to.equal(tokens('44000'))
    })

    it("Deposits USDC (6 decimals) and gets liquidity", async () => {
        await app.usdc.connect(app.user2).approve(app.musdc.address, toTokens('1', 6))
        await app.musdc.connect(app.user2).mint(toTokens('1', 6))
        await app.moartroller.connect(app.user2).enterMarkets([app.musdc.address])
        const liquidity = (await app.moartroller.getAccountLiquidity(app.user2.address))[1]
        expect(liquidity.toString()).to.equal(tokens('0.8'))

        // Now let's add a c-op
        await app.uunn.createProtection(app.user2.address, app.usdc.address, COP_USDC.amount, COP_USDC.strike, COP_USDC.premium)
        expect(await app.uunn.balanceOf(app.user2.address)).to.equal(1)
        await app.uunn.connect(app.user2).approve(app.muunn.address, 1)
        await app.muunn.connect(app.user2).mint(1)
        await app.muunn.connect(app.user2).lockProtectionValue(1, 0);
        expect(await app.muunn.getUnderlyingProtectionLockedAmount(1)).to.equal(toTokens('0.454545', 6))
        expect(await app.muunn.getUnderlyingProtectionLockedValue(1)).to.equal(tokens('0.5'))

        const liquidity2 = (await app.moartroller.getAccountLiquidity(app.user2.address))[1]
        expect(liquidity2.toString()).to.equal(tokens('0.9'))
    })
});