import React from 'react';
import { ProSidebar, Menu, MenuItem, SidebarHeader, SidebarContent, SidebarFooter, SubMenu } from 'react-pro-sidebar';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Flex, Link } from 'crox-new-uikit';
import useMediaQuery from "use-mediaquery";
import { Button } from './CommonComponents';
import '../assets/style/scss/react-pro-sidebar.scss'
import 'react-pro-sidebar/dist/css/styles.css';

function Sidebar(props) {
    const { setCollapse, collapse, toggle, setToggle } = props;
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width: 600px)")
    collapse && !isMobile ? (document.body.style.overflow = 'hidden') : (document.body.style.overflow = 'auto');

    return (
        <ProSidebar className='proSidebar' collapsed={collapse} toggled={toggle} breakPoint='md' image='/sidebar/valbg2.png'>
            <SidebarHeader className='proSidebar__header'>
                <img src='/sidebar/logo2.png' alt='logo' className={!collapse ? 'proSidebar__header__logo' : 'proSidebar__header__logo img-size-75'} />
            </SidebarHeader>
            <SidebarContent>
                
                <Menu iconShape='circle'>
                    <MenuItem icon={<Icon icon="flat-color-icons:home" fontSize='20px' />} onClick={() => { navigate("/") }}>Home</MenuItem>
                    {/* <MenuItem icon={<Icon icon="noto:water-wave" fontSize='20px' />} onClick={() => { navigate("/wave") }}>WaveMe</MenuItem> */}
                    <SubMenu 
                    title="NFT Game" 
                    icon={<Icon icon="noto:video-game" fontSize='20px' />} 
                    >

                        <MenuItem icon={<Icon icon="noto:joystick" fontSize='20px' />} onClick={() => { navigate("/nftch") }}>Choose Character</MenuItem>
                        <MenuItem icon={<Icon icon="twemoji:crossed-swords" fontSize='20px' />} onClick={() => { navigate("/nftbattle") }}>Battle</MenuItem>
                        <MenuItem icon={<Icon icon="noto:bank" fontSize='20px' />} onClick={() => { navigate("/nftstake") }}>Stake</MenuItem>

                    </SubMenu>

                    <SubMenu 
                    title="NFT Rental Market" 
                    icon={<Icon icon="emojione:department-store" fontSize='20px' />} 
                    >
                        <MenuItem icon={<Icon icon="emojione:department-store" fontSize='20px' />} onClick={() => { navigate("/rentalnfts") }}>Rental Market</MenuItem>
                        <MenuItem icon={<Icon icon="emojione:admission-tickets" fontSize='20px' />} onClick={() => { navigate("/listnfts") }}>My Listings</MenuItem>
                        <MenuItem icon={<Icon icon="twemoji:framed-picture" fontSize='20px' />} onClick={() => { navigate("/mynfts") }}>My NFTs</MenuItem>
                        <MenuItem icon={<Icon icon="twemoji:money-with-wings" fontSize='20px' />} onClick={() => { navigate("/myrentals") }}>Rented NFTs</MenuItem>
                        <MenuItem icon={<Icon icon="twemoji:hourglass-done" fontSize='20px' />} onClick={() => { navigate("/lentnfts") }}>Lent NFTs</MenuItem>
                    </SubMenu>
                </Menu>    

                
            </SidebarContent>
            <SidebarFooter>
                <Flex flexDirection={collapse ? 'column' : 'row'} justifyContent='center' alignItems='center' p='20px' mr={!collapse && '30px'}>
                    <Link href="https://github.com/ShivaShanmuganathan" mr={!collapse && '10px'} mb={collapse && '10px'}><Icon icon="bi:github" color="white" width="25" height="25" /></Link>
                    <Link href="https://www.linkedin.com/in/shiva-shanmuganathan/" mr={!collapse && '10px'} mb={collapse && '10px'}><Icon icon="bi:linkedin" color="white" width="25" height="25" /></Link>
                    <Link href="http://shiva-blockchain-portfolio.netlify.app/" mr={!collapse && '10px'} mb={collapse && '10px'}><Icon icon="ic:round-personal-video" color="white" width="25" height="25" /></Link>
                    <Link href="https://twitter.com/shanshiva1"><Icon icon="simple-icons:twitter" color="white" width="25" height="25" /></Link>
                    
                    {collapse && (
                        <Button className='proSidebar__collapseBtn relative' onClick={() => setCollapse(!collapse)}>
                            <lottie-player
                                autoplay
                                loop
                                mode="normal"
                                src="https://assets1.lottiefiles.com/datafiles/9P0TTCFMNh7ejB7/data.json"
                                style={{ width: '30px' }}
                            />
                        </Button>
                    )}
                </Flex>
            </SidebarFooter>
            {!collapse && (
                <Button className='proSidebar__collapseBtn' onClick={() => isMobile ? setToggle(false) : setCollapse(!collapse)}>
                    <lottie-player
                        autoplay
                        loop
                        mode="normal"
                        src="https://assets7.lottiefiles.com/datafiles/5uaVMFvoH3yRSoC/data.json"
                        style={{ width: '30px' }}
                    />
                </Button>
            )}
        </ProSidebar >
    )
}

export default Sidebar