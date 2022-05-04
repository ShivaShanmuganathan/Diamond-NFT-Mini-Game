import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { Flex } from "crox-new-uikit";
import useMediaQuery from "use-mediaquery";
import Arena from "./Arena";
import { WalletConnect } from "../../components/Gadget";
import { NFTGAME_CONTRACT_ADDRESS, transformCharacterData } from "../../utils/constants";
import myEpicGame from '../../utils/MyEpicGame.json'
import Empty from '../../components/Gadget/Empty'
import './stake.scss'

function Stake(props) {
    const { collapse } = props
    const { account } = useWeb3React()
    const isMobile = useMediaQuery("(max-width: 600px)")
    const [characterNFT, setCharacterNFT] = useState([]);
    const [stakeCharacter, setStakeCharacter] = useState(0)

    useEffect(() => {
        const fetchNFTMetadata = async () => {
            console.log('Checking for Character NFT on address:', account);

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                NFTGAME_CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            );

            const [tokens, txn] = await gameContract.fetchAssets();
            console.log("Respond for fetchAssets", txn);
            if (txn[0]) {
                console.log('User has character NFT');
                if (txn[stakeCharacter]) {
                    setCharacterNFT(txn[stakeCharacter])
                } else {
                    setStakeCharacter(stakeCharacter - 1)
                }
            } else {
                console.log('No Character NFT Found');
            }
        }

        if (account) {
            fetchNFTMetadata();
        }
    }, [account, stakeCharacter])

    return (
        <Flex className={!collapse ? "container" : "container wider-width"} justifyContent='center' flexDirection='column' mt='50px' >
            {!account ? (
                <Flex justifyContent='center' flexDirection='column' alignItems='center' mt={isMobile ? 100 : -30}>
                    <WalletConnect />
                </Flex>
            ) : !characterNFT[0] ? (
                <Flex justifyContent='center' alignItems='center' mt={isMobile ? 30 : -50}>
                    <Empty />
                </Flex>
            ) : (
                <Flex justifyContent='center' alignItems='center' mt={isMobile ? 30 : -50}>
                    <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} setStakeCharacter={setStakeCharacter} stakeCharacter={stakeCharacter} />
                </Flex>
            )}
        </Flex>
    )
}

export default Stake