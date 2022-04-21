/* global describe it before ethers */

const {
  getSelectors,
  FacetCutAction,
  removeSelectors,
  findAddressPositionInFacets
} = require('../scripts/libraries/diamond.js')

const { deployDiamond } = require('../scripts/deploy.js')

const { assert, expect } = require('chai')



const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
    
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
  let owner, addr1, addr2;

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
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
  
      expect(result.name).to.equal("Thanos: The Mad Titan");
      expect((result.hp).toString()).to.equal("10000");
      expect((result.maxHp).toString()).to.equal("10000");
      expect((result.attackDamage).toString()).to.equal("50");
  
      const charactersTxn = await dynamicGameFacet.getAllDefaultCharacters();
      const characters = charactersTxn.map((characterData) => transformCharacterData(characterData));
      characters.forEach((character, index) => {
      
        if(index == 0){
            expect(character.name).to.equal("Raze");
            expect((character.hp).toString()).to.equal("100");
            expect((character.maxHp).toString()).to.equal("100");
            expect((character.attackDamage).toString()).to.equal("100");
        }
        
        else if(index == 1){
            expect(character.name).to.equal("Phoenix");
            expect((character.hp).toString()).to.equal("200");
            expect((character.maxHp).toString()).to.equal("200");
            expect((character.attackDamage).toString()).to.equal("50");
        }
  
        else if(index == 2){
            expect(character.name).to.equal("Sage");
            expect((character.hp).toString()).to.equal("400");
            expect((character.maxHp).toString()).to.equal("400");
            expect((character.attackDamage).toString()).to.equal("25");
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
        
        for (let i = 0; i < 3; i++) {
          await expect(dynamicGameFacet.connect(owner).mintCharacterNFT(i, {value: ethers.utils.parseEther("0.01")})).to.not.be.reverted; 
        }

    });

    it('Should Fail To Mint If Amount Is Not Exact', async function () {
      
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
      
      await expect(dynamicGameFacet.connect(addr2).attackBoss()).to.be.reverted;

    });

    // attackBoss after minting NFT
    it('should attack boss', async function() {

      // await expect(myEpicContract.connect(owner).mintCharacterNFT(0, {value: ethers.utils.parseEther("0.1")})).to.not.be.reverted; 
      await expect(dynamicGameFacet.connect(owner).attackBoss()).to.not.be.reverted;

    });

    // attackBoss & check Stats
    it('should mint NFT & Attacks Boss, Both Boss & Player incur damages', async function() {
      
      await expect(dynamicGameFacet.connect(addr1).mintCharacterNFT(0, {value: ethers.utils.parseEther("0.2")})).to.not.be.reverted; 

      // Player1 Stats before Attack
      let player1_token = await dynamicGameFacet.connect(addr1).nftHolders(addr1.address);
      let player1_char_beforeAttack = await dynamicGameFacet.connect(addr1).nftHolderAttributes(player1_token);
      let player1_hp = transformCharacterData(player1_char_beforeAttack).hp;
      let player1_attack = transformCharacterData(player1_char_beforeAttack).attackDamage;
      
      // Boss Stats After Attack
      let beforeAttackBossTxn = await dynamicGameFacet.getBigBoss();
      let beforeAttackResult = transformCharacterData(beforeAttackBossTxn);
      let bossHp = beforeAttackResult.hp;
      let boss_attack = beforeAttackResult.attackDamage;

      // ATTACK NOW!
      await expect(dynamicGameFacet.connect(addr1).attackBoss()).to.not.be.reverted;

      //Check Player Hp After Attack
      let player1_char_afterAttack = await dynamicGameFacet.connect(addr1).nftHolderAttributes(player1_token);
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
        expect((result.name).toString()).to.not.be.equal('');

    });

    // checkIfUserHasNFT
    it('should fail since user does not have NFT', async function() {

      let result = await dynamicGameFacet.connect(addr2).checkIfUserHasNFT();
      expect((result.name).toString()).to.be.equal('');

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
        
        ownersList.forEach((element) => {
          console.log(element);
        });
        
    });


  });


})
