# 🔐 SDK FHEVM Universel

Une boîte à outils frontend universelle pour construire des dApps confidentielles, supportant React, Next.js, Vue et Node.js avec une architecture d'adaptateur modulaire.

## 🎥 **Démo Vidéo**

[![YouTube](https://img.shields.io/badge/YouTube-Démo%20Vidéo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=UJPTUMk47hE)

**Regardez le SDK FHEVM Universel en action !** Découvrez des démos en direct de tous les showcases et apprenez à utiliser les adaptateurs dans vos projets.

👉 **[Regarder sur YouTube](https://www.youtube.com/watch?v=UJPTUMk47hE)**

## 🌐 **Exemples Live**

Tous les exemples fonctionnent avec **des interactions FHEVM réelles** sur le testnet Sepolia :

- **![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) React Showcase :** [https://react-showcase-1738.up.railway.app/](https://react-showcase-1738.up.railway.app/)
- **![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) Next.js Showcase :** [https://nextjs-showcase-1661.up.railway.app/](https://nextjs-showcase-1661.up.railway.app/)
- **![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D) Vue Showcase :** [https://vue-showcase-2780.up.railway.app/](https://vue-showcase-2780.up.railway.app/)
- **![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) Node.js Showcase :** [packages/node-showcase/](packages/node-showcase/)

**Détails du Contrat :**
- **Contrat FHE Counter :** `0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e`
- **Contrat Ratings :** `0xcA2430F1B112EC25cF6b6631bb40039aCa0C86e0`
- **Contrat Voting :** `0x7294A541222ce449faa2B8A7214C571b0fCAb52E`
- **Réseau :** Testnet Sepolia (Chain ID: 11155111)

## 🌍 **Langues / Languages / 语言**
[![English](https://img.shields.io/badge/English-🇺🇸-blue)](README.md)
[![Français](https://img.shields.io/badge/Français-🇫🇷-red)](README.fr.md)
[![中文](https://img.shields.io/badge/中文-🇨🇳-green)](README.zh.md)

## 📐 **Vue d'Ensemble de l'Architecture**

### **Architecture SDK**

```
┌──────────────────────────────────────────────────────────────────────┐
│                    SDK FHEVM Universel                              │
│                      packages/fhevm-sdk/                               │
└──────────────────────────────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
    ┌─────▼─────┐          ┌───────▼───────┐      ┌───────▼───────┐
    │   CORE    │          │   ADAPTERS    │      │   SHOWCASES   │
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

### **Architecture de Flux de Données**

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

## 🏗️ **Structure du Projet**

```
fhevm-react-template/
├── packages/
│   ├── fhevm-sdk/                    # SDK FHEVM Universel Core
│   │   ├── src/
│   │   │   ├── core/                 # Fonctionnalités FHEVM core
│   │   │   │   ├── fhevm.ts         # Initialisation client FHEVM
│   │   │   │   └── contracts.ts      # Interactions de contrat
│   │   │   └── adapters/             # Adaptateurs spécifiques aux frameworks
│   │   │       ├── react.ts          # Hooks React (re-exports)
│   │   │       ├── useWallet.ts      # Hook de connexion wallet
│   │   │       ├── useFhevm.ts       # Hook d'instance FHEVM
│   │   │       ├── useContract.ts    # Hook d'interaction de contrat
│   │   │       ├── useEncrypt.ts     # Hook de chiffrement
│   │   │       ├── useDecrypt.ts     # Hook de déchiffrement
│   │   │       ├── useFhevmOperations.ts  # Hook d'opérations combinées
│   │   │       ├── vue.ts            # Composables Vue
│   │   │       └── node.ts           # Adaptateur de classe Node.js
│   │   └── dist/                     # Sortie construite
│   │
│   ├── react-showcase/               # Exemple React
│   │   ├── src/
│   │   │   ├── App.tsx               # App principale (utilise adaptateurs)
│   │   │   └── components/
│   │   │       ├── FheCounter.tsx    # Utilise useEncrypt, useDecrypt
│   │   │       ├── FheRatings.tsx   # Utilise useEncrypt, useDecrypt
│   │   │       └── FheVoting.tsx    # Utilise useEncrypt
│   │
│   ├── nextjs-showcase/              # Exemple Next.js
│   │   ├── app/
│   │   │   └── page.tsx              # Page principale (utilise adaptateurs)
│   │   └── components/                # Même que React showcase
│   │
│   ├── vue-showcase/                 # Exemple Vue
│   │   ├── src/
│   │   │   ├── App.vue              # App principale (utilise composables)
│   │   │   └── components/
│   │   │       ├── FheCounter.vue   # Utilise useEncryptVue, useDecryptVue
│   │   │       ├── FheRatings.vue   # Utilise useEncryptVue, useDecryptVue
│   │   │       └── FheVoting.vue    # Utilise useEncryptVue
│   │
│   ├── node-showcase/                # Exemple Node.js
│   │   ├── src/
│   │   │   ├── index.ts              # Point d'entrée principal (utilise FhevmNode)
│   │   │   ├── counter.ts            # Démo compteur
│   │   │   ├── voting.ts             # Démo vote
│   │   │   └── ratings.ts            # Démo ratings
│   │
│   └── hardhat/                      # Smart Contracts
│       ├── contracts/                # Contrats Solidity
│       └── deploy/                   # Scripts de déploiement
│
├── pnpm-workspace.yaml                 # Configuration monorepo
└── README.md                           # Ce fichier
```

## 🔧 **Système d'Adaptateurs**

### **Comment Fonctionnent les Adaptateurs**

Le SDK FHEVM Universel utilise une **architecture d'adaptateur propre** où :

1. **Core** fournit des opérations FHEVM indépendantes du framework
2. **Adaptateurs** encapsulent la fonctionnalité core dans des APIs spécifiques aux frameworks
3. **Showcases** démontrent l'utilisation réelle avec les adaptateurs

### **Adaptateurs React/Next.js**

**API basée sur les Hooks** - Similaire au pattern Wagmi :

```typescript
import { useWallet, useFhevm, useEncrypt, useDecrypt, useContract } from '@fhevm-sdk';

function MyComponent() {
  // Connexion wallet
  const { address, isConnected, chainId, connect, disconnect } = useWallet();
  
  // Instance FHEVM
  const { status, initialize, isInitialized } = useFhevm();
  
  // Interaction contrat
  const { contract, isReady } = useContract(contractAddress, abi);
  
  // Chiffrement
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();
  
  // Déchiffrement
  const { decrypt, publicDecrypt, isDecrypting, error: decryptError } = useDecrypt();
  
  // Exemple d'utilisation
  const handleIncrement = async () => {
    const encrypted = await encrypt(contractAddress, address, 1);
    await contract.increment(encrypted.handles[0], encrypted.inputProof);
  };
  
  return (
    <div>
      {!isConnected && <button onClick={connect}>Connecter Wallet</button>}
      {isConnected && <button onClick={handleIncrement}>Incrémenter</button>}
    </div>
  );
}
```

### **Adaptateurs Vue**

**API basée sur les Composables** - Vue 3 Composition API :

```typescript
<script setup lang="ts">
import { useWalletVue, useFhevmVue, useEncryptVue, useDecryptVue } from '@fhevm-sdk';

// Connexion wallet
const { address, isConnected, chainId, connect, disconnect } = useWalletVue();

// Instance FHEVM
const { status, initialize, isInitialized } = useFhevmVue();

// Chiffrement
const { encrypt, isEncrypting, error: encryptError } = useEncryptVue();

// Déchiffrement
const { decrypt, publicDecrypt, isDecrypting, error: decryptError } = useDecryptVue();

// Exemple d'utilisation
const handleIncrement = async () => {
  const encrypted = await encrypt.value(contractAddress, address.value, 1);
  await contract.increment(encrypted.handles[0], encrypted.inputProof);
};
</script>

<template>
  <div>
    <button v-if="!isConnected" @click="connect">Connecter Wallet</button>
    <button v-if="isConnected" @click="handleIncrement">Incrémenter</button>
  </div>
</template>
```

### **Adaptateur Node.js**

**API basée sur les Classes** - Pour les opérations côté serveur :

```typescript
import { FhevmNode } from '@fhevm-sdk';

const fhevm = new FhevmNode({
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  privateKey: 'YOUR_PRIVATE_KEY',
  chainId: 11155111
});

await fhevm.initialize();

// Chiffrer
const encrypted = await fhevm.encrypt(contractAddress, walletAddress, 1);

// Déchiffrer
const decrypted = await fhevm.decrypt(handle, contractAddress);

// Déchiffrement public
const publicDecrypted = await fhevm.publicDecrypt(handle);

// Exécuter transaction
const contract = fhevm.createContract(contractAddress, abi);
await fhevm.executeEncryptedTransaction(contract, 'increment', encrypted);
```

## 🚀 **Démarrage Rapide**

### **Option 1 : Packages NPX (Recommandé)**

Créez un nouveau projet FHEVM instantanément :

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

### **Option 2 : Environnement de Développement**

Clonez et exécutez l'environnement de développement complet :

```bash
# 1. Cloner le repository
git clone https://github.com/your-username/fhevm-react-template.git
cd fhevm-react-template

# 2. Installer les dépendances
pnpm install

# 3. Construire le SDK
pnpm sdk:build

# 4. Exécuter showcase
pnpm --filter react-showcase start      # React sur :3000
pnpm --filter nextjs-showcase dev      # Next.js sur :3001
pnpm --filter vue-showcase dev         # Vue sur :3003
pnpm --filter node-showcase explorer   # Mode CLI interactif (recommandé)
pnpm --filter node-showcase start      # Mode serveur HTTP
pnpm --filter node-showcase cli        # Mode CLI non-interactif
```

## 📚 **Documentation des Showcases**

Chaque showcase démontre l'utilisation réelle des adaptateurs :

- **[React Showcase](./packages/react-showcase/README.md)** - Utilisation des hooks React
- **[Next.js Showcase](./packages/nextjs-showcase/README.md)** - Next.js avec hooks React
- **[Vue Showcase](./packages/vue-showcase/README.md)** - Utilisation des composables Vue
- **[Node.js Showcase](./packages/node-showcase/README.md)** - Opérations côté serveur
  - 🌐 **Mode CLI interactif** - Assistant guidé avec prompts (`pnpm explorer`)
  - 🌐 **Mode serveur HTTP** - API REST avec endpoints (`pnpm start`)
  - 🌐 **Mode CLI non-interactif** - Exécution séquentielle (`pnpm cli`)

## 🏆 **Fonctionnalités Clés**

### **✅ Core Indépendant du Framework**
- Implémentation core unique utilisée par tous les adaptateurs
- Aucune dépendance spécifique au framework dans le core
- Facile à étendre avec de nouveaux adaptateurs

### **✅ API de Type Wagmi**
- Patterns familiers pour les développeurs web3
- Basé sur les hooks (React) et composables (Vue)
- Interface propre et intuitive

### **✅ Support TypeScript**
- Sécurité de type complète à travers tous les adaptateurs
- Excellent support IDE
- Définitions de type complètes

### **✅ Opérations FHEVM Réelles**
- Déchiffrement basé sur signature EIP-712
- Support de déchiffrement public
- Exécution de transaction chiffrée
- Pas de mocks - toutes les interactions blockchain réelles

### **✅ Multiples Scénarios de Démo**
- **Démo Compteur :** Incrément/décrément avec déchiffrement privé
- **Démo Ratings :** Ratings chiffrés avec déchiffrement public
- **Démo Voting :** Vote chiffré avec révélation des résultats

## 📋 **Exigences**

- **Node.js** 18+ 
- **pnpm** (recommandé) ou npm
- **MetaMask** (pour les exemples frontend)
- **Sepolia ETH** (pour les transactions)

## 🔗 **Documentation Associée**

- [Documentation SDK](./packages/fhevm-sdk/README.md)
- [React Showcase](./packages/react-showcase/README.md)
- [Next.js Showcase](./packages/nextjs-showcase/README.md)
- [Vue Showcase](./packages/vue-showcase/README.md)
- [Node.js Showcase](./packages/node-showcase/README.md)

## 📝 **Licence**

MIT License - voir le fichier LICENSE pour plus de détails

## 🤝 **Contributions**

Les contributions sont les bienvenues ! Veuillez consulter nos directives de contribution pour plus d'informations.

---

**Construit avec ❤️ pour le Bounty SDK FHEVM Universel Zama**
