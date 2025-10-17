# create-fhevm-vue

A CLI to create a Vue app with FHEVM SDK integration.

## Usage

```bash
npx create-fhevm-vue my-app
cd my-app
npm install
npm run dev
```

## Environment Setup

Before deploying contracts, you need to set up your environment variables:

### 1. Create a `.env` file in the `hardhat` directory:

```bash
cd hardhat
touch .env
```

### 2. Add your environment variables to `.env`:

```env
# Your wallet mnemonic (12 or 24 words)
MNEMONIC=your wallet mnemonic phrase here

# Your Infura API key (get one at https://infura.io)
INFURA_API_KEY=your_infura_api_key_here

# Optional: Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 3. Get your Infura API key:
- Visit [https://infura.io](https://infura.io)
- Sign up for a free account
- Create a new project
- Copy your project API key

### 4. Deploy your contracts:

```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia
```

## What you get

- Complete React application with FHEVM SDK integration
- Bundled FHEVM SDK (no external dependencies)
- Beautiful Zama-branded UI
- TypeScript support
- Tailwind CSS styling
- Working FHEVM operations (encryption, decryption, contract interactions)
- **Three Complete FHE Contracts** for testing on Sepolia testnet:
  - **FHECounter**: Encrypted counter with increment/decrement
  - **ReviewCardsFHE**: Encrypted rating system with public decryption
  - **SimpleVoting**: Encrypted voting system with tally reveal
- Public decryption demo with hardcoded ciphertexts
- Ready-to-use React hooks
- **Complete Hardhat development environment** with:
  - All three FHE smart contracts
  - Deployment scripts for Sepolia testnet
  - Contract testing utilities
  - TypeScript support for contracts
- **Universal FHEVM SDK** with utilities for:
  - FHEVM initialization
  - Encrypted inputs creation
  - User decryption with EIP-712 signing
  - Public decryption flows

## Deployed FHE Counter Contract

The generated app includes a **pre-deployed FHE Counter Contract** on Sepolia testnet for testing:

- **Contract Address**: `0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e`
- **Network**: Sepolia testnet (Chain ID: 11155111)
- **Features**: 
  - Get encrypted count from contract
  - Increment/decrement with encrypted inputs
  - User decryption with EIP-712 signing
  - Public decryption demo

## Features

- ✅ **Self-contained**: No need to install FHEVM SDK separately
- ✅ **Cross-platform**: Works on Windows, Mac, Linux
- ✅ **Zero configuration**: Works out of the box
- ✅ **Production ready**: Includes all necessary files and configurations
- ✅ **Beautiful UI**: Zama design system with Tailwind CSS
- ✅ **Real FHEVM operations**: Actual encryption/decryption functionality
- ✅ **Live contract**: Pre-deployed FHE counter for immediate testing
- ✅ **Complete development environment**: Includes Hardhat for smart contract development

## Smart Contract Development

The generated app includes a complete Hardhat development environment with all necessary files for FHEVM smart contract development:

### **📁 Hardhat Directory Structure:**
```
hardhat/
├── contracts/
│   ├── FHECounter.sol          # FHE Counter smart contract
│   ├── ReviewCardsFHE_uint32.sol # FHE Rating system contract
│   └── SimpleVoting_uint32.sol  # FHE Voting system contract
├── deploy/
│   └── deploy.ts              # Deployment script for all contracts
├── hardhat.config.js          # Hardhat configuration (JavaScript)
├── package.json               # Hardhat dependencies
└── tsconfig.json             # TypeScript configuration
```

### **🔧 Available Commands:**
```bash
# Navigate to the hardhat directory
cd hardhat

# Install dependencies
npm install

# Compile contracts
npm run compile

# Start local hardhat node
npm run chain

# Deploy to hardhat network
npm run deploy:hardhat

# Deploy to Sepolia testnet (requires INFURA_API_KEY)
npm run deploy:sepolia
```

### **📋 What's Included:**
- ✅ **FHE Counter Contract** - Complete Solidity smart contract
- ✅ **Deployment Scripts** - Ready-to-use deployment scripts
- ✅ **TypeScript Support** - Full type safety for contracts
- ✅ **Network Configuration** - Pre-configured for hardhat and sepolia
- ✅ **FHEVM Integration** - Built-in FHEVM contract support
- ✅ **Simplified Scripts** - Clean, focused deployment commands
- ✅ **JavaScript Config** - No TypeScript compilation issues

## Requirements

- Node.js 16 or higher
- npm or yarn

## License

MIT
