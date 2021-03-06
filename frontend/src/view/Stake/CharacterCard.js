import React, { useEffect, useRef } from "react";
import _ from "lodash";
import { AnimateKeyframes } from 'react-simple-animate';
import { Flex, Text } from "crox-new-uikit";
import useWave from 'use-wave'
import { Icon } from '@iconify/react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const CharacterCard = ({ character, animation, rentalState}) => {
    const wave = useWave({
        color: 'black',
    })

    const percent = character.hp / character.maxHp * 100
    const trailColor = useRef('yellowgreen')

    return (
        <CircularProgressbarWithChildren
            value={percent}
            strokeWidth={3}
            styles={buildStyles({
                pathColor: trailColor.current,
                trailColor: "#1d2125"
            })}
            className='progressBarCharacter'
        >
            <Flex className='bossCard_border' justifyContent='center'>
                <Flex className='bossCard_border' justifyContent='center'>
                    <Flex className='bossCard_border' justifyContent='center'>
                        <Flex className='bossCard_border' justifyContent='center'>
                            <Flex className='bossCard_border' justifyContent='center'>
                                <Flex flexDirection='column' className="CharacterCard" ref={wave} alignItems='center' justifyContent='center'>
                                    <Text fontSize="36px" mb='20px' className="bossName" bold>{character.name}</Text>
                                    <Flex flexDirection='column' className="gameCard CharacterCard__img" alignItems='center'>
                                    {rentalState === 'rented' && <Icon icon="fluent:clock-dismiss-20-regular" color="#ff4655" style={{ fontSize: '30px', right: '35px', top: '10px' }} className="card_icon" />}
                                        <AnimateKeyframes
                                            play
                                            pause={animation}
                                            iterationCount="infinite"
                                            direction="alternate"
                                            duration={1}
                                            keyframes={[
                                                'transform: scale(1)',
                                                'transform: scale(1.25)',
                                            ]}
                                        >
                                            <img alt={character.name} src={character.imageURI} />
                                        </AnimateKeyframes>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </CircularProgressbarWithChildren>
    )
}

export default CharacterCard