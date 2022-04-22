import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Flex, Text } from "crox-new-uikit";
import { Icon } from '@iconify/react';
import { Button } from "../../../components/CommonComponents";
import BossCard from "./BossCard";
import useMediaQuery from "use-mediaquery";
import { NFTGAME_CONTRACT_ADDRESS, transformCharacterData } from "../../../utils/constants";
import myEpicGame from '../../../utils/MyEpicGame.json'
import CharacterCard from "./CharacterCard";

const Arena = ({ characterNFT, setCharacterNFT, setAttackCharacter, attackCharacter }) => {
    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);
    const [attackState, setAttackState] = useState('');
    const isMobile = useMediaQuery("(max-width: 600px)");
    const [animation, setAnimation] = useState(true)

    const runAttackAction = async () => {
        try {
            if (gameContract) {
                setAnimation(false)
                setAttackState('attacking');
                console.log('Attacking boss...')
                const attackTxn = await gameContract.attackBoss(attackCharacter);
                await attackTxn.wait();
                console.log('attackTxn:', attackTxn);
                setAttackState('');
                setAnimation(true)
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
                myEpicGame.abi,
                signer
            )
            setGameContract(gameContract)
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

    const increase = () => {
        setAttackCharacter(attackCharacter + 1)
    }

    const decrease = () => {
        if (attackCharacter > 0) {
            setAttackCharacter(attackCharacter - 1)
        }
    }

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
                    <CharacterCard character={characterNFT} animation={animation} />
                    <Flex alignItems='center' mt='10px'>
                        <Icon icon="emojione-v1:growing-heart" />
                        <Text fontSize="14px" ml='5px' mr='30px' bold>{`${characterNFT.hp.toNumber()}/${characterNFT.maxHp.toNumber()}`}</Text>
                        <Icon icon="noto:crossed-swords" />
                        <Text fontSize="14px" ml='5px' bold>{characterNFT.attackDamage.toNumber()}</Text>
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