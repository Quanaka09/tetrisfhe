# 🚀 Next.js FHEVM Showcase

A Next.js application demonstrating the Universal FHEVM SDK with real FHEVM interactions on Sepolia testnet.

## 🚀 **Quick Start**

```bash
# Navigate to Next.js showcase
cd packages/nextjs-showcase

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3001
```

## ✨ **Features**

- ✅ **Real FHEVM interactions** - Local SDK package
- ✅ **EIP-712 user decryption** - Proper authentication
- ✅ **Real contract interactions** - Sepolia testnet
- ✅ **Provider pattern** - Clean state management
- ✅ **Beautiful UI** - Zama theme (yellow & black)

## 🔧 **Tech Stack**

- **Next.js 15** - React framework with App Router
- **TypeScript** - Full type safety
- **Ethers.js** - Ethereum interactions
- **@fhevm-sdk** - Universal FHEVM SDK with wagmi-like hooks
- **Provider Pattern** - Clean state management

## 🎣 **Wagmi-like Hooks Usage**

This showcase demonstrates the new wagmi-like hooks from the Universal FHEVM SDK:

```typescript
import { useWallet, useFhevm, useContract, useFhevmOperations } from '@fhevm-sdk';

function MyComponent() {
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

### **Provider Pattern**

The Next.js showcase uses a provider pattern to wrap the hooks:

```typescript
// app/providers/FhevmProvider.tsx
import { useWallet, useFhevm, useContract, useFhevmOperations } from '@fhevm-sdk';

export function FhevmProvider({ children }) {
  const wallet = useWallet();
  const fhevm = useFhevm();
  const contract = useContract('', []);
  const operations = useFhevmOperations();
  
  // Provide combined context...
}
```

## 🎯 **What It Demonstrates**

1. **Wallet Connection** - MetaMask integration
2. **FHEVM Provider** - Context-based state management
3. **Contract Reading** - Real blockchain data
4. **EIP-712 Decryption** - User authentication
5. **Encrypted Input** - Contract interactions
6. **Transaction Sending** - Real blockchain transactions

## 🌐 **Live Demo**

- **URL:** http://localhost:3001
- **Contract:** `0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e`
- **Network:** Sepolia testnet (Chain ID: 11155111)

## 📱 **Usage**

1. **Connect Wallet** - Click "Connect Wallet" button
2. **Get Count** - Read encrypted count from contract
3. **Decrypt Count** - Use EIP-712 to decrypt the value
4. **Increment/Decrement** - Send transactions to modify count

## 🔐 **FHEVM Features**

- **Local SDK package** - No CDN dependencies
- **Provider pattern** - Clean state management
- **Real encryption** - Actual FHEVM encryption
- **EIP-712 signing** - User authentication
- **Contract interactions** - Real blockchain calls

## 🏗️ **Architecture**

```
app/
├── layout.tsx              # Root layout with CDN script
├── page.tsx                # Main showcase page
└── providers/
    └── FhevmProvider.tsx   # FHEVM context provider
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

# Start production server
pnpm start
```

## 📦 **Dependencies**

- `next` - Next.js framework
- `react` - React library
- `ethers` - Ethereum interactions
- `@zama-fhe/relayer-sdk` - FHEVM SDK package
- `typescript` - Type safety

## 🔧 **Configuration**

- **Next.js Config** - Optimized for FHEVM SDK
- **TypeScript** - Full type safety
- **CDN Script** - FHEVM SDK from Zama's CDN
- **Provider Pattern** - Clean state management

## 🎉 **Success Metrics**

- ✅ **Real FHEVM interactions** - No mocks
- ✅ **EIP-712 authentication** - Proper user decryption
- ✅ **Live contract integration** - Sepolia testnet
- ✅ **Provider pattern** - Clean architecture
- ✅ **Complete workflow** - From reading to transactions

**Ready for production use!** 🚀