const moartrollerAddress    = '0x802A92B277348299ef766CF6b777921F6a8390Cc'

const MoarTokenAddress      = '0x03f2b2B8A3c1F37F1fE304472D4028e395429c52'
const MProtectionAddress    = '0x3740b7c6d133441DFA342339673B0c4C3603616D'
const LendingRouterAddress  = '0xe632441C31e33a1d57fae39CA0a1a04555cecbE7'


async function main() {
    const { tokens } = require('./../../test/utils/testHelpers')

    const Moartroller = await ethers.getContractFactory("Moartroller")
    moartroller = await Moartroller.attach(moartrollerAddress)

    console.log(`[Moartroller] Setting MOAR token...`)
    tx = await moartroller._setMoarToken(MoarTokenAddress)
    await tx.wait()
    console.log(`[Moartroller] MOAR token set!`)

    console.log(`[Moartroller] Setting MProtection...`)
    tx = await moartroller._setProtection(MProtectionAddress)
    await tx.wait()
    console.log(`[Moartroller] MProtection set!`)

    console.log(`[Moartroller] Setting LendingRouter as privileged address...`)
    tx = await moartroller._addPrivilegedAddress(LendingRouterAddress)
    await tx.wait()
    console.log(`[Moartroller] Privileged address set!`)
  
    console.log(`[Moartroller] Setting LiquidationIncentive...`)
    tx = await moartroller._setLiquidationIncentive(tokens('1.1'))
    await tx.wait()
    console.log(`[Moartroller] LiquidationIncentive set!`)
  
    console.log(`[Moartroller] Setting CloseFactor...`)
    tx = await moartroller._setCloseFactor(tokens('0.5'))
    await tx.wait()
    console.log(`[Moartroller] CloseFactor set!`)
  
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })