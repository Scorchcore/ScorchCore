/**
 * Phase 3 V2 ABI extensions — minimal fragments for new functions.
 * V2 contracts are backward-compatible with V1 ABIs; these add new functions.
 */

export const V2_ENUMERATION_FRAGMENT = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "tokensOfOwner",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const GEODENFT_V2_EXTRA = [
  ...V2_ENUMERATION_FRAGMENT,
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint8", name: "category", type: "uint8" },
      { internalType: "uint8", name: "geodeType", type: "uint8" },
      {
        components: [
          { internalType: "uint256", name: "baseValueUsd", type: "uint256" },
          { internalType: "uint256", name: "oraclePriceAxs", type: "uint256" },
          { internalType: "uint256", name: "mementosTransferred", type: "uint256" },
          { internalType: "uint8", name: "evolutionTier", type: "uint8" },
        ],
        internalType: "struct IGeodeNFTV2.ForgeProvenance",
        name: "provenance",
        type: "tuple",
      },
      { internalType: "uint256[]", name: "axieTokenIds", type: "uint256[]" },
    ],
    name: "mintWithProvenance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "geodeId", type: "uint256" }],
    name: "isHatched",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "geodeId", type: "uint256" }],
    name: "getForgeProvenance",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "baseValueUsd", type: "uint256" },
          { internalType: "uint256", name: "oraclePriceAxs", type: "uint256" },
          { internalType: "uint256", name: "mementosTransferred", type: "uint256" },
          { internalType: "uint8", name: "evolutionTier", type: "uint8" },
        ],
        internalType: "struct IGeodeNFTV2.ForgeProvenance",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "geodeId", type: "uint256" }],
    name: "getAxieTokenIds",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const COREMINERNFT_V2_EXTRA = [
  ...V2_ENUMERATION_FRAGMENT,
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getMinerProvenance",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "baseValueUsd", type: "uint256" },
          { internalType: "uint256", name: "oraclePriceAxs", type: "uint256" },
          { internalType: "uint256", name: "mementosTransferred", type: "uint256" },
          { internalType: "uint8", name: "evolutionTier", type: "uint8" },
          { internalType: "uint8", name: "protocolVersion", type: "uint8" },
        ],
        internalType: "struct ICoreMinerNFTV2.MinerProvenance",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getAxieTokenIds",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
