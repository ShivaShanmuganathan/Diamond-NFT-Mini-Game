import React from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Text } from "crox-new-uikit";
import './gadget.css'

const MintNFT = () => {
    const navigate = useNavigate();
    return (
        <Flex flexDirection='column' alignItems='center' className="container-n cursor btnfos-1 btnfos-4" onClick={() => navigate('/nftch')}>
            <svg>
                <rect x="0" y="0" fill="none" width="100%" height="100%" />
            </svg>
            <Text fontSize="24px" color="#e2e2e2" mb={10} bold>Metaverse Slayer</Text>
            <lottie-player
                autoplay
                loop
                mode="normal"
                src="https://assets10.lottiefiles.com/packages/lf20_sg3zxa.json"
                class='animation'
                style={{ width: '200px' }}
            />
        </Flex>
    )
}

export default MintNFT