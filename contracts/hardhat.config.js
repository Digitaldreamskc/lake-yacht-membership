require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("@typechain/hardhat");
require("dotenv").config({ path: ".env.local" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Base Mainnet
    base: {
      url: process.env.RPC_URL || "https://mainnet.base.org",
      accounts: process.env.CONTRACT_PRIVATE_KEY ? [process.env.CONTRACT_PRIVATE_KEY] : [],
      chainId: 8453,
      gasPrice: 1000000000, // 1 gwei
    },
    // Base Sepolia Testnet
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.CONTRACT_PRIVATE_KEY ? [process.env.CONTRACT_PRIVATE_KEY] : [],
      chainId: 84532,
      gasPrice: "auto", // Let Hardhat estimate optimal gas price
      gas: 5000000, // Set reasonable gas limit
      timeout: 120000, // 2 minute timeout
    },
    // Local development
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || "",
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
