require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require('solidity-coverage')
require("hardhat-gas-reporter");
require("hardhat-diamond-abi");
require('hardhat-abi-exporter');
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
  
});

function filterDuplicateFunctions(abiElement, index, fullAbi, fullyQualifiedName) {

  
  if(abiElement.type !== "event") {
    return false
  }

  if(abiElement.name !== "approve") {
    return false
  }
  
  return true;

}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  solidity: '0.8.1',
  
  diamondAbi: {
    // (required) The name of your Diamond ABI
    name: "awesomeGame",
    include: ['Facet'],
    strict: true,
    filter: function (abiElement, index, fullAbi, fullyQualifiedName) {

      if(abiElement.name === "Approval"){
        return false;
      }

      if(abiElement.name === "ApprovalForAll"){
        return false;
      }

      if(abiElement.name === "Transfer"){
        return false;
      }

      if(abiElement.name === "approve"){
        return false;
      }

      if(abiElement.name === "getApproved"){
        return false;
      }

      if(abiElement.name === "isApprovedForAll"){
        return false;
      }

      if(abiElement.name === "setApprovalForAll"){
        return false;
      }

      if(abiElement.name === "supportsInterface"){
        return false;
      }

      if(abiElement.name === "balanceOf"){
        return false;
      }

      if(abiElement.name === "ownerOf"){
        return false;
      }

      if(abiElement.name === "safeTransferFrom"){
        return false;
      }

      if(abiElement.name === "transferFrom"){
        return false;
      }

      if(abiElement.name === "name"){
        return false;
      }

      if(abiElement.name === "symbol"){
        return false;
      }

      if(abiElement.name === "tokenURI"){
        return false;
      }

      console.log(abiElement);

      return true;
      
    },
    
  },

  abiExporter: {
    // This plugin will copy the ABI from the DarkForest artifact into our `@darkforest_eth/contracts` package as `abis/DarkForest.json`
    path: './data/abi',
    runOnCompile: true,
    // We don't want additional directories created, so we explicitly set the `flat` option to `true`
    flat: true,
    // We **only** want to copy the DarkForest ABI (which is the Diamond ABI we generate) and the initializer ABI to this folder, so we limit the matched files with the `only` option
    only: [':Diamond$', ':DiamondInit$'],
  },

  networks: {
    rinkeby: {
      url: process.env.STAGING_ALCHEMY_KEY,
      accounts: [process.env.PRIVATE_KEY],
    }
    // localhost: {
    //   chainId: 31337
    // }
    
  },

  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY
    
  }
};
