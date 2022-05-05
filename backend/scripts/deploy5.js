/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')

// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deployRentalFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = "0x791B0E7e61B094Eb6B7695d9ABc659F391071c43";
    console.log("diamondAddress", diamondAddress);

    const RentalNFTFacet = await ethers.getContractFactory('RentalNFTFacet')
    const rentalNFTFacet = await RentalNFTFacet.deploy()
    await rentalNFTFacet.deployed()

    console.log("rentalNFTFacet deployed to: ",rentalNFTFacet.address);
    
    let addresses = [];
    addresses.push(rentalNFTFacet.address)
    const selectors = getSelectors(rentalNFTFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: rentalNFTFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(rentalNFTFacet.address)
    assert.sameMembers(result, selectors)
    console.log("rentalNFTFacet Added To Diamond");
    return rentalNFTFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deployRentalFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployRentalFacet = deployRentalFacet
