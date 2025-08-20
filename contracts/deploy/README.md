# DreamLayer Smart Contract Deployment

This folder contains deployment scripts for the DreamLayer smart contracts on various networks.

## Overview

The DreamLayer project consists of three main smart contracts:

1. **ERC6551AccountFactory** - Factory for creating and managing ERC-6551 token-bound accounts
2. **PermissionManager** - Manages granular permissions and access control
3. **IPIntegrationLayer** - Integration layer connecting 6551 accounts with Story Protocol methods

## Deployment Scripts

### 1. `01_deploy_erc6551_account_factory.ts`
- **Purpose**: General deployment script for local development and testing
- **Networks**: Any network (detects automatically)
- **Features**: 
  - Deploys all contracts with UUPS upgradeability
  - Sets up mock contracts for testing
  - Configures permissions automatically
  - Attempts contract verification

### 2. `02_deploy_to_base.ts`
- **Purpose**: Production deployment to Base mainnet
- **Network**: Base Mainnet (Chain ID: 8453)
- **Features**:
  - Network-specific validation
  - Optimized gas settings for Base
  - Basescan verification
  - Production-ready configuration

### 3. `03_deploy_to_base_sepolia.ts`
- **Purpose**: Test deployment to Base Sepolia testnet
- **Network**: Base Sepolia Testnet (Chain ID: 84532)
- **Features**:
  - Testnet validation
  - Testnet-optimized gas settings
  - Basescan Sepolia verification
  - Safe testing environment

## Prerequisites

Before running deployment scripts, ensure you have:

1. **Environment Variables** set in `.env`:
   ```bash
   PRIVATE_KEY=your_private_key_here
   BASE_RPC_URL=https://mainnet.base.org
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   BASESCAN_API_KEY=your_basescan_api_key
   ```

2. **Dependencies** installed:
   ```bash
   npm install
   ```

3. **Network Configuration** in `hardhat.config.ts`:
   - Base mainnet (Chain ID: 8453)
   - Base Sepolia testnet (Chain ID: 84532)

## Usage

### Local Development
```bash
npx hardhat run deploy/01_deploy_erc6551_account_factory.ts --network localhost
```

### Base Sepolia Testnet
```bash
npx hardhat run deploy/03_deploy_to_base_sepolia.ts --network baseSepolia
```

### Base Mainnet
```bash
npx hardhat run deploy/02_deploy_to_base.ts --network base
```

## Contract Architecture

### UUPS Upgradeability
All main contracts use the UUPS (Universal Upgradeable Proxy Standard) pattern:
- **Proxy**: Stores state and delegates calls to implementation
- **Implementation**: Contains the actual contract logic
- **Upgrade**: Can be upgraded by the owner without changing proxy address

### Contract Dependencies
```
IPIntegrationLayer
├── ERC6551AccountFactory
├── PermissionManager
└── MockStoryProtocol (for testing)
```

## Deployment Flow

1. **Deploy Implementation Contracts**
   - MockAccountImplementation
   - MockERC721
   - MockStoryProtocol

2. **Deploy Proxy Contracts**
   - ERC6551AccountFactory (UUPS)
   - PermissionManager (UUPS)
   - IPIntegrationLayer (UUPS)

3. **Configure Permissions**
   - Grant IP_MINT permission to IPIntegrationLayer
   - Grant LICENSE_CREATE permission to IPIntegrationLayer
   - Grant ROYALTY_SET permission to IPIntegrationLayer

4. **Verify Contracts**
   - Verify implementation contracts on block explorer
   - Note proxy contracts for manual verification

## Gas Optimization

### Base Network Gas Settings
- **Gas Limit**: 5,000,000 (5M)
- **Max Fee Per Gas**: 20 gwei
- **Max Priority Fee Per Gas**: 2 gwei

### Gas Usage Estimates
- **ERC6551AccountFactory**: ~2-3M gas
- **PermissionManager**: ~1-2M gas
- **IPIntegrationLayer**: ~2-3M gas

## Verification

### Automatic Verification
Implementation contracts are automatically verified using the `verify` helper.

### Manual Verification
Proxy contracts require manual verification on the block explorer:

1. **Basescan Mainnet**: https://basescan.org
2. **Basescan Sepolia**: https://sepolia.basescan.org

### Verification Process
1. Navigate to the contract address on Basescan
2. Click "Contract" tab
3. Click "Verify and Publish"
4. Select "Proxy" contract type
5. Enter implementation address
6. Submit for verification

## Testing

After deployment, run the test suite:

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/IPIntegrationLayer.test.ts

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage
```

## Post-Deployment

### 1. Update Frontend Configuration
Update your frontend configuration files with the deployed contract addresses:

```typescript
// src/config/contracts.ts
export const CONTRACT_ADDRESSES = {
  erc6551AccountFactory: "0x...",
  permissionManager: "0x...",
  ipIntegrationLayer: "0x...",
  // ... other addresses
};
```

### 2. Update Story Protocol Configuration
Update the Story Protocol configuration with real contract addresses:

```typescript
// src/config/story-protocol.ts
export const STORY_PROTOCOL_CONFIG = {
  // ... other config
  ipAccountImpl: "0x...", // Real Base network address
  ipAssetRegistry: "0x...", // Real Base network address
  // ... other addresses
};
```

### 3. Test Integration
Test the deployed contracts:
- Create token-bound accounts
- Mint IP assets
- Create licenses
- Set up royalties
- Test permission delegation

## Troubleshooting

### Common Issues

1. **Insufficient Gas**
   - Increase gas limit in deployment script
   - Check current gas prices on Base network

2. **Verification Failures**
   - Ensure BASESCAN_API_KEY is set correctly
   - Check network configuration matches deployment target

3. **Permission Errors**
   - Verify PermissionManager is deployed first
   - Check permission grants are successful

4. **Network Mismatch**
   - Ensure hardhat.config.ts has correct network settings
   - Verify RPC URLs are accessible

### Support
For deployment issues:
1. Check Hardhat console output for detailed error messages
2. Verify environment variables are set correctly
3. Ensure sufficient balance in deployer account
4. Check network connectivity and RPC endpoint status

## Security Notes

- **Private Keys**: Never commit private keys to version control
- **Environment Variables**: Use `.env` files for sensitive data
- **Testnet First**: Always test on testnet before mainnet deployment
- **Upgrade Control**: Only trusted addresses should have upgrade permissions
- **Permission Management**: Review all permission grants carefully

## Next Steps

After successful deployment:

1. **Integration Testing**: Test all contract interactions
2. **Frontend Integration**: Update UI to use deployed contracts
3. **Monitoring**: Set up monitoring and alerting
4. **Documentation**: Update API documentation with real addresses
5. **User Testing**: Conduct user acceptance testing
6. **Mainnet Deployment**: Deploy to Base mainnet when ready



