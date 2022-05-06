// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


library AppConstants{
    uint256 constant isTestMode = 1;
    uint256 constant publicPrice = 1000000000000000; 
    uint256 constant dayInSeconds = 86400;
    uint256 constant hourInSeconds = 3600;
    uint256 constant minutesInSeconds = 60;
    uint256 constant _NOT_ENTERED = 1;
    uint256 constant _ENTERED = 2;
}


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

    // We create a struct to keep track of bigBoss's attributes
    struct BigBoss {
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;
    }






struct AppStorage {
    //ERC721
    string _name;
    string _symbol;
    mapping(uint256 => address) _owners;
    mapping(address => uint256) _balances;
    mapping(uint256 => address) _tokenApprovals;
    mapping(address => mapping(address => bool)) _operatorApprovals;
    //ERC721Enumerable
    mapping(address => mapping(uint256 => uint256)) _ownedTokens;
    mapping(uint256 => uint256) _ownedTokensIndex;
    uint256[] _allTokens;
    mapping(uint256 => uint256) _allTokensIndex;
    //ERC721URIStorage
    mapping(uint256 => string) _tokenURIs;//not used

    // The tokenId is the NFTs unique identifier, it's just a number that goes
    // 0, 1, 2, 3, etc.
    uint256 totalTokens;
    uint256 _tokenIds;
    
    // This array help us hold the default data for our characters.
    // This will be helpful when we mint new characters and need to know things like their HP, AD, etc.
    CharacterAttributes[] defaultCharacters;  
    // We create a mapping from the nft's tokenId => that NFTs attributes.
    mapping(uint256 => CharacterAttributes) nftHolderAttributes;
    // bigBoss is the Bad Guy that our Heroes Fight against
    BigBoss bigBoss;
    
    // A fee to mint the Characterrs. 
    uint256 fee;
    uint256 _status;
    string baseUri;

}

library LibAppStorage {
    function diamondStorage() internal pure returns (AppStorage storage ds) {
        assembly {
            ds.slot := 0
        }
    }

    function abs(int256 x) internal pure returns (uint256) {
        return uint256(x >= 0 ? x : -x);
    }
}

interface ReentrancyGuard{
    modifier nonReentrant() {
        require(LibAppStorage.diamondStorage()._status != AppConstants._ENTERED, "ReentrancyGuard: reentrant call");

        LibAppStorage.diamondStorage()._status = AppConstants._ENTERED;

        _;

        LibAppStorage.diamondStorage()._status = AppConstants._NOT_ENTERED;
    }
}