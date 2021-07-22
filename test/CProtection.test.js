const setupAll = require('./utils/setupAllMocked')
const { tokens } = require('./utils/testHelpers')
const { expect } = require("chai");

let app;

const COP_1 = {
  amount: tokens('1'),
  strike: tokens('2200'),
  premium: tokens('30')
}
const COP_2 = {
  amount: tokens('1.5'),
  strike: tokens('2100'),
  premium: tokens('25')
}
const COP_3 = {
  amount: tokens('0.5'),
  strike: tokens('2350'),
  premium: tokens('50')
}
const COP_WBTC = {
    amount: "700000000",
    strike: tokens('60000'),
    premium: tokens('70')
}

 describe("MProtection", () => {

    before(async() => {
      app = await setupAll()
      await app.meth.connect(app.user1).mint({value: tokens('10')})
      await app.moartroller.connect(app.user1).enterMarkets([meth.address, mwbtc.address])

        await app.moartroller._setCollateralFactor(app.mwbtc.address, tokens('0.5'))
        await app.mwbtc._setMaxProtectionComposition(5000)
    })
  
    it("Create C-OP", async () => {
      await app.uunn.createProtection(app.user1.address, app.weth.address, COP_1.amount, COP_1.strike, COP_1.premium)
      expect(await app.uunn.balanceOf(app.user1.address)).to.equal(1)
    })

    it("Deposit C-OP", async () => {
      await app.uunn.connect(app.user1).approve(app.muunn.address, 1)
      await app.muunn.connect(app.user1).mint(1)
      expect(await app.uunn.balanceOf(app.user1.address)).to.equal(0)
      expect(await app.uunn.balanceOf(app.muunn.address)).to.equal(1)
      expect(await app.muunn.balanceOf(app.user1.address)).to.equal(1)
    })

    it("Withdraw C-OP", async () => {
      await app.muunn.connect(app.user1).redeem(1)
      expect(await app.uunn.balanceOf(app.user1.address)).to.equal(1)
      expect(await app.uunn.balanceOf(app.muunn.address)).to.equal(0)
      expect(await app.muunn.balanceOf(app.user1.address)).to.equal(0)
    })

    it("Create and deposit multiple C-OPs", async () => {
      await app.uunn.createProtection(app.user1.address, app.weth.address, COP_2.amount, COP_2.strike, COP_2.premium)
      await app.uunn.createProtection(app.user2.address, app.weth.address, COP_3.amount, COP_3.strike, COP_3.premium)
      expect(await app.uunn.balanceOf(app.user1.address)).to.equal(2)
      expect(await app.uunn.balanceOf(app.user2.address)).to.equal(1)

      await app.uunn.connect(app.user1).approve(app.muunn.address, 1)
      await app.uunn.connect(app.user1).approve(app.muunn.address, 2)
      await app.uunn.connect(app.user2).approve(app.muunn.address, 3)
      await app.muunn.connect(app.user1).mint(1)
      await app.muunn.connect(app.user1).mint(2)
      await app.muunn.connect(app.user2).mint(3)
      expect(await app.uunn.balanceOf(app.user1.address)).to.equal(0)
      expect(await app.uunn.balanceOf(app.user2.address)).to.equal(0)
      expect(await app.uunn.balanceOf(app.muunn.address)).to.equal(3)
      expect(await app.muunn.balanceOf(app.user1.address)).to.equal(2)
      expect(await app.muunn.balanceOf(app.user2.address)).to.equal(1)
    })

    it("Get mapped C-OP dataset", async () => {
      let cop2 = await app.muunn.getMappedProtectionData(3)
      expect(cop2.premium).to.equal(COP_2.premium)
      expect(cop2.strike).to.equal(COP_2.strike)
      expect(cop2.amount).to.equal(COP_2.amount)
      expect(cop2.underlyingAsset).to.equal(app.weth.address)
      expect(cop2.lockedValue).to.equal(0)
      expect(cop2.isProtectionAlive).to.equal(true)
    })

    it("Lock C-OP fixed value", async () => {
      await app.muunn.connect(app.user1).lockProtectionValue(2, tokens('22'))
      expect(await app.muunn.getUnderlyingProtectionLockedAmount(2)).to.equal(tokens('0.01')) 
      expect(await app.muunn.getUnderlyingProtectionLockedValue(2)).to.equal(tokens('22'))
    })
    
    it("Lock C-OP auto value", async () => {
      await app.muunn.connect(app.user1).lockProtectionValue(2, 0)
      expect(await app.muunn.getUnderlyingProtectionLockedAmount(2)).to.equal(tokens('1'))
      expect(await app.muunn.getUnderlyingProtectionLockedValue(2)).to.equal(tokens('2200'))
    })

    it('Get size of UserUnderlyingProtectionTokenIdByCurrency', async () => {
      expect(await app.muunn.getUserUnderlyingProtectionTokenIdByCurrencySize(app.user1.address, app.weth.address)).to.equal(2)
    })
  
    it('Get UserUnderlyingProtectionTokenIdByCurrency element by index', async () => {
      expect(await app.muunn.getUserUnderlyingProtectionTokenIdByCurrency(app.user1.address, app.weth.address, 0)).to.equal(2)
      expect(await app.muunn.getUserUnderlyingProtectionTokenIdByCurrency(app.user1.address, app.weth.address, 1)).to.equal(3)
    })

    it('Get UserUnderlyingProtectionTokenIdByCurrency element by index', async () => {
        await app.wbtc.connect(app.user1).approve(app.mwbtc.address, '1000000000')
        await app.mwbtc.connect(app.user1).mint('100000000')

        await app.uunn.createProtection(app.user1.address, app.wbtc.address, COP_WBTC.amount, COP_WBTC.strike, COP_WBTC.premium)
        expect(await app.uunn.balanceOf(app.user1.address)).to.equal(1)

        await app.uunn.connect(app.user1).approve(app.muunn.address, 4)
        await app.muunn.connect(app.user1).mint(4)
        await app.muunn.connect(app.user1).lockProtectionValue(5, 0)

        let cop = await app.muunn.getMappedProtectionData(5)
        expect(cop.premium).to.equal(COP_WBTC.premium)
        expect(cop.strike).to.equal(COP_WBTC.strike)
        expect(cop.amount).to.equal(COP_WBTC.amount)
        expect(cop.underlyingAsset).to.equal(app.wbtc.address)
        expect(cop.lockedValue).to.equal(tokens("27500"))
        expect(cop.isProtectionAlive).to.equal(true)

        expect((await app.muunn.getUnderlyingProtectionLockedAmount(5)).toString()).to.equal("45833333")
    })
  })
  