const { setupToken, setupMToken, setupMEther, setupMaximillion } = require('./../../test/utils/setupContracts')
const { tokens } = require('./../../test/utils/testHelpers')

let owner, user1, user2, user3, user4
let dai, wbtc, usdc, unn


async function main() {

    [owner, user1, user2, user3, user4] = await ethers.getSigners()
    
    // BASIC TOKENS 

    console.log("Deploying DAI")
    dai  = await setupToken('Dai', 18, '1000000000', '10000', [(await ethers.provider.getNetwork()).chainId])
    console.log("DAI deployed!\n")

    console.log("Deploying WBTC")
    wbtc = await setupToken('WBTC', 8, '1000000000', '10000', [])
    console.log("WBTC deployed!\n")

    console.log("Deploying WETH")
    weth = await setupToken('WETH9', 18, '0', '0')
    console.log("WETH deployed!\n")

    console.log("Deploying USDC")
    usdc = await setupToken('FiatTokenV2', 6, '1000000000', '10000', [], async (token) => {
              tx = await token.initialize('USDC', 'USDC', 'USD', 6, owner.address, owner.address, owner.address, owner.address)
              await tx.wait()
              tx = await token.configureMinter(owner.address, '100000000000000000000')
              await tx.wait()
          })
    console.log("USDC deployed!\n")

    console.log("Deploying UNN")
    unn  = await setupToken('TestUnionGovernanceToken', 18, '0', '0', [owner.address, tokens('1000040000')], async (token) => {
                tx = await token.setCanTransfer(true)
                await tx.wait()
                tx = await token.setReversion(true)
                await tx.wait()
                tx = await token.transfer(user1.address, tokens('10000'))
                await tx.wait()
                tx = await token.transfer(user2.address, tokens('10000'))
                await tx.wait()
                tx = await token.transfer(user3.address, tokens('10000'))
                await tx.wait()
                tx = await token.transfer(user4.address, tokens('10000'))
                await tx.wait()
            })
    console.log("UNN deployed!\n")

    console.log("Deploying MOAR")
    moar  = await setupToken('MoarMockToken', 18, '0', '0', [tokens('10000000000000')])
    console.log("MOAR deployed!\n")

    console.log(
       {
        "DAI address": dai.address,
        "WBTC address": wbtc.address,
        "USDC address": usdc.address,
        "UNN address": unn.address,
        "MOAR address": moar.address
       }
    )
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })