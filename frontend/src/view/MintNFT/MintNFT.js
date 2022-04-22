import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { Flex, Text } from "crox-new-uikit";
import useMediaQuery from "use-mediaquery";
import ReactiveButton from 'reactive-button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WalletConnect } from "../../components/Gadget";
import mintNFT from "../../utils/MyEpicNFT.json"
import '../../assets/style/scss/style-common.scss'
import '../../assets/style/scss/style-basic.scss'

const CONTRACT_ADDRESS = "0x310bFA13DC0f6dcFB7D273f52a36596212f7098f"

const Toast = ({ url }) => {
    return (
        <Flex style={{ width: '100%' }} alignItems="center">
            <Text mr={1}>{url.slice(0, 30)}</Text>
            <ReactiveButton idleText={
                "Opensea"
            } color="teal" onClick={() => window.open(`${url}`, "_blank")} rounded size="small" />
        </Flex>
    )
}

export const setupEventListener = async () => {
    try {
        const { ethereum } = window
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, mintNFT.abi, signer)

            connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
                console.log(from, tokenId.toNumber())
                const notify = () => toast(<Toast url={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`} />);
                notify()
            })

            console.log("Setup event listener!")
        } else {
            console.log("Ethereum object doesn't exist!")
        }
    } catch (error) {
        console.log(error)
    }
}

function MintNFT(props) {
    const { collapse } = props
    const [waitWave, setWaitWave] = useState(false)
    const [success, setSuccess] = useState(false)
    const { account } = useWeb3React()
    const isMobile = useMediaQuery("(max-width: 600px)")

    const askContractToMintNft = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                setWaitWave(true)
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, mintNFT.abi, signer);

                console.log(connectedContract)

                console.log("Going to pop wallet now to pay gas...")
                let nftTxn = await connectedContract.makeAnEpicNFT();

                console.log("Mining...please wait.")
                await nftTxn.wait();

                setWaitWave(false)
                console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
                setSuccess(true)
                const timer = setTimeout(() => {
                    setSuccess(false)
                }, 10000);
                return () => {
                    clearTimeout(timer)
                }

            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            setWaitWave(false)
            console.log(error)
        }
    }

    useEffect(() => {
        setupEventListener()
    })

    return (
        <Flex className={!collapse ? "container" : "container wider-width"} justifyContent='center' flexDirection='column' mt={50} >
            <ToastContainer limit={1} closeOnClick={false} closeButton={false} />
            {!account ? (
                <Flex justifyContent='center' flexDirection='column' alignItems='center' mt={isMobile ? 100 : -30}>
                    <WalletConnect />
                </Flex>
            ) : (
                <Flex justifyContent='center' alignItems='center' mt={isMobile ? 30 : -50}>
                    <Flex justifyContent='center' flexDirection='column' alignItems='center' className="container-n wave-interface" mr={isMobile ? 0 : 30}>
                        {!success ? (
                            <>
                                <Text fontSize="30px" bold>My NFT Collection</Text>
                                <lottie-player
                                    autoplay
                                    loop
                                    mode="normal"
                                    src="https://assets7.lottiefiles.com/private_files/lf30_iyicd2xy.json"
                                    class='animation'
                                    style={{ width: '250px' }}
                                />
                                <Text mt={10}>Each unique. Each beautiful.</Text>
                                <Text>Discover your NFT today.</Text>
                                {waitWave ? (
                                    <Flex mt='10px'>
                                        <lottie-player
                                            autoplay
                                            loop
                                            mode="normal"
                                            src="https://assets6.lottiefiles.com/private_files/lf30_scb38ygi.json"
                                            style={{ width: '70px', height: '70px' }}
                                        />
                                    </Flex>
                                ) : (
                                    <Flex mt='15px'>
                                        <ReactiveButton idleText={
                                            "Mint NFT"
                                        } color="teal" onClick={askContractToMintNft} rounded size="large" />
                                    </Flex>
                                )}
                            </>
                        ) : (
                            <>
                                <Flex>
                                    <lottie-player
                                        autoplay
                                        loop
                                        mode="normal"
                                        src="https://assets2.lottiefiles.com/packages/lf20_fJ7CVd.json"
                                        style={{ width: '500px' }}
                                    />
                                </Flex>
                                <Text fontSize="25px" bold>We&apos;ve minted your NFT</Text>
                            </>
                        )}
                    </Flex>
                </Flex>
            )}
        </Flex>
    )
}

export default MintNFT