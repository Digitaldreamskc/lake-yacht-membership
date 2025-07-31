// Contract addresses and ABIs
export const YACHT_CLUB_CONTRACT = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
  abi: [
    // Contract ABI will be generated from the compiled contract
    {
      inputs: [
        { name: "_authorizedMinter", type: "address" },
        { name: "_royaltyRecipient", type: "address" },
        { name: "_royaltyFraction", type: "uint96" }
      ],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      inputs: [
        { name: "to", type: "address" },
        { name: "tier", type: "uint8" },
        { name: "email", type: "string" },
        { name: "tokenURI", type: "string" }
      ],
      name: "mintMembership",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ name: "tokenId", type: "uint256" }],
      name: "getMemberInfo",
      outputs: [
        {
          components: [
            { name: "tier", type: "uint8" },
            { name: "mintedAt", type: "uint256" },
            { name: "email", type: "string" },
            { name: "active", type: "bool" }
          ],
          name: "",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [{ name: "member", type: "address" }],
      name: "getTokenIdByMember",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [{ name: "account", type: "address" }],
      name: "isMember",
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "view",
      type: "function"
    }
  ] as const
}

export const BASE_CHAIN_ID = 8453
export const BASE_RPC_URL = "https://mainnet.base.org"