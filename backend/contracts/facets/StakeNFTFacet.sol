// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

// LibDiamond 💎 Allows For Diamond Storage
import "../libraries/LibDiamond.sol";

// LibStakeStorage 💎 Allows For Diamond Storage
import "../libraries/LibStakeStorage.sol";

// Structs imported from DiamondStorage
import {LibERC721} from "../libraries/LibERC721.sol";

// LibAppStorage 📱 Allows For App Storage
import "../libraries/LibAppStorage.sol";

// Structs imported from AppStorage
import {CharacterAttributes, BigBoss} from "../libraries/LibAppStorage.sol";

// Importing the NFT Mini Game Facet
import "./DynamicGameFacet.sol";



// @title Staking Contract For NFT Mini Game
/// @author Shiva Shanmuganathan
/// @notice This contract can be used for implementing a simple staking & unstaking on NFT Mini Game to increase the charatcer's Health [NFT Metadata of character changes]
/// @dev All function calls are currently implemented without side effects
contract StakeNFTFacet {
    AppStorage internal s;

    // Events to show that a Minting & Attacking action has been completed 
    event AssetStaked(uint tokenId, uint stakeStartTime);
    event AssetUnstaked(uint tokenId, uint newPlayerHp, uint stakeStartTime, uint stakeEndTime);

    // Data is passed in to the contract when it's first created initializing the characters.
    // We're going to actually pass these values in from from run.js.
  
    /// @notice User with NFT can stake their character [Metadata Of NFT Changes Here]
    /// @dev The Health of User's NFT is increased becuase of staking. [Metadata Of NFT Changes Here]
    /// The user's address & index is used to get the NFT the user owns
    /// Health of Hero is increased due to staking  
    function stakeCharacter(uint tokenID) external {
        
        LibStakeStorage.StakeStorage storage lss = LibStakeStorage.diamondStorage();
        
        require(s._owners[tokenID] == msg.sender, "Not NFT Owner");        
        LibStakeStorage.StakeInfo storage staked_asset = lss.stakingInfo[tokenID];

        require(staked_asset.startTime == 0, "NFT Already Staked.");
        CharacterAttributes memory player = s.nftHolderAttributes[tokenID];
        require(player.hp < player.maxHp, "Player Already Has Enough Hp");

        staked_asset.startTime = block.timestamp;
        staked_asset.staker = msg.sender;

        console.log("Address of THIS CONTRACT", address(this));

        LibERC721._safeTransfer(msg.sender, address(this), tokenID, "");

        emit AssetStaked(tokenID, staked_asset.startTime);

    }

    /// @notice User with NFT can stake their character [Metadata Of NFT Changes Here]
    /// @dev The Health of User's NFT is increased becuase of staking. [Metadata Of NFT Changes Here]
    /// The user's address & index is used to get the NFT the user owns
    /// Health of Hero is increased due to staking  
    function unStakeCharacter(uint tokenID) external {
        LibStakeStorage.StakeStorage storage lss = LibStakeStorage.diamondStorage();
        
        
        LibStakeStorage.StakeInfo storage staked_asset = lss.stakingInfo[tokenID];
        require(staked_asset.startTime != 0, "NFT Is Not Staked.");
        require(staked_asset.staker == msg.sender, "Not NFT Staker");

        CharacterAttributes storage player = s.nftHolderAttributes[tokenID];

        uint stakedTime = block.timestamp - staked_asset.startTime;
        
        player.hp = player.hp + (stakedTime/60);

        if(player.hp >= player.maxHp){
            player.hp = player.maxHp;
        }

        staked_asset.startTime = 0;
        staked_asset.staker = address(0);
        
        DynamicGameFacet(address(this)).transferFrom(address(this), msg.sender, tokenID);
        
        emit AssetUnstaked(tokenID, player.hp, staked_asset.startTime, block.timestamp);

    }

    /// @notice User with Staked NFTs can call this function to know the time at which they staked their character
    /// @dev Staking start time can be retreived using this function 
    /// The tokenID of the NFT is used to get the staking start time
    function getStartTime(uint tokenID) external view returns(uint256){
        
        LibStakeStorage.StakeStorage storage lss = LibStakeStorage.diamondStorage();        
        LibStakeStorage.StakeInfo memory staked_asset = lss.stakingInfo[tokenID];
        return staked_asset.startTime;
        
    }

    /// @notice This view function fetches staked & unstaked NFTs of the user
    /// @dev This function returns 2 arrays -> first array contains tokenIDs of staked & unstaked NFTs; second array contains characterAttributes of staked & unstaked NFTs; 
    /// The user's address is used to get the staked & unstaked NFTs
    function fetchAssets() external view returns(uint[] memory, CharacterAttributes[] memory) {
        
        LibStakeStorage.StakeStorage storage lss = LibStakeStorage.diamondStorage();
        uint256 staked_length = LibERC721._balanceOf(address(this));
        uint256[] memory user_tokens = LibERC721._tokensOfOwner(msg.sender);
        uint256 userCount = user_tokens.length;
        uint256 stakeCount;
        uint256 indexCount;
        

        for(uint i; i < staked_length; i++){

           if(lss.stakingInfo[s._ownedTokens[address(this)][i]].staker == msg.sender){
               stakeCount += 1;
           }
            
        }

        uint256[] memory staked_tokens = new uint256[](stakeCount);

        for(uint i; i < staked_length; i++){

           if(lss.stakingInfo[s._ownedTokens[address(this)][i]].staker == msg.sender){
               
               staked_tokens[indexCount] = s._ownedTokens[address(this)][i];
               indexCount += 1;

           }
            
        }

        uint256[] memory val = new uint256[](stakeCount + userCount);

        for(uint i; i < stakeCount; i++){
            val[i] = staked_tokens[i];
        }

        indexCount = 0;
        for(uint i = stakeCount; i < stakeCount + userCount; i++){
            val[i] = user_tokens[indexCount];
            indexCount += 1;
        }

        CharacterAttributes[] memory charArray = new CharacterAttributes[](stakeCount + userCount);

        for(uint i; i<stakeCount + userCount; i++){

            charArray[i] = s.nftHolderAttributes[val[i]];

        }

        return (val, charArray);

    }



  

}
