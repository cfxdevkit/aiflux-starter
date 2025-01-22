import { Address, PublicClient, parseAbi } from "viem";
import {
    ContractCheckResult,
    INTERFACE_IDS,
    commonMetadataAbi,
    nftSpecificAbi,
} from "../types";
import { isAddress, getAddress } from "viem";
import ERC20ABI from "../abi/erc20";

export class EspaceContractDetector {
    constructor(private publicClient: PublicClient) {}

    private async extractContractMetadata(address: Address) {
        const metadata: Record<string, any> = {};

        const safeCall = async <T extends { functionName: string }>(
            functionName: T["functionName"],
            abi: readonly unknown[] = commonMetadataAbi
        ) => {
            try {
                const result = await this.publicClient.readContract({
                    address,
                    abi,
                    functionName,
                });
                return result;
            } catch {
                return null;
            }
        };

        // Extract basic metadata
        const [name, symbol, version] = await Promise.all([
            safeCall("name"),
            safeCall("symbol"),
            safeCall("version"),
        ]);

        if (name) metadata.name = name;
        if (symbol) metadata.symbol = symbol;
        if (version) metadata.version = version;

        // Extract ownership and implementation details
        const [owner, implementation] = await Promise.all([
            safeCall("owner"),
            safeCall("implementation"),
        ]);

        if (owner) metadata.owner = owner;
        if (implementation) {
            metadata.isProxy = true;
            metadata.implementation = implementation;
        }

        // Extract URIs and configuration
        const [
            baseURI,
            contractURI,
            tokenURIPrefix,
            paused,
            maxSupply,
            maxSupplyAlt,
        ] = await Promise.all([
            safeCall("baseURI"),
            safeCall("contractURI"),
            safeCall("tokenURIPrefix"),
            safeCall("paused"),
            safeCall("maxSupply"),
            safeCall("MAX_SUPPLY"),
        ]);

        if (baseURI) metadata.baseURI = baseURI;
        if (contractURI) metadata.contractURI = contractURI;
        if (tokenURIPrefix) metadata.tokenURIPrefix = tokenURIPrefix;
        if (paused !== null) metadata.paused = paused;
        if (maxSupply) metadata.maxSupply = maxSupply.toString();
        else if (maxSupplyAlt) metadata.maxSupply = maxSupplyAlt.toString();

        // Extract NFT-specific details
        const [totalSupply, maxTokenId, maxTokens] = await Promise.all([
            safeCall("totalSupply", nftSpecificAbi),
            safeCall("maxTokenId", nftSpecificAbi),
            safeCall("MAX_TOKENS", nftSpecificAbi),
        ]);

        const [mintPrice, mintingEnabled, provenanceHash] = await Promise.all([
            safeCall("mintPrice", nftSpecificAbi),
            safeCall("mintingEnabled", nftSpecificAbi),
            safeCall("provenanceHash", nftSpecificAbi),
        ]);

        if (totalSupply) metadata.totalSupply = totalSupply.toString();
        if (maxTokenId) metadata.maxTokenId = maxTokenId.toString();
        if (maxTokens) metadata.maxTokens = maxTokens.toString();
        if (mintPrice) metadata.mintPrice = mintPrice.toString();
        if (mintingEnabled !== null) metadata.mintingEnabled = mintingEnabled;
        if (provenanceHash) metadata.provenanceHash = provenanceHash;

        return metadata;
    }

    async detectContract(address: string): Promise<ContractCheckResult> {
        try {
            if (!isAddress(address)) {
                throw new Error("Invalid address format");
            }

            const checksummedAddress = getAddress(address);

            if (
                checksummedAddress ===
                "0x0000000000000000000000000000000000000000"
            ) {
                throw new Error("Cannot check null address");
            }

            const bytecode = await this.publicClient.getBytecode({
                address: checksummedAddress,
            });

            if (!bytecode || bytecode === "0x") {
                return {
                    isContract: false,
                    type: "EOA",
                    message: "This is not a contract address",
                };
            }

            // Initialize result object
            const result: ContractCheckResult & { isContract: true } = {
                isContract: true as const,
                supportedInterfaces: [],
                features: [],
                type: "UNKNOWN",
                details: {},
                message: "",
                category: undefined,
                metadata:
                    await this.extractContractMetadata(checksummedAddress),
                bytecodeSize: (bytecode.length - 2) / 2,
            };

            await this.detectContractType(checksummedAddress, result);

            return result;
        } catch (error: any) {
            // Handle specific RPC errors
            if (error.message.includes("network")) {
                throw new Error("Network error: Please check your connection");
            }
            if (error.message.includes("rate limit")) {
                throw new Error(
                    "RPC rate limit exceeded: Please try again later"
                );
            }
            throw error;
        }
    }

