    // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./LibAppStorage.sol";
import "./LibMeta.sol";
import "./LibRentalStorage.sol";

import {CharacterAttributes, BigBoss} from "../libraries/LibAppStorage.sol";
// Hardhat Console Debugging Easy
// import "hardhat/console.sol";

library LibERC721 {

    using Address for address;
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


    // function fetchUserNFTs(address user) internal view returns(uint256[] memory) {
        
    //     uint256 length = _balanceOf(user);
    //     uint256[] memory val = new uint256[](length);
    //     AppStorage storage s = LibAppStorage.diamondStorage();
    //     for(uint i; i < length; i++){

    //        val[i] = s._ownedTokens[user][i];
            
    //     }
        

    //     return val;

    // }

    function getNFTHolderAttributes(uint256 tokenID) internal view returns(CharacterAttributes memory) {
        
        AppStorage storage s = LibAppStorage.diamondStorage();
        return s.nftHolderAttributes[tokenID];

    }


    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal {
        _transfer(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
    }


    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal returns (bool) {
        if (!to.isContract()) {
            return true;
        }

        bytes memory returnData = to.functionCall(
            abi.encodeWithSelector(
                IERC721Receiver(to).onERC721Received.selector,
                msg.sender,
                from,
                tokenId,
                data
            ),
            'ERC721: transfer to non ERC721Receiver implementer'
        );

        bytes4 returnValue = abi.decode(returnData, (bytes4));
        return returnValue == type(IERC721Receiver).interfaceId;
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal {
        require(_ownerOf(tokenId) == from, "ERC721: transfer of token that is not own");
        require(to != address(0), "ERC721: transfer to the zero address");
        AppStorage storage s = LibAppStorage.diamondStorage();

        _beforeTokenTransfer(from, to, tokenId);

        _approve(address(0), tokenId);

        s._balances[from] -= 1;
        s._balances[to] += 1;
        s._owners[tokenId] = to;

        
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal {
        
        if (from == address(0)) {
            _addTokenToAllTokensEnumeration(tokenId);
        } else if (from != to) {
            _removeTokenFromOwnerEnumeration(from, tokenId);
        }
        if (to == address(0)) {
            _removeTokenFromAllTokensEnumeration(tokenId);
        } else if (to != from) {
            _addTokenToOwnerEnumeration(to, tokenId);
        }
        LibRentalStorage.RentalMarketData storage rss = LibRentalStorage.diamondStorage();
        LibRentalStorage.RentalInfo storage rental_asset = rss.Rental[tokenId];
        require(rental_asset.isRented == false, "NFT Already Rented.");

    }

    function _approve(address to, uint256 tokenId) internal {
        AppStorage storage s = LibAppStorage.diamondStorage();
        s._tokenApprovals[tokenId] = to;
        // emit Approval(ownerOf(tokenId), to, tokenId);
    }

    function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
        AppStorage storage s = LibAppStorage.diamondStorage();
        s._allTokensIndex[tokenId] = s._allTokens.length;
        s._allTokens.push(tokenId);
    }

    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
        uint256 length = _balanceOf(to);
        AppStorage storage s = LibAppStorage.diamondStorage();

        s._ownedTokens[to][length] = tokenId;
        s._ownedTokensIndex[tokenId] = length;
    }

    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) private {

        AppStorage storage s = LibAppStorage.diamondStorage();

        uint256 lastTokenIndex = _balanceOf(from) - 1;
        uint256 tokenIndex = s._ownedTokensIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = s._ownedTokens[from][lastTokenIndex];

            s._ownedTokens[from][tokenIndex] = lastTokenId;
            s._ownedTokensIndex[lastTokenId] = tokenIndex;
        }

        delete s._ownedTokensIndex[tokenId];
        delete s._ownedTokens[from][lastTokenIndex];
    }

    function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private {

        AppStorage storage s = LibAppStorage.diamondStorage();

        uint256 lastTokenIndex = s._allTokens.length - 1;
        uint256 tokenIndex = s._allTokensIndex[tokenId];

        uint256 lastTokenId = s._allTokens[lastTokenIndex];

        s._allTokens[tokenIndex] = lastTokenId;
        s._allTokensIndex[lastTokenId] = tokenIndex;

        delete s._allTokensIndex[tokenId];
        s._allTokens.pop();
    }



    
}