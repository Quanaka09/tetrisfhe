# ⚛️ React FHEVM Showcase

A React application demonstrating the Universal FHEVM SDK with real FHEVM interactions on Sepolia testnet.

## 🚀 **Quick Start**

```bash
# Navigate to React showcase
cd packages/react-showcase

# Install dependencies
pnpm install

# Start development server
pnpm start

# Open http://localhost:3000
```

## ✨ **Features**

- ✅ **Real FHEVM interactions** - CDN-based FHEVM SDK
- ✅ **EIP-712 user decryption** - Proper authentication
- ✅ **Real contract interactions** - Sepolia testnet
- ✅ **Beautiful UI** - Zama theme (yellow & black)
- ✅ **TypeScript support** - Full type safety

## 🔧 **Tech Stack**

- **React 18** - Modern React with hooks
- **TypeScript** - Full type safety
- **Create React App** - Zero-config React setup
- **Ethers.js** - Ethereum interactions
- **@fhevm-sdk** - Universal FHEVM SDK with wagmi-like hooks

## 🎣 **Wagmi-like Hooks Usage**

This showcase demonstrates the new wagmi-like hooks from the Universal FHEVM SDK:

```typescript
import { useWallet, useFhevm, useContract, useFhevmOperations } from '@fhevm-sdk';

function App() {
  // Wallet connection hook
  const { address, isConnected, connect, disconnect } = useWallet();
  
  // FHEVM instance management
  const { fheInstance, isInitialized, initialize, error } = useFhevm();
  
  // Contract interactions
  const { contract, isReady, error: contractError } = useContract(contractAddress, abi);
  
  // FHEVM operations (encrypt, decrypt, execute)
  const { encrypt, decrypt, executeTransaction, isBusy, message } = useFhevmOperations();
  
  // Use the hooks in your component...
}
```

### **Available Hooks**

- **`useWallet()`** - Wallet connection and management
- **`useFhevm()`** - FHEVM instance initialization and state
- **`useContract(address, abi)`** - Contract instance management
- **`useFhevmOperations()`** - Combined encryption, decryption, and transaction execution

## 🎯 **What It Demonstrates**

1. **Wallet Connection** - MetaMask integration
2. **FHEVM Initialization** - CDN-based SDK setup
3. **Contract Reading** - Real blockchain data
4. **EIP-712 Decryption** - User authentication
5. **Encrypted Input** - Contract interactions
6. **Transaction Sending** - Real blockchain transactions

## 🌐 **Live Demo**

- **URL:** http://localhost:3000
- **Contract:** `0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e`
- **Network:** Sepolia testnet (Chain ID: 11155111)

## 📱 **Usage**

1. **Connect Wallet** - Click "Connect Wallet" button
2. **Get Count** - Read encrypted count from contract
3. **Decrypt Count** - Use EIP-712 to decrypt the value
4. **Increment/Decrement** - Send transactions to modify count

## 🔐 **FHEVM Features**

- **CDN-based SDK** - No bundling issues
- **Real encryption** - Actual FHEVM encryption
- **EIP-712 signing** - User authentication
- **Contract interactions** - Real blockchain calls

## 🎨 **UI Components**

- **Wallet Connection** - MetaMask integration
- **FHEVM Status** - SDK initialization status
- **Counter Demo** - Real FHEVM interactions
- **Transaction Status** - Real-time updates

## 🛠️ **Development**

```bash
# Start development server
pnpm start

# Build for production
pnpm build

# Run tests
pnpm test
```

## 📦 **Dependencies**

- `react` - React framework
- `ethers` - Ethereum interactions
- `typescript` - Type safety
- `react-scripts` - Build tools

## 🎉 **Success Metrics**

- ✅ **Real FHEVM interactions** - No mocks
- ✅ **EIP-712 authentication** - Proper user decryption
- ✅ **Live contract integration** - Sepolia testnet
- ✅ **Beautiful UI** - Zama theme
- ✅ **Complete workflow** - From reading to transactions

**Ready for production use!** 🚀