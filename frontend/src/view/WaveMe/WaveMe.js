import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import Countdown, { zeroPad } from 'react-countdown';
import { Flex, Text } from "crox-new-uikit";
import useMediaQuery from "use-mediaquery";
import ScrollArea from 'react-scrollbar'
import { WalletConnect } from "../../components/Gadget";
import ReactiveButton from 'reactive-button';
import abi from '../../utils/WavePortal.json'
import '../../assets/style/scss/style-common.scss'
import '../../assets/style/scss/style-basic.scss'
import './waveme.css'

function WaveMe(props) {
    const { collapse } = props
    const [message, setMessage] = useState('')
    const [waitWave, setWaitWave] = useState(false)
    const [allWaves, setAllWaves] = useState([]);

    const isMobile = useMediaQuery("(max-width: 600px)")

    const { account } = useWeb3React()

    const contractAddress = "0x5883a15f5a99eaa454433b179338d13caeee8222";
    const contractABI = abi.abi;

    function handleChange(event) {
        setMessage(event.target.value)
    }

    const wave = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                setWaitWave(true)
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

                let count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());

                const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
                console.log("Mining...", waveTxn.hash);

                await waveTxn.wait();
                setWaitWave(false)
                console.log("Mined --", waveTxn.hash);

                count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());
                localStorage.setItem('timestamp', Date.now())
                getAllWaves();
                document.location.reload()
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            setWaitWave(false)
            console.log(error)
        }
    }

    const getAllWaves = async () => {
        const { ethereum } = window;

        try {
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
                console.log(wavePortalContract)
                const waves = await wavePortalContract.getAllWaves();

                const wavesCleaned = waves.map(wave => {
                    return {
                        address: wave.waver,
                        timestamp: new Date(wave.timestamp * 1000),
                        message: wave.message,
                    };
                });

                setAllWaves(wavesCleaned);
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const renderer = ({ minutes, seconds, completed }) => {
        if (completed) {
            return <Flex>
                {waitWave ? (
                    <Flex mt='10px'>
                        <lottie-player
                            autoplay
                            loop
                            mode="normal"
                            src="https://assets4.lottiefiles.com/packages/lf20_6niurjte.json"
                            style={{ width: '70px' }}
                        />
                    </Flex>
                ) : (
                    <Flex mt='15px'>
                        <ReactiveButton idleText={
                            "WAVE AT ME"
                        } color="teal" onClick={wave} rounded size="large" />
                    </Flex>
                )}
            </Flex>
        } else {
            // Render a countdown
            return <div className="text-center timecounter mt-10">{zeroPad(minutes)}:{zeroPad(seconds)}</div>;
        }
    };

    useEffect(() => {
        getAllWaves()
    }, [])

    return (
        <Flex className={!collapse ? "container" : "container wider-width"} justifyContent='center' flexDirection='column' mt={50} >
            {!account ? (
                <Flex justifyContent='center' flexDirection='column' alignItems='center' mt={isMobile ? 100 : -30}>
                    <WalletConnect />
                </Flex>
            ) : (
                <Flex flexDirection={isMobile && 'column'} justifyContent='center' alignItems='center' mt={isMobile ? 30 : -50}>
                    <Flex justifyContent='center' flexDirection='column' alignItems='center' className="container-n wave-interface" mr={isMobile ? 0 : 30}>
                        <Text fontSize="30px" bold>👋 Wave to Shiva</Text>
                        <lottie-player
                            autoplay
                            loop
                            mode="normal"
                            src="https://assets10.lottiefiles.com/packages/lf20_85jUo8.json"
                            class='animation'
                            style={{ width: '250px' }}
                        />
                        <textarea className="textarea mt-20" rows='4' onChange={() => handleChange(event)} required></textarea>
                        <Text mt={10}>You will get 0.01ETH when you wave at me.</Text>
                        <Text>Is it too small? 50% chance to get 2x!!!</Text>
                        <Countdown date={Number(localStorage.getItem('timestamp')) ? (Number(localStorage.getItem('timestamp')) + 60000) : (Date.now() + 1)} renderer={renderer} />
                    </Flex>
                    <Flex flexDirection='column' className="wave-history">
                        <ScrollArea
                            speed={1}
                            className="area"
                            contentClassName="content"
                            horizontal={false}
                            smoothScrolling
                            style={{ borderRadius: '32px' }}
                            verticalContainerStyle={{ borderRadius: '10px' }}
                            verticalScrollbarStyle={{ borderRadius: '10px' }}
                        >
                            {allWaves[0] ?
                                (
                                    allWaves.map((wave, index) => {
                                        return (
                                            <Flex flexDirection='column' key={index} className="message-container">
                                                <Text fontSize={isMobile && "14px"}>Address: {wave.address}</Text>
                                                <Text fontSize={isMobile && "14px"}>Message: {wave.message}</Text>
                                            </Flex>
                                        )
                                    })
                                ) : (
                                    <Flex justifyContent='center' alignItems='center'>
                                        No History!
                                    </Flex>
                                )
                            }

                        </ScrollArea>
                    </Flex>
                </Flex>
            )}
        </Flex >
    )
}

export default WaveMe