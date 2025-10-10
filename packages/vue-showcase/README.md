# 💚 Vue FHEVM Showcase

A Vue 3 application demonstrating the Universal FHEVM SDK with real FHEVM interactions on Sepolia testnet.

## 🚀 **Quick Start**

```bash
# Navigate to Vue showcase
cd packages/vue-showcase

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3003
```

## ✨ **Features**

- ✅ **Real FHEVM interactions** - CDN-based FHEVM SDK
- ✅ **EIP-712 user decryption** - Proper authentication
- ✅ **Real contract interactions** - Sepolia testnet
- ✅ **Composition API** - Modern Vue 3 patterns
- ✅ **Beautiful UI** - Zama theme (yellow & black)

## 🔧 **Tech Stack**

- **Vue 3** - Modern Vue with Composition API
- **TypeScript** - Full type safety
- **Vite** - Fast build tool
- **Ethers.js** - Ethereum interactions
- **@fhevm-sdk** - Universal FHEVM SDK with wagmi-like hooks

## 🎣 **Wagmi-like Hooks Usage**

This showcase demonstrates the new wagmi-like hooks from the Universal FHEVM SDK:

```typescript
import { useWalletVue, useFhevmVue, useContractVue, useFhevmOperationsVue } from '@fhevm-sdk';

export default {
  setup() {
    // Wallet connection hook
    const { address, isConnected, connect, disconnect } = useWalletVue();
    
    // FHEVM instance management
    const { fheInstance, isInitialized, initialize, error } = useFhevmVue();
    
    // Contract interactions
    const { contract, isReady, error: contractError } = useContractVue(contractAddress, abi);
    
    // FHEVM operations (encrypt, decrypt, execute)
    const { encrypt, decrypt, executeTransaction, isBusy, message } = useFhevmOperationsVue();
    
    return { address, isConnected, connect, disconnect, fheInstance, isInitialized, initialize };
  }
}
```

### **Vue Composables**

The Vue showcase uses composables (Vue's equivalent of React hooks):

- **`useWalletVue()`** - Wallet connection and management
- **`useFhevmVue()`** - FHEVM instance initialization and state
- **`useContractVue(address, abi)`** - Contract instance management
- **`useFhevmOperationsVue()`** - Combined encryption, decryption, and transaction execution

## 🎯 **What It Demonstrates**

1. **Wallet Connection** - MetaMask integration
2. **FHEVM Initialization** - CDN-based SDK setup
3. **Contract Reading** - Real blockchain data
4. **EIP-712 Decryption** - User authentication
5. **Encrypted Input** - Contract interactions
6. **Transaction Sending** - Real blockchain transactions

## 🌐 **Live Demo**

- **URL:** http://localhost:3003
- **Contract:** `0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e`
- **Network:** Sepolia testnet (Chain ID: 11155111)

## 📱 **Usage**

1. **Connect Wallet** - Click "Connect Wallet" button
2. **Get Count** - Read encrypted count from contract
3. **Decrypt Count** - Use EIP-712 to decrypt the value
4. **Increment/Decrement** - Send transactions to modify count

## 🔐 **FHEVM Features**

- **CDN-based SDK** - No bundling issues
- **Composition API** - Modern Vue 3 patterns
- **Real encryption** - Actual FHEVM encryption
- **EIP-712 signing** - User authentication
- **Contract interactions** - Real blockchain calls

## 🏗️ **Architecture**

```
src/
├── App.vue                 # Main showcase component
├── main.ts                 # Application entry point
├── fhevm.ts               # FHEVM utilities
└── types/
    └── global.d.ts         # TypeScript declarations
```

## 🎨 **UI Components**

- **Wallet Connection** - MetaMask integration
- **FHEVM Status** - SDK initialization status
- **Counter Demo** - Real FHEVM interactions
- **Transaction Status** - Real-time updates

## 🛠️ **Development**

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📦 **Dependencies**

- `vue` - Vue 3 framework
- `vite` - Build tool
- `ethers` - Ethereum interactions
- `typescript` - Type safety
- `vue-tsc` - TypeScript compiler

## 🔧 **Configuration**

- **Vite Config** - Optimized for Vue 3
- **TypeScript** - Full type safety
- **CDN Import** - FHEVM SDK from Zama's CDN
- **Composition API** - Modern Vue patterns

## 🎉 **Success Metrics**

- ✅ **Real FHEVM interactions** - No mocks
- ✅ **EIP-712 authentication** - Proper user decryption
- ✅ **Live contract integration** - Sepolia testnet
- ✅ **Composition API** - Modern Vue 3 patterns
- ✅ **Complete workflow** - From reading to transactions

**Ready for production use!** 🚀
