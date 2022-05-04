import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { Flex, Text } from "crox-new-uikit";
import { Icon } from '@iconify/react';
import { Button } from "../../components/CommonComponents";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useMediaQuery from "use-mediaquery";
import { NFTGAME_CONTRACT_ADDRESS, transformCharacterData, DYNAMIC_GAME_FACET_ADDRESS, STAKE_FACET_ADDRESS} from "../../utils/constants";
import myEpicGame from '../../utils/MyEpicGame.json'
import CharacterCard from "./CharacterCard";

toast.configure();

const Arena = ({ characterNFT, setCharacterNFT, setStakeCharacter, stakeCharacter }) => {
    const [gameContract, setGameContract] = useState(null);
    const [stakeState, setStakeState] = useState('');
    const [startingTime, setStartingTime] = useState(0);
    const [rentalState, setRentalState] = useState('');
    const isMobile = useMediaQuery("(max-width: 600px)");
    const [animation, setAnimation] = useState(true)
    const { account } = useWeb3React()

    const runStakeAction = async () => {
        try {
            if (gameContract) {
                setAnimation(false)
                setStakeState('staking');
                console.log('Staking NFT...')

                const [tokenIDsTxn, charTxn] = (await gameContract.fetchAssets());
                const tokenIDTxn = tokenIDsTxn[stakeCharacter];
                // await tokenIDTxn.wait();
                console.log('Staking NFT PART 2...')
                console.log('tokenID', tokenIDTxn.toString());
                console.log('user address', account);
                console.log('stake facet address', STAKE_FACET_ADDRESS);
                let overrides = {

                    // The maximum units of gas for the transaction to use
                    gasLimit: 3000000,
                              
                
                    // The price (in wei) per unit of gas
                    //gasPrice: utils.parseUnits('9.0', 'gwei'),
                
                    // The nonce to use in the transaction
                    nonce: 234,
                
                    // The amount to send with the transaction (i.e. msg.value)
                    // value: ethers.utils.parseEther('0.02'),
                
                    // The chain ID (or network ID) to use
                    //chainId: 4
                
                };

                let ownerTxn = await gameContract.ownerOf(tokenIDTxn.toString());
                console.log('Address of owner of tokenID', tokenIDTxn.toString(), ": ", ownerTxn.toString());
                
                // let startTimeTxn = await gameContract.getStartTime(tokenIDTxn.toString(), STAKE_FACET_ADDRESS);
                // await startTimeTxn.wait();
                console.log('Staking NFT PART 3...')
                // console.log('result from the facet call',startTimeTxn.toString());
                // console.log("index of character on owner",stakeCharacter);
                // console.log("list of tokensIDs ",await gameContract.nftHolders(account));
                let tokenID = tokenIDsTxn[stakeCharacter];

                // let approveTxn = await gameContract.approve(NFTGAME_CONTRACT_ADDRESS, tokenIDTxn.toString());
                // await approveTxn.wait();

                const stakeTxn = await gameContract.stakeCharacter(tokenID, overrides);
                await stakeTxn.wait();

                let startTime = (await gameContract.getStartTime(tokenID)).toNumber();
                // console.log('Staking NFT 4...')

                // console.log('stakeTxn:', stakeTxn);
                setStakeState('staked');
                setStartingTime(startTime);
                setAnimation(true)
                toast.success(" STAKING COMPLETE! 🔥", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });

                console.log('Staking Complete');
            }
        } catch (error) {
            console.error('Error staking NFT:', error);
            setStakeState('')
            setAnimation(true)
        }
    }

    const runUnstakeAction = async () => {
        try {
            if (gameContract) {
                setAnimation(false)
                setStakeState('staking');
                console.log('unStaking NFT...')

                const [tokenIDsTxn, charTxn] = (await gameContract.fetchAssets());
                const tokenIDTxn = tokenIDsTxn[stakeCharacter];
                // await tokenIDTxn.wait();
                console.log('unStaking NFT PART 2...')
                console.log('tokenID', tokenIDTxn.toString());
                console.log('user address', account);
                console.log('stake facet address', STAKE_FACET_ADDRESS);
                let overrides = {

                    // The maximum units of gas for the transaction to use
                    gasLimit: 3000000,
                              
                
                    // The price (in wei) per unit of gas
                    //gasPrice: utils.parseUnits('9.0', 'gwei'),
                
                    // The nonce to use in the transaction
                    nonce: 234,
                
                    // The amount to send with the transaction (i.e. msg.value)
                    // value: ethers.utils.parseEther('0.02'),
                
                    // The chain ID (or network ID) to use
                    //chainId: 4
                
                };

                // let approveTxn = await gameContract.attackBoss(stakeCharacter);
                // await approveTxn.wait();

                

                let ownerTxn = await gameContract.ownerOf(tokenIDTxn.toString());
                console.log('Address of owner of tokenID', tokenIDTxn.toString(), ": ", ownerTxn.toString());
                
                // let startTimeTxn = await gameContract.getStartTime(tokenIDTxn.toString(), STAKE_FACET_ADDRESS);
                // await startTimeTxn.wait();
                console.log('unStaking NFT PART 3...')
                // console.log('result from the facet call',startTimeTxn.toString());
                // console.log("index of character on owner",stakeCharacter);
                // console.log("list of tokensIDs ",await gameContract.nftHolders(account));
                let tokenID = tokenIDsTxn[stakeCharacter];

                const stakeTxn = await gameContract.unStakeCharacter(tokenID, overrides);
                await stakeTxn.wait();
                // console.log('Staking NFT 4...')

                // console.log('stakeTxn:', stakeTxn);
                setStakeState('');
                setAnimation(true)
                toast.success(" UNSTAKING COMPLETE! 🔥", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                console.log('unStaking Complete');
            }
        } catch (error) {
            console.error('Error staking NFT:', error);
            setStakeState('')
            setAnimation(true)
        }
    }

    useEffect(() => {
        const { ethereum } = window
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const gameContract = new ethers.Contract(
                NFTGAME_CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            )
            setGameContract(gameContract)
            // console.log("stakeCharacter ID", stakeCharacter);
            

            const fetchData = async () => {

                // let tokenID = (await gameContract.nftHolders(account))[stakeCharacter];
                const [tokenIDsTxn, charTxn] = (await gameContract.fetchAssets());
                const tokenID = tokenIDsTxn[stakeCharacter];
                let rental_status = (await gameContract.fetchNFTRentalStatus(tokenID)).isRented;
                if(rental_status === false){
                    setRentalState('')
                    
                }
                else {
                    setRentalState('rented')
                    
                }


                let startTime = (await gameContract.getStartTime(tokenID)).toNumber();
                if(startTime === 0){
                    setStakeState('')
                    setStartingTime(0);
                }
                else {
                    setStakeState('staked')
                    setStartingTime(startTime);
                }



            }

            fetchData()
            // make sure to catch any error
            .catch(console.error);
            


        } else {
            console.log("Ethereum object not found");
        }
    }, [])

    useEffect(() => {
        // const fetchTime = async () => {
        //     const timeTxn = await gameContract.getStartTime(stakeCharacter, NFTGAME_CONTRACT_ADDRESS);
        //     setTime((timeTxn).toString())
        // };

        const onStakeComplete = (tokenId, newPlayerHp, stakeStartTime, stakeEndTime) => {
            
            const playerHp = newPlayerHp;
            
            setCharacterNFT((prevState) => {
                return { ...prevState, hp: playerHp };
            });

        };

        if (gameContract) {
            // fetchTime()
            gameContract.on('AssetUnstaked', onStakeComplete);
        }

        return () => {
            if (gameContract) {
                gameContract.off('AssetUnstaked', onStakeComplete);
            }
        }
    }, [gameContract])

    const increase = async() => {
        setStakeCharacter(stakeCharacter + 1)
        console.log("stakeCharacter ID", stakeCharacter + 1)
        // const tokenID = stakeCharacter;
        // let tokenID = (await gameContract.nftHolders(account))[stakeCharacter + 1];
        const [tokenIDsTxn, charTxn] = (await gameContract.fetchAssets());
        let tokenID = tokenIDsTxn[stakeCharacter + 1];
        let startTime = (await gameContract.getStartTime(tokenID)).toNumber();
        let rental_status = (await gameContract.fetchNFTRentalStatus(tokenID)).isRented;
        if(rental_status === false){
            setRentalState('')
            
        }
        else {
            setRentalState('rented')
            
        }
        console.log("INCREASE CLICKED");
        console.log('TokenID: ', tokenID.toString());
        console.log('address of contract', DYNAMIC_GAME_FACET_ADDRESS);
        console.log('Start Time: ', startTime);
        console.log("token type",typeof(tokenID));
        console.log("time type",typeof(startTime));
        console.log('Owner of tokenID', (await gameContract.exists(tokenID)).toString());
        // const tokenIDTxn = (await gameContract.nftHolders(account))[stakeCharacter];
        if(startTime === 0){
            setStakeState('')
            setStartingTime(0);
        }
        else {
            setStakeState('staked')
            setStartingTime(startTime);
        }
    }

    const decrease = async() => {
        if (stakeCharacter > 0) {
            setStakeCharacter(stakeCharacter - 1)
            console.log("stakeCharacter ID", stakeCharacter - 1)
            // const tokenID = stakeCharacter;
            const [tokenIDsTxn, charTxn] = (await gameContract.fetchAssets());
            const tokenID = tokenIDsTxn[stakeCharacter - 1];
            let rental_status = (await gameContract.fetchNFTRentalStatus(tokenID)).isRented;
            if(rental_status === false){
                setRentalState('')
                
            }
            else {
                setRentalState('rented')
                
            }
            // const tokenID = (await gameContract.nftHolders(account))[stakeCharacter - 1];
            const startTime = (await gameContract.getStartTime(tokenID)).toNumber();
            console.log("INCREASE CLICKED");
            console.log('TokenID: ', tokenID.toString());
            console.log('address of contract', DYNAMIC_GAME_FACET_ADDRESS);
            console.log('Start Time: ', startTime);
            console.log("token type",typeof(tokenID));
            console.log("time type",typeof(startTime));
            console.log('Owner of tokenID', (await gameContract.exists(tokenID)).toString());
            // const tokenIDTxn = (await gameContract.nftHolders(account))[stakeCharacter];
            if(startTime === 0){
                setStakeState('')
                setStartingTime(0);
            }
            else {
                setStakeState('staked')
                setStartingTime(startTime);
            }
        }
        
    }

    function FindStake(props) {
        const stakeStatus = props.stakeStatus;
        

        if (stakeStatus === 'staking') {
        return <Flex>
          <lottie-player
              autoplay
              loop
              mode="normal"
              src="https://assets5.lottiefiles.com/packages/lf20_cldes4ui.json"
              class='animation'
              style={{ width: '750px' }}
          />
        </Flex>;
        }

        else if (stakeStatus === 'staked') {
            // return <Flex className="m-30" onClick={runUnstakeAction}><Icon icon="flat-color-icons:unlock" className="stake_nft" width="160" height="160" /></Flex>;
            return(
                <Flex flexDirection='column' alignItems='center'>
                        {/* <CharacterCard character={characterNFT} animation={animation} /> */}
                        <Flex className="m-30 mt-10" onClick={runUnstakeAction}><Icon icon="flat-color-icons:unlock" className="stake_nft" width="320" height="320" /></Flex>
                        <Flex alignItems='center' mt='1px'>
                            {/* <Icon icon="emojione-v1:growing-heart" /> */}
                            <Text fontSize="42px" ml='20px' mr='30px' bold>{`UNSTAKE NFT `}</Text>
                            
                        </Flex>

                        <Flex mt='10px'>

                            {/* <Text fontSize="21px" ml='20px' mr='30px' bold >{` NFT STAKED ${((Math.floor(Date.now() / 1000) - startingTime) / 60)} MINUTES AGO`}</Text> */}
                            <Text fontSize="21px" ml='20px' mr='30px' bold >{` NFT STAKED ${Math.floor((Math.floor(Date.now() / 1000) - startingTime) / 60)} MINUTES AGO`}</Text>

                        </Flex>
                </Flex>
                );
        }

        else {
            // return 
            return(
            <Flex flexDirection='column' alignItems='center'>
                    {/* <CharacterCard character={characterNFT} animation={animation} /> */}
                    <Flex className="m-30 mt-10" onClick={runStakeAction}><Icon icon="flat-color-icons:safe" className="stake_nft" width="320" height="320" /></Flex>
                    <Flex alignItems='center' mt='1px'>
                        {/* <Icon icon="emojione-v1:growing-heart" /> */}
                        <Text fontSize="42px" ml='20px' mr='30px' bold>{`STAKE NFT `}</Text>                        
                    </Flex>
                    {/* <Flex mt='10px'>
                        <Button className="animateButton m-0 p-10 mr-10" onClick={async () => {await decrease()}}><Icon icon="emojione:backhand-index-pointing-left" width="40" height="40" /></Button>

                        <Button className="animateButton m-0 p-10" onClick={async () => {await increase()}}><Icon icon="emojione:backhand-index-pointing-right" width="40" height="40" /></Button>
                    </Flex> */}
            </Flex>
            );
        }
        
    }

    

    // const findStartTime = async() => {

    //     let tokenID = (await gameContract.nftHolders(account))[stakeCharacter];
    //     startTime = (await gameContract.getStartTime(tokenID, DYNAMIC_GAME_FACET_ADDRESS)).toString();

    // }

    

    return (
        <Flex flexDirection={isMobile ? 'column' : 'row'} alignItems={'center'}>
            
        {    
            characterNFT && (<FindStake stakeStatus={stakeState} />)
        }
                

            {characterNFT && (
                <Flex flexDirection='column' alignItems='center'>
                    <CharacterCard character={characterNFT} animation={animation} rentalState={rentalState}/>
                    <Flex alignItems='center' mt='10px'>
                        <Icon icon="emojione-v1:growing-heart" />
                        <Text fontSize="14px" ml='5px' mr='30px' bold>{`${characterNFT.hp.toNumber()}/${characterNFT.maxHp.toNumber()}`}</Text>                        
                    </Flex>
                    <Flex mt='10px'>
                        <Button className="animateButton m-0 p-10 mr-10" onClick={async () => {await decrease()}}><Icon icon="emojione:backhand-index-pointing-left" width="40" height="40" /></Button>

                        <Button className="animateButton m-0 p-10" onClick={async () => {await increase()}}><Icon icon="emojione:backhand-index-pointing-right" width="40" height="40" /></Button>
                    </Flex>
                </Flex>
            )}
        </Flex>
    )
}

export default Arena

{/* <Button onClick={async () => {await this.asyncFunc("Example");} }/>

async asyncFunc(text) {
    console.log(text);
} */}