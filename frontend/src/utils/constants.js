const NFTGAME_CONTRACT_ADDRESS = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
const DYNAMIC_GAME_FACET_ADDRESS = "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d";
const STAKE_FACET_ADDRESS = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";

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