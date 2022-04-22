const NFTGAME_CONTRACT_ADDRESS = "0xc50B8E1a9114D0DDCbefEB0BcA6729E922E06ba0"

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

export { NFTGAME_CONTRACT_ADDRESS, transformCharacterData };