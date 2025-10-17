'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeFheInstance, createEncryptedInput, decryptValue } from '../../src/lib/fhevmInstance';

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
  error: string;
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
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string>('');
  const [fheInstance, setFheInstance] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Connect wallet
  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setWalletError('Please install MetaMask or connect a wallet');
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      setAddress(accounts[0]);
      setChainId(parseInt(chainId, 16));
      setIsConnected(true);
      setWalletError('');
    } catch (err: any) {
      setWalletError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAddress('');
    setIsConnected(false);
    setChainId(0);
    setWalletError('');
  };

  // Initialize FHEVM
  const initialize = async () => {
    try {
      setError('');
      const instance = await initializeFheInstance();
      setFheInstance(instance);
      setIsInitialized(true);
    } catch (err: any) {
      setError(err.message);
      setIsInitialized(false);
    }
  };

  // Encrypt function
  const encrypt = async (contractAddress: string, userAddress: string, value: number) => {
    try {
      setIsBusy(true);
      setMessage('Encrypting...');
      const result = await createEncryptedInput(contractAddress, userAddress, value);
      setMessage('Encryption completed');
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsBusy(false);
    }
  };

  // Decrypt function
  const decrypt = async (handle: string, contractAddress: string, signer: any) => {
    try {
      setIsBusy(true);
      setMessage('Decrypting...');
      const result = await decryptValue(handle, contractAddress, signer);
      setMessage('Decryption completed');
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsBusy(false);
    }
  };

  // Execute transaction function
  const executeTransaction = async (contract: any, method: string, encryptedData: string, proof: string, ...args: any[]) => {
    try {
      setIsBusy(true);
      setMessage('Executing transaction...');
      const tx = await contract[method](encryptedData, proof, ...args);
      setMessage('Transaction executed');
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsBusy(false);
    }
  };

  const contextValue: FhevmContextType = {
    // Wallet
    address,
    isConnected,
    chainId,
    isConnecting,
    walletError,
    connect,
    disconnect,
    
    // FHEVM
    fheInstance,
    isInitialized,
    error,
    initialize,
    
    // Contract
    contract: null,
    isContractReady: false,
    contractError: '',
    
    // Operations
    encrypt,
    decrypt,
    executeTransaction,
    isBusy,
    message,
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
