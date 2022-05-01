// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

// LibDiamond 💎 Allows For Diamond Storage
// import "../libraries/LibDiamond.sol";

// LibStakeNFTStorage 💎 Allows For Diamond Storage
import "../libraries/LibRentalStorage.sol";

// Structs imported from DiamondStorage
// import "../libraries/LibStakeStorage.sol";

import "../libraries/LibAppStorage.sol";

// Structs imported from AppStorage
// import {CharacterAttributes, BigBoss} from "../libraries/LibAppStorage.sol";

// Hardhat Console Debugging Easy
import "hardhat/console.sol";

// import "./DynamicGameFacet.sol";

// import "../tokens/ERC721Diamond.sol";

import "../libraries/LibERC721.sol";


// @title NFT Based Mini Game
/// @author Shiva Shanmuganathan
/// @notice You can use this contract for implementing a simple NFT based game to change NFT Metadata
/// @dev All function calls are currently implemented without side effects
contract RentalNFTFacet is ReentrancyGuard{
    AppStorage internal s;

    event AssetListed(uint tokenId, uint rentMaxTime, uint price, address owner);
    // Events to show that a Minting & Attacking action has been completed 
    event AssetRented(uint tokenId, uint rentStartTime, uint rentEndTime, uint price, address renter);

    event AssetReturned(uint tokenId, uint rentEndTime, uint price, address renter);

    // Data is passed in to the contract when it's first created initializing the characters.
    // We're going to actually pass these values in from from run.js.
  
    /// @notice User with NFT can stake their character [Metadata Of NFT Changes Here]
    /// @dev The Health of User's NFT is increased becuase of staking. [Metadata Of NFT Changes Here]
    /// The user's address & index is used to get the NFT the user owns
    /// Health of Hero is increased due to staking  
    function listNFT(uint tokenID, uint price, uint maxRental) external {
        
        LibRentalStorage.RentalMarketData storage rss = LibRentalStorage.diamondStorage();
        console.log("Owner of TokenID",s._owners[tokenID]);
        console.log("MSG SENDER",msg.sender);
        
        require(s._owners[tokenID] == msg.sender, "Not NFT Owner");       
        LibRentalStorage.RentalInfo storage rental_asset = rss.Rental[tokenID];

        require(rental_asset.isRented == false, "NFT Already Rented.");
        // CharacterAttributes memory player = s.nftHolderAttributes[tokenID];
        // require(player.hp < player.maxHp, "Player Already Has Enough Hp");
        require(maxRental > 0, "Request Denied");

        rental_asset.price = price;
        rental_asset.expiresAt = 0;
        rental_asset.maxRental = maxRental;
        rental_asset.seller = payable(msg.sender);
        rental_asset.renter = address(0);
        rental_asset.isRented = false;

        // DynamicGameFacet(address(this)).transferFrom(msg.sender, address(this),  tokenID);
        // LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        // bytes4 functionSelector = bytes4(keccak256("transferFrom(address,address,uint256)"));
        // get facet address of function 
        // address facet = ds.facetAddressAndSelectorPosition[functionSelector].facetAddress; 

        console.log("Address of THIS CONTRACT", address(this));

        // (bool success, ) = facet.delegatecall(abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), tokenID));
        // require(success, "transfer failed"); 

        LibERC721._safeTransfer(msg.sender, address(this), tokenID, "");

        
        emit AssetListed(tokenID, maxRental, price, msg.sender);
        
    }

    function rentMarketItem(
        uint tokenID,
        uint rentalDuration
    ) external payable nonReentrant{

            LibRentalStorage.RentalMarketData storage rss = LibRentalStorage.diamondStorage();
        
            // require(s._owners[tokenID] == msg.sender, "Not NFT Owner");
            LibRentalStorage.RentalInfo storage rental_asset = rss.Rental[tokenID];
            require(rental_asset.isRented == false, "NFT Already Rented.");
            require(rentalDuration > 0, "Request Denied");
            require(rentalDuration <= rental_asset.maxRental, "Request Lower Time");
            uint price = rental_asset.price * (rentalDuration);
            require(msg.value == price, "Pay Exact Price");           
            require(LibERC721._ownerOf( tokenID) == address(this), "Token NA");            
            LibERC721._safeTransfer(address(this), msg.sender, tokenID, "");

            rental_asset.renter = msg.sender;
            rental_asset.expiresAt = block.timestamp + (rentalDuration * 86400);
            rental_asset.isRented = true;            
            
    }

    function finishRenting(uint tokenID) external nonReentrant{

        LibRentalStorage.RentalMarketData storage rss = LibRentalStorage.diamondStorage();
        
        // require(s._owners[tokenID] == msg.sender, "Not NFT Owner");        
        LibRentalStorage.RentalInfo storage rental_asset = rss.Rental[tokenID];

        require(rental_asset.isRented == true, "NFT is not Rented.");

        require(
            msg.sender == rental_asset.renter ||
                block.timestamp >= rental_asset.expiresAt,
            "RentableNFT: this token is rented"
        );


        rental_asset.isRented = false;

        // LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        // bytes4 functionSelector = bytes4(keccak256("transferFrom(address,address,uint256)"));
        // get facet address of function 
        // address facet = ds.facetAddressAndSelectorPosition[functionSelector].facetAddress; 

        // console.log("Address of THIS CONTRACT", address(this));

        // (bool success, ) = facet.delegatecall(abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, rental_asset.seller, tokenID));
        // require(success, "transfer failed"); 
        LibERC721._safeTransfer(rental_asset.renter, rental_asset.seller, tokenID, "");
        
        delete rss.Rental[tokenID];
        
    }




}