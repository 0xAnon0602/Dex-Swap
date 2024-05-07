const { Contract, ContractFactory, utils, BigNumber, constants } = require("ethers")

const WETH = require("../WETH.json")
const factoryArtifact = require('@uniswap/v2-core/build/UniswapV2Factory.json')
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
const pairArtifact = require('@uniswap/v2-periphery/build/IUniswapV2Pair.json')

async function main() {

  const [owner] = await ethers.getSigners()
  
  const Factory = new ContractFactory(factoryArtifact.abi, factoryArtifact.bytecode, owner)
  const factory = await Factory.deploy(owner.address)
  console.log('factory', factory.address)

  const Usdc = await ethers.getContractFactory('UsdCoin', owner)
  const usdc = await Usdc.deploy()
  console.log('usdc', usdc.address)

  const Usdt = await ethers.getContractFactory('Tether', owner)
  const usdt = await Usdt.deploy()
  console.log('usdt', usdt.address)

  await usdt.connect(owner).mint(
    owner.address,
    utils.parseEther('1000000')
  )
  
  await usdc.connect(owner).mint(
    owner.address,
    utils.parseEther('1000000')
  )

  const tx1 = await factory.createPair(usdt.address, usdc.address)
  await tx1.wait()

  const pairAddress = await factory.getPair(usdt.address, usdc.address);
  console.log('pairAddress1', pairAddress)

  const pair = new Contract(pairAddress, pairArtifact.abi, owner)

  let reserves = await pair.getReserves()
  console.log('reserves1', reserves)

  const Weth = new ContractFactory(WETH.abi, WETH.bytecode , owner)
  const weth = await Weth.deploy()
  console.log('weth', weth.address)

  const Router = new ContractFactory(routerArtifact.abi, routerArtifact.bytecode, owner)
  const router = await Router.deploy(factory.address, weth.address)
  console.log('router', router.address)

  const MAXUINT256 = `0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`

  const approval1 = await usdt.approve(router.address, MAXUINT256)
  await approval1.wait()

  const approval2 = await usdc.approve(router.address, MAXUINT256)
  await approval2.wait()

  const balanceUsdt = await usdt.balanceOf(owner.address)
  console.log('balanceUsdt', parseInt(balanceUsdt))

  const balanceUsdc = await usdc.balanceOf(owner.address)
  console.log('balanceUsdc', parseInt(balanceUsdc))

  const token0Amount = utils.parseUnits('10000')
  const token1Amount = utils.parseUnits('10000')

  let deadline = Math.floor( Date.now()/1000 + (10*60))

  let addLiquiditytx = await router.connect(owner).addLiquidity(
    usdt.address,
    usdc.address,
    token0Amount,
    token1Amount,
    0,
    0,
    owner.address,
    deadline,
    { gasLimit: utils.hexlify(1000000)}
  )

  await addLiquiditytx.wait()

  reserves = await pair.getReserves()
  console.log('reserves1', reserves)

  const amountsIn = utils.parseUnits('10')

  let amountOut = await router.connect(owner).getAmountsOut(
    amountsIn,
    [usdt.address, usdc.address]
  )

  let price = amountOut[1]
  console.log('price', price)

  deadline = Math.floor( Date.now()/1000 + (10*60))

  let swap = await router.connect(owner).swapExactTokensForTokens(
    amountsIn,
    price,
    [usdt.address, usdc.address],
    owner.address,
    deadline,
    { gasLimit: utils.hexlify(1000000)}
  )

  await swap.wait()
  // console.log('swap', swap)

  reserves = await pair.getReserves()
  console.log('reserves', reserves)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });