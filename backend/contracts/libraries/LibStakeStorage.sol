// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
library LibStakeStorage {

        struct StakeInfo {
            address staker;     
            uint256 startTime;
        }

        // This struct contains a mapping from TokenID to struct.
        struct StakeStorage {
            // mapping of nftAddress to token id to StakeInfo   
            mapping(uint256 => StakeInfo) stakingInfo;
        }

        // Returns the struct from a specified position in contract storage
        // ds is short for DiamondStorage
        function diamondStorage() internal pure returns(StakeStorage storage ds) {
            // Specifies a random position from a hash of a string
            bytes32 storagePosition = keccak256("diamond.storage.LibStakeStorage");
            // Set the position of our struct in contract storage
            assembly {
                ds.slot := storagePosition
            }
        }
}