const NFTGAME_CONTRACT_ADDRESS = "0x791B0E7e61B094Eb6B7695d9ABc659F391071c43";
const DYNAMIC_GAME_FACET_ADDRESS = "0xf1FeF4915c6D2a73144a6f95239B971197DEAD9e";
const STAKE_FACET_ADDRESS = "0xC16919F426f58dB947234Acb20C454C06053FB4B";

const transformCharacterData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHp: characterData.maxHp.toNumber(),
        attackDamage: characterData.attackDamage.toNumber(),
        levels: characterData.levels
    }
}

export { NFTGAME_CONTRACT_ADDRESS, transformCharacterData, DYNAMIC_GAME_FACET_ADDRESS, STAKE_FACET_ADDRESS};