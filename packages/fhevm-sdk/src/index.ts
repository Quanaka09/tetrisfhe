/**
 * Universal FHEVM SDK
 * Clean, simple implementation that actually works
 */

// Core FHEVM functionality
export * from './core/index.js';

// Framework adapters - explicit exports to avoid conflicts
export { useWallet, useFhevm, useContract, useDecrypt, useEncrypt, useFhevmOperations } from './adapters/react.js';
export { useWallet as useWalletVue, useFhevm as useFhevmVue, useContract as useContractVue, useDecrypt as useDecryptVue, useEncrypt as useEncryptVue, useFhevmOperations as useFhevmOperationsVue } from './adapters/vue.js';
export { FhevmNode } from './adapters/node.js';
export { FhevmVanilla } from './adapters/vanilla.js';
