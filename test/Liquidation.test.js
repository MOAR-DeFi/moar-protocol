const { tokens, getEventsFromTransaction } = require('./utils/testHelpers')
const setupAll = require('./utils/setupAllMocked')
const { expectEvent, expectNoEvent } = require('./utils/expectAddons');
const { expect } = require("chai");

let app

/**
 * Test cases for liquidity calculations - scenario 1
 */
describe("Liquidation", () => {

    beforeEach(async () => {
        app = await setupAll()
        await app.moartroller._setCollateralFactor(app.mdai.address, tokens('0.75'))
        await app.moartroller._setCollateralFactor(app.meth.address, tokens('0.5'))
        await app.moartroller._setCollateralFactor(app.mmoar.address, tokens('0.5'))

        await app.oracle.setUnderlyingPrice(app.meth.address, tokens('1000'))
        await app.oracle.setUnderlyingPrice(app.mdai.address, tokens('1'))
        await app.oracle.setUnderlyingPrice(app.mmoar.address, tokens('1'))
    })

    it("Basic liquidation of negative liquidity account", async () => {
        // SET USER2
        await app.dai.connect(app.user2).approve(app.mdai.address, tokens('8000'))
        await app.mdai.connect(app.user2).mint(tokens('8000'))
        await app.moartroller.connect(app.user2).enterMarkets([app.mdai.address, app.meth.address, app.mmoar.address])
        account2Liquidity1 = (await app.moartroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity1.toString()).to.equal(tokens('6000'))


        // SET USER1
        await app.meth.connect(app.user1).mint({value: tokens('10')})
        await app.moartroller.connect(app.user1).enterMarkets([app.mdai.address, app.meth.address, app.mmoar.address])
        await app.moar.connect(app.user1).approve(app.mmoar.address, tokens('4000'))
        await app.mmoar.connect(app.user1).mint(tokens('4000'))


        // USER2 takes a borrow of 4000MOAR
        let borrowAmount = tokens('4000');
        await expectEvent(app.mmoar.connect(app.user2).borrow(borrowAmount), 'Borrow', {borrower: app.user2.address, borrowAmount: borrowAmount})
        account2Liquidity2 = (await app.moartroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity2.toString()).to.equal(tokens('2000'))

        // Price of MOAR goes up so user2 liquidity goes negative
        await app.oracle.setUnderlyingPrice(app.mmoar.address, tokens('2'))
        account2Liquidity2 = (await app.moartroller.getAccountLiquidity(app.user2.address))[2]
        expect(account2Liquidity2.toString()).to.equal(tokens('2000')) // shortfall


        // LIQUIDATION
        // USER1 provides MOAR to regain USER2's DAI
        const repayAmount = tokens('2000')
        console.log("Approvance for mMOAR before approve: ", (await app.moar.allowance(user1.address, app.mmoar.address)).toString());
        console.log("User1 MOAR before liquidation: ", (await app.moar.balanceOf(app.user1.address)).toString());
        console.log("User1 mDAI before liquidation: ", (await app.mdai.balanceOf(app.user1.address)).toString());
        await app.moar.connect(app.user1).approve(app.mmoar.address, repayAmount);
        console.log("Approvance for mMOAR after approve: ", (await app.moar.allowance(user1.address, app.mmoar.address)).toString());
        await app.mmoar.connect(app.user1).liquidateBorrow(app.user2.address, repayAmount, app.mdai.address);
        console.log("User1 MOAR after liquidation: ", (await app.moar.balanceOf(app.user1.address)).toString());
        console.log("User1 mDAI after liquidation: ", (await app.mdai.balanceOf(app.user1.address)).toString());

        // Check if USER2's liquidity is positive now
        account2Liquidity3 = (await app.moartroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity3.toString()).to.equal('1699992079842096632000')
    })


})
