import { Action } from "@elizaos/core";
import { ValidatedConfig } from "../utils";
import { createBridgeAction } from "./bridge";
import { createCfxTransferAction } from "./cfx-transfer";
import { createTokenTransferAction } from "./token-transfer";
import { createEspaceSwapAction } from "./espace-swap";
import { createAddressLookupAction } from "./address-lookup";
import { getWalletAction } from "./wallet";

export class ConfluxActions {
    constructor(private config: ValidatedConfig) {}
    getAllActions(): Action[] {
        return [
            createAddressLookupAction(this.config),
            createBridgeAction(this.config),
            createCfxTransferAction(this.config),
            createTokenTransferAction(this.config),
            createEspaceSwapAction(this.config),
            getWalletAction(this.config),
        ];
    }
}
