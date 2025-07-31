# Lake Stockton Yacht Club - Tokenized Membership System

A comprehensive blockchain-based membership system for Lake Stockton Yacht Club built on Base mainnet with NFT memberships, Stripe payments, and Privy wallet integration.

## Features

### Smart Contract
- **ERC-721 NFT Memberships**: One unique token per member
- **ERC-2981 Royalty Standard**: 10% royalties on secondary sales
- **Transfer Restrictions**: Optional restrictions with approved marketplace support
- **Member Tiers**: Standard, Premium, Elite, and Lifetime memberships
- **Admin Controls**: Minting restrictions, tier management, and activation controls

### Frontend Application
- **Stripe Integration**: Credit card payments with automatic NFT minting
- **Privy Wallet**: Email-based wallet abstraction for user convenience
- **Admin Dashboard**: Comprehensive member management and analytics
- **Embeddable Design**: Optimized for embedding in Wix sites
- **Responsive Design**: Mobile-first approach with beautiful UI

### Member Tiers & Pricing
- **Standard ($500)**: Basic facility access, 2 guests/month, newsletter
- **Premium ($1,000)**: Enhanced access, 5 guests/month, priority booking, 10% dining discount
- **Elite ($2,500)**: Premium access, unlimited guests, VIP events, 20% dining discount
- **Lifetime ($10,000)**: All Elite benefits plus legacy transfer and board rights

## Technology Stack

- **Blockchain**: Base mainnet (Ethereum L2)
- **Smart Contracts**: Solidity with OpenZeppelin
- **Frontend**: Next.js 13 with App Router
- **Payments**: Stripe Checkout
- **Wallets**: Privy (email-based wallets)
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain Interaction**: wagmi + viem

## Getting Started

### Prerequisites
- Node.js 18+
- Stripe account
- Privy account
- Base mainnet access

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Configure your environment variables:
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Privy
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Installation & Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Smart Contract Deployment

### Compile and Deploy

1. Install Hardhat or Foundry for contract deployment
2. Configure your deployment script with:
   - Authorized minter address (your backend)
   - Royalty recipient address
   - Royalty percentage (1000 = 10%)

3. Deploy to Base mainnet:
```bash
# Using Hardhat
npx hardhat run scripts/deploy.js --network base

# Using Foundry
forge create --rpc-url https://mainnet.base.org \
  --private-key $PRIVATE_KEY \
  contracts/YachtClubMembership.sol:YachtClubMembership \
  --constructor-args $MINTER_ADDRESS $ROYALTY_RECIPIENT 1000
```

### Contract Verification

Verify your contract on BaseScan for transparency:
```bash
npx hardhat verify --network base $CONTRACT_ADDRESS $MINTER_ADDRESS $ROYALTY_RECIPIENT 1000
```

## API Endpoints

### Public Endpoints
- `POST /api/create-checkout` - Create Stripe checkout session
- `POST /api/verify-payment` - Verify payment and mint NFT

### Admin Endpoints (Protect in production)
- `GET /api/admin/dashboard` - Get dashboard statistics
- `POST /api/admin/manual-mint` - Manually mint membership

## Embedding in Wix

To embed this application in a Wix site:

1. Use Wix's HTML embed component
2. Set the iframe source to your deployed application
3. Configure responsive dimensions:
```html
<iframe 
  src="https://your-domain.com" 
  width="100%" 
  height="800px"
  frameborder="0">
</iframe>
```

## Admin Dashboard

Access the admin dashboard at `/admin` to:
- View membership statistics
- Manage member tiers
- Process manual mints
- Track revenue and analytics
- Monitor contract settings

## Security Considerations

### Production Checklist
- [ ] Secure admin routes with authentication
- [ ] Use environment variables for all secrets
- [ ] Implement rate limiting on API endpoints
- [ ] Set up proper CORS policies
- [ ] Use HTTPS in production
- [ ] Implement webhook signature verification
- [ ] Add input validation and sanitization
- [ ] Set up monitoring and logging

### Smart Contract Security
- [ ] Audit contract before mainnet deployment
- [ ] Use multi-sig wallet for contract ownership
- [ ] Implement emergency pause functionality
- [ ] Regular security updates for dependencies
- [ ] Monitor for unusual contract activity

## Customization

### Branding
- Update colors in `tailwind.config.ts`
- Replace logo and imagery
- Modify membership tier names and benefits
- Customize email templates

### Features
- Add more member tier options
- Implement referral systems
- Add governance token features
- Integrate with existing club systems

## Support & Maintenance

### Monitoring
- Set up alerts for failed transactions
- Monitor contract events
- Track payment processing errors
- Watch for unusual user activity

### Updates
- Regular dependency updates
- Smart contract upgrades (if applicable)
- Feature enhancements based on user feedback
- Performance optimizations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For support or questions about the Lake Stockton Yacht Club membership system, please contact the development team.