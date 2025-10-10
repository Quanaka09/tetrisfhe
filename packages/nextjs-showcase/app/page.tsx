'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { decryptValue, createEncryptedInput } from '@fhevm-sdk';
import { FhevmProvider, useFhevm } from './providers/FhevmProvider';

// Contract configuration
const CONTRACT_ADDRESSES = {
  31337: '0x40e8Aa088739445BC3a3727A724F56508899f65B', // Local Hardhat
  11155111: '0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e', // Sepolia
}

const CONTRACT_ABI = [
  {
    inputs: [],
    name: "getCount",
    outputs: [{ internalType: "euint32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "externalEuint32", name: "inputEuint32", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
    ],
    name: "increment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "externalEuint32", name: "inputEuint32", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
    ],
    name: "decrement",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]

// Using Universal FHEVM SDK functions directly - no local declarations needed

function HomePage() {
  const { fheInstance, isInitialized, error, initialize } = useFhevm();
  const [account, setAccount] = useState<string>('');
  const [chainId, setChainId] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [countHandle, setCountHandle] = useState<string>('');
  const [decryptedCount, setDecryptedCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string>('');

  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || 'Not supported chain';

  // Initialize FHEVM when wallet connects
  useEffect(() => {
    if (isConnected && !isInitialized && !error) {
      initialize().catch(console.error);
    }
  }, [isConnected, isInitialized, error, initialize]);

  // Wallet connection
  const connectWallet = async () => {
    console.log('🔗 Attempting to connect wallet...');
    
    if (typeof window === 'undefined') {
      console.error('❌ Window is undefined - not in browser environment');
      return;
    }
    
    if (!window.ethereum) {
      console.error('❌ No Ethereum provider found. Please install MetaMask or connect a wallet.');
      alert('Please install MetaMask or connect a wallet to use this app.');
      return;
    }
    
    try {
      console.log('📱 Requesting accounts...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('✅ Accounts received:', accounts);
      
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('🔗 Chain ID:', chainIdHex);
      
      setAccount(accounts[0]);
      setChainId(parseInt(chainIdHex, 16));
      setIsConnected(true);
      
      console.log('✅ Wallet connected successfully!');
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      alert(`Wallet connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Get encrypted count from contract
  const getCount = async () => {
    if (!isConnected || !contractAddress || !window.ethereum) return;
    
    try {
      setMessage('Reading contract...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      const result = await contract.getCount();
      setCountHandle(result);
      setMessage('Contract read successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Get count failed:', error);
      setMessage('Failed to get count');
    }
  };

  // Decrypt count
  const handleDecrypt = async () => {
    if (!countHandle || !fheInstance || !window.ethereum) return;
    
    try {
      setMessage('Decrypting with EIP-712 user decryption...');
      
      // Get signer for EIP-712 signature
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const result = await decryptValue(countHandle, contractAddress, signer);
      setDecryptedCount(result);
      setMessage('EIP-712 decryption completed!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Decryption failed:', error);
      setMessage('Decryption failed');
    }
  };

  // Increment counter
  const incrementCounter = async () => {
    if (!isConnected || !contractAddress || !window.ethereum || !fheInstance) return;
    
    try {
      setIsProcessing(true);
      setMessage('Starting increment transaction...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      
      setMessage('Encrypting input...');
      const encryptedInput = await createEncryptedInput(contractAddress, account, 1);
      
      setMessage('Sending transaction...');
      const tx = await contract.increment(encryptedInput.encryptedData, encryptedInput.proof);
      
      setMessage('Waiting for confirmation...');
      const receipt = await tx.wait();
      
      setMessage('Increment completed!');
      console.log('✅ Increment transaction completed:', receipt);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Increment failed:', error);
      setMessage('Increment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Decrement counter
  const decrementCounter = async () => {
    if (!isConnected || !contractAddress || !window.ethereum || !fheInstance) return;
    
    try {
      setIsProcessing(true);
      setMessage('Starting decrement transaction...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      
      setMessage('Encrypting input...');
      const encryptedInput = await createEncryptedInput(contractAddress, account, 1);
      
      setMessage('Sending transaction...');
      const tx = await contract.decrement(encryptedInput.encryptedData, encryptedInput.proof);
      
      setMessage('Waiting for confirmation...');
      const receipt = await tx.wait();
      
      setMessage('Decrement completed!');
      console.log('✅ Decrement transaction completed:', receipt);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Decrement failed:', error);
      setMessage('Decrement failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#FFD208', 
        backgroundColor: '#000',
        padding: '1rem',
        margin: '0 0 2rem 0',
        borderRadius: '8px'
      }}>
        🔐 Universal FHEVM SDK - Next.js Showcase
      </h1>

      {/* FHEVM Status */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '1rem', 
        marginBottom: '1rem',
        borderRadius: '8px'
      }}>
        <h2>⚡ FHEVM Status (Next.js Compatible)</h2>
        <p>Status: <strong>{isInitialized ? 'READY' : 'LOADING'}</strong></p>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {isInitialized && <p style={{ color: 'green' }}>✅ FHEVM Ready!</p>}
      </div>

      {/* Wallet Connection */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '1rem', 
        marginBottom: '1rem',
        borderRadius: '8px'
      }}>
        <h2>🔗 Wallet Connection</h2>
        {!isConnected ? (
          <div>
            <p>Connect your wallet to use FHEVM features</p>
            <button 
              onClick={connectWallet}
              style={{
                backgroundColor: '#FFD208',
                color: '#000',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔗 Connect Wallet
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: 'green' }}>✅ Wallet Connected: {account}</p>
            <p>Chain ID: {chainId}</p>
            <p>Contract: {contractAddress}</p>
          </div>
        )}
      </div>

      {/* FHEVM Counter Demo */}
      {isConnected && isInitialized && (
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '1rem', 
          marginBottom: '1rem',
          borderRadius: '8px'
        }}>
          <h2>🔢 FHEVM Counter Demo</h2>
          <p>Using REAL FHEVM SDK on Sepolia testnet:</p>
          
          <div style={{ margin: '1rem 0' }}>
            <button 
              onClick={getCount}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '0.5rem'
              }}
            >
              📊 Get Count
            </button>
            {countHandle && (
              <p style={{ fontSize: '0.9em', color: '#666' }}>
                Handle: {countHandle}
              </p>
            )}
          </div>

          <div style={{ margin: '1rem 0' }}>
            <button 
              onClick={handleDecrypt}
              disabled={!countHandle}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: countHandle ? 'pointer' : 'not-allowed',
                marginRight: '0.5rem'
              }}
            >
              🔓 Decrypt Count
            </button>
            {decryptedCount !== null && (
              <p style={{ color: 'green', fontWeight: 'bold' }}>
                Decrypted Count: {decryptedCount}
              </p>
            )}
          </div>

          <div style={{ margin: '1rem 0' }}>
            <button 
              onClick={incrementCounter}
              disabled={isProcessing}
              style={{
                backgroundColor: '#FFD208',
                color: '#000',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                marginRight: '0.5rem'
              }}
            >
              ➕ Increment
            </button>
            <button 
              onClick={decrementCounter}
              disabled={isProcessing}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              ➖ Decrement
            </button>
          </div>

          {message && (
            <div style={{ 
              padding: '0.5rem', 
              backgroundColor: '#e9ecef', 
              borderRadius: '4px',
              marginTop: '1rem'
            }}>
              {message}
            </div>
          )}
        </div>
      )}

      {/* SDK Info */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '1rem',
        borderRadius: '8px'
      }}>
        <h2>📦 Universal FHEVM SDK</h2>
        <p>Next.js compatible implementation:</p>
        <ul>
          <li>✅ Next.js compatible FHEVM</li>
          <li>✅ No webpack bundling issues</li>
          <li>✅ Real contract interactions</li>
          <li>✅ Framework-agnostic core</li>
          <li>✅ Works in Next.js, React, Vue</li>
          <li>✅ Clean, simple API</li>
        </ul>
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '1rem' }}>
          <strong>Note:</strong> This is a demonstration using REAL FHEVM SDK from Zama's CDN. 
          The SDK provides actual encryption/decryption functionality on Sepolia testnet.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <FhevmProvider>
      <HomePage />
    </FhevmProvider>
  );
}
