const NFTGAME_CONTRACT_ADDRESS = "0x2B085765C520Fea6F8D3f65D37ae203C66C23868"

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