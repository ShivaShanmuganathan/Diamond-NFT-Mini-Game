const NFTGAME_CONTRACT_ADDRESS = "0xE1c16fefCc4AdF4C27e31f60A257a54938Fcde17";
const DYNAMIC_GAME_FACET_ADDRESS = "0xaE488C9db4BA2a32627f8Bf874215bf643399823";
const STAKE_FACET_ADDRESS = "0x0B2775cB9eCaABe3596A57AdacB902eEE3cdD218";

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