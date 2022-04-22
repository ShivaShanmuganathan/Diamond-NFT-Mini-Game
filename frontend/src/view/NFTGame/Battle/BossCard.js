import React, { useRef } from "react";
import _ from "lodash";
import { AnimateKeyframes } from 'react-simple-animate';
import { Flex, Text } from "crox-new-uikit";
import useWave from 'use-wave'
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const BossCard = ({ boss, animation }) => {
    const wave = useWave({
        color: 'black',
    })

    const percent = boss.hp / boss.maxHp * 100;
    const trailColor = useRef('yellowgreen');

    return (
        <CircularProgressbarWithChildren
            value={percent}
            strokeWidth={3}
            styles={buildStyles({
                pathColor: trailColor.current,
                trailColor: "#1d2125"
            })}
            className='progressBar'
        >
            <Flex className='bossCard_border' justifyContent='center'>
                <Flex className='bossCard_border' justifyContent='center'>
                    <Flex className='bossCard_border' justifyContent='center'>
                        <Flex className='bossCard_border' justifyContent='center'>
                            <Flex className='bossCard_border' justifyContent='center'>
                                <Flex flexDirection='column' className="bossCard" ref={wave} alignItems='center' justifyContent='center'>
                                    <Text fontSize="65px" mb='20px' className="bossName" bold>{boss.name}</Text>
                                    <Flex flexDirection='column' className="gameCard bossCard__img" alignItems='center'>
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
                                            <img alt={boss.name} src={boss.imageURI} />
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

export default BossCard