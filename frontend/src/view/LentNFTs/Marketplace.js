import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from "@web3-react/core";
import { Flex, Text } from 'crox-new-uikit';
import { Icon } from '@iconify/react';
import TextField from '@mui/material/TextField';
import ScrollArea from 'react-scrollbar'
import useMediaQuery from "use-mediaquery";
// import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Autoplay } from "swiper";
import myEpicGame from '../../utils/MyEpicGame.json';
import awesomeGame from '../../utils/awesomeGame.json';
import { NFTGAME_CONTRACT_ADDRESS, transformCharacterData } from '../../utils/constants';
import "swiper/swiper.min.css";
import "swiper/components/navigation/navigation.min.css";
SwiperCore.use([Navigation, Autoplay]);
import './marketplace.scss'


const Marketplace = () => {
    const { account } = useWeb3React()
    const [characters, setCharacters] = useState([])
    const [gameContract, setGameContract] = useState(null);
    const [nfts, setNfts] = useState([])
    const [tokens, setTokens] = useState([])
    const [renft, setRenft] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    // const [formInput, updateFormInput] = useState({ rentalDuration: ''})
    const isMobile = useMediaQuery("(max-width: 600px)");

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

        const [txn, rentalArray ,tokenArray] = await gameContract.fetchLentNFTs();
        console.log("MarketItem Information",await gameContract.fetchLentNFTs());
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

            const rentalItems = await Promise.all(rentalArray.map(async rentalData => {
                
                let item = {
                    price: rentalData.price.toString(),
                    expiresAt: rentalData.expiresAt.toString(),
                    maxRental: rentalData.maxRental.toString(),
                    seller: rentalData.seller.toString(),
                    renter: rentalData.renter.toString(),
                    isRented: rentalData.isRented.toString()
                }

                return item
            }))
            

            console.log("tokenArray return ", tokenItems)
            console.log("rentalArray", rentalItems)
            
            setNfts(items)
            setTokens(tokenItems)
            setRenft(rentalItems)
            
        } else {
            console.log('No Character NFT Found');
            setNfts([])
            setTokens([])
            setRenft([])
        }
        
        

        console.log("Works Until Here");
        // console.log("Time Now in JS World", (Math.floor(Date.now() / 1000)))
        // console.log(data);        
        setLoadingState('loaded')
    }

    async function claimNFTs(tokenID) {
        
        // const rentalDuration = parseInt(formInput.rentalDuration);
        // const rentalPrice = parseFloat(price) * rentalDuration;
        // const finalRentalPrice = (ethers.utils.parseUnits(rentalPrice.toString(), 'ether'));

        // console.log("rentalDuration", rentalDuration);
        // console.log("type of rentalDuration", typeof(rentalDuration));
        // console.log();
        // console.log("rentalPrice", finalRentalPrice);
        // console.log("type of rentalPrice", typeof(finalRentalPrice));

        
        // console.log("Rental Price", rentalPrice)
        console.log("Checkpoint 1 Reached!")
        
        if (tokenID==0) return

        console.log("Checkpoint 2 Reached!")
        // console.log("Selected TokenID", tokenID)
        // console.log("Rental Price", rentalPrice)
        // console.log("rentalDuration", rentalDuration)
        console.log();

        let overrides = {

          // The maximum units of gas for the transaction to use
          gasLimit: 3000000,
                    
      
          // The price (in wei) per unit of gas
          //gasPrice: utils.parseUnits('9.0', 'gwei'),
      
          // The nonce to use in the transaction
          // nonce: 234,
      
          // The amount to send with the transaction (i.e. msg.value)
        //   value: finalRentalPrice,
      
          // The chain ID (or network ID) to use
          //chainId: 4
      
      };

        const claimTxn = await gameContract.finishRenting(tokenID, overrides);
        await claimTxn.wait();

        loadNFTs()
    }

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
                {nfts.length > 0 && renft.length > 0 && (
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
                                    
                                    <Flex alignItems='center' mt='10px' mb='10px'>
                                        <Icon icon="cryptocurrency:matic" style="color:#ff4655;" />
                                        <Text fontSize="14px" ml='5px' mr='30px' bold>{(ethers.utils.formatEther((renft[i].price).toString(), 'ether'))}</Text>
                                        <Icon icon="flat-color-icons:expired" />
                                        <Text fontSize="14px" ml='5px' bold>{Math.floor((renft[i].expiresAt - (Math.floor(Date.now() / 1000)))/60).toString()} Mins</Text>
                                    </Flex>

                                    
                                    {/* <TextField
                                        label="Rental Duration"
                                        defaultValue="5"
                                        variant="filled"
                                        type="number"
                                        sx={{ input: { color: 'white' } }}
                                        InputLabelProps={{
                                            style: { color: '#ff4655' },
                                        }}
                                        className="inputField"
                                        onChange={e => updateFormInput({ ...formInput, rentalDuration: e.target.value })}
                                    /> */}
                                    {
                                        renft[i].expiresAt < (Math.floor(Date.now() / 1000)) && (<button className="pushable" onClick={() => claimNFTs(tokens[i])}>
                                            <span className="front">
                                                Claim NFT
                                            </span>                                            
                                            </button>)
                                    }
                                    

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
    );
};

export default Marketplace;