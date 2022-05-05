/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')

// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deployReceiverFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = "0x791B0E7e61B094Eb6B7695d9ABc659F391071c43";
    console.log("diamondAddress", diamondAddress);

    const NFTReceiverFacet = await ethers.getContractFactory('NFTReceiverFacet')
    const nftReceiverFacet = await NFTReceiverFacet.deploy()
    await nftReceiverFacet.deployed()

    console.log("nftReceiverFacet deployed to: ",nftReceiverFacet.address);
    
    let addresses = [];
    addresses.push(nftReceiverFacet.address)
    const selectors = getSelectors(nftReceiverFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: nftReceiverFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(nftReceiverFacet.address)
    assert.sameMembers(result, selectors)
    console.log("nftReceiverFacet Added To Diamond");
    return nftReceiverFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deployReceiverFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployReceiverFacet = deployReceiverFacet
