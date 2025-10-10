/**
 * FHEVM Encryption - Universal SDK
 * Simple encryption using your working implementation
 */

import { getFheInstance } from './fhevm.js';

/**
 * Encrypt values using FHEVM
 */
export async function encryptValue(
  contractAddress: string,
  address: string,
  plainDigits: number[]
) {
  const relayer = getFheInstance();
  if (!relayer) throw new Error("FHEVM not initialized");

  const inputHandle = relayer.createEncryptedInput(contractAddress, address);
  for (const d of plainDigits) {
    inputHandle.add8(d);
  }
  
  const ciphertextBlob = await inputHandle.encrypt();
  return ciphertextBlob;
}

/**
 * Create encrypted input for contract interaction (matches showcase API)
 */
export async function createEncryptedInput(contractAddress: string, userAddress: string, value: number) {
  const fhe = getFheInstance();
  if (!fhe) throw new Error('FHE instance not initialized. Call initializeFheInstance() first.');

  console.log(`🔐 Creating encrypted input for contract ${contractAddress}, user ${userAddress}, value ${value}`);
  
  const inputHandle = fhe.createEncryptedInput(contractAddress, userAddress);
  inputHandle.add32(value);
  const result = await inputHandle.encrypt();
  
  console.log('✅ Encrypted input created successfully');
  console.log('🔍 Encrypted result structure:', result);
  
  // The FHEVM SDK returns an object with handles and inputProof
  // We need to extract the correct values for the contract
  if (result && typeof result === 'object') {
    // If result has handles array, use the first handle
    if (result.handles && Array.isArray(result.handles) && result.handles.length > 0) {
      return {
        encryptedData: result.handles[0],
        proof: result.inputProof
      };
    }
    // If result has encryptedData and proof properties
    else if (result.encryptedData && result.proof) {
      return {
        encryptedData: result.encryptedData,
        proof: result.proof
      };
    }
    // Fallback: use the result as-is
    else {
      return {
        encryptedData: result,
        proof: result
      };
    }
  }
  
  // If result is not an object, use it directly
  return {
    encryptedData: result,
    proof: result
  };
}
