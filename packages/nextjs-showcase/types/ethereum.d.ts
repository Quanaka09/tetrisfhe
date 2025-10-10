// Ethereum provider type declarations
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
      isConnected?: () => boolean;
    };
  }
}

// FHEVM SDK module declaration
declare module '@zama-fhe/relayer-sdk/bundle' {
  export function initSDK(): Promise<void>;
  export function createInstance(config: any): Promise<any>;
  export const SepoliaConfig: any;
}

export {};
