const setupAll = require('./../../test/utils/setupAllMocked')

async function main() {
    app = await setupAll()

    console.log(
       {
        "DAI address": app.dai.address,
        "WBTC address": app.wbtc.address,
        "USDC address": app.usdc.address,
        "UNN address": app.unn.address,
        "WETH address": app.weth.address,
        "cDAI address": app.cdai.address,
        "cWBTC address": app.cwbtc.address,
        "cUSDC address": app.cusdc.address,
        "cUNN address": app.cunn.address,
        "cEther address": app.ceth.address,
        "uUNN address": app.uunn.address,
        "cuUNN address": app.cuunn.address,
        "Moartroller address": app.moartroller.address,
        "Oracle address": app.oracle.address,
        "Maximillion address":app. maximillion.address,
        "LendingRouter address": app.lendingRouter.address
       }
    )
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })