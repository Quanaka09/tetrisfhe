/**
 * Universal FHEVM Core - Environment-Aware SDK
 * Supports both browser and Node.js environments
 * Preserves all existing browser functionality
 */

let fheInstance: any = null;

/**
 * Initialize FHEVM instance for browser environment
 * PRESERVES EXACT SAME FUNCTIONALITY as before
 */
async function initializeBrowserFheInstance() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found. Please install MetaMask or connect a wallet.');
  }

  // Check for both uppercase and lowercase versions of RelayerSDK
  let sdk = (window as any).RelayerSDK || (window as any).relayerSDK;
  
  if (!sdk) {
    throw new Error('RelayerSDK not loaded. Please include the script tag in your HTML:\n<script src="https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs"></script>');
  }

  const { initSDK, createInstance, SepoliaConfig } = sdk;

  await initSDK(); // Loads WASM
  const config = { ...SepoliaConfig, network: window.ethereum };
  
  try {
    fheInstance = await createInstance(config);
    return fheInstance;
  } catch (err) {
    console.error('FHEVM browser instance creation failed:', err);
    throw err;
  }
}

/**
 * Initialize FHEVM instance for Node.js environment
 * REAL FUNCTIONALITY - uses actual RelayerSDK
 */
async function initializeNodeFheInstance(rpcUrl?: string) {
  try {
    console.log('🚀 Initializing REAL FHEVM Node.js instance...');
    
    // Import the RelayerSDK with correct Node.js path
    const { createInstance, SepoliaConfig, generateKeypair } = await import('@zama-fhe/relayer-sdk/node');
    
    // Create an EIP-1193 compatible provider for Node.js
    const { ethers } = await import('ethers');
    const provider = new ethers.JsonRpcProvider(rpcUrl || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY');
    
    // Create EIP-1193 provider wrapper
    const eip1193Provider = {
      request: async ({ method, params }: { method: string; params: any[] }) => {
        switch (method) {
          case 'eth_chainId':
            return '0xaa36a7'; // Sepolia chain ID
          case 'eth_accounts':
            return ['0x8Efff193475604790D04e3F972AB5b9047C3503d'];
          case 'eth_requestAccounts':
            return ['0x8Efff193475604790D04e3F972AB5b9047C3503d'];
          case 'eth_call':
            // Use the real provider for blockchain calls
            return await provider.call(params[0]);
          case 'eth_sendTransaction':
            // Use the real provider for transactions
            return await provider.broadcastTransaction(params[0]);
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
      },
      on: () => {},
      removeListener: () => {}
    };
    
    const config = { 
      ...SepoliaConfig, 
      network: eip1193Provider 
    };
    
    fheInstance = await createInstance(config);
    console.log('✅ REAL FHEVM Node.js instance created successfully!');
    return fheInstance;
  } catch (err) {
    console.error('FHEVM Node.js instance creation failed:', err);
    throw err;
  }
}

/**
 * Initialize FHEVM instance - Environment-aware
 * MAINTAINS BACKWARD COMPATIBILITY
 */
export async function initializeFheInstance(options?: { rpcUrl?: string }) {
  // Detect environment
  if (typeof window !== 'undefined' && window.ethereum) {
    // Browser environment - use existing working code
    return initializeBrowserFheInstance();
  } else {
    // Node.js environment - use new functionality
    return initializeNodeFheInstance(options?.rpcUrl);
  }
}

export function getFheInstance() {
  return fheInstance;
}

/**
 * Decrypt a single encrypted value using EIP-712 user decryption (matches showcase API)
 */
export async function decryptValue(encryptedBytes: string, contractAddress: string, signer: any): Promise<number> {
  const fhe = getFheInstance();
  if (!fhe) throw new Error('FHE instance not initialized. Call initializeFheInstance() first.');

  try {
    console.log('🔐 Using EIP-712 user decryption for handle:', encryptedBytes);
    
    // Use EIP-712 user decryption instead of public decryption
    const keypair = fhe.generateKeypair();
    const handleContractPairs = [
      {
        handle: encryptedBytes,
        contractAddress: contractAddress,
      },
    ];
    
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "10";
    const contractAddresses = [contractAddress];

    const eip712 = fhe.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    );

    const signature = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
      },
      eip712.message
    );

    const result = await fhe.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace("0x", ""),
      contractAddresses,
      await signer.getAddress(),
      startTimeStamp,
      durationDays
    );

    return Number(result[encryptedBytes]);
  } catch (error: any) {
    // Check for relayer/network error
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      throw new Error('Decryption service is temporarily unavailable. Please try again later.');
    }
    throw error;
  }
}

/**
 * Public decryption for handles that don't require user authentication
 */
export async function publicDecrypt(encryptedBytes: string): Promise<number> {
  const fhe = getFheInstance();
  if (!fhe) throw new Error('FHE instance not initialized. Call initializeFheInstance() first.');

  try {
    let handle = encryptedBytes;
    if (typeof handle === "string" && handle.startsWith("0x") && handle.length === 66) {
      const values = await fhe.publicDecrypt([handle]);
      return Number(values[handle]);
    } else {
      throw new Error('Invalid ciphertext handle for decryption');
    }
  } catch (error: any) {
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      throw new Error('Decryption service is temporarily unavailable. Please try again later.');
    }
    throw error;
  }
}
