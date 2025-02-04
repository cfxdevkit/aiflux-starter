import { Provider } from "@elizaos/core";
import { ValidatedConfig } from "../utils";
import {
    getGeckoTerminalProvider,
    getTokensProvider,
    getMarketAnalysisProvider,
    getDefiLlamaProvider,
} from "./common";
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
    getEspaceTpsProvider,
    getEspaceTransactionsProvider,
    getESpaceTopGasUsersProvider,
    getESpaceTopCfxSendersProvider,
    getESpaceTopCfxReceiversProvider,
    getESpaceTopTransactionSendersProvider,
    getESpaceTopTransactionReceiversProvider,
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
            getESpaceTopGasUsersProvider(this.confluxConfig),
            getESpaceTopCfxSendersProvider(this.confluxConfig),
            getESpaceTopCfxReceiversProvider(this.confluxConfig),
            getESpaceTopTransactionSendersProvider(this.confluxConfig),
            getESpaceTopTransactionReceiversProvider(this.confluxConfig),
        ];
    }
}
