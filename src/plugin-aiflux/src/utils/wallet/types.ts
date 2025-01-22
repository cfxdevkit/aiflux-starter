export type ContractCheckResult =
    | {
          isContract: true;
          type: string;
          supportedInterfaces: string[];
          features: string[];
          details: Record<string, any>;
          message: string;
          category?: string;
          metadata?: Record<string, any>;
          bytecodeSize?: number;
      }
    | {
          isContract: false;
          type: "EOA";
          message: string;
      };

export const INTERFACE_IDS = {
    ERC165: "0x01ffc9a7",
    ERC721: "0x80ac58cd",
    ERC721Metadata: "0x5b5e139f",
    ERC721Enumerable: "0x780e9d63",
    ERC1155: "0xd9b67a26",
    ERC1155MetadataURI: "0x0e89341c",
    ERC2981: "0x2a55205a",
    ERC4907: "0xad092b5c",
    ERC3156FlashLender: "0xd9c45357",
    ERC4626: "0x90f4c252",
    Ownable: "0x7f5828d0",
    AccessControl: "0x7965db0b",
} as const;

// Common ABI definitions that can be used by both wallets
export const commonMetadataAbi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function version() view returns (string)",
    "function owner() view returns (address)",
    "function implementation() view returns (address)",
    "function baseURI() view returns (string)",
    "function contractURI() view returns (string)",
    "function tokenURIPrefix() view returns (string)",
    "function paused() view returns (bool)",
    "function maxSupply() view returns (uint256)",
    "function MAX_SUPPLY() view returns (uint256)",
] as const;

export const nftSpecificAbi = [
    "function totalSupply() view returns (uint256)",
    "function maxTokenId() view returns (uint256)",
    "function MAX_TOKENS() view returns (uint256)",
    "function mintPrice() view returns (uint256)",
    "function mintingEnabled() view returns (bool)",
    "function provenanceHash() view returns (string)",
] as const;