    private async detectContractType(
        address: Address,
        result: ContractCheckResult & { isContract: true }
    ): Promise<void> {
        let isERC20 = false;
        try {
            const [totalSupply, name, symbol, decimals] = await Promise.all([
                this.publicClient.readContract({
                    address,
                    abi: ERC20ABI,
                    functionName: "totalSupply",
                }),
                this.publicClient
                    .readContract({
                        address,
                        abi: ERC20ABI,
                        functionName: "name",
                    })
                    .catch(() => null),
                this.publicClient
                    .readContract({
                        address,
                        abi: ERC20ABI,
                        functionName: "symbol",
                    })
                    .catch(() => null),
                this.publicClient
                    .readContract({
                        address,
                        abi: ERC20ABI,
                        functionName: "decimals",
                    })
                    .catch(() => null),
            ]);

            isERC20 = true;
            result.type = "ERC20";
            result.supportedInterfaces.push("ERC20");
            result.details.erc20 = {
                name,
                symbol,
                decimals,
                totalSupply: totalSupply.toString(),
            };
        } catch (error) {
            // Not an ERC20 token
        }

        // Check ERC165 and other standards
        try {
            const supportsERC165 = await this.publicClient.readContract({
                address,
                abi: parseAbi([
                    "function supportsInterface(bytes4) view returns (bool)",
                ]),
                functionName: "supportsInterface",
                args: [INTERFACE_IDS.ERC165 as `0x${string}`],
            });

            if (supportsERC165) {
                result.supportedInterfaces.push("ERC165");

                // Check all interfaces in parallel
                const interfaceChecks = await Promise.all(
                    Object.entries(INTERFACE_IDS).map(
                        async ([name, interfaceId]) => {
                            try {
                                const supported =
                                    await this.publicClient.readContract({
                                        address,
                                        abi: parseAbi([
                                            "function supportsInterface(bytes4) view returns (bool)",
                                        ]),
                                        functionName: "supportsInterface",
                                        args: [interfaceId as `0x${string}`],
                                    });
                                return { name, supported };
                            } catch {
                                return { name, supported: false };
                            }
                        }
                    )
                );

                // Process interface check results
                for (const { name, supported } of interfaceChecks) {
                    if (supported) {
                        result.supportedInterfaces.push(name);

                        // Set primary type if not already ERC20
                        if (!isERC20) {
                            if (name === "ERC721") result.type = "ERC721";
                            else if (name === "ERC1155")
                                result.type = "ERC1155";
                            else if (name === "ERC4626")
                                result.type = "ERC4626";
                        }

                        // Add feature flags
                        if (name === "ERC721Metadata")
                            result.features.push("METADATA");
                        if (name === "ERC721Enumerable")
                            result.features.push("ENUMERABLE");
                        if (name === "ERC2981")
                            result.features.push("ROYALTIES");
                        if (name === "ERC4907")
                            result.features.push("RENTABLE");
                        if (name === "Ownable") result.features.push("OWNABLE");
                        if (name === "AccessControl")
                            result.features.push("RBAC");
                    }
                }
            }
        } catch (error) {
            // Contract doesn't implement ERC165
            if (!isERC20) {
                result.message =
                    "Contract does not implement ERC165 and is not a standard token contract";
            }
        }

        // Add high-level categorization
        if (result.type !== "UNKNOWN") {
            if (["ERC721", "ERC1155"].includes(result.type)) {
                result.category = "NFT";
            } else if (["ERC20", "ERC4626"].includes(result.type)) {
                result.category = "FUNGIBLE_TOKEN";
            }
        }
    }
}
