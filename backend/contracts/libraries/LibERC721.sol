    // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LibAppStorage.sol";
import {CharacterAttributes, BigBoss} from "../libraries/LibAppStorage.sol";

library LibERC721 {
    function _tokenOfOwnerByIndex(address owner, uint256 index) internal view returns (uint256) {
        AppStorage storage s = LibAppStorage.diamondStorage();
        require(index < _balanceOf(owner), "ERC721Enumerable: owner index out of bounds");
        return s._ownedTokens[owner][index];
    }

    function _balanceOf(address owner) internal view returns (uint256) {
        AppStorage storage s = LibAppStorage.diamondStorage();
        require(owner != address(0), "ERC721: balance query for the zero address");
        return s._balances[owner];
    }

    function _ownerOf(uint256 tokenId) internal view returns (address) {
        AppStorage storage s = LibAppStorage.diamondStorage();
        address owner = s._owners[tokenId];
        require(owner != address(0), "ERC721: owner query for nonexistent token");
        return owner;
    }

    function _tokensOfOwner(address _owner) internal view returns(uint256[] memory ) {
        uint256 tokenCount = _balanceOf(_owner);
        if (tokenCount == 0) {
            // Return an empty array
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 index;
            for (index = 0; index < tokenCount; index++) {
                result[index] = _tokenOfOwnerByIndex(_owner, index);
            }
            return result;
        }
    }

    function isReserved(uint256 tokenId) internal pure returns(uint16){
        uint256 x = (tokenId - 1) % 100;
        uint256 y = (tokenId - 1 - x) / 100;
        if((x >= 11 && x < 21 && y >= 13 && y < 20 )
            || (x >= 10 && x < 25 && y >= 43 && y < 49 )
            || (x >= 14 && x < 19 && y >= 67 && y < 82 )
            || (x >= 3 && x < 18 && y >= 90 && y < 96 )
            || (x >= 32 && x < 38 && y >= 7 && y < 19 )
            || (x >= 89 && x < 95 && y >= 14 && y < 36 )
            || (x >= 26 && x < 39 && y >= 83 && y < 89 )
            || (x >= 46 && x < 59 && y >= 83 && y < 89 )
            || (x >= 65 && x < 73 && y >= 13 && y < 20 )
            || (x >= 63 && x < 70 && y >= 53 && y < 65 )
            || (x >= 82 && x < 92 && y >= 85 && y < 95 )
            || (x >= 92 && x < 97 && y >= 43 && y < 58 )){
            return 1;
        }
        return 0;
    }


    function getNFTHolders(address user) internal view returns(uint256 val) {
        
        AppStorage storage s = LibAppStorage.diamondStorage();
        val = s.nftHolders[user];

    }

    function getNFTHolderAttributes(uint256 tokenID) internal view returns(CharacterAttributes memory) {
        
        AppStorage storage s = LibAppStorage.diamondStorage();
        return s.nftHolderAttributes[tokenID];

    }

    
}