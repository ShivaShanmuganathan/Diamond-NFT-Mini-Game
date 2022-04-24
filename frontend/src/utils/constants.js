const NFTGAME_CONTRACT_ADDRESS = "0xA5518dEFdbF7B55bf073f42ef3DB7f39bcecA6FF";
const DYNAMIC_GAME_FACET_ADDRESS = "0x10843144611428C4Ef2e921116f037027509358a";
const STAKE_FACET_ADDRESS = "0x725081cc13fa55397d6ab952Df50dD1b4A7CDc20";

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