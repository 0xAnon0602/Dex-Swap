import {Input, Popover, Radio, Modal} from 'antd'
import {ArrowDownOutlined, SettingOutlined} from '@ant-design/icons'
import { useState, useEffect } from 'react'
import tokenList from '../tokenList.json'
import { useWeb3ModalProvider, useWeb3ModalAccount} from '@web3modal/ethers5/react'
import { utils, Contract, providers } from 'ethers'

import { routerABI } from '../routerABI.js'
import { tokenABI } from '../tokenABI.js'
const routerAddress = "0xe646114957c60C76634Cd8D87005a76D13e9c984"

function Swap() {

    const { address, isConnected } = useWeb3ModalAccount()
    const { walletProvider } = useWeb3ModalProvider()
    const [isOpen, setIsOpen] = useState(false)
    const [slippage, setSlippage] = useState(2.5)
    const [tokenOneAmount, setTokenOneAmount] = useState(0)
    const [tokenTwoAmount, setTokenTwoAmount] = useState(0)
    const [tokenTwo, setTokenTwo] = useState(tokenList[1])
    const [tokenOne, setTokenOne] = useState(tokenList[0])
    const [changeToken, setChangeToken] = useState(1)
    const [tokenOneBalance, setTokenOneBalance] = useState(0)
    const [tokenTwoBalance, setTokenTwoBalance] = useState(0)
    const [tokenOneApprove, setTokenOneApprove] = useState(true)
    const [tokenTwoApprove, setTokenTwoApprove] = useState(true)

    const getAmountsOutFunction = async(_newAmount) => {

      if(_newAmount !== 0){

        const ethersProvider = new providers.Web3Provider(walletProvider)
        const signer = ethersProvider.getSigner()
        const routerContract = new Contract(routerAddress, routerABI, signer)

        const result = await routerContract.getAmountsOut(
          utils.parseEther(_newAmount),
          [tokenOne.address,tokenTwo.address]
        )

        setTokenTwoAmount(Number((utils.formatEther(result[1]))).toFixed(2))

      }else{
        setTokenTwoAmount('')
      }

    }

    const swapFunction = async() => {

      const ethersProvider = new providers.Web3Provider(walletProvider)
      const signer = ethersProvider.getSigner()
      const routerContract = new Contract(routerAddress, routerABI, signer)

      const result = await routerContract.swapExactTokensForTokens(
        utils.parseEther(tokenOneAmount),
        utils.parseEther(String((tokenTwoAmount*(100-slippage))/100)),
        [tokenOne.address,tokenTwo.address],
        address,
        Math.floor( Date.now()/1000 + (10*60)),
        { gasLimit: utils.hexlify(1000000)}
      )

      await result.wait()
      console.log(result)
      getAllBalances()
 
    }

    const approveFunction = async(_type) => {

      const ethersProvider = new providers.Web3Provider(walletProvider)
      const signer = ethersProvider.getSigner()
      const MAXUINT256 = `0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`

      if(_type === 1){

        let tokenContract = new Contract(tokenOne.address, tokenABI, signer)
        let tx = await tokenContract.approve(routerAddress, MAXUINT256)
        const receipt = await tx.wait()
        console.log(receipt)
        await getAllowances()

      }else if(_type === 2){

        let tokenContract = new Contract(tokenTwo.address, tokenABI, signer)
        let tx = await tokenContract.approve(routerAddress, MAXUINT256)
        const receipt = await tx.wait()
        console.log(receipt)
        await getAllowances()

      }

    }

    const getAllBalances = async() => {
      
      const ethersProvider = new providers.Web3Provider(walletProvider)
      const signer = ethersProvider.getSigner()

      let tokenContract = new Contract(tokenOne.address, tokenABI, signer)
      let tokenBalance = utils.formatEther(await tokenContract.balanceOf(address))
      setTokenOneBalance(parseInt(tokenBalance))

      tokenContract = new Contract(tokenTwo.address, tokenABI, signer)
      tokenBalance = utils.formatEther(await tokenContract.balanceOf(address))
      setTokenTwoBalance(parseInt(tokenBalance))

    }

    const getAllowances = async() => {

      const ethersProvider = new providers.Web3Provider(walletProvider)
      const signer = ethersProvider.getSigner()

      let tokenContract = new Contract(tokenOne.address, tokenABI, signer)
      let allowanceBalance = parseInt(await tokenContract.allowance(address,routerAddress))
      console.log(allowanceBalance)
      setTokenOneApprove(allowanceBalance > 0)

      tokenContract = new Contract(tokenTwo.address, tokenABI, signer)
      allowanceBalance = parseInt(await tokenContract.allowance(address,routerAddress))
      console.log(allowanceBalance)
      setTokenTwoApprove(allowanceBalance > 0)

    }

    const modifyToken = (i) => {
        setTokenOneAmount(0)
        setTokenTwoAmount(0)

        if (changeToken === 1) {
          if(tokenTwo.address !== tokenList[i].address) setTokenOne(tokenList[i])
        } else {
          if(tokenOne.address !== tokenList[i].address) setTokenTwo(tokenList[i])
        }
        setIsOpen(false)
        getAllBalances()
    }

    const handleSlippage = (e) => {
        setSlippage(e.target.value)
    } 

    const switchTokens = () => {
        setTokenOneAmount(0)
        setTokenTwoAmount(0)
        setTokenOne(tokenTwo)
        setTokenTwo(tokenOne)
        getAllBalances()
        getAmountsOutFunction(tokenOneAmount)
    }

    const changeAmount = (e) => {

      if(e.target.value) {
        setTokenOneAmount(String(parseInt(e.target.value)))
        getAmountsOutFunction(String(parseInt(e.target.value)))
      }else {
        setTokenOneAmount('')
        getAmountsOutFunction(0)
      }
   
    }

    const openModal = (token) => {
    setChangeToken(token)
    setIsOpen(true)
    }
      

    const settingsContent = (
        <>
        <div>Slippage Tolerance</div>
        <div>
        <Radio.Group onChange={handleSlippage} value={slippage}>
            <Radio.Button value={0.5}>0.5%</Radio.Button>
            <Radio.Button value={2.5}>2.5%</Radio.Button>
            <Radio.Button value={5}>5%</Radio.Button>
        </Radio.Group>
        </div>
        </>
    )

    useEffect( () => {
      if(isConnected){
        getAllowances()
        getAllBalances()
      }      
    }, [isConnected,address])


    return (
        <div className='swapModel'>
        <p className='title'>DEX SWAP</p>
        <Modal open={isOpen} footer={null} onCancel={()=> {setIsOpen(false)}} title="Select a token">
        
        <div className='modalContent'>
          {tokenList?.map((token, index) => {
            return (
              <div className='tokenChoice' key={index} 
              onClick={() => modifyToken(index)}
              >
                <img src={token.img} alt={token.ticker} className="tokenLogo"/>
                <div className='tokenChoiceNames'>
                  <div className='tokenName'> 
                    {token.name}
                  </div>
                  <div className='tokenTicker'>
                    {token.ticker}
                    </div>
                </div>
                </div>
            )
          })}
        </div>
        </Modal>
        <div className='tradeBox'>
          <div className='tradeBoxHeader'>
            <h4>Swap</h4>
            <Popover
            title='Settings'
            trigger='click'
            placement='bottomRight'
            content={settingsContent}
            >
            <SettingOutlined className='cog'/>
            </Popover>
          </div>
          <div className='inputs'>
          <Input placeholder='0' value={tokenOneAmount} onChange={changeAmount}/>
          <span className='firstBalance'>Balance: {tokenOneBalance} </span>
          <Input placeholder='0' value={tokenTwoAmount} disabled={true} />
          <span className='secondBalance'>Balance: {tokenTwoBalance} </span>
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className='switchArrow'/>
          </div> 
          <div className='assetOne' onClick={()=> openModal(1)}>
            <img src={tokenOne.img} alt="assetOnelogo" className='logo'/>
            {tokenOne.ticker}
          </div>
          <div className='assetTwo' onClick={()=> openModal(2)}>
          <img src={tokenTwo.img} alt="assetTwologo" className='logo' />
            {tokenTwo.ticker}
          </div>
        </div>

        {tokenOneApprove && tokenTwoApprove &&(
          <div className='swapButton' onClick={swapFunction}  disabled={!tokenOneAmount || !isConnected || tokenOneAmount > tokenOneBalance}>
            Swap
          </div>
        )}

        {!tokenOneApprove && (
          <div className='swapButton' onClick={() => approveFunction(1)}  disabled={!isConnected}>
            Approve {tokenOne.name}
          </div>
        )}

        {tokenOneApprove && !tokenTwoApprove && (
          <div className='swapButton' onClick={() => approveFunction(2)}  disabled={!isConnected}>
            Approve {tokenTwo.name}
          </div>
        )}
          
        </div>
        </div>
      )


}

export default Swap;