'use client';

import React, { createContext, useContext } from 'react';
import { useWallet as useWalletHook, useFhevm as useFhevmHook, useContract as useContractHook, useFhevmOperations as useFhevmOperationsHook } from '@fhevm-sdk';

// Create a comprehensive context that includes all wagmi-like hooks
interface FhevmContextType {
  // Wallet
  address: string;
  isConnected: boolean;
  chainId: number;
  isConnecting: boolean;
  walletError: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // FHEVM
  fheInstance: any;
  isInitialized: boolean;
  error: string; // Changed from fhevmError to error
  initialize: () => Promise<void>;
  
  // Contract
  contract: any;
  isContractReady: boolean;
  contractError: string;
  
  // Operations
  encrypt: (contractAddress: string, userAddress: string, value: number) => Promise<any>;
  decrypt: (handle: string, contractAddress: string, signer: any) => Promise<number>;
  executeTransaction: (contract: any, method: string, encryptedData: string, proof: string, ...args: any[]) => Promise<any>;
  isBusy: boolean;
  message: string;
}

const FhevmContext = createContext<FhevmContextType | undefined>(undefined);

export function FhevmProvider({ children }: { children: React.ReactNode }) {
  // Use all the wagmi-like hooks
  const wallet = useWalletHook();
  const fhevm = useFhevmHook();
  const contract = useContractHook('', []); // Will be set by individual components
  const operations = useFhevmOperationsHook();

  const contextValue: FhevmContextType = {
    // Wallet
    address: wallet.address,
    isConnected: wallet.isConnected,
    chainId: wallet.chainId,
    isConnecting: wallet.isConnecting,
    walletError: wallet.error,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    
    // FHEVM
    fheInstance: fhevm.instance,
    isInitialized: fhevm.isInitialized,
    error: fhevm.error,
    initialize: fhevm.initialize,
    
    // Contract
    contract: contract.contract,
    isContractReady: contract.isReady,
    contractError: contract.error,
    
    // Operations
    encrypt: operations.encrypt,
    decrypt: operations.decrypt,
    executeTransaction: operations.executeTransaction,
    isBusy: operations.isBusy,
    message: operations.message,
  };

  return (
    <FhevmContext.Provider value={contextValue}>
      {children}
    </FhevmContext.Provider>
  );
}

export function useFhevm() {
  const context = useContext(FhevmContext);
  if (context === undefined) {
    throw new Error('useFhevm must be used within a FhevmProvider');
  }
  return context;
}
