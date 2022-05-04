import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { Flex, Text } from "crox-new-uikit";
import { Icon } from '@iconify/react';
import { Button } from "../../../components/CommonComponents";
import BossCard from "./BossCard";
import useMediaQuery from "use-mediaquery";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NFTGAME_CONTRACT_ADDRESS, DYNAMIC_GAME_FACET_ADDRESS, transformCharacterData } from "../../../utils/constants";
import myEpicGame from '../../../utils/MyEpicGame.json';
import awesomeGame from '../../../utils/awesomeGame.json';
import CharacterCard from "./CharacterCard";

toast.configure();


const Arena = ({ characterNFT, setCharacterNFT, setAttackCharacter, attackCharacter }) => {
    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);
    const [attackState, setAttackState] = useState('');
    const [rentalState, setRentalState] = useState('');
    const isMobile = useMediaQuery("(max-width: 600px)");
    const [animation, setAnimation] = useState(true)
    const { account } = useWeb3React();

    const runAttackAction = async () => {
        try {
            if (gameContract) {
                setAnimation(false)
                setAttackState('attacking');
                console.log('Attacking boss...')
                
                let tokenID = (await gameContract.nftHolders(account))[attackCharacter];
                const attackTxn = await gameContract.attackBoss(tokenID);
                await attackTxn.wait();
                console.log('attackTxn:', attackTxn);
                setAttackState('');
                setAnimation(true)
                toast.success("🔥THANOS WAS ATTACKED🔥", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }
        } catch (error) {
            console.error('Error attacking boss:', error);
            setAttackState('')
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
                awesomeGame.abi,
                signer
            )
            setGameContract(gameContract)
            const fetchData = async () => {

                let tokenID = (await gameContract.nftHolders(account))[attackCharacter];
                let rental_status = (await gameContract.fetchNFTRentalStatus(tokenID)).isRented;
                if(rental_status === false){
                    setRentalState('')
                    // setStartingTime(0);
                }
                else {
                    setRentalState('rented')
                    // setStartingTime(startTime);
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
        const fetchBoss = async () => {
            const bossTxn = await gameContract.getBigBoss();
            setBoss(transformCharacterData(bossTxn))
        };

        const onAttackComplete = (newBossHp, newPlayerHp) => {
            const bossHp = newBossHp.toNumber();
            const playerHp = newPlayerHp;
            setBoss((prevState) => {
                return { ...prevState, hp: bossHp };
            });
            setCharacterNFT((prevState) => {
                return { ...prevState, hp: playerHp };
            });
        };

        if (gameContract) {
            fetchBoss()
            gameContract.on('AttackComplete', onAttackComplete);
        }

        return () => {
            if (gameContract) {
                gameContract.off('AttackComplete', onAttackComplete);
            }
        }
    }, [gameContract])

    const increase = async() => {
        setAttackCharacter(attackCharacter + 1)
        // let tokenID = (await gameContract.nftHolders(account))[attackCharacter + 1];
        // let startTime = (await gameContract.getStartTime(tokenID, DYNAMIC_GAME_FACET_ADDRESS)).toNumber();
        // if(startTime === 0){
        //     setStakeState('')
            
        // }
        // else {
        //     setStakeState('staked')
      
        // }
        let tokenID = (await gameContract.nftHolders(account))[attackCharacter + 1];
        let rental_status = (await gameContract.fetchNFTRentalStatus(tokenID)).isRented;
        if(rental_status === false){
            setRentalState('')
            // setStartingTime(0);
        }
        else {
            setRentalState('rented')
            // setStartingTime(startTime);
        }
    }

    const decrease = async() => {

        if (attackCharacter > 0) {
            
            setAttackCharacter(attackCharacter - 1)
            // let tokenID = (await gameContract.nftHolders(account))[attackCharacter - 1];
            // let startTime = (await gameContract.getStartTime(tokenID, DYNAMIC_GAME_FACET_ADDRESS)).toNumber();
            // if(startTime === 0){
            //     setStakeState('')
      
            // }
            // else {
            //     setStakeState('staked')
      
            // }
            let tokenID = (await gameContract.nftHolders(account))[attackCharacter - 1];
            let rental_status = (await gameContract.fetchNFTRentalStatus(tokenID)).isRented;
            if(rental_status === false){
                setRentalState('')
                // setStartingTime(0);
            }
            else {
                setRentalState('rented')
                // setStartingTime(startTime);
            }

    }}

    return (
        <Flex flexDirection={isMobile ? 'column' : 'row'} alignItems={'center'}>
            {boss && (
                <Flex flexDirection='column' alignItems='center'>
                    <BossCard boss={boss} animation={animation} />
                    <Flex alignItems='center' mt='10px'>
                        <Icon icon="emojione-v1:growing-heart" />
                        <Text fontSize="14px" ml='5px' mr='30px' bold>{`${boss.hp}/${boss.maxHp}`}</Text>
                        <Icon icon="noto:crossed-swords" />
                        <Text fontSize="14px" ml='5px' bold>{boss.attackDamage}</Text>
                    </Flex>
                </Flex>
            )}
            {attackState === 'attacking' ? (
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
            ) : boss && (
                <Flex className="m-30" onClick={runAttackAction}><Icon icon="noto:crossed-swords" className="sword_battle" width="160" height="160" /></Flex>
            )}
            {characterNFT && (
                <Flex flexDirection='column' alignItems='center'>
                    <CharacterCard character={characterNFT} animation={animation} rentalState={rentalState}/>
                    <Flex alignItems='center' mt='10px'>
                        <Icon icon="emojione-v1:growing-heart" />
                        <Text fontSize="14px" ml='5px' mr='30px' bold>{`${characterNFT.hp.toNumber()}/${characterNFT.maxHp.toNumber()}`}</Text>
                        <Icon icon="noto:crossed-swords" />
                        <Text fontSize="14px" ml='5px' bold>{characterNFT.attackDamage.toNumber()}</Text>
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