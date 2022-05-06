// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

// ERC721 Token 🎫 in Diamond Standard.
import "../tokens/ERC721Diamond.sol";
// LibERC721 📃 Allows For Helper Functions
import {LibERC721} from "../libraries/LibERC721.sol";
// Helper ⛑ we wrote to encode in Base64
import "../libraries/Base64.sol";
// LibDiamond 💎 Allows For Diamond Storage
import "../libraries/LibDiamond.sol";
// Structs imported from AppStorage
import {CharacterAttributes, BigBoss} from "../libraries/LibAppStorage.sol";
// Hardhat Console Debugging Easy
import "hardhat/console.sol";


// @title NFT Based Mini Game
/// @author Shiva Shanmuganathan
/// @notice You can use this contract for implementing a simple NFT based game to change NFT Metadata
/// @dev All function calls are currently implemented without side effects
contract DynamicGameFacet is ERC721Diamond {


  // Events to show that a Minting & Attacking action has been completed 
  event CharacterNFTMinted(address sender, uint256 tokenId, uint256 characterIndex);
  event AttackComplete(uint newBossHp, uint newPlayerHp);


  // Data is passed in to the contract when it's first created initializing the characters.
  // We're going to actually pass these values in from from run.js.
  
    /// @notice Update Fee to mint the NFTs
    /// @dev Only the contract owner will be able to update the minting fee
    /// @param _fee The updated fee is passed by contract owner
    function updateFee(uint256 _fee) external {

        LibDiamond.enforceIsContractOwner();
        s.fee = _fee;

    }


  /// @notice Mints the NFT of the selected character
  /// @dev The payable function requires users to pay the fee amount to mint the NFT. 
  /// @param _characterIndex The index of the character the user chooses to Mint
  
  function mintCharacterNFT(uint _characterIndex) external payable{
    require(msg.value >= s.fee);
    uint256 newItemId = s._tokenIds;

    _safeMint(msg.sender, newItemId);

    s.nftHolderAttributes[newItemId] = CharacterAttributes({
      
      characterIndex: _characterIndex,
      name: s.defaultCharacters[_characterIndex].name,
      imageURI: s.defaultCharacters[_characterIndex].imageURI,
      hp: s.defaultCharacters[_characterIndex].hp,
      maxHp: s.defaultCharacters[_characterIndex].hp,
      attackDamage: s.defaultCharacters[_characterIndex].attackDamage,
      levels: s.defaultCharacters[_characterIndex].levels
      
    });

    // console.log("Minted NFT w/ tokenId %s and characterIndex %s", newItemId, _characterIndex);  

    
    s.totalTokens = newItemId;
    s._tokenIds += 1;
    
    emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);

  }


  /// @notice View Function that returns NFT Metadata of token as a string 
  /// @dev The tokenURI function is overridden to get character attributes and return the  json object as string
  /// @param _tokenId It is used to uniquely identify NFTs
  /// @return Returns the encoded json object as string
  /// @inheritdoc ERC721Diamond
  function tokenURI(uint256 _tokenId) public view override returns (string memory) 
  {
    CharacterAttributes memory charAttributes = s.nftHolderAttributes[_tokenId];

    string memory strHp = Strings.toString(charAttributes.hp);
    string memory strMaxHp = Strings.toString(charAttributes.maxHp);
    string memory strAttackDamage = Strings.toString(charAttributes.attackDamage);

    string memory json = Base64.encode(

        abi.encodePacked(
          '{"name": "',
          charAttributes.name,
          ' -- NFT #: ',
          Strings.toString(_tokenId),
          '", "description": "An epic NFT", "image": "ipfs://',
          charAttributes.imageURI,
          '", "attributes": [ { "trait_type": "Health Points", "value": ',strHp,', "max_value":',strMaxHp,'}, { "trait_type": "Attack Damage", "value": ', strAttackDamage,'}, { "trait_type": "Levels", "value": "',charAttributes.levels,'"} ]}'          
        )
    );

    string memory output = string(
      abi.encodePacked("data:application/json;base64,", json)
    );
    
    return output;
  }


  /// @notice User with NFT can attack the Boss [Metadata Of NFT Changes Here]
  /// @dev The Health of Boss & User's NFT is reduced becuase of attack. [Metadata Of NFT Changes Here]
  /// The user's address is used to get the NFT the user owns
  /// Health of Boss & Hero is reduced due to fight  
  function attackBoss(uint tokenID) public {
    // Get the state of the player's NFT.
    
    // uint256 nftTokenIdOfPlayer = s.nftHolders[msg.sender][_index];
    require(s._owners[tokenID] == msg.sender, "Not NFT Owner");
    CharacterAttributes storage player = s.nftHolderAttributes[tokenID];

    // console.log("\nPlayer w/ character %s about to attack. Has %s HP and %s AD", player.name, player.hp, player.attackDamage);
    // console.log("Boss %s has %s HP and %s AD", s.bigBoss.name, s.bigBoss.hp, s.bigBoss.attackDamage);
    // Make sure the player has more than 0 HP.
    require (
      player.hp > 0,
      "Error: character must have HP to attack boss."
    );

    // Make sure the boss has more than 0 HP.
    require (
      s.bigBoss.hp > 0,
      "Error: boss must have HP to attack boss."
    );

    // Allow player to attack boss.
    if (s.bigBoss.hp < player.attackDamage) {
      s.bigBoss.hp = 0;
    } else {
      s.bigBoss.hp = s.bigBoss.hp - player.attackDamage;
    }

    // Allow boss to attack player.
    if (player.hp < s.bigBoss.attackDamage) {
      player.hp = 0;
    } else {
      player.hp = player.hp - s.bigBoss.attackDamage;
    }

    // Console for ease.
    // console.log("%s attacked Boss. Boss hp: %s\n", player.name, s.bigBoss.hp);
    // console.log("Boss attacked %s. %s hp: %s\n", player.name, player.name ,player.hp);
    emit AttackComplete(s.bigBoss.hp, player.hp);
  }


  /// @notice Function to check whether user owns an NFT
  /// @dev If the user has NFTs, Struct with Attributes of NFTs is returned 
  /// @dev If not, empty struct is returned when user does not have any NFTs
  /// @return A struct containing the Token's Attributes are returned 
  /// The address of message sender is used to get the tokenId
  //// The tokenId is then used to get the attributes of NFT 
  function checkIfUserHasNFT() public view returns (CharacterAttributes[] memory) {
    
    uint[] memory nftArray = LibERC721._tokensOfOwner(msg.sender);

    if(nftArray.length == 0){
      CharacterAttributes[] memory emptyStruct;
      return emptyStruct;
    }

    CharacterAttributes[] memory charArray = new CharacterAttributes[](nftArray.length);

    for(uint i=0; i<nftArray.length; i++){

        charArray[i] = s.nftHolderAttributes[nftArray[i]];

    }

    return charArray;

  }
  
  /// @notice View function to check the attributes of Boss
  /// @dev public view function that returns attributes of boss as struct
  /// @return A struct containing the attributes of Boss is returned
  function getBigBoss() public view returns (BigBoss memory) {
    
    return s.bigBoss;

  }

  /// @notice View function to get attributes of all default characters
  /// @dev public view function that returns attributes of all default characters as struct
  /// @return A struct containing the attributes of all default characters is returned
  function getAllDefaultCharacters() external view returns (CharacterAttributes[] memory) {

    return s.defaultCharacters;

  }


  /// @notice Withdraw function for contract owner to withdraw the funds
  /// @dev call function is used to transfer balance over transfer function due to security reasons
  /// enforceIsContractOwner is used to verify the contract owner
  function withdraw() external {

    LibDiamond.enforceIsContractOwner();
    (bool success, ) = msg.sender.call{value: address(this).balance}("");
    require(success, "Transfer failed.");

  }

  /// @notice View function to get tokenIDs of user
  /// @dev external view function that returns all tokenIDs of user
  /// @return val is an array of tokenIDs owner by the user
  function nftHolders(address user) external view returns(uint256[] memory val) {

    return LibERC721._tokensOfOwner(user);

  }

  /// @notice View function to get characterAttributes of tokenID 
  /// @dev external view function that returns character attributes of tokenID
  /// @return CharacterAttributes of tokenID
  function nftHolderAttributes(uint256 tokenID) external view returns(CharacterAttributes memory) {

    return LibERC721.getNFTHolderAttributes(tokenID);

  }

  /// @notice View function to get total number of tokens 
  /// @dev external view function that returns total number of tokens
  /// @return val is total number of tokens as uint
  function totalTokens() external view returns(uint256 val) {

    val = s.totalTokens;

  }


}
