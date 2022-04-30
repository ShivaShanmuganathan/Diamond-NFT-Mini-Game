import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Flex, Text } from "crox-new-uikit";
import { Icon } from '@iconify/react';
import useMediaQuery from "use-mediaquery";
import ReactModal from 'react-modal'
import { injected } from "../connector";
import ReactiveButton from 'reactive-button';
import '../../assets/style/scss/style-common.scss'
import '../../assets/style/scss/style-basic.scss'
import './header.css'

let isConfirm = false

function Header(props) {
    const { setToggle } = props;
    const { account, activate, deactivate, error, active, chainId } = useWeb3React();

    const [isNetworkSelectModalOpen, setIsNetworkSelectModalOpen] = useState(false);

    const handleLogin = () => {
        isConfirm = true
        localStorage.setItem("accountStatus", "1");
        return activate(injected)
    }

    const handleLogout = () => {
        isConfirm = false
        localStorage.removeItem("accountStatus")
        deactivate()
    }

    function copyToClipBoard() {
        var x = document.getElementById("snackbar");
        x.className = "show";
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
    }

    function closeModal() {
        setIsNetworkSelectModalOpen(false);
    }

    useEffect(() => {
        if (!chainId && isConfirm) {
            const { ethereum } = window;
            (async () => {
                try {
                    await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x13881" }],
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        try {
                            await ethereum.request({
                                method: "wallet_addEthereumChain",
                                params: [
                                    {
                                        chainId: "0x13881",
                                        chainName: "Mumbai Testnet",
                                        nativeCurrency: {
                                            name: "MATIC",
                                            symbol: "MATIC",
                                            decimals: 18,
                                        },
                                        rpcUrls: ["https://rpc-mumbai.maticvigil.com/v1/"],
                                        blockExplorerUrls: ["https://rinkeby.etherscan.io/"],
                                    },
                                ],
                            });
                        } catch (addError) {
                            console.error(addError);
                        }
                    }
                }
                activate(injected);
            })();
            isConfirm = false;
        }
    }, [account, error]);

    useEffect(() => {
        if (!active && localStorage.getItem("accountStatus")) {
            activate(injected);
        }
    }, [])

    const customStyles = {
        content: {
            top: '65px',
            left: 'auto',
            right: '10px',
            bottom: 'auto',
            backgroundColor: "transparent",
            border: 'none',
            overflow: 'hidden',
        },
    };

    ReactModal.defaultStyles.overlay.backgroundColor = 'rgba(0,0,0,0)';

    const isMobile = useMediaQuery("(max-width: 600px)")

    return (
        <Flex justifyContent={isMobile ? 'space-between' : 'flex-end'} className="header">
            {isMobile && (
                <Flex m='20px 10px'>
                    <ReactiveButton idleText={
                        <Icon icon="line-md:menu-unfold-left" width='24' height='24' />
                    } color="teal" onClick={() => setToggle(true)} rounded shadow />
                </Flex>
            )}
            {!account ? (
                <Flex m={isMobile ? '20px 10px' : '20px'}>
                    <ReactiveButton idleText={
                        <Flex alignItems='center'>
                            <Icon icon="logos:metamask-icon" color="white" width="25" height="25" />
                            <Text ml='5px' bold>Connect Wallet</Text>
                        </Flex>
                    } size="large" color="teal" onClick={handleLogin} rounded shadow />
                </Flex>
            ) : (
                <Flex m={isMobile ? '20px 10px' : '20px'}>
                    <ReactiveButton idleText={
                        <Flex alignItems='center'>
                            <lottie-player
                                autoplay
                                loop
                                mode="normal"
                                src="https://assets7.lottiefiles.com/packages/lf20_yZpLO2.json"
                                style={{ width: "60px", margin: '-20px -10px -10px' }}
                            />
                            <Text ml="5px" mr="10px" bold>{account.slice(0, 4)}...{account.slice(-4)}</Text>
                            <Icon icon="ant-design:caret-down-filled" color="#00B5AD" width="15" height="15" />
                        </Flex>
                    } size="large" color="teal" onClick={() => setIsNetworkSelectModalOpen(true)} outline rounded shadow />
                    <ReactModal isOpen={isNetworkSelectModalOpen} onRequestClose={() => closeModal()} style={customStyles}>
                        <Flex flexDirection="column" className="accountModal">
                            <Flex alignItems='center' justifyContent='space-between'>
                                <Text bold>Account</Text>
                                <ReactiveButton idleText={
                                    <Flex alignItems='center'>
                                        <Icon icon="clarity:logout-line" color="#f4516c" width="15" height="15" />
                                        <Text fontSize="12px" ml="3px">Logout</Text>
                                    </Flex>
                                } size="small" onClick={handleLogout} color="red" outline rounded />
                            </Flex>
                            <Flex alignItems='center' mt="20px">
                                <Icon icon="et:wallet" color="#00B5AD" width="30" height="30" />
                                <Text m="0 10px" bold>{account.slice(0, 7)}...{account.slice(-7)}</Text>
                                <div onClick={() => {
                                    navigator.clipboard.writeText(account)
                                    copyToClipBoard()
                                }} className='cursor-pointer'>
                                    <Icon icon="fluent:copy-24-filled" color="#00B5AD" width="30" height="30" />
                                </div>
                            </Flex>
                        </Flex>
                    </ReactModal>
                    <div id="snackbar">Copied</div>
                </Flex>
            )}
        </Flex>
    )
}

export default Header