import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { Flex } from "crox-new-uikit";
import useMediaQuery from "use-mediaquery";
import { WalletConnect } from "../../../components/Gadget";
import { NFTGAME_CONTRACT_ADDRESS, transformCharacterData } from "../../../utils/constants";
import SelectCharacter from "./SelectCharacter";
import myEpicGame from '../../../utils/MyEpicGame.json'
import './selectcharacter.scss'

function Character(props) {
    const { collapse } = props
    const { account } = useWeb3React()
    const isMobile = useMediaQuery("(max-width: 600px)")
    const [characterNFT, setCharacterNFT] = useState([]);

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

            const txn = await gameContract.checkIfUserHasNFT();
            if (txn[0]) {
                console.log('User has character NFT');
                setCharacterNFT(txn)
            } else {
                console.log('No Character NFT Found');
            }
        }

        if (account) {
            fetchNFTMetadata();
        }
    }, [account])

    return (
        <Flex className={!collapse ? "container" : "container wider-width"} justifyContent='center' flexDirection='column' mt={isMobile ? '20px' : '50px'} >
            {!account ? (
                <Flex justifyContent='center' flexDirection='column' alignItems='center' mt={isMobile ? 100 : -30}>
                    <WalletConnect />
                </Flex>
            ) : (
                <Flex justifyContent='center' alignItems='center' mt={isMobile ? 30 : -50}>
                    <SelectCharacter setCharacterNFT={setCharacterNFT} characterNFT={characterNFT} />
                </Flex>
            )}
        </Flex>
    )
}

export default Character