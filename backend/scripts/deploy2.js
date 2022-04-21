/* global ethers */
/* eslint prefer-const: "off" */

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deployDiamond () {
  const accounts = await ethers.getSigners()
  const contractOwner = accounts[0]

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet')
  const diamondCutFacet = await DiamondCutFacet.deploy()
  await diamondCutFacet.deployed()
  console.log('DiamondCutFacet deployed:', diamondCutFacet.address)

  // deploy Diamond
  const Diamond = await ethers.getContractFactory('Diamond')
  const diamond = await Diamond.deploy(contractOwner.address, diamondCutFacet.address)
  await diamond.deployed()
  console.log('Diamond deployed:', diamond.address)

  // deploy DiamondInit
  // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
  // Read about how the diamondCut function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
  const DiamondInit = await ethers.getContractFactory('DiamondInit')
  const diamondInit = await DiamondInit.deploy()
  await diamondInit.deployed()
  console.log('DiamondInit deployed:', diamondInit.address)

  // deploy facets
  console.log('')
  console.log('Deploying facets')
  const FacetNames = [
    'DiamondLoupeFacet',
    'OwnershipFacet',
  ]
  const cut = []
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName)
    const facet = await Facet.deploy()
    await facet.deployed()
    
    console.log(`${FacetName} deployed: ${facet.address}`)

    let functionSelectors = getSelectors(facet);
    if (FacetName === 'DynamicGameFacet') {
      functionSelectors = functionSelectors.remove(['supportsInterface']);
    }
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet)
    })
  }

  // upgrade diamond with facets
  console.log('')
  console.log('Diamond Cut:', cut)
  const diamondCut = await ethers.getContractAt('IDiamondCut', diamond.address)
  let tx
  let receipt
  // call to init function
  let functionCall = diamondInit.interface.encodeFunctionData('init', [["Raze", "Phoenix", "Sage"],       
  ["QmYGgUYWA8pNrjYopSD5yf4cVGNUibWSvg3hgC3RitF2qB", 
  "QmPWXBPUEoPkMX3fQtQY1Jwjkmn4p9qVdcMQvhy42wkqMD", 
  "QmbsoshH2rPYgEdSJZWHQBkHn9YSDSZVsKALgmVHSDK7LM"],
  [100, 200, 400],                    
  [100, 50, 25],                      
  "Thanos: The Mad Titan", 
  "https://i.pinimg.com/564x/8a/b9/0e/8ab90eff3e1830f20dfa7990fa905afb.jpg",
  10000, 
  50 ])
  tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall)
  console.log('Diamond cut tx: ', tx.hash)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')

  const DynamicGameFacet = await ethers.getContractFactory('DynamicGameFacet')
  const dynamicGameFacet = await DynamicGameFacet.deploy()

  console.log('Deployed dynamicGameFacet to ', dynamicGameFacet.address)


  let selectors = getSelectors(dynamicGameFacet);
  selectors = selectors.remove(['supportsInterface'])
  let addresses = [];
  addresses.push(dynamicGameFacet.address);

  await diamondCut.diamondCut([[dynamicGameFacet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  console.log('Added dynamicGameFacet to Diamond ', dynamicGameFacet.address)

  const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamond.address);
  result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);

  return diamond.address
}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployDiamond = deployDiamond
