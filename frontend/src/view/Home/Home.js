import React from "react";
import { WalletConnect, WaveMe, MintNFT, NFTGame } from "../../components/Gadget";
import { useWeb3React } from "@web3-react/core";
import { Flex } from "crox-new-uikit";
import useMediaQuery from "use-mediaquery";
import '../../assets/style/scss/style-common.scss'
import '../../assets/style/scss/style-basic.scss'
import './home.css'

function Home(props) {
    const { collapse } = props
    const { account } = useWeb3React()
    const isMobile = useMediaQuery("(max-width: 600px)")
    return (
        <Flex className={!collapse ? "container mobile-home" : "container mobile-home wider-width"} justifyContent='center' alignItems='center' flexDirection='column' mt={50} >
            {!account && <Flex justifyContent='center' flexDirection='column' alignItems='center'>
                <WalletConnect />
            </Flex>}
            <Flex justifyContent='center' alignItems='center' flexDirection={isMobile ? 'column' : 'row'}>
                <WaveMe />
                <Flex m={10} />
                <MintNFT />
                <Flex m={10} />
                <NFTGame />
            </Flex>
        </Flex >
    )
}

export default Home