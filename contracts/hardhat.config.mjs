import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "dotenv/config";

const config = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 20000,
      },
      viaIR: true,
      evmVersion: "cancun",
    },
  },
  networks: {
    // Base Mainnet
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
      gasPrice: 20000000000, // 20 gwei
    },
            // Base Sepolia Testnet
        baseSepolia: {
            url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 84532,
            gasPrice: 20000000000, // 20 gwei
        },
        // Base Fork for testing Story Protocol integration
        "base-fork": {
            url: process.env.BASE_FORK_RPC_URL || "https://mainnet.base.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 8453,
            forking: {
                url: process.env.BASE_FORK_RPC_URL || "https://mainnet.base.org",
                blockNumber: process.env.BASE_FORK_BLOCK_NUMBER ? parseInt(process.env.BASE_FORK_BLOCK_NUMBER) : undefined,
            },
        },
        // Local development
        hardhat: {
            chainId: 31337,
            allowUnlimitedContractSize: true,
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
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  mocha: {
    timeout: 60000,
  },
  // Story Protocol remappings
  remappings: [
    "@openzeppelin/=node_modules/@openzeppelin/",
    "@storyprotocol/core/=node_modules/@story-protocol/protocol-core/contracts/",
    "@storyprotocol/periphery/=node_modules/@story-protocol/protocol-periphery/contracts/",
    "erc6551/=node_modules/erc6551/",
    "forge-std/=node_modules/forge-std/src/",
    "ds-test/=node_modules/ds-test/src/",
    "@storyprotocol/test/=node_modules/@story-protocol/protocol-core/test/foundry/",
    "@solady/=node_modules/solady/"
  ],
};

export default config;
