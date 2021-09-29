// const UnionRouterAddress    = '0xB72a9BBB6a43Aed80DB482ccbb6A0B788e416785' //main
const UnionRouterAddress    = '0x70CBfC1B9E9E50B84b5E8074692ccCbd98a7146e' //rinkeby

async function main() {
    unionRouter = await ethers.getContractAt("IUnionRouter", UnionRouterAddress)

    // tx = await unionRouter.uunnToken()
    tx = await unionRouter.collateralProtection('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
    console.log(tx)

}   

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })