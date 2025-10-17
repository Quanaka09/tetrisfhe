/**
 * Simple FHEVM Core - Universal SDK
 * Clean, working FHEVM implementation for all frameworks
 * Uses CDN for browser environments to avoid bundling issues
 */
/**
 * Initialize FHEVM instance
 * Uses CDN for browser environments to avoid bundling issues
 */
export declare function initializeFheInstance(): Promise<any>;
export declare function getFheInstance(): any;
/**
 * Decrypt a single encrypted value using EIP-712 user decryption (matches showcase API)
 */
export declare function decryptValue(encryptedBytes: string, contractAddress: string, signer: any): Promise<number>;
/**
 * Create encrypted input for contract interaction (matches showcase API)
 */
export declare function createEncryptedInput(contractAddress: string, userAddress: string, value: number): Promise<{encryptedData: any, proof: any}>;

/**
 * Encrypt values using FHEVM
 */
export declare function encryptValue(contractAddress: string, address: string, plainDigits: number[]): Promise<any>;

/**
 * Request user decryption with EIP-712 signature
 */
export declare function requestUserDecryption(contractAddress: string, signer: any, ciphertextHandle: string): Promise<any>;

/**
 * Public decryption for multiple handles
 */
export declare function fetchPublicDecryption(handles: string[]): Promise<any>;

/**
 * Public decryption for handles that don't require user authentication
 */
export declare function publicDecrypt(encryptedBytes: string): Promise<number>;
