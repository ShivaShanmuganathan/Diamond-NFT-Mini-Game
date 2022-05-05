/* global describe it before ethers */

const {
  getSelectors,
  FacetCutAction,
  removeSelectors,
  findAddressPositionInFacets
} = require('../scripts/libraries/diamond.js')

const { deployDiamond } = require('../scripts/deploy.js')

const { assert, expect } = require('chai')



const transformRentalData = (rentalData) => {
  return {
    
    price: rentalData.price.toString(),
    expiresAt: rentalData.expiresAt.toString(),
    maxRental: rentalData.maxRental.toString(),
    seller: rentalData.seller.toString(),
    renter: rentalData.renter.toString(),
    isRented: rentalData.isRented.toString()    
  };
};

const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
    levels: characterData.levels    
  };
};

describe('DiamondTest', async function () {
  let diamondAddress
  let diamondCutFacet
  let diamondLoupeFacet
  let ownershipFacet
  let tx
  let receipt
  let result
  const addresses = []
  let owner, addr1, addr2, addr3;

  before(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    diamondAddress = await deployDiamond()
    diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', diamondAddress)
    diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)
    ownershipFacet = await ethers.getContractAt('OwnershipFacet', diamondAddress)
  })

  it('should have three facets -- call to facetAddresses function', async () => {
    for (const address of await diamondLoupeFacet.facetAddresses()) {
      addresses.push(address)
    }

    assert.equal(addresses.length, 3)
  })

  it('facets should have the right function selectors -- call to facetFunctionSelectors function', async () => {
    
    let selectors = getSelectors(diamondCutFacet)
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0])
    assert.sameMembers(result, selectors)
    selectors = getSelectors(diamondLoupeFacet)
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[1])
    assert.sameMembers(result, selectors)
    selectors = getSelectors(ownershipFacet)
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[2])
    assert.sameMembers(result, selectors)

  })

  it('selectors should be associated to facets correctly -- multiple calls to facetAddress function', async () => {
    assert.equal(
      addresses[0],
      await diamondLoupeFacet.facetAddress('0x1f931c1c')
    )
    assert.equal(
      addresses[1],
      await diamondLoupeFacet.facetAddress('0xcdffacc6')
    )
    assert.equal(
      addresses[1],
      await diamondLoupeFacet.facetAddress('0x01ffc9a7')
    )
    assert.equal(
      addresses[2],
      await diamondLoupeFacet.facetAddress('0xf2fde38b')
    )
  })

  describe('Deploy DynamicGameFacet & Test Constructor Args()', function () { 

    it('should add dynamic game facet', async () => {

      const DynamicGameFacet = await ethers.getContractFactory('DynamicGameFacet')
      const dynamicGameFacet = await DynamicGameFacet.deploy()
  
      // let facetB = await FacetB.deployed();
      let selectors = getSelectors(dynamicGameFacet);
      selectors = selectors.remove(['supportsInterface'])
      let addresses = [];
      addresses.push(dynamicGameFacet.address);
      
      await diamondCutFacet.diamondCut([[dynamicGameFacet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      // let diamondLoupeFacet = await DiamondLoupeFacet.at(diamond.address);
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    })
  
    it('should check dynamic game facet constructor args', async () => { 
  
      const dynamicGameFacet = await ethers.getContractAt('DynamicGameFacet', diamondAddress)
      let bossTxn = await dynamicGameFacet.getBigBoss();
      let result = transformCharacterData(bossTxn);
  
      expect(result.name).to.equal("THANOS");
      expect((result.hp).toString()).to.equal("100000");
      expect((result.maxHp).toString()).to.equal("100000");
      expect((result.attackDamage).toString()).to.equal("150");
  
      const charactersTxn = await dynamicGameFacet.getAllDefaultCharacters();
      const characters = charactersTxn.map((characterData) => transformCharacterData(characterData));
      characters.forEach((character, index) => {
        // ["Jett", "Phoenix", "Neon", "Raze", "Reyna", "Yoru", "Breach", "KAY/O", "Skye", "Sova", "Astra", "Brimstone", "Omen", "Viper", "Cypher", "Sage"]
        // [1000, 1250, 1100, 1400, 1500, 1450, 1700, 1800, 1950, 2000, 2100, 2500, 2400, 3000, 3500, 4000],
        // [45, 30, 35, 25, 15, 20, 60, 55, 50, 45, 80, 75, 70, 65, 100, 90],

        if(index == 0){
            expect(character.name).to.equal("Jett");
            expect((character.hp).toString()).to.equal("1000");
            expect((character.maxHp).toString()).to.equal("1000");
            expect((character.attackDamage).toString()).to.equal("45");
            expect(character.levels).to.equal("Duelists");
        }
        
        else if(index == 1){
            expect(character.name).to.equal("Phoenix");
            expect((character.hp).toString()).to.equal("1250");
            expect((character.maxHp).toString()).to.equal("1250");
            expect((character.attackDamage).toString()).to.equal("30");
            expect(character.levels).to.equal("Duelists");
        }
  
        else if(index == 2){
            expect(character.name).to.equal("Neon");
            expect((character.hp).toString()).to.equal("1100");
            expect((character.maxHp).toString()).to.equal("1100");
            expect((character.attackDamage).toString()).to.equal("35");
            expect(character.levels).to.equal("Duelists");
        }

        else if(index == 3){
          expect(character.name).to.equal("Raze");
          expect((character.hp).toString()).to.equal("1400");
          expect((character.maxHp).toString()).to.equal("1400");
          expect((character.attackDamage).toString()).to.equal("25");
          expect(character.levels).to.equal("Duelists");
        }

        
      });
  
      
  
    })

  });

  describe('mintCharacterNFT()', function () { 

    // Fetch dynamicGameFacet
    it('Should Fetch DynamicGameFacet', async function () {

      dynamicGameFacet = await ethers.getContractAt('DynamicGameFacet', diamondAddress)

    });

    // Minting Characters
    it('Should Mint Characters', async function () {
        
        for (let i = 0; i < 16; i++) {
          await expect(dynamicGameFacet.connect(owner).mintCharacterNFT(i, {value: ethers.utils.parseEther("0.1")})).to.not.be.reverted; 
        }

    });

    it('Should Fail To Mint If Amount Is Low', async function () {
      
      await expect(dynamicGameFacet.connect(addr1).mintCharacterNFT(0, {value: ethers.utils.parseEther("0.005")})).to.be.reverted; 
      await expect(dynamicGameFacet.connect(addr1).mintCharacterNFT(0, {value: ethers.utils.parseEther("0.002")})).to.be.reverted; 

    });

  });

  describe('updateFee()', function () { 

    // Fetch dynamicGameFacet
    it('Should Fetch DynamicGameFacet', async function () {

      dynamicGameFacet = await ethers.getContractAt('DynamicGameFacet', diamondAddress)

    });

    // updateFee function can be used only by contract owner
    it('should fail since fee can only be updated by owner', async function() {
        
        await expect(dynamicGameFacet.connect(addr1).updateFee(ethers.utils.parseEther("0.2"))).to.be.reverted;

    });

    // updateFee function is accessible only by contract owner
    it('should allow only the owner to update fee', async function() {
      
        await expect(dynamicGameFacet.connect(owner).updateFee(ethers.utils.parseEther("0.2"))).to.not.be.reverted;

    });

  });

  describe('Withdraw()', function () { 

    // Fetch dynamicGameFacet
    it('Should Fetch DynamicGameFacet', async function () {

      dynamicGameFacet = await ethers.getContractAt('DynamicGameFacet', diamondAddress)

    });

    // withdraw function with onlyOwner
    it('should fail since withdraw can only be called by owner', async function() { 
      
      await expect(dynamicGameFacet.connect(addr1).withdraw()).to.be.reverted;

    });

    // withdraw function is accessible by owner
    it('Withdraw should only work with owner and balance after withdrawal must be higher', async function() {
            
      const balanceBefore = await ethers.provider.getBalance(owner.address);
  
      await expect(dynamicGameFacet.connect(owner).withdraw()).to.not.be.reverted;
  
      const balanceAfter = await ethers.provider.getBalance(owner.address);
      
      expect(balanceAfter.gt(balanceBefore), 'Balance is not higher').to.be.true;
        
    });

  });

  describe('TokenURI()', function () { 

    // Fetch dynamicGameFacet
    it('Should Fetch DynamicGameFacet', async function () {

      dynamicGameFacet = await ethers.getContractAt('DynamicGameFacet', diamondAddress)

    });

    // tokenURI function can be checked with maxHp, attackDamage
    it('check TokenURI', async function() {
        
        let tokenURI = await expect(dynamicGameFacet.connect(addr1).tokenURI(1)).to.not.be.reverted;
        // let nftAttributes = await (myEpicContract.connect(addr1).nftHolderAttributes(1));
        console.log(tokenURI);

    });

  });

  describe('Attack Boss()', function () { 

    // Fetch dynamicGameFacet
    it('Should Fetch DynamicGameFacet', async function () {

      dynamicGameFacet = await ethers.getContractAt('DynamicGameFacet', diamondAddress)

    });

    // fail since account has not an NFT
    it('should fail to attack boss since account does not have an NFT  ', async function() {
      
      await expect(dynamicGameFacet.connect(addr2).attackBoss(0)).to.be.reverted;

    });

    // attackBoss after minting NFT
    it('should attack boss', async function() {

      // await expect(myEpicContract.connect(owner).mintCharacterNFT(0, {value: ethers.utils.parseEther("0.1")})).to.not.be.reverted; 
      let tokenID = (await dynamicGameFacet.connect(owner).nftHolders(owner.address))[0];
      await expect(dynamicGameFacet.connect(owner).attackBoss(tokenID)).to.not.be.reverted;

    });

    // attackBoss after minting NFT
    it('should attack boss with another character', async function() {

      let tokenID = (await dynamicGameFacet.connect(owner).nftHolders(owner.address))[5];
      await expect(dynamicGameFacet.connect(owner).attackBoss(tokenID)).to.not.be.reverted;

    });

    // attackBoss & check Stats
    it('should mint NFT & Attacks Boss, Both Boss & Player incur damages', async function() {
      
      await expect(dynamicGameFacet.connect(addr1).mintCharacterNFT(0, {value: ethers.utils.parseEther("0.2")})).to.not.be.reverted; 

      // Player1 Stats before Attack
      let player1_token = await dynamicGameFacet.connect(addr1).nftHolders(addr1.address);
      let player1_char_beforeAttack = await dynamicGameFacet.connect(addr1).nftHolderAttributes(player1_token[0]);
      let player1_hp = transformCharacterData(player1_char_beforeAttack).hp;
      let player1_attack = transformCharacterData(player1_char_beforeAttack).attackDamage;
      
      // Boss Stats After Attack
      let beforeAttackBossTxn = await dynamicGameFacet.getBigBoss();
      let beforeAttackResult = transformCharacterData(beforeAttackBossTxn);
      let bossHp = beforeAttackResult.hp;
      let boss_attack = beforeAttackResult.attackDamage;

      // ATTACK NOW!
      let tokenID = (await dynamicGameFacet.connect(addr1).nftHolders(addr1.address))[0];
      console.log("TokenID of Address1 ", Number(tokenID));
      await expect(dynamicGameFacet.connect(addr1).attackBoss(tokenID)).to.not.be.reverted;

      //Check Player Hp After Attack
      let player1_char_afterAttack = await dynamicGameFacet.connect(addr1).nftHolderAttributes(player1_token[0]);
      let player1_hp_afterAttack = transformCharacterData(player1_char_afterAttack).hp;
      expect(player1_hp_afterAttack).to.equal(player1_hp - boss_attack);

      // Check Boss Hp
      let bossTxn = await dynamicGameFacet.getBigBoss();
      let result = transformCharacterData(bossTxn).hp;
      expect(result).to.equal(bossHp - player1_attack);
      
      });

  });

  describe('checkIfUserHasNFT()', function () { 

    // Fetch dynamicGameFacet
    it('Should Fetch DynamicGameFacet', async function () {

      dynamicGameFacet = await ethers.getContractAt('DynamicGameFacet', diamondAddress)

    });

    // checkIfUserHasNFT
    it('should check if user has NFT', async function() {
        
        let result = await dynamicGameFacet.connect(owner).checkIfUserHasNFT();        
        expect(result.length).to.not.be.equal(0);
        expect((transformCharacterData(result[0]).name).toString()).to.not.be.equal('');

    });

    // checkIfUserHasNFT
    it('should fail since user does not have NFT', async function() {

      let result = await dynamicGameFacet.connect(addr2).checkIfUserHasNFT();      
      expect(result.length).to.be.equal(0);
      
    });

  });

  describe('checkNFTOwner()', function () { 

    // Fetch dynamicGameFacet
    it('Should Fetch DynamicGameFacet', async function () {

      dynamicGameFacet = await ethers.getContractAt('DynamicGameFacet', diamondAddress)

    });
    
    // check owner of NFT
    it('Checking the Owners of NFT', async function() {
        
        let totalTokens = (await dynamicGameFacet.totalTokens()).toNumber();
        let ownersList = [];
        console.log(totalTokens);
        for (let i = 1; i <= totalTokens; i++) {
          ownersList.push(await dynamicGameFacet.ownerOf(i)); 
        }
        
        ownersList.forEach((element, index) => {
          console.log("TokenID", index+1 ,"Owner Address", element);
        });
        
    });


  });

  describe('Test StakeNFTFacet Facet()', function () { 

    it('should deploy StakeNFTFacet & add functions to diamond', async () => {
      const StakeNFTFacet = await ethers.getContractFactory('StakeNFTFacet')
      const stakeNFTFacet = await StakeNFTFacet.deploy()
      await stakeNFTFacet.deployed()
      addresses.push(stakeNFTFacet.address)
      const selectors = getSelectors(stakeNFTFacet)
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
      console.log("Stake NFT Facet Address: ", stakeNFTFacet.address)
      assert.sameMembers(result, selectors)
    })

    it('should deploy NFTReceiverFacet & add functions to diamond', async () => {
      const NFTReceiverFacet = await ethers.getContractFactory('NFTReceiverFacet')
      const nftReceiverFacet = await NFTReceiverFacet.deploy()
      await nftReceiverFacet.deployed()
      addresses.push(nftReceiverFacet.address)
      const selectors = getSelectors(nftReceiverFacet)
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
      console.log("NFT Receiver Facet Address: ", nftReceiverFacet.address)
      assert.sameMembers(result, selectors)
    })

    // Fetch stakeNFTFacet
    it('Should Fetch stakeNFTFacet', async function () {

      stakeNFTFacet = await ethers.getContractAt('StakeNFTFacet', diamondAddress)

    });

    it('Should test staking NFT tokenID 6', async () => {
      // const stakeNFTFacet = await ethers.getContractAt('StakeNFTFacet', diamondAddress)
      console.log("Address of Token Owner", owner.address)
      const tokenID = (await dynamicGameFacet.nftHolders(owner.address))[5];
      console.log("TokenID for staking ", tokenID.toString());
      // await dynamicGameFacet.approve(diamondAddress, tokenID);      
      await stakeNFTFacet.connect(owner).stakeCharacter(tokenID)
    })

    it('Should test staking NFT index 0', async () => {
      // const stakeNFTFacet = await ethers.getContractAt('StakeNFTFacet', diamondAddress)
      console.log("Address of Token Owner", owner.address)
      const tokenID = (await dynamicGameFacet.nftHolders(owner.address))[0];
      console.log("TokenID for staking ", tokenID.toString());
      // await dynamicGameFacet.approve(stakeNFTFacet.address, tokenID);      
      await stakeNFTFacet.connect(owner).stakeCharacter(tokenID)
    })

    it("Increase Time By 30 Mins", async function() {
    
      await ethers.provider.send('evm_increaseTime', [1800]);
      await ethers.provider.send('evm_mine');
      console.log("~~~~~~~~~~~~~~~~~~~~~~~ TIME INCREASED ~~~~~~~~~~~~~~~~~~~~~~~")
      console.log();
      
    })

    it('Should test startTime NFT tokenID 6', async () => {
      
      console.log("Staking Start Time", (await stakeNFTFacet.connect(owner).getStartTime(6)).toString() )
      
    })

    it('Should test unstaking NFT tokenID 6', async () => {
      
      let [tokenIDs, charAttributes] = (await stakeNFTFacet.connect(owner).fetchAssets());
      let tokenID = tokenIDs[0];
      let result = charAttributes[0];
      result = transformCharacterData(result);
      console.log("Hp of character",result.hp)
      console.log("TokenID for unstaking ", tokenID.toString());


      console.log("Owner of Token ID during staking",await dynamicGameFacet.ownerOf(tokenID)); 
      
      await stakeNFTFacet.connect(owner).unStakeCharacter(tokenID.toString())
      console.log("Owner of Token ID after staking",await dynamicGameFacet.ownerOf(tokenID));      

      let result2 = await dynamicGameFacet.nftHolderAttributes(tokenID);
      result2 = transformCharacterData(result2);
      console.log("Hp of character after staking",result2.hp)

    })

    it('Should test startTime NFT tokenID 6', async () => {
      
      console.log("Staking Start Time After Staking Complete", (await stakeNFTFacet.connect(owner).getStartTime(6)).toString() )
      
    })

    it("Increase Time By 150 mins", async function() {
    
      await ethers.provider.send('evm_increaseTime', [150*60]);
      await ethers.provider.send('evm_mine');
      console.log("~~~~~~~~~~~~~~~~~~~~~~~ TIME INCREASED ~~~~~~~~~~~~~~~~~~~~~~~")
  
      
      console.log();
      
    })

    it('Should test unstaking NFT index 0', async () => {
      
      let [tokenIDs, charAttributes] = (await stakeNFTFacet.connect(owner).fetchAssets());
      let tokenID = tokenIDs[0];
      let result = charAttributes[0];

      console.log("TokenID for unstaking ", tokenID.toString());
      console.log("tokenID to be unstaked", tokenID.toString());
      console.log("Owner of Token ID during staking",await dynamicGameFacet.ownerOf(tokenID)); 
      console.log("Token Exists? ", (await dynamicGameFacet.exists(tokenID)).toString()); 
      

      // let result = await dynamicGameFacet.nftHolderAttributes(tokenID);
      result = transformCharacterData(result);
      console.log("Hp of character",result.hp)


      
      
      await stakeNFTFacet.connect(owner).unStakeCharacter(tokenID.toString())
      console.log("Owner of Token ID after staking",await dynamicGameFacet.ownerOf(tokenID));      

      let result2 = await dynamicGameFacet.nftHolderAttributes(tokenID);
      result2 = transformCharacterData(result2);
      console.log("Hp of character after staking",result2.hp)

    })

    






  });  

  describe('Test RentalNFTFacet()', function () { 

    it('should deploy RentalNFTFacet & add functions to diamond', async () => {
      const RentalNFTFacet = await ethers.getContractFactory('RentalNFTFacet')
      const rentalNFTFacet = await RentalNFTFacet.deploy()
      await rentalNFTFacet.deployed()
      addresses.push(rentalNFTFacet.address)
      const selectors = getSelectors(rentalNFTFacet)
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
      console.log("Stake NFT Facet Address: ", rentalNFTFacet.address)
      assert.sameMembers(result, selectors)
    })

    
    // Fetch stakeNFTFacet
    it('Should Fetch stakeNFTFacet', async function () {

      stakeNFTFacet = await ethers.getContractAt('StakeNFTFacet', diamondAddress)

    });

    // Fetch stakeNFTFacet
    it('Should Fetch rentalNFTFacet', async function () {

      rentalNFTFacet = await ethers.getContractAt('RentalNFTFacet', diamondAddress)

    });
    
    it('Should test listing NFT tokenID 6 on rental marketplace', async () => {
      
      const tokenID = (await dynamicGameFacet.nftHolders(owner.address))[5];
      const rental_price = ethers.utils.parseUnits('0.01', 'ether')
      const maxRental = 10;

      console.log("tokenID for Listing", Number(tokenID));
      console.log("Owner Of TokenID ", Number(tokenID), " before listing is ", await dynamicGameFacet.ownerOf(tokenID));
      await rentalNFTFacet.connect(owner).listNFT(tokenID, rental_price, maxRental);
      console.log("Owner Of TokenID ", Number(tokenID), " after listing is ", await dynamicGameFacet.ownerOf(tokenID));

    })

    it('Should test listing NFT index 10 on rental marketplace', async () => {
      
      const tokenID = (await dynamicGameFacet.nftHolders(owner.address))[10];
      const rental_price = ethers.utils.parseUnits('0.01', 'ether')
      const maxRental = 10;
      console.log("tokenID for Listing", Number(tokenID));
      console.log("Owner Of TokenID ", Number(tokenID), " before listing is ", await dynamicGameFacet.ownerOf(tokenID));
      await rentalNFTFacet.connect(owner).listNFT(tokenID, rental_price, maxRental);
      console.log("Owner Of TokenID ", Number(tokenID), " after listing is ", await dynamicGameFacet.ownerOf(tokenID));

    })

    it('Should test listing NFT index 17 on rental marketplace', async () => {
      
      const tokenID = (await dynamicGameFacet.nftHolders(addr1.address))[0];
      const rental_price = ethers.utils.parseUnits('0.05', 'ether')
      const maxRental = 100;
      console.log("tokenID for Listing", Number(tokenID));
      console.log("Owner Of TokenID ", Number(tokenID), " before listing is ", await dynamicGameFacet.ownerOf(tokenID));
      await rentalNFTFacet.connect(addr1).listNFT(tokenID, rental_price, maxRental);
      console.log("Owner Of TokenID ", Number(tokenID), " after listing is ", await dynamicGameFacet.ownerOf(tokenID));

    })

    it('Should check fetchMarketItems', async () => {

      // const tokenID = (await dynamicGameFacet.nftHolders(addr1.address))[0];
      let [charTxn, rentalTxn, tokenTxn] = await rentalNFTFacet.connect(addr1).fetchMarketItems();
      for(let i = 0; i < rentalTxn.length; i++){

        let result = transformRentalData(rentalTxn[i]);
        console.log("market item no.", i+1);
        console.log("rental price",result.price);
        console.log("rental expiresAt",result.expiresAt);
        console.log("rental maxRental",result.maxRental);
        console.log("rental seller",result.seller);
        console.log("rental renter",result.renter);
        console.log("rental isRented",result.isRented);
        console.log();

      }
      

    });

    it('Should check fetchMyListedNFTs', async () => {

      // const tokenID = (await dynamicGameFacet.nftHolders(addr1.address))[0];
      let [charTxn, rentalTxn, tokenTxn] = await rentalNFTFacet.connect(owner).fetchMyListedNFTs();
      for(let i = 0; i < rentalTxn.length; i++){

        let result = transformRentalData(rentalTxn[i]);
        console.log("rental item no.", i+1);
        console.log("rental price",result.price);
        console.log("rental expiresAt",result.expiresAt);
        console.log("rental maxRental",result.maxRental);
        console.log("rental seller",result.seller);
        console.log("rental renter",result.renter);
        console.log("rental isRented",result.isRented);
        console.log();

      }
      

    });

    it('Should check fetchMyUnListedNFTs', async () => {

      // console.log("RETURN VALUE ",await rentalNFTFacet.connect(owner).fetchMyUnListedNFTs());
      let [charTxn, tokenTxn] = await rentalNFTFacet.connect(owner).fetchMyUnListedNFTs();
      for(let i = 0; i < charTxn.length; i++){

        let result = transformCharacterData(charTxn[i]);
        console.log("TokenID ",tokenTxn[i].toString());
        console.log("character item no.", i+1);
        console.log("character name ",result.name);
        console.log("character HP: ",result.hp);
        console.log("character attackDamage ",result.attackDamage);
        console.log("character level ",result.levels);        
        console.log();

      }
      

    });

    it('Should test renting NFT index 5 for 10 days', async () => {
      
      // console.log("TokenIDs of user: ", await dynamicGameFacet.nftHolders(owner.address));

      // const tokenID = (await dynamicGameFacet.nftHolders(owner.address))[5];
      let [charArrays, rentalArrays, tokenIDs] = await rentalNFTFacet.connect(owner).fetchMyListedNFTs();
      const tokenID = tokenIDs[0];
      console.log("tokenID for Rent", Number(tokenID));

      const rentalDuration = 10;
      const rentalPrice = ethers.utils.parseUnits('0.01', 'ether') * 10;
      const balanceBefore = await ethers.provider.getBalance(owner.address);

      console.log("Owner Of TokenID ", Number(tokenID), " before renting is ", await dynamicGameFacet.ownerOf(tokenID));
      await rentalNFTFacet.connect(addr2).rentNFT(tokenID, rentalDuration, { value: (rentalPrice).toString() });
      console.log("Owner Of TokenID ", Number(tokenID), " after renting is ", await dynamicGameFacet.ownerOf(tokenID));

      const balanceAfter = await ethers.provider.getBalance(owner.address);
      expect(balanceAfter.gt(balanceBefore), 'Balance is not higher').to.be.true;
  

    })

    it('Should check fetchMarketItems', async () => {

      // const tokenID = (await dynamicGameFacet.nftHolders(addr1.address))[0];
      let [charTxn, rentalTxn, tokenTxn] = await rentalNFTFacet.connect(addr1).fetchMarketItems();
      for(let i = 0; i < rentalTxn.length; i++){

        let result = transformRentalData(rentalTxn[i]);
        console.log("market item no.", i+1);
        console.log("rental price",result.price);
        console.log("rental expiresAt",result.expiresAt);
        console.log("rental maxRental",result.maxRental);
        console.log("rental seller",result.seller);
        console.log("rental renter",result.renter);
        console.log("rental isRented",result.isRented);
        console.log();

      }
      

    });

    it('Should test renting NFT index 17 for 25 days', async () => {
      
      // const tokenID = (await dynamicGameFacet.nftHolders(addr1.address))[0];
      let [charArrays, rentalArrays, tokenIDs] = await rentalNFTFacet.connect(addr1).fetchMyListedNFTs();
      const tokenID = tokenIDs[0];
      console.log("tokenID for Rent", Number(tokenID));
      const rentalDuration = 25;
      const rentalPrice = ethers.utils.parseUnits('0.05', 'ether') * 25;
      const balanceBefore = await ethers.provider.getBalance(addr1.address);

      console.log("Owner Of TokenID ", Number(tokenID), " before renting is ", await dynamicGameFacet.ownerOf(tokenID));
      await rentalNFTFacet.connect(addr2).rentNFT(tokenID, rentalDuration, { value: (rentalPrice).toString() });
      console.log("Owner Of TokenID ", Number(tokenID), " after renting is ", await dynamicGameFacet.ownerOf(tokenID));

      const balanceAfter = await ethers.provider.getBalance(addr1.address);
      expect(balanceAfter.gt(balanceBefore), 'Balance is not higher').to.be.true;
    })

    it('Should check fetchRentedNFTs', async () => {

      // const tokenID = (await dynamicGameFacet.nftHolders(addr1.address))[0];
      let [charTxn, rentalTxn, tokenTxn] = await rentalNFTFacet.connect(addr2).fetchRentedNFTs();
      for(let i = 0; i < rentalTxn.length; i++){

        let result = transformRentalData(rentalTxn[i]);
        console.log("market item no.", i+1);
        console.log("rental price",result.price);
        console.log("rental expiresAt",result.expiresAt);
        console.log("rental maxRental",result.maxRental);
        console.log("rental seller",result.seller);
        console.log("rental renter",result.renter);
        console.log("rental isRented",result.isRented);
        console.log();

      }
      

    });

    
    it('Should fail to transfer rented NFT tokenID 16', async () => {
      
      const tokenID = 16;

      console.log("Owner Of TokenID ", Number(tokenID), " before trying to tranfer is ", await dynamicGameFacet.ownerOf(tokenID));
      await expect(dynamicGameFacet.connect(addr2).transferFrom(addr2.address, addr3.address, tokenID)).to.be.revertedWith("NFT Already Rented.");
      console.log("Owner Of TokenID ", Number(tokenID), " before trying to tranfer ", await dynamicGameFacet.ownerOf(tokenID));
      
    });

    it('Should fail to transfer rented NFT tokenID 17', async () => {
      
      const tokenID = 17;

      console.log("Owner Of TokenID ", Number(tokenID), " before trying to tranfer is ", await dynamicGameFacet.ownerOf(tokenID));
      await expect(dynamicGameFacet.connect(addr2).transferFrom(addr2.address, addr3.address, tokenID)).to.be.revertedWith("NFT Already Rented.");
      console.log("Owner Of TokenID ", Number(tokenID), " before trying to tranfer ", await dynamicGameFacet.ownerOf(tokenID));
      
    });


    it("Increase Time By 10 Days", async function() {
    
      await ethers.provider.send('evm_increaseTime', [60*10]);
      await ethers.provider.send('evm_mine');
      console.log("~~~~~~~~~~~~~~~~~~~~~~~ TIME INCREASED ~~~~~~~~~~~~~~~~~~~~~~~")
      console.log();
      
    })

    it('Should check fetchLentNFTs', async () => {

      // const tokenID = (await dynamicGameFacet.nftHolders(addr1.address))[0];
      let [charTxn, rentalTxn, tokenTxn] = await rentalNFTFacet.connect(owner).fetchLentNFTs();
      for(let i = 0; i < rentalTxn.length; i++){

        let result = transformRentalData(rentalTxn[i]);
        console.log("market item no.", i+1);
        console.log("rental price",result.price);
        console.log("rental expiresAt",result.expiresAt);
        console.log("rental maxRental",result.maxRental);
        console.log("rental seller",result.seller);
        console.log("rental renter",result.renter);
        console.log("rental isRented",result.isRented);
        console.log();

      }
      

    });

    it('Should test finish renting NFT index 5 after 10 days', async () => {
      
      const tokenID = 16;
      console.log("Owner Of TokenID ", Number(tokenID), " before finish renting is ", await dynamicGameFacet.ownerOf(tokenID));
      await rentalNFTFacet.connect(addr1).finishRenting(tokenID);
      console.log("Owner Of TokenID ", Number(tokenID), " after finish renting is ", await dynamicGameFacet.ownerOf(tokenID));

    })

    it('Should fail to finish renting NFT tokenID 17 after 10 days', async () => {
      
      const tokenID = 17;
      console.log("Owner Of TokenID ", Number(tokenID), " before finish renting is ", await dynamicGameFacet.ownerOf(tokenID));
      await expect (rentalNFTFacet.connect(addr1).finishRenting(tokenID)).to.be.reverted;
      console.log("Owner Of TokenID ", Number(tokenID), " after finish renting is ", await dynamicGameFacet.ownerOf(tokenID));

    })

    // it('Should finish renting NFT index 17 after 10 days', async () => {
      
    //   const tokenID = (await dynamicGameFacet.nftHolders(addr1.address))[0];
    //   console.log("Owner Of TokenID ", Number(tokenID), " before finish renting is ", await dynamicGameFacet.ownerOf(tokenID));
    //   await expect (rentalNFTFacet.connect(addr2).finishRenting(tokenID)).to.not.be.reverted;
    //   console.log("Owner Of TokenID ", Number(tokenID), " after finish renting is ", await dynamicGameFacet.ownerOf(tokenID));

    // })


    it('Should check rental status of NFT', async () => {

      const tokenID = 17;
      let rentalTxn = await rentalNFTFacet.connect(addr1).fetchNFTRentalStatus(tokenID);
      let result = transformRentalData(rentalTxn);
      console.log("rental price",result.price);
      console.log("rental expiresAt",result.expiresAt);
      console.log("rental maxRental",result.maxRental);
      console.log("rental seller",result.seller);
      console.log("rental renter",result.renter);
      console.log("rental isRented",result.isRented);

    });

    it("Increase Time By 15 Days", async function() {
    
      await ethers.provider.send('evm_increaseTime', [60*15]);
      await ethers.provider.send('evm_mine');
      console.log("~~~~~~~~~~~~~~~~~~~~~~~ TIME INCREASED ~~~~~~~~~~~~~~~~~~~~~~~")
      console.log();
      
    })

    it('Should check fetchLentNFTs', async () => {

      
      let [charTxn, rentalTxn, tokenTxn] = await rentalNFTFacet.connect(addr1).fetchLentNFTs();
      for(let i = 0; i < rentalTxn.length; i++){

        let result = transformRentalData(rentalTxn[i]);
        console.log("market item no.", i+1);
        console.log("rental price",result.price);
        console.log("rental expiresAt",result.expiresAt);
        console.log("rental maxRental",result.maxRental);
        console.log("rental seller",result.seller);
        console.log("rental renter",result.renter);
        console.log("rental isRented",result.isRented);
        console.log();

      }
      

    });

    it('Should finish renting NFT index 17 after 25 days', async () => {
      
      const tokenID = 17;
      console.log("Owner Of TokenID ", Number(tokenID), " before finish renting is ", await dynamicGameFacet.ownerOf(tokenID));
      await expect (rentalNFTFacet.connect(addr1).finishRenting(tokenID)).to.not.be.reverted;
      console.log("Owner Of TokenID ", Number(tokenID), " after finish renting is ", await dynamicGameFacet.ownerOf(tokenID));

    })

    it('Should check rental status of NFT', async () => {

      const tokenID = 17;
      let rentalTxn = await rentalNFTFacet.connect(addr1).fetchNFTRentalStatus(tokenID);
      let result = transformRentalData(rentalTxn);
      console.log("rental price",result.price);
      console.log("rental expiresAt",result.expiresAt);
      console.log("rental maxRental",result.maxRental);
      console.log("rental seller",result.seller);
      console.log("rental renter",result.renter);
      console.log("rental isRented",result.isRented);

    });

    it('Should check fetchMarketItems', async () => {

      // const tokenID = (await dynamicGameFacet.nftHolders(addr1.address))[0];
      let [charTxn, rentalTxn, tokenTxn] = await rentalNFTFacet.connect(addr1).fetchMarketItems();
      for(let i = 0; i < rentalTxn.length; i++){

        let result = transformRentalData(rentalTxn[i]);
        console.log("market item no.", i+1);
        console.log("rental price",result.price);
        console.log("rental expiresAt",result.expiresAt);
        console.log("rental maxRental",result.maxRental);
        console.log("rental seller",result.seller);
        console.log("rental renter",result.renter);
        console.log("rental isRented",result.isRented);
        console.log();

      }
      

    });

    it('Should check fetchMyListedNFTs', async () => {

      // const tokenID = (await dynamicGameFacet.nftHolders(addr1.address))[0];
      let [charTxn, rentalTxn, tokenTxn] = await rentalNFTFacet.connect(owner).fetchMyListedNFTs();
      for(let i = 0; i < rentalTxn.length; i++){

        let result = transformRentalData(rentalTxn[i]);
        console.log("rental item no.", i+1);
        console.log("rental price",result.price);
        console.log("rental expiresAt",result.expiresAt);
        console.log("rental maxRental",result.maxRental);
        console.log("rental seller",result.seller);
        console.log("rental renter",result.renter);
        console.log("rental isRented",result.isRented);
        console.log();

      }
      

    });

    it('Should check cancelListing', async () => {

      const tokenID = [12, 13, 14];
      const rental_price = ethers.utils.parseUnits('0.05', 'ether')
      const maxRental = 100;
      console.log("tokenID for Listing", Number(tokenID));
      
      for(let i=0; i<tokenID.length; i++){
        console.log("Owner Of TokenID ", Number(tokenID), " before listing is ", await dynamicGameFacet.ownerOf(tokenID[i]));
        await rentalNFTFacet.connect(owner).listNFT(tokenID[i], rental_price, maxRental);
        console.log("Owner Of TokenID ", Number(tokenID), " after listing is ", await dynamicGameFacet.ownerOf(tokenID[i]));
      } 
      console.log();     

      console.log("Checking NFTs Listed in marketplace")
      let [charTxn, rentalTxn, tokenTxn] = await rentalNFTFacet.connect(addr1).fetchMarketItems();
      for(let i = 0; i < rentalTxn.length; i++){

        let result = transformRentalData(rentalTxn[i]);
        console.log("market item no.", tokenTxn[i].toString());
        console.log("rental price",result.price);
        console.log("rental expiresAt",result.expiresAt);
        console.log("rental maxRental",result.maxRental);
        console.log("rental seller",result.seller);
        console.log("rental renter",result.renter);
        console.log("rental isRented",result.isRented);
        console.log();

      }
      console.log();

      console.log("Checking NFTs Listed By User in marketplace")
      let [charTxn1, rentalTxn1, tokenTxn1] = await rentalNFTFacet.connect(owner).fetchMyListedNFTs();
      for(let i = 0; i < rentalTxn1.length; i++){

        let result = transformRentalData(rentalTxn1[i]);
        console.log("tokenID ", tokenTxn1[i].toString());
        console.log("rental price",result.price);
        console.log("rental expiresAt",result.expiresAt);
        console.log("rental maxRental",result.maxRental);
        console.log("rental seller",result.seller);
        console.log("rental renter",result.renter);
        console.log("rental isRented",result.isRented);
        console.log();

      }
      console.log();


      console.log("Cancelling NFTs Listed By User in marketplace")
      for(let i = 0; i < rentalTxn1.length - 1; i++){
        
        await rentalNFTFacet.connect(owner).cancelListing(tokenTxn1[i]);        

      }
      console.log("Cancellation Complete")      
      console.log();


      console.log("Checking NFTs Listed in marketplace After Cancellation")
      let [charTxn2, rentalTxn2, tokenTxn2] = await rentalNFTFacet.connect(addr1).fetchMarketItems();
      for(let i = 0; i < rentalTxn2.length; i++){

        let result = transformRentalData(rentalTxn2[i]);
        console.log("market item no.", tokenTxn2[i].toString());
        console.log("rental price",result.price);
        console.log("rental expiresAt",result.expiresAt);
        console.log("rental maxRental",result.maxRental);
        console.log("rental seller",result.seller);
        console.log("rental renter",result.renter);
        console.log("rental isRented",result.isRented);
        console.log();

      }
      console.log();

      console.log("Checking NFTs Listed By User in marketplace After Cancellation")
      let [charTxn3, rentalTxn3, tokenTxn3] = await rentalNFTFacet.connect(owner).fetchMyListedNFTs();
      for(let i = 0; i < rentalTxn3.length; i++){

        let result = transformRentalData(rentalTxn3[i]);
        console.log("tokenID ", tokenTxn3[i].toString());
        console.log("rental price",result.price);
        console.log("rental expiresAt",result.expiresAt);
        console.log("rental maxRental",result.maxRental);
        console.log("rental seller",result.seller);
        console.log("rental renter",result.renter);
        console.log("rental isRented",result.isRented);
        console.log();

      }
      console.log();



    });

    it('Should check fetchMyUnListedNFTs after cancellation', async () => {

      // console.log("RETURN VALUE ",await rentalNFTFacet.connect(owner).fetchMyUnListedNFTs());
      let [charTxn, tokenTxn] = await rentalNFTFacet.connect(owner).fetchMyUnListedNFTs();
      for(let i = 0; i < charTxn.length; i++){

        let result = transformCharacterData(charTxn[i]);
        console.log("TokenID ",tokenTxn[i].toString());
        console.log("character item no.", i+1);
        console.log("character name ",result.name);
        console.log("character HP: ",result.hp);
        console.log("character attackDamage ",result.attackDamage);
        console.log("character level ",result.levels);        
        console.log();

      }
      

    });


  });





})
