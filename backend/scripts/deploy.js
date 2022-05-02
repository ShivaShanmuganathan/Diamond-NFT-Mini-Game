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
  let functionCall = diamondInit.interface.encodeFunctionData('init', [["Jett", "Phoenix", "Neon", "Raze", "Reyna", "Yoru", "Breach", "KAY/O", "Skye", "Sova", "Astra", "Brimstone", "Omen", "Viper", "Cypher", "Sage"],
  [
      "https://gateway.pinata.cloud/ipfs/QmXDEW26MnmgkdijbQtTQSnQZ7DWfMFqJYzruU3mGnp64w",
      "https://gateway.pinata.cloud/ipfs/QmWbkhC6AunE9ZZMwJbTbrHTPYFPCbY9uDFtLsSbr5zYt2",
      "https://gateway.pinata.cloud/ipfs/Qmc659ijRouVQEycT5rEwCo73j1QuaFLH1FMSTbDpTPueX",
      "https://gateway.pinata.cloud/ipfs/QmUpzvz2hC9gBYs5Tr1N3GqqiL9PstSkVR1cxmNKjC1FrU",
      "https://gateway.pinata.cloud/ipfs/QmWuzkZo4JLBvTo14LLCY7nP5oViifJt4oU5rpcd5QhHFH",
      "https://gateway.pinata.cloud/ipfs/QmUWYfyJDjMm65WGCNsrXqZdUGAA4Szt7A3wFaNZirfMqn",
      "https://gateway.pinata.cloud/ipfs/QmNwfv6rUgW3PCKnNo3uxLuy8r3hU9sGEd5TgoyQDLitTf",
      "https://gateway.pinata.cloud/ipfs/QmS6v2Gz22QSasUCmHg6gaMsUaWT2AvHVpKA4vefMf16u7",
      "https://gateway.pinata.cloud/ipfs/QmZqr3hj8RPeFeP6DGKi25KBTzTW5h4VWD2f6q94pXrJiA",
      "https://gateway.pinata.cloud/ipfs/QmPpbjrWbejguWRNP9qwgoPf6VYYfV4SUsZ51vvVMPbyTE",
      "https://gateway.pinata.cloud/ipfs/QmXHk7GYn7bgLRCig6zTEXpDvA5T8jTKqhXnyiiHEL5G8b",
      "https://gateway.pinata.cloud/ipfs/QmXrW7CdHC9UjJTAWuNU4vRAk7QdbjyHjewy3SGTD9DWms",
      "https://gateway.pinata.cloud/ipfs/QmP1R6xYmm77KdT8ZxUyixdA8uwCEHpmgDRBYCVSHMGc36",
      "https://gateway.pinata.cloud/ipfs/QmX3hV9q5k5B7mwsyj8g6q8qw8HPdkYTKuws6e73L997xQ",            
      "https://gateway.pinata.cloud/ipfs/QmPFbj4Ufx69zf241qJ5U4Qexqc8hx4PG5Uo5ucyuNW61X",            
      "https://gateway.pinata.cloud/ipfs/QmePF9pBnjdfajbT3i4peVoNqijaQCNYeLQXj76P7JoFXr"
  ],
  [1000, 1250, 1100, 1400, 1500, 1450, 1700, 1800, 1950, 2000, 2100, 2500, 2400, 3000, 3500, 4000],
  [45, 30, 35, 25, 15, 20, 60, 55, 50, 45, 80, 75, 70, 65, 100, 90],
  ["Duelists", "Duelists", "Duelists", "Duelists", "Duelists", "Duelists", "Initiators", "Initiators", "Initiators", "Initiators", "Controllers", "Controllers", "Controllers", "Controllers", "Sentinels", "Sentinels"],
  "THANOS",
  "https://raw.githubusercontent.com/ShivaShanmuganathan/diamond-nft-game/main/Thanos.webp",
  100000,
  150])
  tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall)
  console.log('Diamond cut tx: ', tx.hash)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')

  // const DynamicGameFacet = await ethers.getContractFactory('DynamicGameFacet')
  // const dynamicGameFacet = await DynamicGameFacet.deploy()

  // console.log('Deployed dynamicGameFacet to ', dynamicGameFacet.address)


  // let selectors = getSelectors(dynamicGameFacet);
  // selectors = selectors.remove(['supportsInterface'])
  // let addresses = [];
  // addresses.push(dynamicGameFacet.address);

  // await diamondCut.diamondCut([[dynamicGameFacet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  // console.log('Added dynamicGameFacet to Diamond ', dynamicGameFacet.address)

  // const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamond.address);
  // result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);

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
