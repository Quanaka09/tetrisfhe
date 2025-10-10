import React, { useState } from 'react';
import { ethers } from 'ethers';
import { initializeFheInstance, decryptValue, createEncryptedInput, publicDecrypt } from '@fhevm-sdk';
import './App.css';

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

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
      isConnected?: () => boolean;
    };
  }
}

function App() {
  const [account, setAccount] = useState<string>('');
  const [chainId, setChainId] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [countHandle, setCountHandle] = useState<string>('');
  const [decryptedCount, setDecryptedCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [fhevmStatus, setFhevmStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [fhevmError, setFhevmError] = useState<string>('');

  // Public decryption state
  const [publicDecryptedCount, setPublicDecryptedCount] = useState<number | null>(null);
  const [publicDecryptedSum, setPublicDecryptedSum] = useState<number | null>(null);
  const [isPublicDecrypting, setIsPublicDecrypting] = useState(false);

  // Hardcoded ciphertexts for public decryption testing
  const HARDCODED_CIPHERTEXTS = {
    encryptedCount: "0x42bbe4377f93c8e01c6ea6a9bfe98cab65b67b97e1ff0000000000aa36a70500",
    encryptedSum: "0x1495e50acd5cef684c3a9cae49e18a13d631768f70ff0000000000aa36a70500"
  };

  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || 'Not supported chain';

  // Initialize FHEVM
  const initializeFhevm = async () => {
    setFhevmStatus('loading');
    setFhevmError('');
    
    try {
      await initializeFheInstance();
      setFhevmStatus('ready');
      console.log('✅ FHEVM initialized for React!');
    } catch (error) {
      setFhevmStatus('error');
      setFhevmError(error instanceof Error ? error.message : 'Unknown error');
      console.error('FHEVM initialization failed:', error);
    }
  };

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
      
      // Initialize FHEVM after wallet connection
      await initializeFhevm();
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
    if (!countHandle || !window.ethereum) return;
    
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
    if (!isConnected || !contractAddress || !window.ethereum) return;
    
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
    if (!isConnected || !contractAddress || !window.ethereum) return;
    
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

  // Public decryption function
  const handlePublicDecrypt = async () => {
    if (fhevmStatus !== 'ready') return;
    
    try {
      setIsPublicDecrypting(true);
      setMessage('Testing public decryption...');
      
      // Test public decryption with hardcoded ciphertexts
      const countResult = await publicDecrypt(HARDCODED_CIPHERTEXTS.encryptedCount);
      const sumResult = await publicDecrypt(HARDCODED_CIPHERTEXTS.encryptedSum);
      
      setPublicDecryptedCount(countResult);
      setPublicDecryptedSum(sumResult);
      setMessage('Public decryption completed!');
      
      console.log('✅ Public decryption results:');
      console.log('Count:', countResult);
      console.log('Sum:', sumResult);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Public decryption failed:', error);
      setMessage('Public decryption failed');
    } finally {
      setIsPublicDecrypting(false);
    }
  };

  return (
    <div className="app">
      {/* FHEVM Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">Universal FHEVM SDK - React Showcase</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          
          {/* FHEVM Status */}
          <div className="section">
            <div className="section-header">
              <h2>FHEVM Status</h2>
              <span className="status-badge" data-status={fhevmStatus}>{fhevmStatus.toUpperCase()}</span>
            </div>
            <div className="section-content">
              {fhevmError && <p className="error">Error: {fhevmError}</p>}
              {fhevmStatus === 'ready' && <p className="success">FHEVM Ready</p>}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="section">
            <div className="section-header">
              <h2>Wallet Connection</h2>
              {!isConnected ? (
                <button onClick={connectWallet} className="connect-btn-header">
                  Connect Wallet
                </button>
              ) : (
                <button onClick={() => {
                  setAccount('');
                  setChainId(0);
                  setIsConnected(false);
                  setCountHandle('');
                  setDecryptedCount(null);
                  setFhevmStatus('idle');
                  setFhevmError('');
                  setMessage('');
                }} className="disconnect-btn-header">
                  <svg className="lucide-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  Disconnect
                </button>
              )}
            </div>
            <div className="section-content">
              {!isConnected ? (
                <div className="connection-prompt">
                  <p>Connect your wallet to use FHEVM features</p>
                </div>
              ) : (
                <div className="connection-info">
                  <div className="info-item">
                    <span className="label">Status:</span>
                    <span className="success">Connected</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Address:</span>
                    <span className="address">{account}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Chain ID:</span>
                    <span className="value">{chainId}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Contract:</span>
                    <span className="contract">{contractAddress}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="main-grid">
            {/* FHEVM Counter Demo */}
            {isConnected && fhevmStatus === 'ready' && (
              <div className="section">
                <div className="section-header">
                  <h2>FHEVM Counter Demo</h2>
                  <p className="subtitle">Using REAL FHEVM SDK on Sepolia testnet</p>
                </div>
                <div className="section-content">
                  <div className="demo-controls">
                    <div className="control-group">
                      <button onClick={getCount} className="btn btn-primary">
                        <svg className="lucide-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3v18h18"/>
                          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                        </svg>
                        Get Count
                      </button>
                      {countHandle && (
                        <div className="handle-display">
                          <span className="label">Handle:</span>
                          <span className="handle">{countHandle}</span>
                        </div>
                      )}
                    </div>

                    <div className="control-group">
                      <button 
                        onClick={handleDecrypt} 
                        disabled={!countHandle}
                        className="btn btn-success"
                      >
                        <svg className="lucide-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Decrypt Count
                      </button>
                      {decryptedCount !== null && (
                        <div className="result-display">
                          <span className="label">Decrypted Count:</span>
                          <span className="result">{decryptedCount}</span>
                        </div>
                      )}
                    </div>

                    <div className="control-group">
                      <button 
                        onClick={incrementCounter} 
                        disabled={isProcessing}
                        className="btn btn-warning"
                      >
                        <svg className="lucide-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/>
                          <path d="M12 5v14"/>
                        </svg>
                        Increment
                      </button>
                      <button 
                        onClick={decrementCounter} 
                        disabled={isProcessing}
                        className="btn btn-danger"
                      >
                        <svg className="lucide-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/>
                        </svg>
                        Decrement
                      </button>
                    </div>

                    {message && (
                      <div className="message">
                        {message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Public Decryption Demo */}
            {fhevmStatus === 'ready' && (
              <div className="section">
                <div className="section-header">
                  <h2>Public Decryption Demo</h2>
                  <p className="subtitle">Testing public decryption with hardcoded ciphertexts</p>
                </div>
                <div className="section-content">
                  <div className="demo-controls">
                    {/* Show ciphertexts initially */}
                    <div className="control-group">
                      <div className="handle-display">
                        <span className="label">Encrypted Count Ciphertext:</span>
                        <span className="handle">{HARDCODED_CIPHERTEXTS.encryptedCount}</span>
                      </div>
                      <div className="handle-display">
                        <span className="label">Encrypted Sum Ciphertext:</span>
                        <span className="handle">{HARDCODED_CIPHERTEXTS.encryptedSum}</span>
                      </div>
                    </div>

                    <div className="control-group">
                      <button 
                        onClick={handlePublicDecrypt}
                        disabled={isPublicDecrypting}
                        className="btn btn-primary"
                      >
                        <svg className="lucide-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        {isPublicDecrypting ? 'Decrypting...' : 'Test Public Decrypt'}
                      </button>
                    </div>

                    {/* Show decrypted results only after clicking */}
                    {(publicDecryptedCount !== null || publicDecryptedSum !== null) && (
                      <div className="result-display">
                        <h3 style={{ color: '#ffd208', margin: '0 0 10px 0' }}>Public Decryption Results:</h3>
                        {publicDecryptedCount !== null && (
                          <div className="info-item">
                            <span className="label">Decrypted Count:</span>
                            <span className="result">{publicDecryptedCount}</span>
                          </div>
                        )}
                        {publicDecryptedSum !== null && (
                          <div className="info-item">
                            <span className="label">Decrypted Sum:</span>
                            <span className="result">{publicDecryptedSum}</span>
                          </div>
                        )}
                        <div className="note">
                          These values were decrypted using public decryption (no user signature required)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SDK Info */}
            <div className="section">
              <div className="section-header">
                <h2>Universal FHEVM SDK</h2>
                <p className="subtitle">React compatible implementation</p>
              </div>
              <div className="section-content">
                <div className="features-list">
                  <div className="feature-item">
                    <span className="checkmark">✓</span>
                    <span>React compatible FHEVM</span>
                  </div>
                  <div className="feature-item">
                    <span className="checkmark">✓</span>
                    <span>No webpack bundling issues</span>
                  </div>
                  <div className="feature-item">
                    <span className="checkmark">✓</span>
                    <span>Real contract interactions</span>
                  </div>
                  <div className="feature-item">
                    <span className="checkmark">✓</span>
                    <span>Framework-agnostic core</span>
                  </div>
                  <div className="feature-item">
                    <span className="checkmark">✓</span>
                    <span>Works in React, Next.js, Vue</span>
                  </div>
                  <div className="feature-item">
                    <span className="checkmark">✓</span>
                    <span>Clean, simple API</span>
                  </div>
                </div>
                <div className="note">
                  <strong>Note:</strong> This is a demonstration using REAL FHEVM SDK from Zama's CDN. 
                  The SDK provides actual encryption/decryption functionality on Sepolia testnet.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
