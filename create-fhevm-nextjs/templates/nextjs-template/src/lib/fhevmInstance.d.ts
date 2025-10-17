// Type declarations for fhevmInstance.js

export interface EncryptedInput {
  encryptedData: string;
  proof: string;
}

// Main exports
export declare function decryptValue(handle: string, contractAddress: string, signer: any): Promise<number>;
export declare function createEncryptedInput(contractAddress: string, userAddress: string, value: number): Promise<EncryptedInput>;
export declare function publicDecrypt(encryptedData: string): Promise<number>;
export declare function initializeFheInstance(): Promise<any>;
export declare function getFheInstance(): any;
