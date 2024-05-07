import { createWeb3Modal, defaultConfig, useWeb3Modal, useWeb3ModalProvider, useWeb3ModalAccount} from '@web3modal/ethers5/react'
import { Button } from 'antd';

function Header() {

  const projectId = '8a7d81605e0daa9ccdbf19443b1cf9b9'

  const fantonmTestnet = {
    chainId: 4002,
    name: 'Fantom-Testnet',
    currency: 'FTM',
    explorerUrl: 'https://testnet.ftmscan.com',
    rpcUrl: 'https://rpc.testnet.fantom.network'
  }

  const metadata = {
    name: '0xAnon Dapp',
    description: 'My Website description',
    url: 'https://mywebsite.com', // origin must match your domain & subdomain
    icons: ['https://avatars.mywebsite.com/']
  }

  const { address, isConnected } = useWeb3ModalAccount()

  const ethersConfig = defaultConfig({
    metadata,
  })

  const model = createWeb3Modal({
    ethersConfig,
    chains: [fantonmTestnet],
    projectId,
  })
  
  
  const {open} = useWeb3Modal()

  return (
    <div className="App">

      <div className="navbar">
      {!isConnected ? (
        <Button onClick={open} type="primary">Connect Wallet</Button>
      ):(
        <>
          <Button className='address' type="primary">{address.substring(0,12)}</Button>
          <Button  onClick={ () => model.disconnect() } type="primary">Disconnect</Button>
        </>
      )
      }     
      </div>


    </div>
  );

}

export default Header;