/**
 * React Adapter - Universal FHEVM SDK
 * Wagmi-like React hooks for FHEVM operations
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  initializeFheInstance, 
  getFheInstance, 
  decryptValue,
  createEncryptedInput,
  requestUserDecryption,
  publicDecrypt
} from '../core/index.js';

/**
 * Wagmi-like hook for wallet connection
 */
export function useWallet() {
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not found. Please install MetaMask.');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setAddress(account);
      setIsConnected(true);

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(chainId, 16));

      console.log('✅ Wallet connected:', account);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      console.error('❌ Wallet connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress('');
    setIsConnected(false);
    setChainId(0);
    setError('');
    console.log('🔌 Wallet disconnected');
  }, []);

  return {
    address,
    isConnected,
    chainId,
    isConnecting,
    error,
    connect,
    disconnect,
  };
}

/**
 * Wagmi-like hook for FHEVM instance
 */
export function useFhevm() {
  const [instance, setInstance] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const initialize = useCallback(async () => {
    setStatus('loading');
    setError('');
    
    try {
      const fheInstance = await initializeFheInstance();
      setInstance(fheInstance);
      setStatus('ready');
      console.log('✅ FHEVM initialized');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
      console.error('❌ FHEVM initialization failed:', err);
    }
  }, []);

  return {
    instance,
    status,
    error,
    initialize,
    isInitialized: status === 'ready',
  };
}

/**
 * Wagmi-like hook for contract interactions
 */
export function useContract(address: string, abi: any[]) {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!window.ethereum || !address || !abi) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contractInstance = new ethers.Contract(address, abi, provider);
      setContract(contractInstance);
      setIsReady(true);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Contract setup failed');
      setIsReady(false);
    }
  }, [address, abi]);

  return {
    contract,
    isReady,
    error,
  };
}

/**
 * Wagmi-like hook for decryption operations
 */
export function useDecrypt() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string>('');

  const decrypt = useCallback(async (handle: string, contractAddress: string, signer: any) => {
    setIsDecrypting(true);
    setError('');
    
    try {
      const result = await decryptValue(handle, contractAddress, signer);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed');
      throw err;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  const publicDecryptValue = useCallback(async (handle: string) => {
    setIsDecrypting(true);
    setError('');
    
    try {
      const result = await publicDecrypt(handle);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Public decryption failed');
      throw err;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  return {
    decrypt,
    publicDecrypt: publicDecryptValue,
    isDecrypting,
    error,
  };
}

/**
 * Wagmi-like hook for encryption operations
 */
export function useEncrypt() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string>('');

  const encrypt = useCallback(async (contractAddress: string, userAddress: string, value: number) => {
    setIsEncrypting(true);
    setError('');
    
    try {
      const result = await createEncryptedInput(contractAddress, userAddress, value);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption failed');
      throw err;
    } finally {
      setIsEncrypting(false);
    }
  }, []);

  return {
    encrypt,
    isEncrypting,
    error,
  };
}

/**
 * Comprehensive wagmi-like hook for FHEVM operations
 */
export function useFhevmOperations() {
  const { decrypt, publicDecrypt, isDecrypting, error: decryptError } = useDecrypt();
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string>('');

  const executeTransaction = useCallback(async (
    contract: ethers.Contract,
    method: string,
    encryptedData: string,
    proof: string,
    ...args: any[]
  ) => {
    setIsProcessing(true);
    setMessage('Sending transaction...');
    
    try {
      const tx = await contract[method](encryptedData, proof, ...args);
      setMessage('Waiting for confirmation...');
      const receipt = await tx.wait();
      setMessage('Transaction confirmed!');
      return { tx, receipt };
    } catch (err) {
      setMessage('Transaction failed');
      throw err;
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMessage(''), 3000);
    }
  }, []);

  return {
    // Encryption
    encrypt,
    isEncrypting,
    encryptError,
    
    // Decryption
    decrypt,
    publicDecrypt,
    isDecrypting,
    decryptError,
    
    // Transaction execution
    executeTransaction,
    isProcessing,
    message,
    
    // Combined states
    isBusy: isEncrypting || isDecrypting || isProcessing,
    hasError: !!(encryptError || decryptError),
  };
}
