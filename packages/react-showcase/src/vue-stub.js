/**
 * Vue adapter stub for React builds
 * This replaces the Vue adapter when building React showcase
 * to prevent webpack from trying to resolve Vue dependencies
 */

// Export empty stubs for Vue composables
export function useWalletVue() {
  throw new Error('Vue adapters are not available in React showcase');
}

export function useFhevmVue() {
  throw new Error('Vue adapters are not available in React showcase');
}

export function useContractVue() {
  throw new Error('Vue adapters are not available in React showcase');
}

export function useDecryptVue() {
  throw new Error('Vue adapters are not available in React showcase');
}

export function useEncryptVue() {
  throw new Error('Vue adapters are not available in React showcase');
}

export function useFhevmOperationsVue() {
  throw new Error('Vue adapters are not available in React showcase');
}

