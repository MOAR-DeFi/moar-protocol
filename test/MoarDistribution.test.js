const setupAll = require('./utils/setupAllMocked')
const { tokens, advanceBlock } = require('./utils/testHelpers')
const { expectRevert } = require('./utils/expectAddons');
const { expect } = require("chai");

let app;

 describe("Moar reward distribution (v1 proxy)", () => {

    // describe("for deposit", () => {

    //   beforeEach(async() => {
    //     app = await setupAll()
    //     await moartroller._setMProxy(app.mproxyv1.address)
    //     await app.moartroller._setRewardClaimEnabled(true)
    //     await app.moar.transfer(app.moartroller.address, tokens('100000'))
    //     await app.moartroller._setMoarSpeed(app.meth.address, tokens('1'))
    //   })

    //   it("single user", async () => {
    //     expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    //     await app.meth.connect(app.user1).mint({value: tokens('10')})

    //     await advanceBlock(5)
    //     await app.moartroller.claimMoarReward(app.user1.address)

    //     expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10006'))
    //   })
        
    //   it("multiple users", async () => {
    //     expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    //     expect(await app.moar.balanceOf(app.user2.address)).to.equal(tokens('10000'))
    //     await app.meth.connect(app.user1).mint({value: tokens('10')})
    //     await app.meth.connect(app.user2).mint({value: tokens('20')})

    //     await advanceBlock(5)
    //     await app.moartroller.claimMoarReward(app.user1.address)
    //     await advanceBlock(2)
    //     await app.moartroller.claimMoarReward(app.user2.address)

    //     expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10003'))
    //     expect(await app.moar.balanceOf(app.user2.address)).to.equal(tokens('10006'))
    //   })

    //   it("with rewardClaim disabled", async () => {
    //     await app.moartroller._setRewardClaimEnabled(false)

    //     expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    //     await app.meth.connect(app.user1).mint({value: tokens('10')})

    //     await advanceBlock(5)
    //     expectRevert(app.moartroller.claimMoarReward(app.user1.address), 'disabled')

    //     expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    //   })
    // })
  
    // describe("for borrow", () => {

    //   beforeEach(async() => {
    //     app = await setupAll()
    //     await moartroller._setMProxy(app.mproxyv1.address)
    //     await app.moartroller._setRewardClaimEnabled(true)
    //     await app.moar.transfer(app.moartroller.address, tokens('100000'))
    //     await app.dai.approve(app.mdai.address, tokens('100000'))
    //     await app.mdai.mint(tokens('100000'))
    //     await app.moartroller._setMoarSpeed(app.mdai.address, tokens('0.2'))      
    //   })

    //   it("single user", async () => {
    //     await app.meth.connect(app.user1).mint({value: tokens('10')})
    //     await app.moartroller.connect(app.user1).enterMarkets([meth.address])
  
    //     expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    //     await app.mdai.connect(app.user1).borrow(tokens('10'))

    //     await advanceBlock(5)
    //     await app.moartroller.claimMoarReward(app.user1.address)

    //     expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10001.2'))
    //   })

    //   it("multiple users", async () => {
    //     await app.meth.connect(app.user1).mint({value: tokens('10')})
    //     await app.meth.connect(app.user2).mint({value: tokens('10')})
    //     await app.moartroller.connect(app.user1).enterMarkets([meth.address])
    //     await app.moartroller.connect(app.user2).enterMarkets([meth.address])
    //     expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    //     expect(await app.moar.balanceOf(app.user2.address)).to.equal(tokens('10000'))

    //     await app.mdai.connect(app.user1).borrow(tokens('20'))
    //     await app.mdai.connect(app.user2).borrow(tokens('30'))

    //     await advanceBlock(5)
    //     await app.moartroller.claimMoarReward(app.user1.address)
    //     await advanceBlock(2)
    //     await app.moartroller.claimMoarReward(app.user2.address)

    //     expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000.680000000001343246'))
    //     expect(await app.moar.balanceOf(app.user2.address)).to.equal(tokens('10001.079999999997985129'))
    //   })

    // })

    // describe("live balance check", () => {

    //   beforeEach(async() => {
    //     app = await setupAll()
    //     await moartroller._setMProxy(app.mproxyv1.address)
    //     await app.moartroller._setRewardClaimEnabled(true)
    //     await app.moar.transfer(app.moartroller.address, tokens('100000'))
    //     await app.moartroller._setMoarSpeed(app.meth.address, tokens('1'))
    //   })

    //   it("with rewardClaim enabled", async () => {
    //     await app.meth.connect(app.user1).mint({value: tokens('10')})
    //     expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('0'))

    //     await advanceBlock(5)
    //     expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('5'))

    //     await advanceBlock(30)
    //     expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('35'))

    //     await app.moartroller._setMoarSpeed(app.meth.address, tokens('1.5'))
    //     await advanceBlock(10)
    //     expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('51'))
    //   })

    //   it("with rewardClaim disabled", async () => {
    //     await app.moartroller._setRewardClaimEnabled(false)

    //     await app.meth.connect(app.user1).mint({value: tokens('10')})
    //     expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('0'))

    //     await advanceBlock(5)
    //     expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('5'))

    //     await advanceBlock(30)
    //     expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('35'))

    //     await app.moartroller._setMoarSpeed(app.meth.address, tokens('1.5'))
    //     await advanceBlock(10)
    //     expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('51'))
    //   })

    // })

    describe("rate changes", () => {

      before(async() => {
        app = await setupAll()
        await moartroller._setMProxy(app.mproxyv1.address)
        await app.moartroller._setRewardClaimEnabled(true)
        await app.moar.transfer(app.moartroller.address, tokens('100000'))
      })

      it("set rates for the first time after period of time", async () => {
        expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
        await app.meth.connect(app.user1).mint({value: tokens('10')})

        await advanceBlock(100)
        expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('0'))

        await app.moartroller._setMoarSpeed(app.meth.address, tokens('0.1'))
        expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('0'))

        await advanceBlock(100)
        expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('9.99999995'))
       
        await app.moartroller._setMoarSpeed(app.meth.address, tokens('0'))
        await advanceBlock(100)
        expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('10.09999995'))

        await app.moartroller._setMoarSpeed(app.meth.address, tokens('0.1'))
        await advanceBlock(100)
        expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('20.09999995'))
      })

      it("set rates back to zero", async () => {
        await app.moartroller._setMoarSpeed(app.meth.address, tokens('0'))
        await advanceBlock(100)
        expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('20.19999995'))
      })

      it("set rates from value to value", async () => {
        await app.moartroller._setMoarSpeed(app.meth.address, tokens('1'))
        await advanceBlock(10)
        expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('30.19999995'))

        await app.moartroller._setMoarSpeed(app.meth.address, tokens('10'))
        await advanceBlock(10)
        expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('131.19999995'))

        await app.moartroller._setMoarSpeed(app.meth.address, tokens('1'))
        await advanceBlock(10)
        expect(await app.moartroller.callStatic.updateMoarReward(app.user1.address)).to.equal(tokens('151.19999995'))
      })


    })

  })
  