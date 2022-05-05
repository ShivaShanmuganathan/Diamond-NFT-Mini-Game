/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')

// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deployStakeFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = "0x791B0E7e61B094Eb6B7695d9ABc659F391071c43";
    console.log("diamondAddress", diamondAddress);

    const StakeNFTFacet = await ethers.getContractFactory('StakeNFTFacet')
    const stakeNFTFacet = await StakeNFTFacet.deploy()
    await stakeNFTFacet.deployed()

    console.log("stakeNFTFacet deployed to: ",stakeNFTFacet.address);
    
    let addresses = [];
    addresses.push(stakeNFTFacet.address)
    const selectors = getSelectors(stakeNFTFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: stakeNFTFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(stakeNFTFacet.address)
    assert.sameMembers(result, selectors)
    console.log("stakeNFTFacet Added To Diamond");
    return stakeNFTFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
  deployStakeFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployStakeFacet = deployStakeFacet
