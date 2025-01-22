import { elizaLogger } from "@elizaos/core";
import { HDKey } from "@scure/bip32";
import {
    generateMnemonic as gm,
    mnemonicToSeedSync,
    validateMnemonic,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

/**
 * Validates the given mnemonic phrase.
 * @param mnemonic The mnemonic phrase to validate
 * @returns A boolean indicating whether the mnemonic is valid
 */
function isValidMnemonic(mnemonic: string): boolean {
    const isValid = validateMnemonic(mnemonic, wordlist);
    elizaLogger.debug(`Mnemonic validation result: ${isValid}`);
    return isValid;
}

/**
 * Derives a private key for Conflux eSpace (EVM compatible) from a mnemonic
 * @param mnemonic The mnemonic phrase to derive from
 * @param index The account index (default 0)
 * @returns The private key as a hex string with 0x prefix
 * @throws Error if the mnemonic is invalid
 */
export function deriveESpaceKey(
    mnemonic: string,
    index: number = 0
): `0x${string}` {
    elizaLogger.debug(`Deriving eSpace key for index: ${index}`);
    if (!isValidMnemonic(mnemonic)) {
        elizaLogger.error(
            "Invalid mnemonic phrase provided for eSpace key derivation"
        );
        throw new Error("Invalid mnemonic phrase");
    }
    const seed = mnemonicToSeedSync(mnemonic);
    const hdKey = HDKey.fromMasterSeed(seed);
    // eSpace uses the same path as Ethereum: m/44'/60'/0'/0/{index}
    const derivationPath = `m/44'/60'/0'/0/${index}`;
    elizaLogger.debug(`Using derivation path: ${derivationPath}`);
    const derivedKey = hdKey.derive(derivationPath);
    const privateKey = `0x${Buffer.from(derivedKey.privateKey!).toString("hex")}`;
    elizaLogger.debug("eSpace private key derived successfully");
    return privateKey as `0x${string}`;
}

/**
 * Derives a private key for Conflux Core from a mnemonic
 * @param mnemonic The mnemonic phrase to derive from
 * @param index The account index (default 0)
 * @returns The private key as a hex string with 0x prefix
 * @throws Error if the mnemonic is invalid
 */
export function deriveCoreKey(
    mnemonic: string,
    index: number = 0
): `0x${string}` {
    elizaLogger.debug(`Deriving Core key for index: ${index}`);
    if (!isValidMnemonic(mnemonic)) {
        elizaLogger.error(
            "Invalid mnemonic phrase provided for Core key derivation"
        );
        throw new Error("Invalid mnemonic phrase");
    }
    const seed = mnemonicToSeedSync(mnemonic);
    const hdKey = HDKey.fromMasterSeed(seed);
    // Conflux Core uses path: m/44'/503'/0'/0/{index}
    const derivationPath = `m/44'/503'/0'/0/${index}`;
    elizaLogger.debug(`Using derivation path: ${derivationPath}`);
    const derivedKey = hdKey.derive(derivationPath);
    const privateKey = `0x${Buffer.from(derivedKey.privateKey!).toString("hex")}`;
    elizaLogger.debug("Core private key derived successfully");
    return privateKey as `0x${string}`;
}

export function generateMnemonic(): string {
    elizaLogger.debug("Generating new 12-word mnemonic");
    const mnemonic = gm(wordlist, 128);
    elizaLogger.debug("Mnemonic generated successfully");
    return mnemonic;
}
