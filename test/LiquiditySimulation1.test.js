const { tokens, getEventsFromTransaction } = require('./utils/testHelpers')
const setupAll = require('./utils/setupAllMocked')
const { expectEvent, expectNoEvent } = require('./utils/expectAddons');
const { expect } = require("chai");

let app

describe("Liquidity Simulation 1", () => {

  beforeEach(async () => {
    app = await setupAll()
    await app.moartroller._setCollateralFactor(app.cdai.address, tokens('0.9'))
    await app.moartroller._setCollateralFactor(app.cwbtc.address, tokens('0.6'))
    await app.moartroller._setCollateralFactor(app.cusdc.address, tokens('0.9'))
    await app.moartroller._setCollateralFactor(app.cunn.address, tokens('0.4'))
    await app.moartroller._setCollateralFactor(app.ceth.address, tokens('0.5'))
  })

  it("Test case 1 with protection", async () => {
    await app.dai.connect(app.user2).approve(app.cdai.address, tokens('8000'))
    await app.cdai.connect(app.user2).mint(tokens('8000'))

    // ------
    // DAY 1
    // -----
    // Set price and MPC
    await app.oracle.setUnderlyingPrice(app.ceth.address, tokens('1000'))
    await app.ceth._setMaxProtectionComposition(2500)
    await app.moartroller._setCollateralFactor(app.ceth.address, tokens('0.5'))


    // Deposit ETH
    await app.ceth.connect(app.user1).mint({value: tokens('2')})
    await app.moartroller.connect(app.user1).enterMarkets([app.cdai.address, app.ceth.address])

    let accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('1000'))

    let daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('10000'))

    // Create a protection 
    await app.uunn.createProtection(app.user1.address, app.weth.address, tokens('10'), tokens('1000'), tokens('15'));
    await app.uunn.connect(app.user1).approve(app.cuunn.address, 1)
    await app.cuunn.connect(app.user1).mint(1)
    await app.cuunn.connect(app.user1).lockProtectionValue(1, tokens("0"))

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('1250'))

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('10000'))

    // Take a borrow
    await expectEvent(app.cdai.connect(app.user1).borrow(tokens('1000')), 'Borrow', {borrower: app.user1.address, borrowAmount: tokens('1000')})

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('250'))

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('11000'))

    // ------
    // DAY 2
    // -----
    // Set new price
    await app.oracle.setUnderlyingPrice(app.ceth.address, tokens('1500'))

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('875'))

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('11000'))

    // Create new protection
    await app.uunn.createProtection(app.user1.address, app.weth.address, tokens('10'), tokens('1500'), tokens('25'));
    await app.uunn.connect(app.user1).approve(app.cuunn.address, 2)
    await app.cuunn.connect(app.user1).mint(2)
    await app.cuunn.connect(app.user1).lockProtectionValue(2, tokens("0"))

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('1000'))

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('11000'))

    // Take another borrow
    await expectEvent(app.cdai.connect(app.user1).borrow(tokens('500')), 'Borrow', {borrower: app.user1.address, borrowAmount: tokens('500')})

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('499.999982509808354000')) //interest fee applied

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('11500'))
  })

  it("Test case 1 without protection", async () => {
    await app.dai.connect(app.user2).approve(app.cdai.address, tokens('8000'))
    await app.cdai.connect(app.user2).mint(tokens('8000'))
    
    // ------
    // DAY 1
    // -----
    // Set price and MPC
    await app.oracle.setUnderlyingPrice(app.ceth.address, tokens('1000'))
    await app.ceth._setMaxProtectionComposition(2500)

    // Deposit ETH
    await app.ceth.connect(app.user1).mint({value: tokens('2')})
    await app.moartroller.connect(app.user1).enterMarkets([app.cdai.address, app.ceth.address])

    let accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('1000'))

    let daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('10000'))

    // Take a borrow
    await expectEvent(app.cdai.connect(app.user1).borrow(tokens('1000')), 'Borrow', {borrower: app.user1.address, borrowAmount: tokens('1000')})

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('0'))

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('11000'))

    // ------
    // DAY 2
    // -----
    // Set new price
    await app.oracle.setUnderlyingPrice(app.ceth.address, tokens('1500'))

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('500'))

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('11000'))

    // Take another borrow
    await expectNoEvent(app.cdai.connect(app.user1).borrow(tokens('500')), 'Borrow')

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('499.999994169936118000')) //interest fee applied

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('11000'))
  })

  it("Test case 2 with protection", async () => {
    await app.dai.connect(app.user2).approve(app.cdai.address, tokens('8000'))
    await app.cdai.connect(app.user2).mint(tokens('8000'))

    // ------
    // DAY 1
    // -----
    // Set price and MPC
    await app.oracle.setUnderlyingPrice(app.ceth.address, tokens('1000'))
    await app.ceth._setMaxProtectionComposition(2500)
    await app.moartroller._setCollateralFactor(app.ceth.address, tokens('0.5'))

    // Deposit ETH
    await app.ceth.connect(app.user1).mint({value: tokens('20')})
    await app.moartroller.connect(app.user1).enterMarkets([app.cdai.address, app.ceth.address])

    let accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('10000'))

    let daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('10000'))

    // Create a protection 
    await app.uunn.createProtection(app.user1.address, app.weth.address, tokens('10'), tokens('1000'), tokens('15'));
    await app.uunn.connect(app.user1).approve(app.cuunn.address, 1)
    await app.cuunn.connect(app.user1).mint(1)
    await app.cuunn.connect(app.user1).lockProtectionValue(1, tokens("0"))

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('12500'))

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('10000'))

    // Take a borrow
    await expectEvent(app.cdai.connect(app.user1).borrow(tokens('1000')), 'Borrow', {borrower: app.user1.address, borrowAmount: tokens('1000')})

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('11500'))

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('11000'))

    // ------
    // DAY 2
    // -----
    // Set new price
    await app.oracle.setUnderlyingPrice(app.ceth.address, tokens('1500'))

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('17750'))

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('11000'))

    // Create new protection
    await app.uunn.createProtection(app.user1.address, app.weth.address, tokens('10'), tokens('1500'), tokens('20'));
    await app.uunn.connect(app.user1).approve(app.cuunn.address, 2)
    await app.cuunn.connect(app.user1).mint(2)
    await app.cuunn.connect(app.user1).lockProtectionValue(2, tokens("0"))

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('19000'))

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('11000'))

    // Take another borrow
    await expectEvent(app.cdai.connect(app.user1).borrow(tokens('500')), 'Borrow', {borrower: app.user1.address, borrowAmount: tokens('500')})

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal('18499999982509808354000') //interest fee applied

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('11500'))
  })

  it("Test case 2 without protection", async () => {
    await app.dai.connect(app.user2).approve(app.cdai.address, tokens('8000'))
    await app.cdai.connect(app.user2).mint(tokens('8000'))
    
    // ------
    // DAY 1
    // -----
    // Set price and MPC
    await app.oracle.setUnderlyingPrice(app.ceth.address, tokens('1000'))
    await app.ceth._setMaxProtectionComposition(2500)

    // Deposit ETH
    await app.ceth.connect(app.user1).mint({value: tokens('20')})
    await app.moartroller.connect(app.user1).enterMarkets([app.cdai.address, app.ceth.address])

    let accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('10000'))

    let daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('10000'))

    // Take a borrow
    await expectEvent(app.cdai.connect(app.user1).borrow(tokens('1000')), 'Borrow', {borrower: app.user1.address, borrowAmount: tokens('1000')})

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('9000'))

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('11000'))

    // ------
    // DAY 2
    // -----
    // Set new price
    await app.oracle.setUnderlyingPrice(app.ceth.address, tokens('1500'))

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal(tokens('14000'))

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('11000'))

    // Take another borrow
    await expectEvent(app.cdai.connect(app.user1).borrow(tokens('500')), 'Borrow', {borrower: app.user1.address, borrowAmount: tokens('500')})

    accountLiquidity = (await app.moartroller.getAccountLiquidity(app.user1.address))[1]
    expect(accountLiquidity.toString()).to.equal('13499999994169936118000') //interest fee applied

    daiBalance = (await app.dai.balanceOf(app.user1.address))
    expect(daiBalance.toString()).to.equal(tokens('11500'))
  })

})
