export const MOCK_AXIE_NFT_V2_ABI = [
  {
    type: "function",
    name: "claimFakeAxies",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [
      { name: "tokenIds", type: "uint256[]", internalType: "uint256[]" },
    ],
  },
  {
    type: "function",
    name: "claimsByWallet",
    stateMutability: "view",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
  },
  {
    type: "function",
    name: "getAxiesOfOwner",
    stateMutability: "view",
    inputs: [{ name: "tokenOwner", type: "address", internalType: "address" }],
    outputs: [
      { name: "tokenIds", type: "uint256[]", internalType: "uint256[]" },
      { name: "classes", type: "uint8[]", internalType: "uint8[]" },
    ],
  },
  {
    type: "function",
    name: "tokensOfOwner",
    stateMutability: "view",
    inputs: [{ name: "tokenOwner", type: "address", internalType: "address" }],
    outputs: [
      { name: "tokenIds", type: "uint256[]", internalType: "uint256[]" },
    ],
  },
  {
    type: "function",
    name: "axieClass",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
  },
  {
    type: "function",
    name: "isApprovedForAll",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "operator", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
  },
  {
    type: "function",
    name: "setApprovalForAll",
    stateMutability: "nonpayable",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "approved", type: "bool", internalType: "bool" },
    ],
    outputs: [],
  },
] as const;
