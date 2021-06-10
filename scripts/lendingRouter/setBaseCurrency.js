const LENDING_ROUTER_ADDRESS = '0x77ccD25F2Edfa9666e9C612DF9bbE83DAbc4D6a7'

async function main() {
    const LendingRouter = await ethers.getContractFactory('LendingRouter')
    lendingRouter = await LendingRouter.attach(LENDING_ROUTER_ADDRESS)  
    await lendingRouter.setBaseCurrency('0x3813a8Ba69371e6DF3A89b78bf18fC72Dd5B43c5')
}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })