import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { Flex } from "crox-new-uikit";
import useMediaQuery from "use-mediaquery";
import { WalletConnect } from "../../components/Gadget";
import { NFTGAME_CONTRACT_ADDRESS, transformCharacterData } from "../../utils/constants";
import Markteplace from "./Marketplace";
import myEpicGame from '../../utils/MyEpicGame.json';
import awesomeGame from '../../utils/awesomeGame.json';
import './marketplace.scss'

function LentNFTs(props) {
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
                awesomeGame.abi,
                signer
            );

            const [txn, rentalTxn, tokenTxn] = await gameContract.fetchLentNFTs();
            if (txn[0]) {
                console.log('User has character NFT');
                console.log(transformCharacterData(txn[0]))
                setCharacterNFT(txn)
            } else {
                console.log('No Character NFT Found');
                setCharacterNFT([])
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
                    <Markteplace />
                </Flex>
            )}
        </Flex>
    )
}

export default LentNFTs