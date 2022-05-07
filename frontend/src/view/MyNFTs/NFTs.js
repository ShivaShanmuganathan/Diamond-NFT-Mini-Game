import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { Flex, Text } from "crox-new-uikit";
import { Icon } from '@iconify/react';
import useMediaQuery from "use-mediaquery";
import { WalletConnect } from "../../components/Gadget";
import { NFTGAME_CONTRACT_ADDRESS, transformCharacterData } from "../../utils/constants";
import myEpicGame from '../../utils/MyEpicGame.json'
import awesomeGame from '../../utils/awesomeGame.json';
import TextField from '@mui/material/TextField';
import Empty from '../../components/Gadget/Empty'
import ScrollArea from 'react-scrollbar'
import './nft.scss';


function MyNFTs(props) {
    const { collapse } = props
    const { account } = useWeb3React()
    const isMobile = useMediaQuery("(max-width: 600px)")
    const [nfts, setNfts] = useState([])
    const [tokens, setTokens] = useState([])
    const [formInput, updateFormInput] = useState({ price: '',maxRental: ''})
    const [loadingState, setLoadingState] = useState('not-loaded')
    const [gameContract, setGameContract] = useState(null);
    
    useEffect(() => {

      if(account){
        loadNFTs()
      }

    }, [account])
    
    
    async function loadNFTs() {

        console.log('Loading NFTs For User Address:', account);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const gameContract = new ethers.Contract(
            NFTGAME_CONTRACT_ADDRESS,
            awesomeGame.abi,
            signer
        );
        setGameContract(gameContract);
        const [txn, tokenArray] = await gameContract.fetchMyUnListedNFTs();
        if (txn[0]) {
            console.log('User has character NFT');
            // setCharacterNFT(txn)
            const items = await Promise.all(txn.map(async characterData => {
                
                let item = {
                    name: characterData.name,
                    image: characterData.imageURI,
                    hp: characterData.hp.toNumber(),
                    maxHp: characterData.maxHp.toNumber(),
                    attackDamage: characterData.attackDamage.toNumber(),
                    levels: characterData.levels
                }

                return item
            }))
            
            const tokenItems = await Promise.all(tokenArray.map(async tokenData => {
                
              let tokenItem = tokenData.toString();

              return tokenItem
            }))

            console.log("tokenArray return ", tokenItems)
            
            setNfts(items)
            setTokens(tokenItems)
            
        } else {
            console.log('No Character NFT Found');
            setNfts([])
            setTokens([])
        }
        
        

        console.log("Works Until Here");
        // console.log("Time Now in JS World", (Math.floor(Date.now() / 1000)))
        // console.log(data);        
        setLoadingState('loaded')
    }

    async function listForRent(tokenID) {
        /* needs the user to sign the transaction, so will use Web3Provider and sign it */
        // await checkNetwork();
        // const web3Modal = new Web3Modal()
        // const connection = await web3Modal.connect()
        // const provider = new ethers.providers.Web3Provider(connection)
        // const signer = provider.getSigner()
        // const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        // const transaction = await contract.finishRenting(nft.itemId)
        // await transaction.wait()
        
        // const { price, maxRental } = formInput
        const price = ethers.utils.parseUnits(formInput.price, 'ether');
        const maxRental = formInput.maxRental;
        console.log("Checkpoint 1 Reached!")
        // console.log("Rental Price", price)
        // console.log("Maximum Rental Time", maxRental)
        if (!price || !maxRental || tokenID==0) return

        console.log("Checkpoint 2 Reached!")
        console.log("Selected TokenID", tokenID)
        console.log("Rental Price", price)
        console.log("Maximum Rental Time", maxRental)
        console.log();

        let overrides = {

          // The maximum units of gas for the transaction to use
          gasLimit: 3000000,
                    
      
          // The price (in wei) per unit of gas
          //gasPrice: utils.parseUnits('9.0', 'gwei'),
      
          // The nonce to use in the transaction
          // nonce: 234,
      
          // The amount to send with the transaction (i.e. msg.value)
          // value: ethers.utils.parseEther('0.1'),
      
          // The chain ID (or network ID) to use
          //chainId: 4
      
      };

        const listTxn = await gameContract.listNFT(tokenID, price, maxRental, overrides);
        await listTxn.wait();

        loadNFTs()
    }

    
    // if (loadingState === 'loaded' && !nfts.length) return (
    //     (
    //         <div>
    //         <h1 className="default">No Assets Found</h1>
    //         <lottie-player
    //             autoplay
    //             loop
    //             mode="normal"
    //             src="https://assets2.lottiefiles.com/packages/lf20_aBYmBC.json"
    //             style={{ width: "320px" }}
    //         >

    //         </lottie-player>
    //         </div>
    //     )
    // )
    return (

      <Flex className='card_group'>
      <ScrollArea
          speed={1}
          className="area"
          contentClassName="content"
          smoothScrolling
          verticalContainerStyle={{ borderRadius: '10px' }}
          verticalScrollbarStyle={{ borderRadius: '10px' }}
      >
          {nfts.length > 0 && (
              <Flex flexDirection='column'>

                  <div className="grid-container">
                      {
                      nfts.map((nft, i) => (
                          
                          <div key={i} className="grid-item">

                          <img src={nft.image} className="wrapper5" />

                          <div className="wrapper6">
                              <Flex alignItems='center' mb='10px'>
                                  <Text fontSize="18px" ml='3px' bold>{nft.name.toUpperCase()}</Text>
                              </Flex>
                              
                              {/* <p className="wrapper7">Level {nft.levels}</p> */}

                              <Flex alignItems='center' mt='10px' mb='10px'>
                                  <Icon icon="emojione-v1:growing-heart" />
                                  <Text fontSize="14px" ml='5px' mr='30px' bold>{nft.hp}</Text>
                                  <Icon icon="noto:crossed-swords" />
                                  <Text fontSize="14px" ml='5px' bold>{nft.attackDamage}</Text>
                              </Flex>

                              <Flex alignItems='center' mb='10px'>
                              <TextField
                                  label="Rental Price Per Minute"
                                  defaultValue="0.001"
                                  variant="filled"
                                  type="number"
                                  sx={{ input: { color: 'white' } }}
                                  InputLabelProps={{
                                      style: { color: '#ff4655' },
                                  }}
                                  className="inputField"
                                  onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                                  
                              />
                              </Flex>

                              <TextField
                                  label="Maximum Rental Mins"
                                  defaultValue="5"
                                  variant="filled"
                                  type="number"
                                  sx={{ input: { color: 'white' } }}
                                  InputLabelProps={{
                                      style: { color: '#ff4655' },
                                  }}
                                  className="inputField"
                                  onChange={e => updateFormInput({ ...formInput, maxRental: e.target.value })}
                              />

                              <button className="pushable" onClick={() => listForRent(tokens[i])}>
                                  <span className="front">
                                    List NFT
                                  </span>
                                </button>

                          </div>

                          </div>

                      ))
                      }
                  </div>

              
                 
              </Flex>
          )}
          {
                    nfts.length == 0 && (
                        <div>
                        <h1 className="default">No Assets Found</h1>
                        <lottie-player
                            autoplay
                            loop
                            mode="normal"
                            src="https://assets2.lottiefiles.com/packages/lf20_aBYmBC.json"
                            style={{ width: "320px" }}
                        >

                        </lottie-player>
                        </div>
                    )
            }
      </ScrollArea>
      </Flex>

    
    // <div className="wrapper1">
    //     <div className="wrapper2">
    //       <div className="grid-container">
    //         {
    //           nfts.map((nft, i) => (
                
    //             <div key={i} className="grid-item">

    //               <img src={nft.image} className="wrapper5" />

    //               <div className="wrapper6">
    //                 <Flex alignItems='center' mb='10px'>
    //                     <Text fontSize="18px" ml='3px' bold>{nft.name.toUpperCase()}</Text>
    //                 </Flex>
                    
    //                 {/* <p className="wrapper7">Level {nft.levels}</p> */}

    //                 <Flex alignItems='center' mt='10px' mb='10px'>
    //                     <Icon icon="emojione-v1:growing-heart" />
    //                     <Text fontSize="14px" ml='5px' mr='30px' bold>{nft.hp}</Text>
    //                     <Icon icon="noto:crossed-swords" />
    //                     <Text fontSize="14px" ml='5px' bold>{nft.attackDamage}</Text>
    //                 </Flex>

    //                 <Flex alignItems='center' mb='10px'>
    //                 <TextField
    //                     label="Rental Price Per Day"
    //                     defaultValue="0.01"
    //                     variant="filled"
    //                     type="number"
    //                     sx={{ input: { color: 'white' } }}
    //                     InputLabelProps={{
    //                         style: { color: '#ff4655' },
    //                     }}
    //                     className="inputField"
    //                     onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                        
    //                 />
    //                 </Flex>

    //                 <TextField
    //                     label="Maximum Rental Days"
    //                     defaultValue="5"
    //                     variant="filled"
    //                     type="number"
    //                     sx={{ input: { color: 'white' } }}
    //                     InputLabelProps={{
    //                         style: { color: '#ff4655' },
    //                     }}
    //                     className="inputField"
    //                     onChange={e => updateFormInput({ ...formInput, maxRental: e.target.value })}
    //                 />

    //                 <button className="wrapper8" onClick={() => listForRent(tokens[i])}>List NFT</button>

    //               </div>

    //             </div>

    //           ))
    //         }
    //       </div>
    //     </div>
    // </div>
      
    )
}

export default MyNFTs