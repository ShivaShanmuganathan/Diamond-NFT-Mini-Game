// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

// LibDiamond 💎 Allows For Diamond Storage
import "../libraries/LibDiamond.sol";

// LibStakeNFTStorage 💎 Allows For Diamond Storage
import "../libraries/LibStakeStorage.sol";

// Structs imported from DiamondStorage
// import "../libraries/LibStakeStorage.sol";

import "../libraries/LibAppStorage.sol";

// Structs imported from AppStorage
import {CharacterAttributes, BigBoss} from "../libraries/LibAppStorage.sol";

// Hardhat Console Debugging Easy
import "hardhat/console.sol";


interface IERC721Diamond {
    function transferFrom(address from, address to, uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
}


// @title NFT Based Mini Game
/// @author Shiva Shanmuganathan
/// @notice You can use this contract for implementing a simple NFT based game to change NFT Metadata
/// @dev All function calls are currently implemented without side effects
contract StakeNFTFacet {
    AppStorage internal s;


    // Events to show that a Minting & Attacking action has been completed 
    event AssetStaked(uint tokenId, uint stakeStartTime);
    event AssetUnstaked(uint tokenId, uint stakeStartTime, uint stakeEndTime);

    // Data is passed in to the contract when it's first created initializing the characters.
    // We're going to actually pass these values in from from run.js.
  
    /// @notice User with NFT can stake their character [Metadata Of NFT Changes Here]
    /// @dev The Health of User's NFT is increased becuase of staking. [Metadata Of NFT Changes Here]
    /// The user's address & index is used to get the NFT the user owns
    /// Health of Hero is increased due to staking  
    function stakeCharacter(uint _index, address contractAddress) external {
        
        LibStakeStorage.StakeStorage storage ds = LibStakeStorage.diamondStorage();
        // Get the state of the player's NFT.
        uint256 nftTokenIdOfPlayer = s.nftHolders[msg.sender][_index];
        require(s._owners[nftTokenIdOfPlayer] == msg.sender, "Not NFT Owner");        
        LibStakeStorage.StakeInfo storage staked_asset = ds.stakingInfo[contractAddress][nftTokenIdOfPlayer];

        require(staked_asset.startTime == 0, "NFT Already Staked.");
        CharacterAttributes memory player = s.nftHolderAttributes[nftTokenIdOfPlayer];
        require(player.hp < player.maxHp, "Player Already Has Enough Hp");

        staked_asset.startTime = block.timestamp;
        staked_asset.staker = msg.sender;
        
        IERC721Diamond(contractAddress).transferFrom(msg.sender, address(this), nftTokenIdOfPlayer);
        // console.log("Address of TokenID ",nftTokenIdOfPlayer, " :", IERC721Diamond(contractAddress).ownerOf(nftTokenIdOfPlayer));
        emit AssetStaked(nftTokenIdOfPlayer, staked_asset.startTime);

    }

    /// @notice User with NFT can stake their character [Metadata Of NFT Changes Here]
    /// @dev The Health of User's NFT is increased becuase of staking. [Metadata Of NFT Changes Here]
    /// The user's address & index is used to get the NFT the user owns
    /// Health of Hero is increased due to staking  
    function unStakeCharacter(uint _index, address contractAddress) external {
        LibStakeStorage.StakeStorage storage ds = LibStakeStorage.diamondStorage();
        // Get the state of the player's NFT.
        uint256 nftTokenIdOfPlayer = s.nftHolders[msg.sender][_index];
        
        LibStakeStorage.StakeInfo storage staked_asset = ds.stakingInfo[contractAddress][nftTokenIdOfPlayer];
        require(staked_asset.startTime != 0, "NFT Is Not Staked.");
        require(staked_asset.staker == msg.sender, "Not NFT Staker");

        CharacterAttributes storage player = s.nftHolderAttributes[nftTokenIdOfPlayer];

        uint stakedTime = block.timestamp - staked_asset.startTime;
        
        player.hp = player.hp + (stakedTime/60);

        if(player.hp >= player.maxHp){
            player.hp = player.maxHp;
        }

        staked_asset.startTime = 0;

        IERC721Diamond(contractAddress).transferFrom(address(this), msg.sender, nftTokenIdOfPlayer);

        emit AssetUnstaked(nftTokenIdOfPlayer, staked_asset.startTime, block.timestamp);

    }


    function getStartTime(uint _index, address contractAddress) external view returns(uint256){
        LibStakeStorage.StakeStorage storage ds = LibStakeStorage.diamondStorage();
        // Get the state of the player's NFT.
        uint256 nftTokenIdOfPlayer = s.nftHolders[msg.sender][_index];
        
        LibStakeStorage.StakeInfo memory staked_asset = ds.stakingInfo[contractAddress][nftTokenIdOfPlayer];
        return staked_asset.startTime;
        
    }


  

}
