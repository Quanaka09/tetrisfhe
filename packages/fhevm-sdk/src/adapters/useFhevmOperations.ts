/**
 * Comprehensive wagmi-like hook for FHEVM operations
 */

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useDecrypt } from './useDecrypt.js';
import { useEncrypt } from './useEncrypt.js';

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















