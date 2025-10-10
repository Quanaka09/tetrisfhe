# 🖥️ Node.js FHEVM Showcase

A Node.js CLI application demonstrating the Universal FHEVM SDK with real blockchain interactions on Sepolia testnet.

## 🚀 **Quick Start**

```bash
# Navigate to Node.js showcase
cd packages/node-showcase

# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env
# Edit .env with your private key and RPC URL

# Start the showcase
pnpm start
```

## ✨ **Features**

- ✅ **Real blockchain interactions** - Live Sepolia testnet
- ✅ **Environment variables** - Secure configuration
- ✅ **Real wallet integration** - Your private key
- ✅ **CLI interface** - Command-line FHEVM operations
- ✅ **Complete workflow** - From reading to decrypting

## 🔧 **Tech Stack**

- **Node.js** - Server-side JavaScript
- **TypeScript** - Full type safety
- **Ethers.js** - Ethereum interactions
- **Dotenv** - Environment variables
- **@fhevm-sdk** - Universal FHEVM SDK with Node.js adapter

## 🎣 **Node.js Adapter Usage**

This showcase demonstrates the Node.js adapter from the Universal FHEVM SDK:

```typescript
import { FhevmNode } from '@fhevm-sdk';

async function main() {
  // Initialize Node.js FHEVM adapter
  const fhevm = new FhevmNode();
  await fhevm.initialize();
  
  // Use FHEVM operations
  const encrypted = await fhevm.encrypt(contractAddress, userAddress, value);
  const decrypted = await fhevm.decrypt(handle, contractAddress, signer);
  
  // Execute transactions
  const result = await fhevm.executeTransaction(contract, method, encryptedData, proof);
}
```

### **Node.js Adapter**

The Node.js showcase uses the `FhevmNode` class:

- **`FhevmNode()`** - Node.js FHEVM adapter constructor
- **`initialize()`** - Initialize FHEVM instance
- **`encrypt(contractAddress, userAddress, value)`** - Encrypt values
- **`decrypt(handle, contractAddress, signer)`** - Decrypt values
- **`executeTransaction(contract, method, data, proof)`** - Execute transactions

## 🎯 **What It Demonstrates**

1. **Environment Setup** - Private key and RPC configuration
2. **Wallet Connection** - Real wallet integration
3. **Contract Reading** - Live blockchain data
4. **EIP-712 Decryption** - User authentication
5. **Encrypted Input** - Contract interaction preparation
6. **Transaction Attempts** - Real blockchain calls

## 🌐 **Configuration**

- **Contract:** `0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e`
- **Network:** Sepolia testnet (Chain ID: 11155111)
- **RPC:** Infura or your preferred provider

## 📱 **Usage**

1. **Set Environment Variables** - Configure `.env` file
2. **Run Showcase** - Execute `pnpm start`
3. **Watch Live Data** - See real blockchain interactions
4. **Understand Workflow** - Learn FHEVM concepts

## 🔐 **FHEVM Features**

- **Mock Implementation** - Demonstrates FHEVM concepts
- **Real blockchain calls** - Actual contract interactions
- **Environment variables** - Secure configuration
- **CLI interface** - Server-side FHEVM usage
- **Complete workflow** - From reading to attempting transactions

## 🏗️ **Architecture**

```
src/
├── index.ts                # Main showcase application
├── fhevm.ts               # FHEVM utilities (mock)
└── .env                   # Environment variables
```

## 🎨 **CLI Output**

- **Environment Configuration** - Shows loaded variables
- **FHEVM Status** - SDK initialization
- **Wallet Connection** - Real wallet address
- **Contract Reading** - Live blockchain data
- **Decryption Results** - Real decrypted values
- **Transaction Attempts** - Real blockchain calls

## 🛠️ **Development**

```bash
# Start the showcase
pnpm start

# Development mode (watch)
pnpm dev

# Build TypeScript
pnpm build
```

## 📦 **Dependencies**

- `node` - Node.js runtime
- `ethers` - Ethereum interactions
- `dotenv` - Environment variables
- `typescript` - Type safety
- `@zama-fhe/relayer-sdk` - FHEVM SDK (for reference)

## 🔧 **Configuration**

Create `.env` file:
```bash
# Node.js FHEVM Showcase Environment Variables
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=YOUR_PRIVATE_KEY
```

## 🎉 **Success Metrics**

- ✅ **Real blockchain interactions** - Live Sepolia testnet
- ✅ **Environment variables** - Secure configuration
- ✅ **Real wallet integration** - Your private key
- ✅ **CLI interface** - Server-side FHEVM usage
- ✅ **Complete workflow** - From reading to attempting transactions

## 🚨 **Important Notes**

- **Mock FHEVM** - Uses mock implementation for demonstration
- **Real blockchain** - Makes actual contract calls
- **Environment variables** - Requires real private key and RPC URL
- **CLI only** - No web interface

**Perfect for learning FHEVM concepts!** 🚀