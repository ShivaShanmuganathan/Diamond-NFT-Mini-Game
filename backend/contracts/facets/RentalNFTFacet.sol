// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

// LibDiamond 💎 Allows For Diamond Storage
import "../libraries/LibDiamond.sol";

// LibRentalStorage 💎 Allows For Diamond Storage
import "../libraries/LibRentalStorage.sol";

// LibAppStorage 📱 Allows For App Storage
import "../libraries/LibAppStorage.sol";

// Structs imported from AppStorage
import {CharacterAttributes} from "../libraries/LibAppStorage.sol";

// LibERC721 Allows usage of ERC721 functions
import "../libraries/LibERC721.sol";

// Hardhat Console Debugging Easy
import "hardhat/console.sol";


// @title Collateral Free NFT Rental Marketplace 
/// @author Shiva Shanmuganathan
/// @notice This contract is used to implement a Collateral Free NFT Rental Marketplace for NFT Mini Game
/// @dev All function calls are currently implemented without side effects
contract RentalNFTFacet is ReentrancyGuard{
    // Using App Storage
    AppStorage internal s;

    // Event to indicate that an NFT is Listed in Rental Marketplace 
    event AssetListed(uint tokenId, uint rentMaxTime, uint price, address owner);
    
    // Event to indicate that an NFT has been Rented from the Rental Marketplace 
    event AssetRented(uint tokenId, uint rentStartTime, uint rentEndTime, uint price, address renter);

    // Event to indicate that a Rented NFT has been returned from the Renter to Seller after renting is complete 
    event AssetReturned(uint tokenId, uint rentEndTime, uint price, address renter);

    // Event to indicate that a Listed NFT has been returned from the Rental Marketplace to Seller [Lisitng Cancellation]
    event AssetUnListed(uint tokenId, address owner);

    /// @notice List NFT function is used to list an NFT in the Rental Marketplace
    /// @dev Only the NFT owner will be able to list their NFT in the Rental Marketplace
    /// @param tokenID The tokenID of the NFT to be listed
    /// @param price The price per minute of the NFT to be listed
    /// @param maxRental The maximum rental duration the seller allows to rent their NFT for
    function listNFT(uint tokenID, uint price, uint maxRental) external {
        
        LibRentalStorage.RentalMarketData storage rss = LibRentalStorage.diamondStorage();
        console.log("Owner of TokenID",s._owners[tokenID]);
        console.log("MSG SENDER",msg.sender);
        
        require(s._owners[tokenID] == msg.sender, "Not NFT Owner");       
        LibRentalStorage.RentalInfo storage rental_asset = rss.Rental[tokenID];

        require(rental_asset.isRented == false, "NFT Already Rented.");
        require(maxRental > 0, "Request Denied");
        require(price > 0, "Request Denied");

        rental_asset.price = price;
        rental_asset.expiresAt = 0;
        rental_asset.maxRental = maxRental;
        rental_asset.seller = payable(msg.sender);
        rental_asset.renter = address(0);
        rental_asset.isRented = false;

        console.log("Address of THIS CONTRACT", address(this));

        LibERC721._safeTransfer(msg.sender, address(this), tokenID, "");
        emit AssetListed(tokenID, maxRental, price, msg.sender);
        
    }

    /// @notice Cancel Listing function is used to cancel the listing in the Rental Marketplace
    /// @dev Only the NFT seller will be able to unlist their NFT from the Rental Marketplace. The NFT is returned from the rental marketplace to the NFT seller.
    /// @dev nonReentrant is used to prevent reentrancy attack
    /// @param tokenID The tokenID of the NFT to be unlisted
    function cancelListing(uint tokenID) external nonReentrant{
        
        LibRentalStorage.RentalMarketData storage rss = LibRentalStorage.diamondStorage();
        console.log("Owner of TokenID",s._owners[tokenID]);
        console.log("MSG SENDER",msg.sender);
        console.log("Address of THIS CONTRACT", address(this));
        
        require(s._owners[tokenID] == address(this), "Not NFT Owner");       

        LibRentalStorage.RentalInfo storage rental_asset = rss.Rental[tokenID];

        require(rental_asset.isRented == false, "NFT Already Rented.");
        require(rental_asset.seller == msg.sender, "Not NFT Lister");
        
        LibERC721._safeTransfer(address(this), msg.sender, tokenID, "");
        
        delete rss.Rental[tokenID];
        
        emit AssetUnListed(tokenID, msg.sender);
    }

    /// @notice Rent NFT function can called by renter to start renting of the NFT
    /// @dev This function can called by renter using tokenID & rental duration of listed NFT
    /// @dev NFT seller receives the rental fee sent by renter 
    /// @dev nonReentrant is used to prevent reentrancy attacks
    /// @param tokenID The tokenID of the NFT to start renting
    /// @param rentalDuration The rentalDuration the renter wants to rent this NFT for. rentalDuration must be lesser than maximum rental duration.
    function rentNFT(
        uint tokenID,
        uint rentalDuration
    ) external payable nonReentrant{

            LibRentalStorage.RentalMarketData storage rss = LibRentalStorage.diamondStorage();
        
            LibRentalStorage.RentalInfo storage rental_asset = rss.Rental[tokenID];
            require(rental_asset.isRented == false, "NFT Already Rented.");
            require(rentalDuration > 0, "Request Denied");
            require(rentalDuration <= rental_asset.maxRental, "Request Lower Time");
            uint price = rental_asset.price * (rentalDuration);
            require(msg.value == price, "Pay Exact Price");           
            require(LibERC721._ownerOf( tokenID) == address(this), "Token NA");
            rental_asset.seller.transfer(msg.value);
            LibERC721._safeTransfer(address(this), msg.sender, tokenID, "");

            rental_asset.renter = msg.sender;
            rental_asset.expiresAt = block.timestamp + (rentalDuration * AppConstants.minutesInSeconds);
            rental_asset.isRented = true;            
            
    }

    /// @notice Finish Renting function can called by renter or lender to end renting of the NFT
    /// @dev This function can either be called by renter before rental time expires or it could be called by seller after the rental time expires
    /// @dev nonReentrant is used to prevent reentrancy attacks
    /// @dev After the rental expiry time, anyone can call this function to end the renting of an NFT. However, NFT is received only by the NFT seller
    /// @param tokenID The tokenID of the rented NFT to finish renting
    function finishRenting(uint tokenID) external nonReentrant{

        LibRentalStorage.RentalMarketData storage rss = LibRentalStorage.diamondStorage();
        
        LibRentalStorage.RentalInfo storage rental_asset = rss.Rental[tokenID];

        require(rental_asset.isRented == true, "NFT is not Rented.");

        require(
            msg.sender == rental_asset.renter ||
                block.timestamp >= rental_asset.expiresAt,
            "RentableNFT: this token is rented"
        );


        rental_asset.isRented = false;

        LibERC721._safeTransfer(rental_asset.renter, rental_asset.seller, tokenID, "");
        
        delete rss.Rental[tokenID];
        
    }

    /// @notice This view function returns the rental status of NFT using tokenID
    /// @dev The tokenID is used to fetch rental details of the NFT from Diamond Storage
    /// @param tokenID The tokenID of the NFT to fetch rental status
    /// @return This function returns Rental Information of NFT using Diamond Storage
    function fetchNFTRentalStatus(uint tokenID) external view returns(LibRentalStorage.RentalInfo memory){

        LibRentalStorage.RentalMarketData storage rss = LibRentalStorage.diamondStorage();
        LibRentalStorage.RentalInfo storage rental_asset = rss.Rental[tokenID];
        return rental_asset;

    }

    /// @notice This view function returns all NFTs listed in rental marketplace
    /// @dev The function loops through all the NFTs the contract owns and checks the rental status using Diamond Storage
    /// @return This function returns 3 arrays -> first array contains the Chararacter Attributes of NFTs; second array contains the Rental Information of NFTs; third array contains the tokenIDs of NFTs
    function fetchMarketItems() external view returns(CharacterAttributes[] memory, LibRentalStorage.RentalInfo[] memory, uint[] memory){

        uint totalItemCount = LibERC721._balanceOf(address(this));
        uint itemCount = 0;
        uint currentIndex = 0;
        LibRentalStorage.RentalMarketData storage rss = LibRentalStorage.diamondStorage();
        

        for (uint i = 0; i < totalItemCount; i++) {
            uint tokenID = s._ownedTokens[address(this)][i];

            if ( (rss.Rental[tokenID].seller != address(0)) && (rss.Rental[tokenID].expiresAt == 0) ) {
                itemCount += 1;
            }
        }

        if(itemCount == 0){
            CharacterAttributes[] memory emptyStruct;
            LibRentalStorage.RentalInfo[] memory emptyItems;
            uint[] memory emptyArray;
            return (emptyStruct, emptyItems, emptyArray);
        }

        CharacterAttributes[] memory charArray = new CharacterAttributes[](itemCount);
        LibRentalStorage.RentalInfo[] memory marketItems = new LibRentalStorage.RentalInfo[](itemCount);
        uint[] memory tokenArray = new uint[](itemCount);

        for (uint i = 0; i < totalItemCount; i++) {

            uint tokenID = s._ownedTokens[address(this)][i];

            if ( (rss.Rental[tokenID].seller != address(0)) && (rss.Rental[tokenID].expiresAt == 0) ) 
            {

                charArray[currentIndex] = s.nftHolderAttributes[tokenID];
                marketItems[currentIndex] = rss.Rental[tokenID];
                tokenArray[currentIndex] = tokenID;
                currentIndex += 1;
                
            }
        }

        return (charArray, marketItems, tokenArray);

    }

    /// @notice This view function returns NFTs that a user has listed in rental marketplace
    /// @dev The function returns NFTs that are listed by the user through the rental marketplace; This function returns both the lent nfts & listed nfts
    /// @return This function returns 3 arrays -> first array contains the Chararacter Attributes of NFTs; second array contains the Rental Information of NFTs; third array contains the tokenIDs of NFTs
    function fetchMyListedNFTs() external view returns(CharacterAttributes[] memory, LibRentalStorage.RentalInfo[] memory, uint[] memory){

        uint totalItemCount = LibERC721._balanceOf(address(this));
        uint itemCount = 0;
        uint currentIndex = 0;
        LibRentalStorage.RentalMarketData storage rss = LibRentalStorage.diamondStorage();
        

        for (uint i = 0; i < totalItemCount; i++) {
            uint tokenID = s._ownedTokens[address(this)][i];

            if ( rss.Rental[tokenID].seller == msg.sender ) {
                itemCount += 1;
            }
        }

        if(itemCount == 0){
            CharacterAttributes[] memory emptyStruct;
            LibRentalStorage.RentalInfo[] memory emptyItems;
            uint[] memory emptyArray;
            return (emptyStruct, emptyItems, emptyArray);
        }

        CharacterAttributes[] memory charArray = new CharacterAttributes[](itemCount);
        LibRentalStorage.RentalInfo[] memory marketItems = new LibRentalStorage.RentalInfo[](itemCount);
        uint[] memory tokenArray = new uint[](itemCount);

        for (uint i = 0; i < totalItemCount; i++) {

            uint tokenID = s._ownedTokens[address(this)][i];

            if ( (rss.Rental[tokenID].seller == msg.sender) ) 
            {

                charArray[currentIndex] = s.nftHolderAttributes[tokenID];
                marketItems[currentIndex] = rss.Rental[tokenID];
                tokenArray[currentIndex] = tokenID;
                currentIndex += 1;
                
            }
        }

        return (charArray, marketItems, tokenArray);


    }

    /// @notice This view function returns only NFTs that a user owns, and has not listed in marketplace
    /// @dev The function returns only NFTs that are owned by user but are not listed in the rental marketplace
    /// @return This function returns 3 arrays -> first array contains the Chararacter Attributes of NFTs; second array contains the Rental Information of NFTs; third array contains the tokenIDs of NFTs
    function fetchMyUnListedNFTs() external view returns(CharacterAttributes[] memory, uint[] memory){

        uint[] memory nftArray = LibERC721._tokensOfOwner(msg.sender);
        uint itemCount = 0;
        uint currentIndex = 0;

        if(nftArray.length == 0){
            CharacterAttributes[] memory emptyStruct;
            uint[] memory emptyArray;
            return (emptyStruct, emptyArray);
        }

        LibRentalStorage.RentalMarketData storage rss = LibRentalStorage.diamondStorage();

        for (uint i; i < nftArray.length; i++) {
            if ( (rss.Rental[nftArray[i]].seller != msg.sender) && (rss.Rental[nftArray[i]].isRented == false) ) {
                itemCount += 1;
            }
        }

        if(itemCount == 0){
            CharacterAttributes[] memory emptyStruct;
            uint[] memory emptyArray;
            return (emptyStruct, emptyArray);
        }

        CharacterAttributes[] memory charArray = new CharacterAttributes[](itemCount);
        uint[] memory tokenArray = new uint[](itemCount);


        for (uint i; i < nftArray.length; i++) {

            if ( (rss.Rental[nftArray[i]].seller != msg.sender) && (rss.Rental[nftArray[i]].isRented == false) ) {

                charArray[currentIndex] = s.nftHolderAttributes[nftArray[i]];
                tokenArray[currentIndex] = nftArray[i];
                currentIndex += 1;
            }
        }

        return (charArray, tokenArray);

    }

    /// @notice This view function returns only NFTs that a user has rented from marketplace
    /// @dev The function loops through NFTs that are owned by user, and returns only NFTs that are rented by the user
    /// @return This function returns 3 arrays -> first array contains the Chararacter Attributes of NFTs; second array contains the Rental Information of NFTs; third array contains the tokenIDs of NFTs
    function fetchRentedNFTs() external view returns(CharacterAttributes[] memory, LibRentalStorage.RentalInfo[] memory, uint[] memory){

        uint[] memory nftArray = LibERC721._tokensOfOwner(msg.sender);
        uint itemCount = 0;
        uint currentIndex = 0;

        if(nftArray.length == 0){
            CharacterAttributes[] memory emptyStruct;
            LibRentalStorage.RentalInfo[] memory emptyItems;
            uint[] memory emptyArray;
            return (emptyStruct, emptyItems, emptyArray);
        }

        LibRentalStorage.RentalMarketData storage rss = LibRentalStorage.diamondStorage();

        for (uint i; i < nftArray.length; i++) {
            if (rss.Rental[nftArray[i]].renter == msg.sender) {
                itemCount += 1;
            }
        }

        if(itemCount == 0){
            CharacterAttributes[] memory emptyStruct;
            LibRentalStorage.RentalInfo[] memory emptyItems;
            uint[] memory emptyArray;
            return (emptyStruct, emptyItems, emptyArray);
        }

        CharacterAttributes[] memory charArray = new CharacterAttributes[](itemCount);
        LibRentalStorage.RentalInfo[] memory marketItems = new LibRentalStorage.RentalInfo[](itemCount);
        uint[] memory tokenArray = new uint[](itemCount);


        for (uint i; i < nftArray.length; i++) {

            if (rss.Rental[nftArray[i]].renter == msg.sender) { 

                charArray[currentIndex] = s.nftHolderAttributes[nftArray[i]];
                marketItems[currentIndex] = rss.Rental[nftArray[i]];
                tokenArray[currentIndex] = nftArray[i];
                currentIndex += 1;
            }
        }

        return (charArray, marketItems, tokenArray);

    }
    

    /// @notice This view function returns only NFTs that are lent by the user
    /// @dev The function loops through NFTs that are owned by user, and returns only NFTs that are rented by the user
    /// @return This function returns 3 arrays -> first array contains the Chararacter Attributes of NFTs; second array contains the Rental Information of NFTs; third array contains the tokenIDs of NFTs
    function fetchLentNFTs() external view returns(CharacterAttributes[] memory, LibRentalStorage.RentalInfo[] memory, uint[] memory){

        uint totalItemCount = s.totalTokens;
        uint itemCount = 0;
        uint currentIndex = 0;
        LibRentalStorage.RentalMarketData storage rss = LibRentalStorage.diamondStorage();
        

        for (uint i = 0; i < totalItemCount; i++) {
            if ((rss.Rental[i + 1].seller == msg.sender) && (rss.Rental[i + 1].isRented == true)) {
                itemCount += 1;
            }
        }

        if(itemCount == 0){
            CharacterAttributes[] memory emptyStruct;
            LibRentalStorage.RentalInfo[] memory emptyItems;
            uint[] memory emptyArray;
            return (emptyStruct, emptyItems, emptyArray);
        }

        CharacterAttributes[] memory charArray = new CharacterAttributes[](itemCount);
        LibRentalStorage.RentalInfo[] memory marketItems = new LibRentalStorage.RentalInfo[](itemCount);
        uint[] memory tokenArray = new uint[](itemCount);

        for (uint i = 0; i < totalItemCount; i++) {

            if ((rss.Rental[i + 1].seller == msg.sender) && (rss.Rental[i + 1].isRented == true)) {

                charArray[currentIndex] = s.nftHolderAttributes[i+1];
                marketItems[currentIndex] = rss.Rental[i + 1];
                tokenArray[currentIndex] = i+1;
                currentIndex += 1;
                
            }
        }

        return (charArray, marketItems, tokenArray);


    }
    

}