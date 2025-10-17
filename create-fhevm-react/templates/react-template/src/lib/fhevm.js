/**
 * Universal FHEVM SDK - Consolidated Instance
 * Complete FHEVM functionality in a single file for NPX packages
 * Includes: FHEVM instance, encryption, and decryption
 */

let fheInstance = null;

/**
 * Initialize FHEVM instance
 * Uses CDN for browser environments to avoid bundling issues
 */
export async function initializeFheInstance() {
    if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Ethereum provider not found. Please install MetaMask or connect a wallet.');
    }
    
    // Check for both uppercase and lowercase versions of RelayerSDK
    let sdk = window.RelayerSDK || window.relayerSDK;
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
        console.error('FHEVM instance creation failed:', err);
        throw err;
    }
}

export function getFheInstance() {
    return fheInstance;
}

/**
 * Encrypt values using FHEVM
 */
export async function encryptValue(contractAddress, address, plainDigits) {
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
export async function createEncryptedInput(contractAddress, userAddress, value) {
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

/**
 * Request user decryption with EIP-712 signature
 */
export async function requestUserDecryption(contractAddress, signer, ciphertextHandle) {
    const relayer = getFheInstance();
    if (!relayer) throw new Error("FHEVM not initialized");
    
    const keypair = relayer.generateKeypair();
    const handleContractPairs = [
        {
            handle: ciphertextHandle,
            contractAddress: contractAddress,
        },
    ];
    
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "10";
    const contractAddresses = [contractAddress];
    
    const eip712 = relayer.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
    const signature = await signer.signTypedData(eip712.domain, {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
    }, eip712.message);
    
    const result = await relayer.userDecrypt(handleContractPairs, keypair.privateKey, keypair.publicKey, signature.replace("0x", ""), contractAddresses, await signer.getAddress(), startTimeStamp, durationDays);
    return result[ciphertextHandle];
}

/**
 * Public decryption for multiple handles
 */
export async function fetchPublicDecryption(handles) {
    const relayer = getFheInstance();
    if (!relayer) throw new Error("FHEVM not initialized");
    return relayer.publicDecrypt(handles);
}

/**
 * Decrypt a single encrypted value using EIP-712 user decryption (matches showcase API)
 */
export async function decryptValue(encryptedBytes, contractAddress, signer) {
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
        
        const eip712 = fhe.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
        const signature = await signer.signTypedData(eip712.domain, {
            UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        }, eip712.message);
        
        const result = await fhe.userDecrypt(handleContractPairs, keypair.privateKey, keypair.publicKey, signature.replace("0x", ""), contractAddresses, await signer.getAddress(), startTimeStamp, durationDays);
        return Number(result[encryptedBytes]);
    } catch (error) {
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
export async function publicDecrypt(encryptedBytes) {
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
    } catch (error) {
        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
            throw new Error('Decryption service is temporarily unavailable. Please try again later.');
        }
        throw error;
    }
}
