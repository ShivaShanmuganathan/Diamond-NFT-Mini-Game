import React, { Suspense, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import PageLoader from './components/PageLoader'
import Header from "./components/Header";
import Sidebar from "./components/Sidebar"
import Home from "./view/Home"
import WaveMe from "./view/WaveMe";
import MintNFT from "./view/MintNFT";
import { NFTCharacter, NFTBattle } from "./view/NFTGame";
import { NFTStake } from "./view/Stake";
import { MyNFTs } from "./view/MyNFTs";
import { RentalNFTs } from "./view/NFTRentalMarket";
import { ListedNFTs } from "./view/MyListings";
import { MyRentals } from "./view/RentalNFTs";
import { LentNFTs } from "./view/LentNFTs";
import GlobalStyle from './assets/style/css/GlobalStyle'
// import './assets/style/css/globals.css';
import { Flex } from "crox-new-uikit";

function App() {
  const [collapse, setCollapse] = useState(false)
  const [toggle, setToggle] = useState(false)
  return (
    <>
      <BrowserRouter>
        <GlobalStyle />
        <Header toggle={toggle} setToggle={setToggle} />
        <Flex>
          <Sidebar collapse={collapse} setCollapse={setCollapse} toggle={toggle} setToggle={setToggle} />
          <Flex justifyContent='center'>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home collapse={collapse} />} />
                <Route path="/wave" element={<WaveMe collapse={collapse} />} />
                <Route path="/mint" element={<MintNFT collapse={collapse} />} />
                <Route path="/nftch" element={<NFTCharacter collapse={collapse} />} />
                <Route path="/nftbattle" element={<NFTBattle collapse={collapse} />} />
                <Route path="/nftstake" element={<NFTStake collapse={collapse} />} />
                <Route path="/mynfts" element={<MyNFTs collapse={collapse} />} />
                <Route path="/rentalnfts" element={<RentalNFTs collapse={collapse} />} />
                <Route path="/listnfts" element={<ListedNFTs collapse={collapse} />} />
                <Route path="/myrentals" element={<MyRentals collapse={collapse} />} />
                <Route path="/lentnfts" element={<LentNFTs collapse={collapse} />} />
                
              </Routes>
            </Suspense>
          </Flex>
        </Flex>
      </BrowserRouter>
    </>
  );
}

export default App;
