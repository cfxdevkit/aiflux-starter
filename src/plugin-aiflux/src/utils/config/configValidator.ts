import { elizaLogger } from "@elizaos/core";
import { ConfluxScanCore, ConfluxScanESpace } from "../confluxscan";
import { GeckoTerminal } from "../geckoterminal";
import { ConfluxTarget } from "./types";
import { CoreWallet } from "../wallet/coreWallet";
import { EspaceWallet } from "../wallet/espaceWallet";
import { deriveCoreKey, deriveESpaceKey } from "../wallet/mnemonic";
import { TokenListManager } from "./tokenList";
import { DeFiLlama } from "../defillama";

export interface ValidatedConfig {
    coreWallet?: CoreWallet;
    espaceWallet?: EspaceWallet;
    coreConfluxScan?: ConfluxScanCore;
    espaceConfluxScan?: ConfluxScanESpace;
    geckoTerminal?: GeckoTerminal;
    tokenListManager?: TokenListManager;
    defiLlama?: DeFiLlama;
    target: ConfluxTarget;
}

export async function validateConfig(
    getSetting: (key: string) => string | undefined
): Promise<ValidatedConfig | null> {
    const target = getSetting("CONFLUX_TARGET") as ConfluxTarget | undefined;

    // Validate target
    if (!target || !["mainnet", "testnet"].includes(target)) {
        elizaLogger.error("Invalid or missing CONFLUX_TARGET");
        return null;
    }

    elizaLogger.debug(`Initializing Conflux config for ${target}`);

    let coreWallet: CoreWallet | undefined;
    let espaceWallet: EspaceWallet | undefined;
    let coreConfluxScan: ConfluxScanCore | undefined;
    let espaceConfluxScan: ConfluxScanESpace | undefined;
    let geckoTerminal: GeckoTerminal | undefined;
    let tokenListManager: TokenListManager | undefined;
    let defiLlama: DeFiLlama | undefined;

    const mnemonic = getSetting("CONFLUX_MNEMONIC");

    // Initialize ConfluxScan instances
    elizaLogger.debug("Initializing ConfluxScan clients");
    const coreConfluxScanApiKey = getSetting("CONFLUX_CORE_CONFLUXSCAN_APIKEY");
    const coreConfluxScanHost = getSetting("CONFLUX_CORE_CONFLUXSCAN_HOST");
    coreConfluxScan = new ConfluxScanCore(
        coreConfluxScanApiKey,
        coreConfluxScanHost,
        target
    );

    const espaceConfluxScanApiKey = getSetting(
        "CONFLUX_ESPACE_CONFLUXSCAN_APIKEY"
    );
    const espaceConfluxScanHost = getSetting("CONFLUX_ESPACE_CONFLUXSCAN_HOST");
    espaceConfluxScan = new ConfluxScanESpace(
        espaceConfluxScanApiKey,
        espaceConfluxScanHost,
        target
    );

    // Initialize Core Wallet
    const corePrivateKey = getSetting("CONFLUX_CORE_PRIVATE_KEY");
    const coreRpcUrl = getSetting("CONFLUX_CORE_RPC_URL");
    if (corePrivateKey) {
        elizaLogger.debug("Initializing Core wallet with private key");
        try {
            coreWallet = new CoreWallet(
                corePrivateKey as `0x${string}`,
                target,
                coreRpcUrl
            );
        } catch (error) {
            elizaLogger.error(
                "Failed to initialize Core wallet with private key:",
                error
            );
        }
    } else if (mnemonic) {
        elizaLogger.debug("Initializing Core wallet with mnemonic");
        try {
            const derivedKey = deriveCoreKey(mnemonic);
            coreWallet = new CoreWallet(derivedKey, target, coreRpcUrl);
        } catch (error) {
            elizaLogger.error(
                "Failed to initialize Core wallet with mnemonic:",
                error
            );
        }
    }

    // Initialize eSpace Wallet
    const espacePrivateKey = getSetting("CONFLUX_ESPACE_PRIVATE_KEY");
    const espaceRpcUrl = getSetting("CONFLUX_ESPACE_RPC_URL");
    if (espacePrivateKey) {
        elizaLogger.debug("Initializing eSpace wallet with private key");
        try {
            espaceWallet = new EspaceWallet(
                espacePrivateKey as `0x${string}`,
                target,
                espaceRpcUrl
            );
        } catch (error) {
            elizaLogger.error(
                "Failed to initialize eSpace wallet with private key:",
                error
            );
        }
    } else if (mnemonic) {
        elizaLogger.debug("Initializing eSpace wallet with mnemonic");
        try {
            const derivedKey = deriveESpaceKey(mnemonic);
            espaceWallet = new EspaceWallet(derivedKey, target, espaceRpcUrl);
        } catch (error) {
            elizaLogger.error(
                "Failed to initialize eSpace wallet with mnemonic:",
                error
            );
        }
    }

    // Initialize TokenListManager and GeckoTerminal for mainnet only
    if (target === "mainnet") {
        elizaLogger.debug("Initializing GeckoTerminal");
        geckoTerminal = new GeckoTerminal();

        elizaLogger.debug("Initializing DeFiLlama");
        defiLlama = new DeFiLlama();
    }

    tokenListManager = new TokenListManager(
        geckoTerminal,
        espaceConfluxScan,
        espaceWallet?.getAddress()
    );
    await tokenListManager.initialize(target);

    const result: ValidatedConfig = {
        target,
        coreWallet,
        espaceWallet,
        coreConfluxScan,
        espaceConfluxScan,
        geckoTerminal,
        tokenListManager,
        defiLlama,
    };

    elizaLogger.debug("Config validation completed", {
        hasCoreWallet: !!coreWallet,
        hasEspaceWallet: !!espaceWallet,
        hasCoreConfluxScan: !!coreConfluxScan,
        hasEspaceConfluxScan: !!espaceConfluxScan,
        hasGeckoTerminal: !!geckoTerminal,
        hasTokenListManager: !!tokenListManager,
        hasDefiLlama: !!defiLlama
    });

    return result;
}
