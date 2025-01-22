import { Provider, elizaLogger } from "@elizaos/core";
import { ValidatedConfig } from "../utils";
import { getGeckoTerminalProvider, getTokensProvider, getMarketAnalysisProvider, getDefiLlamaProvider } from "./common";
import {
    getCoreAccountGrowthProvider,
    getCoreActiveAccountsProvider,
    getCoreCfxHoldersProvider,
    getCoreCfxTransfersProvider,
    getCoreContractsProvider,
    getCoreSupplyProvider,
    getCoreTopCfxReceiversProvider,
    getCoreTopCfxSendersProvider,
    getCoreTopGasUsedProvider,
    getCoreTopMinersProvider,
    getCoreTopTransactionReceiversProvider,
    getCoreTopTransactionSendersProvider,
    getCoreTpsProvider,
    getCoreTransactionsProvider,
} from "./core";
import {
    getEspaceAccountGrowthProvider,
    getEspaceActiveAccountsProvider,
    getEspaceCfxHoldersProvider,
    getEspaceCfxTransfersProvider,
    getEspaceContractsProvider,
    getEspaceTopCfxReceiversProvider,
    getEspaceTopCfxSendersProvider,
    getEspaceTopGasUsedProvider,
    getEspaceTopTransactionReceiversProvider,
    getEspaceTopTransactionSendersProvider,
    getEspaceTpsProvider,
    getEspaceTransactionsProvider,
} from "./espace";

export class ConfluxProviders {
    constructor(private confluxConfig: ValidatedConfig) {}

    getAllProviders(): Provider[] {
        return [
            // Common providers
            getTokensProvider(this.confluxConfig),
            getGeckoTerminalProvider(this.confluxConfig),
            getMarketAnalysisProvider(this.confluxConfig),
            getDefiLlamaProvider(this.confluxConfig),


            // Core providers
            getCoreActiveAccountsProvider(this.confluxConfig),
            getCoreCfxHoldersProvider(this.confluxConfig),
            getCoreAccountGrowthProvider(this.confluxConfig),
            getCoreContractsProvider(this.confluxConfig),
            getCoreSupplyProvider(this.confluxConfig),
            getCoreTransactionsProvider(this.confluxConfig),
            getCoreCfxTransfersProvider(this.confluxConfig),
            getCoreTpsProvider(this.confluxConfig),
            getCoreTopMinersProvider(this.confluxConfig),
            getCoreTopGasUsedProvider(this.confluxConfig),
            getCoreTopCfxSendersProvider(this.confluxConfig),
            getCoreTopCfxReceiversProvider(this.confluxConfig),
            getCoreTopTransactionSendersProvider(this.confluxConfig),
            getCoreTopTransactionReceiversProvider(this.confluxConfig),

            // eSpace providers
            getEspaceActiveAccountsProvider(this.confluxConfig),
            getEspaceCfxHoldersProvider(this.confluxConfig),
            getEspaceAccountGrowthProvider(this.confluxConfig),
            getEspaceContractsProvider(this.confluxConfig),
            getEspaceTransactionsProvider(this.confluxConfig),
            getEspaceCfxTransfersProvider(this.confluxConfig),
            getEspaceTpsProvider(this.confluxConfig),
            getEspaceTopGasUsedProvider(this.confluxConfig),
            getEspaceTopCfxSendersProvider(this.confluxConfig),
            getEspaceTopCfxReceiversProvider(this.confluxConfig),
            getEspaceTopTransactionSendersProvider(this.confluxConfig),
            getEspaceTopTransactionReceiversProvider(this.confluxConfig),
        ]
    }
}
