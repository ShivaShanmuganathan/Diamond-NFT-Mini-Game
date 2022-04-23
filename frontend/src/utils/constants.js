const NFTGAME_CONTRACT_ADDRESS = "0x2D410d62Ab8D91f1f47e9D309164806b4887aA1e";
const DYNAMIC_GAME_FACET_ADDRESS = "0x7eb9F18478D880f72696E26b723eD2b151426Df8";
const STAKE_FACET_ADDRESS = "0x95f82e923B2d74E5fBaEA07B85d368b833394bEF";

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