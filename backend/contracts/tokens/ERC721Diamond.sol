// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import "../libraries/LibAppStorage.sol";
import "../libraries/LibMeta.sol";
import "../libraries/LibERC721.sol";

import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import { IERC173 } from "../interfaces/IERC173.sol";

// Hardhat Console Debugging Easy
import "hardhat/console.sol";

abstract contract ERC721Diamond is Context, ERC165, IERC721Enumerable {
    AppStorage internal s;
    using Address for address;
    using Strings for uint256;

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
        interfaceId == type(IERC721Enumerable).interfaceId ||
        interfaceId == type(IERC721).interfaceId ||
        interfaceId == type(IERC721Metadata).interfaceId ||
        interfaceId == type(IDiamondCut).interfaceId ||
        interfaceId == type(IDiamondLoupe).interfaceId ||
        interfaceId == type(IERC173).interfaceId ||
        super.supportsInterface(interfaceId);
    }

    function totalSupply() public view virtual override returns (uint256) {
        return s._allTokens.length;
    }

    function tokenOfOwnerByIndex(address owner, uint256 index) public view virtual override returns (uint256) {
        return LibERC721._tokenOfOwnerByIndex(owner, index);
    }

    function tokenByIndex(uint256 index) public view virtual override returns (uint256) {
        require(index < totalSupply(), "ERC721Enumerable: global index out of bounds");
        return s._allTokens[index];
    }

    function balanceOf(address owner) public view virtual override returns (uint256) {
        return LibERC721._balanceOf(owner);
    }

    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        return LibERC721._ownerOf(tokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
        require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    }

    function _baseURI() internal view virtual returns (string memory) {
        return "";
    }

    function approve(address to, uint256 tokenId) public virtual override {
        address owner = ownerOf(tokenId);
        
        require(to != owner, "ERC721: approval to current owner");
        
        
        require(
            LibMeta.msgSender() == owner || isApprovedForAll(owner, LibMeta.msgSender()),
            "ERC721: approve caller is not owner nor approved for all"
        );
        

        LibERC721._approve(to, tokenId);
        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        require(_exists(tokenId), "ERC721: approved query for nonexistent token");

        return s._tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) public virtual override {
        require(operator != LibMeta.msgSender(), "ERC721: approve to caller");

        s._operatorApprovals[LibMeta.msgSender()][operator] = approved;
        emit ApprovalForAll(LibMeta.msgSender(), operator, approved);
    }

    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        return s._operatorApprovals[owner][operator];
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(LibMeta.msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");

        LibERC721._transfer(from, to, tokenId);
        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        require(_isApprovedOrOwner(LibMeta.msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        LibERC721._safeTransfer(from, to, tokenId, _data);
        emit Transfer(from, to, tokenId);
    }

    // function _safeTransfer(
    //     address from,
    //     address to,
    //     uint256 tokenId,
    //     bytes memory _data
    // ) internal virtual {
    //     _transfer(from, to, tokenId);
    //     require(_checkOnERC721Received(from, to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
    // }

    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        // console.log("owner address: ",s._owners[tokenId]);
        return s._owners[tokenId] != address(0);
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        // console.log("Checkpoint Reached");
        // console.log(tokenId);
        // console.log(exists(tokenId));
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        // console.log("Checkpoint Reached 2");
        address owner = ownerOf(tokenId);
        // console.log("owner address: ",owner);
        // console.log("user address: ",LibMeta.msgSender());
        // console.log("Checkpoint Reached 2");
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    function _safeMint(address to, uint256 tokenId) internal virtual {
        _safeMint(to, tokenId, "");
    }

    function _safeMint(
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal virtual {
        _mint(to, tokenId);
        require(
            LibERC721._checkOnERC721Received(address(0), to, tokenId, _data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
    }

    function _mint(address to, uint256 tokenId) internal virtual {
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), "ERC721: token already minted");

        LibERC721._beforeTokenTransfer(address(0), to, tokenId);

        s._balances[to] += 1;
        s._owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
    }

    function _burn(uint256 tokenId) internal virtual {
        address owner = ownerOf(tokenId);

        LibERC721._beforeTokenTransfer(owner, address(0), tokenId);

        LibERC721._approve(address(0), tokenId);

        s._balances[owner] -= 1;
        delete s._owners[tokenId];

        emit Transfer(owner, address(0), tokenId);
    }

    // function _transfer(
    //     address from,
    //     address to,
    //     uint256 tokenId
    // ) internal virtual {
    //     require(ownerOf(tokenId) == from, "ERC721: transfer of token that is not own");
    //     require(to != address(0), "ERC721: transfer to the zero address");

    //     _beforeTokenTransfer(from, to, tokenId);

    //     _approve(address(0), tokenId);

    //     s._balances[from] -= 1;
    //     s._balances[to] += 1;
    //     s._owners[tokenId] = to;

    //     emit Transfer(from, to, tokenId);
    // }


    // function _approve(address to, uint256 tokenId) internal virtual {
    //     s._tokenApprovals[tokenId] = to;
    //     emit Approval(ownerOf(tokenId), to, tokenId);
    // }

    // function _checkOnERC721Received(
    //     address from,
    //     address to,
    //     uint256 tokenId,
    //     bytes memory _data
    // ) private returns (bool) {
    //     if (to.isContract()) {
    //         try IERC721Receiver(to).onERC721Received(LibMeta.msgSender(), from, tokenId, _data) returns (bytes4 retval) {
    //             return retval == IERC721Receiver.onERC721Received.selector;
    //         } catch (bytes memory reason) {
    //             if (reason.length == 0) {
    //                 revert("ERC721: transfer to non ERC721Receiver implementer");
    //             } else {
    //                 assembly {
    //                     revert(add(32, reason), mload(reason))
    //                 }
    //             }
    //         }
    //     } else {
    //         return true;
    //     }
    // }


    // function _beforeTokenTransfer(
    //     address from,
    //     address to,
    //     uint256 tokenId
    // ) internal virtual {
    //     if (from == address(0)) {
    //         _addTokenToAllTokensEnumeration(tokenId);
    //     } else if (from != to) {
    //         _removeTokenFromOwnerEnumeration(from, tokenId);
    //     }
    //     if (to == address(0)) {
    //         _removeTokenFromAllTokensEnumeration(tokenId);
    //     } else if (to != from) {
    //         _addTokenToOwnerEnumeration(to, tokenId);
    //     }
    // }

    // function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
    //     uint256 length = balanceOf(to);
    //     s._ownedTokens[to][length] = tokenId;
    //     s._ownedTokensIndex[tokenId] = length;
    // }

    // function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
    //     s._allTokensIndex[tokenId] = s._allTokens.length;
    //     s._allTokens.push(tokenId);
    // }

    // function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) private {
    //     uint256 lastTokenIndex = balanceOf(from) - 1;
    //     uint256 tokenIndex = s._ownedTokensIndex[tokenId];

    //     if (tokenIndex != lastTokenIndex) {
    //         uint256 lastTokenId = s._ownedTokens[from][lastTokenIndex];

    //         s._ownedTokens[from][tokenIndex] = lastTokenId;
    //         s._ownedTokensIndex[lastTokenId] = tokenIndex;
    //     }

    //     delete s._ownedTokensIndex[tokenId];
    //     delete s._ownedTokens[from][lastTokenIndex];
    // }

    // function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private {
    //     uint256 lastTokenIndex = s._allTokens.length - 1;
    //     uint256 tokenIndex = s._allTokensIndex[tokenId];

    //     uint256 lastTokenId = s._allTokens[lastTokenIndex];

    //     s._allTokens[tokenIndex] = lastTokenId;
    //     s._allTokensIndex[lastTokenId] = tokenIndex;

    //     delete s._allTokensIndex[tokenId];
    //     s._allTokens.pop();
    // }
}
