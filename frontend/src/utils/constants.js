const NFTGAME_CONTRACT_ADDRESS = "0xCe29944309A1aFD75a67E85f83FAa045b421629F";
const DYNAMIC_GAME_FACET_ADDRESS = "0xD01BC1A7C9D4f87bF4056F01c254135303099996";
const STAKE_FACET_ADDRESS = "0xe96eec8729daeFA76b04B2b7b7a3Cb69e6935AbD";

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