import React from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Text } from "crox-new-uikit";
import ReactiveButton from 'reactive-button';
import './gadget.css'

const Empty = () => {
    const navigate = useNavigate();
    return (
        <Flex flexDirection='column' alignItems='center' className="container-n">
            <Text fontSize="24px" color="#e2e2e2" mb={10} bold>You don&apos;t have NFT.</Text>
            <lottie-player
                autoplay
                loop
                mode="normal"
                src="https://assets7.lottiefiles.com/datafiles/vhvOcuUkH41HdrL/data.json"
                class='animation'
                style={{ width: '200px' }}
            />
            <Flex mt='10px'>
                <ReactiveButton idleText={
                    "Mint First"
                } color="teal" onClick={() => navigate('/nftch')} rounded size="large" />
            </Flex>
        </Flex>
    )
}

export default Empty