// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
library LibRentalStorage {

        struct RentalInfo {

            uint256 price;
            uint256 expiresAt;
            uint256 maxRental;
            address payable seller;
            address renter;
            bool isRented;
            
        }



        // This struct contains a mapping from TokenID to struct.
        struct RentalMarketData {
            // mapping of nftAddress to token id to StakeInfo   
            mapping(uint256 => RentalInfo) Rental;
        }

        // Returns the struct from a specified position in contract storage
        // ds is short for DiamondStorage
        function diamondStorage() internal pure returns(RentalMarketData storage ds) {
            // Specifies a random position from a hash of a string
            bytes32 storagePosition = keccak256("diamond.storage.LibRentalStorage");
            // Set the position of our struct in contract storage
            assembly {
                ds.slot := storagePosition
            }
        }
}