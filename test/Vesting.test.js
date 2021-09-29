const setupAll = require('./utils/setupAllMocked')
const { tokens, toTokens, fromTokens, advanceBlock, increaseTime } = require('./utils/testHelpers')
const { expect } = require("chai");

let app;

 describe("Vesting", () => {

  beforeEach(async() => {
    app = await setupAll()
    await app.moartroller._setRewardClaimEnabled(true)
    await app.moar.transfer(app.moartroller.address, tokens('100000'))
    await app.moartroller._setMoarSpeed(app.meth.address, tokens('1'))
  })

  it("get vested tokens and early exit", async () => {
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    await app.meth.connect(app.user1).mint({value: tokens('10')})

    await advanceBlock(5)
    await app.moartroller.claimMoarReward(app.user1.address);
    [amount, penalty] = await app.vesting.withdrawableBalance(app.user1.address)

    expect(amount).to.equal(tokens('1.799999985'))
    expect(penalty).to.equal(tokens('4.199999965'))
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    expect(await app.vesting.totalBalance(app.user1.address)).to.equal(tokens('5.99999995'))
    expect(await app.vesting.totalSupply()).to.equal(tokens('5.99999995'))
    expect(await app.vesting.lockedSupply()).to.equal(tokens('0'))

    await app.vesting.connect(app.user1).earlyExitVests();
    [amount, penalty] = await app.vesting.withdrawableBalance(app.user1.address)

    expect(amount).to.equal(tokens('0'))
    expect(penalty).to.equal(tokens('0'))
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10001.799999985'))
    expect(await app.vesting.totalBalance(app.user1.address)).to.equal(tokens('0'))
    expect(await app.vesting.totalSupply()).to.equal(tokens('0'))
    expect(await app.vesting.lockedSupply()).to.equal(tokens('0'))
  })

  it("get vested tokens and wait to exit", async () => {
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    await app.meth.connect(app.user1).mint({value: tokens('10')})

    await advanceBlock(5)
    await app.moartroller.claimMoarReward(app.user1.address);
    [amount, penalty] = await app.vesting.withdrawableBalance(app.user1.address)

    expect(amount).to.equal(tokens('1.799999985'))
    expect(penalty).to.equal(tokens('4.199999965'))
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    expect(await app.vesting.totalBalance(app.user1.address)).to.equal(tokens('5.99999995'))
    expect(await app.vesting.totalSupply()).to.equal(tokens('5.99999995'))
    expect(await app.vesting.lockedSupply()).to.equal(tokens('0'))

    await increaseTime(60*60*24*7*13)
    await app.vesting.connect(app.user1).earlyExitVests();

    [amount, penalty] = await app.vesting.withdrawableBalance(app.user1.address)

    expect(amount).to.equal(tokens('5.99999995'))
    expect(penalty).to.equal(tokens('0'))
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    expect(await app.vesting.totalBalance(app.user1.address)).to.equal(tokens('5.99999995'))
    expect(await app.vesting.totalSupply()).to.equal(tokens('5.99999995'))
    expect(await app.vesting.lockedSupply()).to.equal(tokens('0'))
  })

  it("get vested tokens and early withdrawUnlockedStake", async () => {
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    await app.meth.connect(app.user1).mint({value: tokens('10')})

    await advanceBlock(5)
    await app.moartroller.claimMoarReward(app.user1.address);
    [amount, penalty] = await app.vesting.withdrawableBalance(app.user1.address)

    expect(amount).to.equal(tokens('1.799999985'))
    expect(penalty).to.equal(tokens('4.199999965'))
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    expect(await app.vesting.totalBalance(app.user1.address)).to.equal(tokens('5.99999995'))
    expect(await app.vesting.totalSupply()).to.equal(tokens('5.99999995'))
    expect(await app.vesting.lockedSupply()).to.equal(tokens('0'))

    await app.vesting.connect(app.user1).withdrawUnlockedStake();
    [amount, penalty] = await app.vesting.withdrawableBalance(app.user1.address)

    expect(amount).to.equal(tokens('1.799999985'))
    expect(penalty).to.equal(tokens('4.199999965'))
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    expect(await app.vesting.totalBalance(app.user1.address)).to.equal(tokens('5.99999995'))
    expect(await app.vesting.totalSupply()).to.equal(tokens('5.99999995'))
    expect(await app.vesting.lockedSupply()).to.equal(tokens('0'))
  })

  it("get vested tokens, wait and withdrawUnlockedStake", async () => {
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    await app.meth.connect(app.user1).mint({value: tokens('10')})

    await advanceBlock(5)
    await app.moartroller.claimMoarReward(app.user1.address);
    [amount, penalty] = await app.vesting.withdrawableBalance(app.user1.address)

    expect(amount).to.equal(tokens('1.799999985'))
    expect(penalty).to.equal(tokens('4.199999965'))
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    expect(await app.vesting.totalBalance(app.user1.address)).to.equal(tokens('5.99999995'))
    expect(await app.vesting.totalSupply()).to.equal(tokens('5.99999995'))
    expect(await app.vesting.lockedSupply()).to.equal(tokens('0'))

    await increaseTime(60*60*24*7*13)
    await app.vesting.connect(app.user1).withdrawUnlockedStake();
    [amount, penalty] = await app.vesting.withdrawableBalance(app.user1.address)

    expect(amount).to.equal(tokens('0'))
    expect(penalty).to.equal(tokens('0'))
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10005.99999995'))
    expect(await app.vesting.totalBalance(app.user1.address)).to.equal(tokens('0'))
    expect(await app.vesting.totalSupply()).to.equal(tokens('0'))
    expect(await app.vesting.lockedSupply()).to.equal(tokens('0'))
  })
      
  it("stake without lock and withdrawUnlockedStake", async () => {
    await app.moar.connect(app.user1).approve(app.vesting.address, tokens('5'))
    await app.vesting.connect(app.user1).stake(tokens('5'), false);
    let [amount, penalty] = await app.vesting.withdrawableBalance(app.user1.address)

    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('9995'))
    expect(amount).to.equal(tokens('5'))
    expect(penalty).to.equal(tokens('0'))
    expect(await app.vesting.totalBalance(app.user1.address)).to.equal(tokens('5'))
    expect(await app.vesting.totalSupply()).to.equal(tokens('5'))
    expect(await app.vesting.lockedSupply()).to.equal(tokens('0'))

    await app.vesting.connect(app.user1).withdrawUnlockedStake();
    [amount, penalty] = await app.vesting.withdrawableBalance(app.user1.address)

    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    expect(amount).to.equal(tokens('0'))
    expect(penalty).to.equal(tokens('0'))
    expect(await app.vesting.totalBalance(app.user1.address)).to.equal(tokens('0'))
    expect(await app.vesting.totalSupply()).to.equal(tokens('0'))
    expect(await app.vesting.lockedSupply()).to.equal(tokens('0'))
  })

  it("stake, get vested tokens and early withdrawUnlockedStake", async () => {
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    await app.meth.connect(app.user1).mint({value: tokens('10')})
    await app.moar.connect(app.user1).approve(app.vesting.address, tokens('5'))
    await app.vesting.connect(app.user1).stake(tokens('5'), false);
    await advanceBlock(3)
    await app.moartroller.claimMoarReward(app.user1.address);
    [amount, penalty] = await app.vesting.withdrawableBalance(app.user1.address)

    expect(amount).to.equal(tokens('6.799999985'))
    expect(penalty).to.equal(tokens('4.199999965'))
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('9995'))
    expect(await app.vesting.totalBalance(app.user1.address)).to.equal(tokens('10.99999995'))
    expect(await app.vesting.totalSupply()).to.equal(tokens('10.99999995'))
    expect(await app.vesting.lockedSupply()).to.equal(tokens('0'))

    await app.vesting.connect(app.user1).withdrawUnlockedStake();
    [amount, penalty] = await app.vesting.withdrawableBalance(app.user1.address)

    expect(amount).to.equal(tokens('1.799999985'))
    expect(penalty).to.equal(tokens('4.199999965'))
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    expect(await app.vesting.totalBalance(app.user1.address)).to.equal(tokens('5.99999995'))
    expect(await app.vesting.totalSupply()).to.equal(tokens('5.99999995'))
    expect(await app.vesting.lockedSupply()).to.equal(tokens('0'))
  })

  it("stake, get vested tokens, wait and withdrawUnlockedStake", async () => {
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10000'))
    await app.meth.connect(app.user1).mint({value: tokens('10')})
    await app.moar.connect(app.user1).approve(app.vesting.address, tokens('5'))
    await app.vesting.connect(app.user1).stake(tokens('5'), false);
    await advanceBlock(3)
    await app.moartroller.claimMoarReward(app.user1.address);
    [amount, penalty] = await app.vesting.withdrawableBalance(app.user1.address)

    expect(amount).to.equal(tokens('6.799999985'))
    expect(penalty).to.equal(tokens('4.199999965'))
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('9995'))
    expect(await app.vesting.totalBalance(app.user1.address)).to.equal(tokens('10.99999995'))
    expect(await app.vesting.totalSupply()).to.equal(tokens('10.99999995'))
    expect(await app.vesting.lockedSupply()).to.equal(tokens('0'))

    await increaseTime(60*60*24*7*13)
    await app.vesting.connect(app.user1).withdrawUnlockedStake();
    [amount, penalty] = await app.vesting.withdrawableBalance(app.user1.address)

    expect(amount).to.equal(tokens('0'))
    expect(penalty).to.equal(tokens('0'))
    expect(await app.moar.balanceOf(app.user1.address)).to.equal(tokens('10005.99999995'))
    expect(await app.vesting.totalBalance(app.user1.address)).to.equal(tokens('0'))
    expect(await app.vesting.totalSupply()).to.equal(tokens('0'))
    expect(await app.vesting.lockedSupply()).to.equal(tokens('0'))
  })

})
