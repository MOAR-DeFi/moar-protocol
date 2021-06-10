const setupAll = require('./utils/setupAllMocked')
const { tokens, advanceBlock } = require('./utils/testHelpers')
const { expect } = require("chai");

let app;

 describe("Moar reward distribution", () => {

    describe("for deposit", () => {

      beforeEach(async() => {
        app = await setupAll()
        await app.moar.transfer(app.moartroller.address, tokens('100000'))
        await app.moartroller._setMoarSpeed(app.meth.address, tokens('1'))
      })

      it("single user", async () => {
        expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
        await app.meth.connect(app.user1).mint({value: tokens('10')})

        await advanceBlock(5)
        await app.moartroller.claimMoarReward(app.user1.address)

        expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10006'))
      })
        
      it("multiple users", async () => {
        expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
        expect(await app.moar.balanceOf(app.user2.address)).to.equal(tokens('10000'))
        await app.meth.connect(app.user1).mint({value: tokens('10')})
        await app.meth.connect(app.user2).mint({value: tokens('20')})

        await advanceBlock(5)
        await app.moartroller.claimMoarReward(app.user1.address)
        await advanceBlock(2)
        await app.moartroller.claimMoarReward(app.user2.address)

        expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10003'))
        expect(await app.moar.balanceOf(app.user2.address)).to.equal(tokens('10006'))
      })

    })
  
    describe("for borrow", () => {

      beforeEach(async() => {
        app = await setupAll()
        await app.moar.transfer(app.moartroller.address, tokens('100000'))
        await app.dai.approve(app.mdai.address, tokens('100000'))
        await app.mdai.mint(tokens('100000'))
        await app.moartroller._setMoarSpeed(app.mdai.address, tokens('0.2'))      
      })

      it("single user", async () => {
        await app.meth.connect(app.user1).mint({value: tokens('10')})
        await app.moartroller.connect(app.user1).enterMarkets([meth.address])
  
        expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
        await app.mdai.connect(app.user1).borrow(tokens('10'))

        await advanceBlock(5)
        await app.moartroller.claimMoarReward(app.user1.address)

        expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10001.2'))
      })

      it("multiple users", async () => {
        await app.meth.connect(app.user1).mint({value: tokens('10')})
        await app.meth.connect(app.user2).mint({value: tokens('10')})
        await app.moartroller.connect(app.user1).enterMarkets([meth.address])
        await app.moartroller.connect(app.user2).enterMarkets([meth.address])
        expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
        expect(await app.moar.balanceOf(app.user2.address)).to.equal(tokens('10000'))

        await app.mdai.connect(app.user1).borrow(tokens('20'))
        await app.mdai.connect(app.user2).borrow(tokens('30'))

        await advanceBlock(5)
        await app.moartroller.claimMoarReward(app.user1.address)
        await advanceBlock(2)
        await app.moartroller.claimMoarReward(app.user2.address)

        expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000.680000000001343246'))
        expect(await app.moar.balanceOf(app.user2.address)).to.equal(tokens('10001.079999999997985129'))
      })

    })

  })
  