import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { Flex, Text } from "crox-new-uikit";
import { Icon } from '@iconify/react';
import { Button } from "../../components/CommonComponents";
import useMediaQuery from "use-mediaquery";
import { NFTGAME_CONTRACT_ADDRESS, transformCharacterData, DYNAMIC_GAME_FACET_ADDRESS, STAKE_FACET_ADDRESS} from "../../utils/constants";
import myEpicGame from '../../utils/MyEpicGame.json'
import CharacterCard from "./CharacterCard";

const Arena = ({ characterNFT, setCharacterNFT, setStakeCharacter, stakeCharacter }) => {
    const [gameContract, setGameContract] = useState(null);
    const [stakeState, setStakeState] = useState('');
    const isMobile = useMediaQuery("(max-width: 600px)");
    const [animation, setAnimation] = useState(true)
    const { account } = useWeb3React()

    const runStakeAction = async () => {
        try {
            if (gameContract) {
                setAnimation(false)
                setStakeState('staking');
                console.log('Staking NFT...')

                const tokenIDTxn = (await gameContract.nftHolders(account))[stakeCharacter];
                // await tokenIDTxn.wait();
                console.log('Staking NFT 2...')
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

                // let approveTxn = await gameContract.approve(STAKE_FACET_ADDRESS, tokenIDTxn.toString());
                // await approveTxn.wait();

                let ownerTxn = await gameContract.ownerOf(tokenIDTxn.toString());
                console.log('Address of owner of tokenID', tokenIDTxn.toString(), ": ", ownerTxn.toString());
                
                // let startTimeTxn = await gameContract.getStartTime(tokenIDTxn.toString(), STAKE_FACET_ADDRESS);
                // await startTimeTxn.wait();
                console.log('Staking NFT 3...')
                // console.log('result from the facet call',startTimeTxn.toString());
                // console.log("index of character on owner",stakeCharacter);
                // console.log("list of tokensIDs ",await gameContract.nftHolders(account));
                let tokenID = (await gameContract.nftHolders(account))[stakeCharacter];

                const stakeTxn = await gameContract.unStakeCharacter(tokenID, DYNAMIC_GAME_FACET_ADDRESS, overrides);
                await stakeTxn.wait();
                // console.log('Staking NFT 4...')

                // console.log('stakeTxn:', stakeTxn);
                setStakeState('');
                setAnimation(true)
                console.log('Staking Complete');
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
        } else {
            console.log("Ethereum object not found");
        }
    }, [])

    useEffect(() => {
        // const fetchTime = async () => {
        //     const timeTxn = await gameContract.getStartTime(stakeCharacter, NFTGAME_CONTRACT_ADDRESS);
        //     setTime((timeTxn).toString())
        // };

        const onStakeComplete = (newPlayerHp) => {
            // const stakeTime = newTime.toNumber();
            const playerHp = newPlayerHp;
            // setTime((prevState) => {
            //     return { ...prevState, time: stakeTime };
            // });
            setCharacterNFT((prevState) => {
                return { ...prevState, hp: playerHp };
            });
        };

        if (gameContract) {
            // fetchTime()
            gameContract.on('AssetStaked', onStakeComplete);
        }

        return () => {
            if (gameContract) {
                gameContract.off('AssetStaked', onStakeComplete);
            }
        }
    }, [gameContract])

    const increase = () => {
        setStakeCharacter(stakeCharacter + 1)
    }

    const decrease = () => {
        if (stakeCharacter > 0) {
            setStakeCharacter(stakeCharacter - 1)
        }
    }

    return (
        <Flex flexDirection={isMobile ? 'column' : 'row'} alignItems={'center'}>
            
            {stakeState === 'staking' ? (
                <Flex>
                    <lottie-player
                        autoplay
                        loop
                        mode="normal"
                        src="https://assets3.lottiefiles.com/packages/lf20_a9Bla0.json"
                        class='animation'
                        style={{ width: '200px' }}
                    />
                </Flex>
            ) : (
                <Flex className="m-30" onClick={runStakeAction}><Icon icon="flat-color-icons:safe" className="stake_nft" width="160" height="160" /></Flex>
            )}
            {characterNFT && (
                <Flex flexDirection='column' alignItems='center'>
                    <CharacterCard character={characterNFT} animation={animation} />
                    <Flex alignItems='center' mt='10px'>
                        <Icon icon="emojione-v1:growing-heart" />
                        <Text fontSize="14px" ml='5px' mr='30px' bold>{`${characterNFT.hp.toNumber()}/${characterNFT.maxHp.toNumber()}`}</Text>                        
                    </Flex>
                    <Flex mt='10px'>
                        <Button className="animateButton m-0 p-10 mr-10" onClick={decrease}><Icon icon="emojione:backhand-index-pointing-left" width="40" height="40" /></Button>
                        <Button className="animateButton m-0 p-10" onClick={increase}><Icon icon="emojione:backhand-index-pointing-right" width="40" height="40" /></Button>
                    </Flex>
                </Flex>
            )}
        </Flex>
    )
}

export default Arena