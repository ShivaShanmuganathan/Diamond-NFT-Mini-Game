# 💎 Fullstack Dynamic NFT Mini Game 🎮 Using Diamond Standard 💎

### [Play On 💎🎮](http://diamond-dapp.vercel.app/) ⏩ http://diamond-dapp.vercel.app/

## Project Description 📝

### Fullstack Dynamic NFT Mini Game 🎮 Using Diamond Standard 💎 

- Player can connect to the mini game using Metamask on Rinkeby Network
- Players can choose Valorant Heroes and mint them as an NFT
- Use the minted Hero NFT to battle against Thanos in the dapp
- Battling against Thanos changes the HP (On-Chain Metadata) of Hero NFT
- Players can heal their heroes by staking their Hero NFT in the dapp
- Staking NFTs increase the HP (On-Chain Metadata) of Hero NFT.

## Directory Structure 📂
- `backend/contracts` ⏩ Smart Contract Code [Deployed @ Rinkeby Test Network]
- `frontend` ⏩ Project's React frontend.
- `backend/test` ⏩ Tests for Smart Contracts.

## Run this project locally 🏃🏾‍♂️💨

```shell
git clone https://github.com/ShivaShanmuganathan/diamond-dapp
```

### Frontend 🎨🖌

- `cd frontend`
- `yarn install` Install Dependencies
- `yarn start` Start the frontend in localhost 
- Open `http://localhost:3000` <br />
We can use the localhost frontend to interact with the smart contract on rinkeby

### Backend 🔗

- `cd backend`
- `npm install` Install Dependencies
- `npx hardhat --version` Check if Hardhat is properly installed 
- `npx hardhat compile` Compile the Smart Contract
- `npx hardhat test` Test the Smart Contract Locally
- `npx hardhat run scripts/deploy.js` Deploy the Smart Contract Locally

### If you want to deploy it on Rinkeby Network

1. open `hardhat.config.js` file and uncomment the below lines <br />
    // rinkeby: { <br />
    //   url: process.env.STAGING_ALCHEMY_KEY, <br />
    //   accounts: [process.env.PRIVATE_KEY], <br />
    // }, <br />
2. change filename `.env.example` to `.env`
3. Get Alchemy Key for Rinkeby Network from Alchemy, and assign it to `STAGING_ALCHEMY_KEY` in `.env`
4. Get `PRIVATE_KEY` from MetaMask, and assign it to `PRIVATE_KEY` in `.env`
5. RUN `npx hardhat run scripts/deploy.js --network rinkeby` to deploy Diamond Contract & DynamicGame Facet Contract to the Rinkeby Network. 
6. RUN `npx hardhat run scripts/deploy2.js --network rinkeby` to deploy StakeNFTFacet Contract to the Rinkeby Network, and add it to the Diamond Contract. 


```
STAGING_ALCHEMY_KEY=
PRIVATE_KEY=
```

### How to make your own hero characters

- Open `scripts/deploy.js` in `backend` folder
- This is the code you need to edit to make your own heroes <br /> `let functionCall = diamondInit.interface.encodeFunctionData('init', [["Jett", "Phoenix", "Neon", "Raze", "Reyna", "Yoru", "Breach", "KAY/O", "Skye", "Sova", "Astra", "Brimstone", "Omen", "Viper", "Cypher", "Sage"],
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
  150]);`
- Change `["Jett", "Phoenix", "Neon", ...]` to the character names you want
- Upload images you want to [IPFS using Pinata](https://www.pinata.cloud/) and get the CID of the uploaded images
- Change 
      `["https://gateway.pinata.cloud/ipfs/QmXDEW26MnmgkdijbQtTQSnQZ7DWfMFqJYzruU3mGnp64w",
      "https://gateway.pinata.cloud/ipfs/QmWbkhC6AunE9ZZMwJbTbrHTPYFPCbY9uDFtLsSbr5zYt2",
      "https://gateway.pinata.cloud/ipfs/Qmc659ijRouVQEycT5rEwCo73j1QuaFLH1FMSTbDpTPueX",
      ...]` to the CID of the images uploaded to IPFS
- Change `[1000, 1250, 1100, ...]` to the maxHealth you want for the Heroes
- Change `[45, 30, 35, ...]` to the attackDamage you want for the Heroes
- Change `THANOS` to the name of your Boss
- Change `https://raw.githubusercontent.com/ShivaShanmuganathan/diamond-nft-game/main/Thanos.webp"` to the image url of your Boss
- Change `100000` to edit the Boss Health
- Change `150` to edit the Boss Attack Damage

## Gas Report ⛽
![gasReport](./gas-report.JPG)

## Test Coverage Report 🛸
![testReport](./test-coverage-report.JPG)

## [Project Walkthrough Video - WIP 🚧](https://www.loom.com/share/8f68f312c12046acb23962dca11fbd8a) 

[Video Link - WIP 🚧](https://www.loom.com/share/8f68f312c12046acb23962dca11fbd8a)


## 💎 Diamond Proxy Contract Address

`0xA5518dEFdbF7B55bf073f42ef3DB7f39bcecA6FF`

