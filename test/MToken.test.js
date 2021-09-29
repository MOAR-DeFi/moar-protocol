const setupAll = require('./utils/setupAllMocked')
const { tokens, toTokens, advanceBlock } = require('./utils/testHelpers')
const { expect } = require("chai");

let app;

describe("MToken", () => {

  describe("reserves", () => {

    beforeEach(async() => {
      app = await setupAll()

      // create liquidity in pool
      await app.usdc.approve(app.musdc.address, toTokens('100000', 6))
      await app.musdc.mint(toTokens('100000', 6))

      // create liquidity for user 
      await app.wbtc.connect(app.user1).approve(app.mwbtc.address, toTokens('5', 8))
      await app.mwbtc.connect(app.user1).mint(toTokens('5', 8))
      await app.moartroller.connect(app.user1).enterMarkets([app.mwbtc.address])
    })

    it("default reserves calculation", async () => {
      await app.musdc._setReserveFactor(tokens('0.5'))

      expect(await app.usdc.balanceOf(app.user1.address)).to.equal(toTokens('10000', 6))
      await app.musdc.connect(app.user1).borrow(toTokens('10000', 6))
      expect(await app.usdc.balanceOf(app.user1.address)).to.equal(toTokens('20000', 6))

      await advanceBlock(1000)
      await app.usdc.connect(app.user1).approve(app.musdc.address, ethers.constants.MaxUint256)
      await app.musdc.connect(app.user1).repayBorrow(ethers.constants.MaxUint256)

      expect(await app.musdc.totalReserves()).to.equal('11683')
    })

    it("calculation with split factor", async () => {
      await app.musdc._setReserveFactor(tokens('0.5'))
      await musdc._setReserveSplitFactor(tokens('0.75'));

      expect(await app.usdc.balanceOf(app.user1.address)).to.equal(toTokens('10000', 6))
      await app.musdc.connect(app.user1).borrow(toTokens('10000', 6))
      expect(await app.usdc.balanceOf(app.user1.address)).to.equal(toTokens('20000', 6))

      await advanceBlock(1000)
      await app.usdc.connect(app.user1).approve(app.musdc.address, ethers.constants.MaxUint256)
      await app.musdc.connect(app.user1).repayBorrow(ethers.constants.MaxUint256)

      expect(await app.musdc.totalReserves()).to.equal('2921')
    })

  })

})
