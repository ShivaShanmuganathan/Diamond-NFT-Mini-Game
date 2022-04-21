// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Helper we wrote to encode in Base64
import "./libraries/Base64.sol";

// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Access Control Function
import "@openzeppelin/contracts/access/Ownable.sol";

// Makes Debugging Easy
import "hardhat/console.sol";


// @title NFT Based Mini Game
/// @author Shiva Shanmuganathan
/// @notice You can use this contract for implementing a simple NFT based game to change NFT Metadata
/// @dev All function calls are currently implemented without side effects
contract MyEpicGame is ERC721, Ownable{

  // We'll hold our character's attributes in a struct.   
  struct CharacterAttributes {
    uint characterIndex;
    string name;
    string imageURI;        
    uint hp;
    uint maxHp;
    uint attackDamage;
    string levels;
  }

  struct stakeAttributes {
    uint startTime; 
  }

  // The tokenId is the NFTs unique identifier, it's just a number that goes
  // 0, 1, 2, 3, etc.
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  uint256 public totalTokens;

  // This array help us hold the default data for our characters.
  // This will be helpful when we mint new characters and need to know things like their HP, AD, etc.
  CharacterAttributes[] defaultCharacters;
  
  // We create a mapping from the nft's tokenId => that NFTs attributes.
  mapping(uint256 => CharacterAttributes) public nftHolderAttributes;

  // We create a mapping from the nft's tokenId => that NFTs attributes.
  mapping(uint256 => stakeAttributes) public stakeInfo;

  // We create a struct to keep track of bigBoss's attributes
  struct BigBoss {
    string name;
    string imageURI;
    uint hp;
    uint maxHp;
    uint attackDamage;
  }

  // bigBoss is the Bad Guy that our Heroes Fight against
  BigBoss public bigBoss;

  // A mapping from an address => the NFT tokenIds. Gives me an easy way
  // to store the owner of the NFT and reference it later.
  mapping(address => uint256[]) public nftHolders;
  
  // Events to show that a Minting & Attacking action has been completed 
  event CharacterNFTMinted(address sender, uint256 tokenId, uint256 characterIndex);
  event AttackComplete(uint newBossHp, uint newPlayerHp);
  event AssetStaked(uint tokenId, uint stakeStartTime);
  event AssetUnstaked(uint tokenId, uint stakeStartTime, uint stakeEndTime);

  // A fee to mint the Characterrs. 
  uint256 fee = 0.1 ether;

  // Data is passed in to the contract when it's first created initializing the characters.
  // We're going to actually pass these values in from from run.js.
  
  /// @notice Constructor function initializes the Boss & DefaultCharacter's Attributes
  /// @dev TokenId is incremented to 1, so that 0th Token can be assigned for users that sell their Token
  /// @param characterNames -> Gets All Default Character's Names as string array
  /// @param characterImageURIs -> Gets All Default Character's ImageURI as string array
  /// @param characterHp -> Gets All Default Character's Health as uint array. 
  /// @param characterAttackDmg-> Gets All Default Character's Attack Damage as uint array. 
  /// @param bossName -> Gets Boss name as string
  /// @param bossImageURI -> Gets Boss imageURI as string
  /// @param bossHp -> Gets Boss Hp as uint
  /// @param bossAttackDamage -> Gets Boss AttackDamage as uint
  constructor(
    // These new variables would be passed in via run.js or deploy.js.
    string[] memory characterNames,
    string[] memory characterImageURIs,
    uint[] memory characterHp,
    uint[] memory characterAttackDmg,
    string[] memory characterLevels,
    string memory bossName, 
    string memory bossImageURI,
    uint bossHp,
    uint bossAttackDamage
  )
  ERC721("Heroes", "HERO")
  {

    // Initialize the boss as our "bigBoss" state variable.
    bigBoss = BigBoss({
      name: bossName,
      imageURI: bossImageURI,
      hp: bossHp,
      maxHp: bossHp,
      attackDamage: bossAttackDamage
    });

    // console.log("Done initializing BOSS %s w/ HP %s, img %s", bigBoss.name, bigBoss.hp, bigBoss.imageURI);

    // Loop through all the characters, and save their values in our contract so
    // we can use them later when we mint our NFTs.
    for(uint i = 0; i < characterNames.length; i += 1) {

      defaultCharacters.push(CharacterAttributes({
        characterIndex: i,
        name: characterNames[i],
        imageURI: characterImageURIs[i],
        hp: characterHp[i],
        maxHp: characterHp[i],
        attackDamage: characterAttackDmg[i],
        levels: characterLevels[i]
      }));

    }
    
    _tokenIds.increment();
  }
  
  /// @notice Update Fee to mint the NFTs
  /// @dev Only the contract owner will be able to update the minting fee
  /// @param _fee The updated fee is passed by contract owner
  /// Ownable is used to verify the contract owner

  function updateFee(uint256 _fee) external onlyOwner {

    fee = _fee;

  }

  /// @notice Withdraw function for contract owner to withdraw the funds
  /// @dev call function is used to transfer balance over transfer function due to security reasons
  /// Ownable is used to verify the contract owner
  function withdraw() external onlyOwner {

    (bool success, ) = msg.sender.call{value: address(this).balance}("");
    require(success, "Transfer failed.");

  }


  /// @notice Mints the NFT of the selected character
  /// @dev The payable function requires users to pay the fee amount to mint the NFT. 
  /// @param _characterIndex The index of the character the user chooses to Mint
  function mintCharacterNFT(uint _characterIndex) external payable{
    // require(msg.value == fee);
    uint256 newItemId = _tokenIds.current();

    _safeMint (msg.sender, newItemId);

    nftHolderAttributes[newItemId] = CharacterAttributes({
      
      characterIndex: _characterIndex,
      name: defaultCharacters[_characterIndex].name,
      imageURI: defaultCharacters[_characterIndex].imageURI,
      hp: defaultCharacters[_characterIndex].hp,
      maxHp: defaultCharacters[_characterIndex].hp,
      attackDamage: defaultCharacters[_characterIndex].attackDamage,
      levels: defaultCharacters[_characterIndex].levels
      
    });

    console.log("Minted NFT w/ tokenId %s and characterIndex %s", newItemId, _characterIndex);  

    nftHolders[msg.sender].push(newItemId);
    totalTokens = newItemId;

    _tokenIds.increment();
    
    emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);

  }

  /// @notice View Function that returns NFT Metadata of token as a string 
  /// @dev The tokenURI function is overridden to get character attributes and return the  json object as string
  /// @param _tokenId It is used to uniquely identify NFTs
  /// @return Returns the encoded json object as string
  /// @inheritdoc ERC721
  function tokenURI(uint256 _tokenId) public view override returns (string memory) 
  {
    CharacterAttributes memory charAttributes = nftHolderAttributes[_tokenId];

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
  function attackBoss(uint _index) public {
    // Get the state of the player's NFT.
    uint256 nftTokenIdOfPlayer = nftHolders[msg.sender][_index];
    CharacterAttributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];
    console.log("\nPlayer w/ character %s about to attack. Has %s HP and %s AD", player.name, player.hp, player.attackDamage);
    console.log("Boss %s has %s HP and %s AD", bigBoss.name, bigBoss.hp, bigBoss.attackDamage);
    // Make sure the player has more than 0 HP.
    require (
      player.hp > 0,
      "Error: character must have HP to attack boss."
    );

    // Make sure the boss has more than 0 HP.
    require (
      bigBoss.hp > 0,
      "Error: boss must have HP to attack boss."
    );

    // Allow player to attack boss.
    if (bigBoss.hp < player.attackDamage) {
      bigBoss.hp = 0;
    } else {
      bigBoss.hp = bigBoss.hp - player.attackDamage;
    }

    // Allow boss to attack player.
    if (player.hp < bigBoss.attackDamage) {
      player.hp = 0;
    } else {
      player.hp = player.hp - bigBoss.attackDamage;
    }

    // Console for ease.
    console.log("%s attacked Boss. Boss hp: %s\n", player.name, bigBoss.hp);
    console.log("Boss attacked %s. %s hp: %s\n", player.name, player.name ,player.hp);
    emit AttackComplete(bigBoss.hp, player.hp);
  }

  /// @notice User with NFT can stake their character [Metadata Of NFT Changes Here]
  /// @dev The Health of User's NFT is increased becuase of staking. [Metadata Of NFT Changes Here]
  /// The user's address is used to get the NFT the user owns
  /// Health of Hero is increased due to staking  
  function stakeCharacter(uint _index) public {
    // Get the state of the player's NFT.
    uint256 nftTokenIdOfPlayer = nftHolders[msg.sender][_index];
    stakeAttributes storage staked_asset = stakeInfo[nftTokenIdOfPlayer];
    require(staked_asset.startTime == 0, "NFT Already Staked.");
    CharacterAttributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];
    require(player.hp < player.maxHp, "Player Already Has Enough Hp");

    staked_asset.startTime = block.timestamp;
    // nftHolders[msg.sender][_index] = nftHolders[msg.sender][nftHolders[msg.sender].length - 1];
    // nftHolders[msg.sender].pop();
    
    transferFrom(msg.sender, address(this), nftTokenIdOfPlayer);
    emit AssetStaked(nftTokenIdOfPlayer, staked_asset.startTime);

  }

  /// @notice User with NFT can stake their character [Metadata Of NFT Changes Here]
  /// @dev The Health of User's NFT is increased becuase of staking. [Metadata Of NFT Changes Here]
  /// The user's address is used to get the NFT the user owns
  /// Health of Hero is increased due to staking  
  function unStakeCharacter(uint _index) public {
    // Get the state of the player's NFT.
    uint256 nftTokenIdOfPlayer = nftHolders[msg.sender][_index];
    stakeAttributes storage staked_asset = stakeInfo[nftTokenIdOfPlayer];
    require(staked_asset.startTime != 0, "NFT Is Not Staked.");
    CharacterAttributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];
    
    uint stakedTime = block.timestamp - staked_asset.startTime;
    
    player.hp = player.hp + (stakedTime/60);

    if(player.hp >= player.maxHp){
      player.hp = player.maxHp;
    }

    staked_asset.startTime = 0;

    ERC721(address(this)).transferFrom(address(this), msg.sender, nftTokenIdOfPlayer);

    emit AssetUnstaked(nftTokenIdOfPlayer, staked_asset.startTime, block.timestamp);

  }


  /// @notice Function to check whether user owns an NFT
  /// @dev If the user has NFTs, Struct with Attributes of NFTs is returned 
  /// @dev If not, empty struct is returned when user does not have any NFTs
  /// @return A struct containing the Token's Attributes are returned 
  /// The address of message sender is used to get the tokenId
  //// The tokenId is then used to get the attributes of NFT 
  function checkIfUserHasNFT() public view returns (CharacterAttributes[] memory) {

    // Get the tokenId of the user's character NFT
    // uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];

    uint[] memory nftArray = nftHolders[msg.sender];
    
    if(nftArray.length == 0){
      CharacterAttributes[] memory emptyStruct;
      return emptyStruct;
    }
    
    CharacterAttributes[] memory charArray = new CharacterAttributes[](nftArray.length);

    for(uint i=0; i<nftArray.length; i++){

        charArray[i] = nftHolderAttributes[nftArray[i]];

    }

    return charArray;

  }
  
  /// @notice View function to check the attributes of Boss
  /// @dev public view function that returns attributes of boss as struct
  /// @return A struct containing the attributes of Boss is returned
  function getBigBoss() public view returns (BigBoss memory) {
    
    return bigBoss;

  }

  /// @notice View function to get attributes of all default characters
  /// @dev public view function that returns attributes of all default characters as struct
  /// @return A struct containing the attributes of all default characters is returned
  function getAllDefaultCharacters() public view returns (CharacterAttributes[] memory) {

    return defaultCharacters;

  }

}

