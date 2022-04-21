// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library LibMeta {
    function msgSender() internal view returns (address sender_) {
        sender_ = msg.sender;
    }

    function checkContains(uint256[] memory array, uint256 value) internal pure returns(bool){
        for(uint256 i = 0; i < array.length; i++){
            if(array[i] == value){
                return true;
            }
        }
        return false;
    }
}