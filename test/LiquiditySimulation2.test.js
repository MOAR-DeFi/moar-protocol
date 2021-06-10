const { tokens, getEventsFromTransaction } = require('./utils/testHelpers')
const setupAll = require('./utils/setupAllMocked')
const { expectEvent, expectNoEvent } = require('./utils/expectAddons');
const { expect } = require("chai");

let app

describe("Liquidity Simulation with underflow", () => {

  beforeEach(async () => {
    app = await setupAll()
    await app.moartroller._setCollateralFactor(app.mdai.address, tokens('0.9'))
    await app.moartroller._setCollateralFactor(app.mwbtc.address, tokens('0.6'))
    await app.moartroller._setCollateralFactor(app.musdc.address, tokens('0.9'))
    await app.moartroller._setCollateralFactor(app.munn.address, tokens('0.4'))
    await app.moartroller._setCollateralFactor(app.meth.address, tokens('0.5'))
  })


  it("Test case 2 with protection", async () => {
    await app.dai.connect(app.user2).approve(app.mdai.address, tokens('8000'))
    await app.mdai.connect(app.user2).mint(tokens('8000'))

    // ------
    // DAY 1
    // -----
    // Set price and MPC
    await app.oracle.setUnderlyingPrice(app.meth.address, tokens('2800'))
    await app.meth._setMaxProtectionComposition(7600)
    await app.moartroller._setCollateralFactor(app.meth.address, tokens('0.75'))

    // Deposit ETH
    await app.meth.connect(app.user1).mint({value: tokens('0.15')})
    await app.moartroller.connect(app.user1).enterMarkets([app.mdai.address, app.meth.address])

    // Create a protection 
    await app.uunn.createProtection(app.user1.address, app.weth.address, tokens('0.15'), tokens('3491.68'), tokens('15'));
    await app.uunn.connect(app.user1).approve(app.muunn.address, 1)
    await app.muunn.connect(app.user1).mint(1)
    await app.muunn.connect(app.user1).lockProtectionValue(1, tokens("0"))

    // Take a borrow
    await expectEvent(app.mdai.connect(app.user1).borrow(tokens('319')), 'Borrow', {borrower: app.user1.address, borrowAmount: tokens('319')})

    // Set new price
    await app.oracle.setUnderlyingPrice(app.meth.address, tokens('1400'))

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))['1']
    expect(accountLiquidity.toString()).to.equal(tokens('0.2'))
  })

})
