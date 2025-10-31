# 🔐 通用FHEVM SDK

一个框架无关的工具包，帮助开发者轻松构建机密dApp。采用模块化适配器架构，可在React、Next.js、Vue和Node.js环境中无缝工作。

## 🎥 **视频演示**

[![YouTube](https://img.shields.io/badge/YouTube-演示视频-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=UJPTUMk47hE)

**观看通用FHEVM SDK的实际演示！** 查看所有展示的实时演示，学习如何在您的项目中使用适配器。

👉 **[在YouTube上观看](https://www.youtube.com/watch?v=UJPTUMk47hE)**

## 🌐 **实时示例**

所有示例都在Sepolia测试网上运行**真实的FHEVM交互**：

- **![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) React Showcase：** [https://react-showcase-1738.up.railway.app/](https://react-showcase-1738.up.railway.app/)
- **![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) Next.js Showcase：** [https://nextjs-showcase-1661.up.railway.app/](https://nextjs-showcase-1661.up.railway.app/)
- **![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D) Vue Showcase：** [https://vue-showcase-2780.up.railway.app/](https://vue-showcase-2780.up.railway.app/)
- **![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) Node.js Showcase：** [packages/node-showcase/](packages/node-showcase/)

**合约详情：**
- **FHE计数器合约：** `0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e`
- **评分合约：** `0xcA2430F1B112EC25cF6b6631bb40039aCa0C86e0`
- **投票合约：** `0x7294A541222ce449faa2B8A7214C571b0fCAb52E`
- **网络：** Sepolia测试网 (链ID: 11155111)

## 🌍 **语言 / Languages / Langues**
[![English](https://img.shields.io/badge/English-🇺🇸-blue)](README.md)
[![Français](https://img.shields.io/badge/Français-🇫🇷-red)](README.fr.md)
[![中文](https://img.shields.io/badge/中文-🇨🇳-green)](README.zh.md)

## 📐 **架构概述**

### **SDK架构**

```
┌──────────────────────────────────────────────────────────────────────┐
│                    通用FHEVM SDK                                    │
│                      packages/fhevm-sdk/                               │
└──────────────────────────────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
    ┌─────▼─────┐          ┌───────▼───────┐      ┌───────▼───────┐
    │    核心    │          │    适配器      │      │     展示      │
    │src/core/  │          │src/adapters/  │      │  packages/    │
    └─────┬─────┘          └───────┬───────┘      └───────┬───────┘
          │                        │                       │
    ┌─────┴─────────────────────────────────────────────────────┐
    │                                                             │
    │  ┌──────────┐     ┌──────────┐     ┌──────────┐           │
    │  │fhevm.ts  │     │contracts.│     │index.ts  │           │
    │  │          │     │ts        │     │(exports) │           │
    │  │-initialize│    │          │     └──────────┘           │
    │  │-createEnc│    │-FhevmCon │                              │
    │  │-decrypt  │    │tract     │                              │
    │  │-publicDec│    └──────────┘                              │
    │  │-test/    │                                               │
    │  └──────────┘                                               │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
                                                                  
          ┌───────────────────────────────────────┐
          │                                       │
    ┌─────▼─────┐      ┌─────▼─────┐    ┌─────▼─────┐
    │  react.ts │      │  vue.ts   │    │  node.ts  │
    │           │      │           │    │           │
    │useWallet  │      │useWalletVue│   │FhevmNode  │
    │useFhevm   │      │useFhevmVue │   │(class)    │
    │useContract│      │useContract │   └───────────┘
    │useEncrypt │      │useEncrypt  │
    │useDecrypt │      │useDecrypt  │
    │useFhevmOps│      │useFhevmOps │
    └───────────┘      └───────────┘
                                                                  
          ┌───────────────────────────────────────┐
          │                                       │
    ┌─────▼─────────┐  ┌─────▼─────────┐  ┌─────▼─────────┐
    │react-showcase │  │nextjs-showcase │  │ vue-showcase  │
    │               │  │                │  │               │
    │App.tsx        │  │page.tsx        │  │App.vue         │
    │FheCounter     │  │components/     │  │components/     │
    │FheRatings     │  │FHECounter      │  │FHECounter      │
    │FheVoting      │  │FHERatings      │  │FHERatings      │
    │               │  │SimpleVoting    │  │SimpleVoting    │
    │               │  │test/           │  │test/           │
    └───────────────┘  └────────────────┘  └───────────────┘
                                            
    ┌─────────────────────────────────────────┐
    │        node-showcase                     │
    │                                         │
    │  index.ts     server.ts    explorer.ts  │
    │  counter.ts   voting.ts    ratings.ts   │
    │                                         │
    └─────────────────────────────────────────┘
```

### **数据流架构**

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ react-showcase  │      │ vue-showcase    │      │ node-showcase   │
│                 │      │                 │      │                 │
│ App.tsx         │      │ App.vue         │      │ index.ts        │
│ FheCounter.tsx  │      │ FheCounter.vue  │      │ counter.ts      │
│ FheRatings.tsx  │      │ FheRatings.vue  │      │ voting.ts       │
│ FheVoting.tsx   │      │ FheVoting.vue   │      │ ratings.ts      │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │ import { useWallet,    │ import { useWalletVue,│ import { FhevmNode
         │         useFhevm,      │         useFhevmVue } │         } from
         │         useEncrypt,    │         } from         │         '@fhevm-sdk'
         │         useDecrypt }   │         '@fhevm-sdk'   │
         │ from '@fhevm-sdk'      │                        │
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   @fhevm-sdk/src/          │
                    │                           │
                    │   ┌─────────────────────┐ │
                    │   │  adapters/react.ts  │ │
                    │   │  adapters/vue.ts     │ │
                    │   │  adapters/node.ts   │ │
                    │   └──────────┬──────────┘ │
                    │              │            │
                    │   ┌──────────▼──────────┐ │
                    │   │   core/index.ts     │ │
                    │   │   core/fhevm.ts     │ │
                    │   │   core/contracts.ts │ │
                    │   └──────────┬──────────┘ │
                    └──────────────┼────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      Zama Relayer SDK       │
                    │   (@zama-fhe/relayer-sdk)   │
                    │                             │
                    │   ┌──────────────────────┐ │
                    │   │ createInstance()      │ │
                    │   │ createEncryptedInput │ │
                    │   │ decryptValue()       │ │
                    │   │ publicDecrypt()      │ │
                    │   └──────────────────────┘ │
                    └─────────────────────────────┘
```

## 🏗️ **项目结构**

```
fhevm-react-template/
├── packages/
│   ├── fhevm-sdk/                    # 通用FHEVM SDK核心
│   │   ├── src/
│   │   │   ├── core/                 # 核心FHEVM功能
│   │   │   │   ├── fhevm.ts         # FHEVM客户端初始化
│   │   │   │   └── contracts.ts      # 合约交互
│   │   │   └── adapters/             # 框架特定适配器
│   │   │       ├── react.ts          # React hooks (re-exports)
│   │   │       ├── useWallet.ts      # 钱包连接hook
│   │   │       ├── useFhevm.ts       # FHEVM实例hook
│   │   │       ├── useContract.ts    # 合约交互hook
│   │   │       ├── useEncrypt.ts     # 加密hook
│   │   │       ├── useDecrypt.ts     # 解密hook
│   │   │       ├── useFhevmOperations.ts  # 组合操作hook
│   │   │       ├── vue.ts            # Vue组合式函数
│   │   │       └── node.ts           # Node.js类适配器
│   │   └── dist/                     # 构建输出
│   │
│   ├── react-showcase/               # React示例
│   │   ├── src/
│   │   │   ├── App.tsx               # 主应用 (使用适配器)
│   │   │   └── components/
│   │   │       ├── FheCounter.tsx    # 使用 useEncrypt, useDecrypt
│   │   │       ├── FheRatings.tsx    # 使用 useEncrypt, useDecrypt
│   │   │       └── FheVoting.tsx    # 使用 useEncrypt
│   │
│   ├── nextjs-showcase/              # Next.js示例
│   │   ├── app/
│   │   │   └── page.tsx              # 主页面 (使用适配器)
│   │   └── components/                # 与React showcase相同
│   │
│   ├── vue-showcase/                 # Vue示例
│   │   ├── src/
│   │   │   ├── App.vue              # 主应用 (使用组合式函数)
│   │   │   └── components/
│   │   │       ├── FheCounter.vue    # 使用 useEncryptVue, useDecryptVue
│   │   │       ├── FheRatings.vue   # 使用 useEncryptVue, useDecryptVue
│   │   │       └── FheVoting.vue    # 使用 useEncryptVue
│   │
│   ├── node-showcase/                # Node.js示例
│   │   ├── src/
│   │   │   ├── index.ts              # 主入口 (使用 FhevmNode)
│   │   │   ├── counter.ts            # 计数器演示
│   │   │   ├── voting.ts             # 投票演示
│   │   │   └── ratings.ts            # 评分演示
│   │
│   └── hardhat/                      # 智能合约
│       ├── contracts/                # Solidity合约
│       └── deploy/                   # 部署脚本
│
├── pnpm-workspace.yaml                 # Monorepo配置
└── README.md                           # 本文件
```

## 🔧 **适配器系统**

### **适配器工作原理**

通用FHEVM SDK采用**清晰的适配器架构**：

1. **核心**提供框架无关的FHEVM操作
2. **适配器**将核心功能封装在框架特定的API中
3. **展示**演示适配器的实际使用

### **React/Next.js适配器**

**基于Hooks的API** - 类似于Wagmi模式：

```typescript
import { useWallet, useFhevm, useEncrypt, useDecrypt, useContract } from '@fhevm-sdk';

function MyComponent() {
  // 钱包连接
  const { address, isConnected, chainId, connect, disconnect } = useWallet();
  
  // FHEVM实例
  const { status, initialize, isInitialized } = useFhevm();
  
  // 合约交互
  const { contract, isReady } = useContract(contractAddress, abi);
  
  // 加密
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();
  
  // 解密
  const { decrypt, publicDecrypt, isDecrypting, error: decryptError } = useDecrypt();
  
  // 使用示例
  const handleIncrement = async () => {
    const encrypted = await encrypt(contractAddress, address, 1);
    await contract.increment(encrypted.handles[0], encrypted.inputProof);
  };
  
  return (
    <div>
      {!isConnected && <button onClick={connect}>连接钱包</button>}
      {isConnected && <button onClick={handleIncrement}>递增</button>}
    </div>
  );
}
```

### **Vue适配器**

**基于组合式函数的API** - Vue 3组合式API：

```typescript
<script setup lang="ts">
import { useWalletVue, useFhevmVue, useEncryptVue, useDecryptVue } from '@fhevm-sdk';

// 钱包连接
const { address, isConnected, chainId, connect, disconnect } = useWalletVue();

// FHEVM实例
const { status, initialize, isInitialized } = useFhevmVue();

// 加密
const { encrypt, isEncrypting, error: encryptError } = useEncryptVue();

// 解密
const { decrypt, publicDecrypt, isDecrypting, error: decryptError } = useDecryptVue();

// 使用示例
const handleIncrement = async () => {
  const encrypted = await encrypt.value(contractAddress, address.value, 1);
  await contract.increment(encrypted.handles[0], encrypted.inputProof);
};
</script>

<template>
  <div>
    <button v-if="!isConnected" @click="connect">连接钱包</button>
    <button v-if="isConnected" @click="handleIncrement">递增</button>
  </div>
</template>
```

### **Node.js适配器**

**基于类的API** - 用于服务器端操作：

```typescript
import { FhevmNode } from '@fhevm-sdk';

const fhevm = new FhevmNode({
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  privateKey: 'YOUR_PRIVATE_KEY',
  chainId: 11155111
});

await fhevm.initialize();

// 加密
const encrypted = await fhevm.encrypt(contractAddress, walletAddress, 1);

// 解密
const decrypted = await fhevm.decrypt(handle, contractAddress);

// 公共解密
const publicDecrypted = await fhevm.publicDecrypt(handle);

// 执行交易
const contract = fhevm.createContract(contractAddress, abi);
await fhevm.executeEncryptedTransaction(contract, 'increment', encrypted);
```

## 🚀 **快速开始**

### **选项1：NPX包（推荐）**

立即创建新的FHEVM项目：

```bash
# React
npx create-fhevm-react my-app
cd my-app
npm install && npm start

# Next.js
npx create-fhevm-nextjs my-app
cd my-app
npm install && npm run dev

# Vue
npx create-fhevm-vue my-app
cd my-app
npm install && npm run dev
```

### **选项2：开发环境**

克隆并运行完整的开发环境：

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/fhevm-react-template.git
cd fhevm-react-template

# 2. 安装依赖
pnpm install

# 3. 构建SDK
pnpm sdk:build

# 4. 运行展示
pnpm --filter react-showcase start      # React在:3000
pnpm --filter nextjs-showcase dev      # Next.js在:3001
pnpm --filter vue-showcase dev         # Vue在:3003
pnpm --filter node-showcase explorer   # 交互式CLI模式（推荐）
pnpm --filter node-showcase start      # HTTP服务器模式
pnpm --filter node-showcase cli        # 非交互式CLI模式
```

## 📚 **展示文档**

每个展示演示适配器的实际使用：

- **[React Showcase](./packages/react-showcase/README.md)** - React hooks使用
- **[Next.js Showcase](./packages/nextjs-showcase/README.md)** - Next.js与React hooks
- **[Vue Showcase](./packages/vue-showcase/README.md)** - Vue组合式函数使用
- **[Node.js Showcase](./packages/node-showcase/README.md)** - 服务器端操作
  - 🌐 **交互式CLI模式** - 带提示的引导助手 (`pnpm explorer`)
  - 🌐 **HTTP服务器模式** - 带端点的REST API (`pnpm start`)
  - 🌐 **非交互式CLI模式** - 顺序执行 (`pnpm cli`)

## 🏆 **核心特性**

### **✅ 框架无关的核心**
- 单一核心实现，所有适配器使用
- 核心中无框架特定依赖
- 易于扩展新适配器

### **✅ Wagmi-like API**
- 对web3开发者来说熟悉的模式
- 基于hooks（React）和组合式函数（Vue）
- 清晰直观的接口

### **✅ TypeScript支持**
- 所有适配器的完整类型安全
- 出色的IDE支持
- 完整的类型定义

### **✅ 真实的FHEVM操作**
- EIP-712签名解密
- 公共解密支持
- 加密交易执行
- 无模拟 - 所有真实的区块链交互

### **✅ 多个演示场景**
- **计数器演示：** 使用私有解密的递增/递减
- **评分演示：** 使用公共解密的加密评分
- **投票演示：** 加密投票与结果揭示

## 📋 **要求**

- **Node.js** 18+
- **pnpm**（推荐）或npm
- **MetaMask**（用于前端示例）
- **Sepolia ETH**（用于交易）

## 🔗 **相关文档**

- [SDK文档](./packages/fhevm-sdk/README.md)
- [React Showcase](./packages/react-showcase/README.md)
- [Next.js Showcase](./packages/nextjs-showcase/README.md)
- [Vue Showcase](./packages/vue-showcase/README.md)
- [Node.js Showcase](./packages/node-showcase/README.md)

## 📝 **许可证**

MIT许可证 - 详细信息请参阅LICENSE文件

## 🤝 **贡献**

欢迎贡献！更多信息请参阅我们的贡献指南。

---

**为Zama通用FHEVM SDK赏金而构建，保护隐私**
