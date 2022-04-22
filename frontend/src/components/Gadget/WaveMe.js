import React from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Text } from "crox-new-uikit";
import './gadget.css'

const WaveMe = () => {
    const navigate = useNavigate();
    return (
        <Flex flexDirection='column' alignItems='center' className="container-n cursor btnfos-1 btnfos-4" onClick={() => navigate('/wave')}>
            <svg>
                <rect x="0" y="0" fill="none" width="100%" height="100%" />
            </svg>
            <Text fontSize="24px" color="#e2e2e2" mb={10} bold>Wave at Shiva</Text>
            <lottie-player
                autoplay
                loop
                mode="normal"
                src="https://assets6.lottiefiles.com/packages/lf20_riidvuxb.json"
                class='animation'
                style={{ width: '200px' }}
            />
        </Flex>
    )
}

export default WaveMe