<template>
  <div class="app">
    <!-- FHEVM Header -->
    <header class="header">
      <div class="header-content">
        <h1 class="app-title">Universal FHEVM SDK - Vue Showcase</h1>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        
        <!-- FHEVM Status -->
        <div class="section">
          <div class="section-header">
            <h2>FHEVM Status</h2>
            <span class="status-badge" :class="fhevmStatus">{{ fhevmStatus.toUpperCase() }}</span>
          </div>
          <div class="section-content">
            <p v-if="fhevmError" class="error">Error: {{ fhevmError }}</p>
            <p v-if="fhevmStatus === 'ready'" class="success">FHEVM Ready</p>
          </div>
        </div>

        <!-- Wallet Connection -->
        <div class="section">
          <div class="section-header">
            <h2>Wallet Connection</h2>
            <button v-if="!isConnected" @click="connectWallet" class="connect-btn-header">
              Connect Wallet
            </button>
            <button v-else @click="disconnectWallet" class="disconnect-btn-header">
              <svg class="lucide-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
              Disconnect
            </button>
          </div>
          <div class="section-content">
            <div v-if="!isConnected" class="connection-prompt">
              <p>Connect your wallet to use FHEVM features</p>
            </div>
            <div v-else class="connection-info">
              <div class="info-item">
                <span class="label">Status:</span>
                <span class="success">Connected</span>
              </div>
              <div class="info-item">
                <span class="label">Address:</span>
                <span class="address">{{ account }}</span>
              </div>
              <div class="info-item">
                <span class="label">Chain ID:</span>
                <span class="value">{{ chainId }}</span>
              </div>
              <div class="info-item">
                <span class="label">Contract:</span>
                <span class="contract">{{ contractAddress }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="main-grid">
          <!-- FHEVM Counter Demo -->
          <div v-if="isConnected && fhevmStatus === 'ready'" class="section">
            <div class="section-header">
              <h2>FHEVM Counter Demo</h2>
              <p class="subtitle">Using REAL FHEVM SDK on Sepolia testnet</p>
            </div>
            <div class="section-content">
              <div class="demo-controls">
                <div class="control-group">
                  <button @click="getCount" class="btn btn-primary">
                    <svg class="lucide-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 3v18h18"/>
                      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                    </svg>
                    Get Count
                  </button>
                  <div v-if="countHandle" class="handle-display">
                    <span class="label">Handle:</span>
                    <span class="handle">{{ countHandle }}</span>
                  </div>
                </div>

                <div class="control-group">
                  <button 
                    @click="handleDecrypt" 
                    :disabled="!countHandle"
                    class="btn btn-success"
                  >
                    <svg class="lucide-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Decrypt Count
                  </button>
                  <div v-if="decryptedCount !== null" class="result-display">
                    <span class="label">Decrypted Count:</span>
                    <span class="result">{{ decryptedCount }}</span>
                  </div>
                </div>

                <div class="control-group">
                  <button 
                    @click="incrementCounter" 
                    :disabled="isProcessing"
                    class="btn btn-warning"
                  >
                    <svg class="lucide-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 12h14"/>
                      <path d="M12 5v14"/>
                    </svg>
                    Increment
                  </button>
                  <button 
                    @click="decrementCounter" 
                    :disabled="isProcessing"
                    class="btn btn-danger"
                  >
                    <svg class="lucide-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 12h14"/>
                    </svg>
                    Decrement
                  </button>
                </div>

                <div v-if="message" class="message">
                  {{ message }}
                </div>
              </div>
            </div>
          </div>

          <!-- SDK Info -->
          <div class="section">
            <div class="section-header">
              <h2>Universal FHEVM SDK</h2>
              <p class="subtitle">Vue compatible implementation</p>
            </div>
            <div class="section-content">
              <div class="features-list">
                <div class="feature-item">
                  <span class="checkmark">✓</span>
                  <span>Vue compatible FHEVM</span>
                </div>
                <div class="feature-item">
                  <span class="checkmark">✓</span>
                  <span>No webpack bundling issues</span>
                </div>
                <div class="feature-item">
                  <span class="checkmark">✓</span>
                  <span>Real contract interactions</span>
                </div>
                <div class="feature-item">
                  <span class="checkmark">✓</span>
                  <span>Framework-agnostic core</span>
                </div>
                <div class="feature-item">
                  <span class="checkmark">✓</span>
                  <span>Works in React, Next.js, Vue</span>
                </div>
                <div class="feature-item">
                  <span class="checkmark">✓</span>
                  <span>Clean, simple API</span>
                </div>
              </div>
              <div class="note">
                <strong>Note:</strong> This is a demonstration using REAL FHEVM SDK from Zama's CDN. 
                The SDK provides actual encryption/decryption functionality on Sepolia testnet.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ethers } from 'ethers'
import { initializeFheInstance, decryptValue, createEncryptedInput } from '@fhevm-sdk'

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

// Reactive state
const account = ref<string>('')
const chainId = ref<number>(0)
const isConnected = ref(false)
const fheInstance = ref<any>(null)
const countHandle = ref<string>('')
const decryptedCount = ref<number | null>(null)
const isProcessing = ref(false)
const message = ref<string>('')
const fhevmStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const fhevmError = ref<string>('')

const contractAddress = computed(() => 
  CONTRACT_ADDRESSES[chainId.value as keyof typeof CONTRACT_ADDRESSES] || 'Not supported chain'
)

// Initialize FHEVM
const initializeFhevm = async () => {
  try {
    fhevmStatus.value = 'loading'
    fhevmError.value = ''
    const instance = await initializeFheInstance()
    fheInstance.value = instance
    fhevmStatus.value = 'ready'
    console.log('✅ FHEVM initialized for Vue!')
  } catch (error) {
    console.error('❌ FHEVM initialization failed:', error)
    fhevmStatus.value = 'error'
    fhevmError.value = error instanceof Error ? error.message : 'Unknown error'
  }
}

// Wallet connection
const connectWallet = async () => {
  console.log('Attempting to connect wallet...')
  
  if (typeof window === 'undefined') {
    console.error('Window is undefined - not in browser environment')
    return
  }
  
  if (!window.ethereum) {
    console.error('No Ethereum provider found. Please install MetaMask or connect a wallet.')
    alert('Please install MetaMask or connect a wallet to use this app.')
    return
  }
  
  try {
    console.log('Requesting accounts...')
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    console.log('Accounts received:', accounts)
    
    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
    console.log('Chain ID:', chainIdHex)
    
    account.value = accounts[0]
    chainId.value = parseInt(chainIdHex, 16)
    isConnected.value = true
    
    console.log('Wallet connected successfully!')
    
    // Initialize FHEVM after wallet connection
    await initializeFhevm()
  } catch (error) {
    console.error('Wallet connection failed:', error)
    alert(`Wallet connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Disconnect wallet
const disconnectWallet = () => {
  account.value = ''
  chainId.value = 0
  isConnected.value = false
  fheInstance.value = null
  countHandle.value = ''
  decryptedCount.value = null
  fhevmStatus.value = 'idle'
  fhevmError.value = ''
  message.value = ''
  console.log('Wallet disconnected')
}

// Get encrypted count from contract
const getCount = async () => {
  if (!isConnected.value || !contractAddress.value || !window.ethereum) return
  
  try {
    message.value = 'Reading contract...'
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(contractAddress.value, CONTRACT_ABI, provider)
    const result = await contract.getCount()
    countHandle.value = result
    message.value = 'Contract read successfully!'
    setTimeout(() => message.value = '', 3000)
  } catch (error) {
    console.error('Get count failed:', error)
    message.value = 'Failed to get count'
  }
}

// Decrypt count using EIP-712
const handleDecrypt = async () => {
  if (!countHandle.value || !window.ethereum) return
  
  try {
    message.value = 'Decrypting with EIP-712 user decryption...'
    
    // Get signer for EIP-712 signature
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    
    const result = await decryptValue(countHandle.value, contractAddress.value, signer)
    decryptedCount.value = result
    message.value = 'EIP-712 decryption completed!'
    setTimeout(() => message.value = '', 3000)
  } catch (error) {
    console.error('Decryption failed:', error)
    message.value = 'Decryption failed'
  }
}

// Increment counter
const incrementCounter = async () => {
  if (!isConnected.value || !contractAddress.value || !window.ethereum || !fheInstance.value) return
  
  try {
    isProcessing.value = true
    message.value = 'Starting increment transaction...'
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress.value, CONTRACT_ABI, signer)
    
    message.value = 'Encrypting input...'
    const encryptedInput = await createEncryptedInput(contractAddress.value, account.value, 1)
    
    message.value = 'Sending transaction...'
    const tx = await contract.increment(encryptedInput.encryptedData, encryptedInput.proof)
    
    message.value = 'Waiting for confirmation...'
    const receipt = await tx.wait()
    
    message.value = 'Increment completed!'
    console.log('✅ Increment transaction completed:', receipt)
    
    setTimeout(() => message.value = '', 3000)
  } catch (error) {
    console.error('Increment failed:', error)
    message.value = 'Increment failed'
  } finally {
    isProcessing.value = false
  }
}

// Decrement counter
const decrementCounter = async () => {
  if (!isConnected.value || !contractAddress.value || !window.ethereum || !fheInstance.value) return
  
  try {
    isProcessing.value = true
    message.value = 'Starting decrement transaction...'
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress.value, CONTRACT_ABI, signer)
    
    message.value = 'Encrypting input...'
    const encryptedInput = await createEncryptedInput(contractAddress.value, account.value, 1)
    
    message.value = 'Sending transaction...'
    const tx = await contract.decrement(encryptedInput.encryptedData, encryptedInput.proof)
    
    message.value = 'Waiting for confirmation...'
    const receipt = await tx.wait()
    
    message.value = 'Decrement completed!'
    console.log('✅ Decrement transaction completed:', receipt)
    
    setTimeout(() => message.value = '', 3000)
  } catch (error) {
    console.error('Decrement failed:', error)
    message.value = 'Decrement failed'
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #000;
  color: white;
}

/* FHEVM Header */
.header {
  background-color: #ffd208;
  padding: 1.5rem 0;
  border-bottom: 1px solid #000;
  z-index: 999;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.app-title {
  color: #000;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

/* Main Content */
.main-content {
  background-color: #000;
  min-height: calc(100vh - 120px);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}


.section {
  background-color: #1a1a1a;
  margin-bottom: 2rem;
  border-radius: 16px;
  border: 1px solid #333;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.section-header {
  background-color: #2a2a2a;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  color: #ffd208;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.subtitle {
  color: #888;
  font-size: 0.9rem;
  margin: 0.5rem 0 0 0;
  font-weight: 400;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.ready {
  background-color: #4caf50;
  color: white;
}

.status-badge.loading {
  background-color: #ff9800;
  color: white;
}

.status-badge.error {
  background-color: #f44336;
  color: white;
}

.status-badge.idle {
  background-color: #666;
  color: white;
}

.section-content {
  padding: 2rem;
}

.section-content p {
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.connection-prompt {
  text-align: center;
  padding: 2rem;
}

.connection-info {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #000;
  border-radius: 8px;
  border: 1px solid #333;
}

.label {
  color: #888;
  font-weight: 500;
}

.value, .address, .contract {
  color: #e0e0e0;
  font-family: monospace;
  font-size: 0.9rem;
}

.address, .contract {
  word-break: break-all;
  max-width: 300px;
  text-align: right;
}

.demo-controls {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.handle-display, .result-display {
  padding: 1rem;
  background-color: #000;
  border-radius: 8px;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.handle {
  font-family: monospace;
  font-size: 0.8rem;
  color: #888;
  word-break: break-all;
}

.result {
  color: #4caf50;
  font-weight: bold;
  font-size: 1.1rem;
}

.features-list {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #000;
  border-radius: 8px;
  border: 1px solid #333;
}

.checkmark {
  color: #4caf50;
  font-weight: bold;
  font-size: 1.2rem;
}

.button-group {
  margin: 1.5rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.btn {
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.icon {
  font-size: 1rem;
  font-weight: bold;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #1e7e34;
}

.btn-warning {
  background-color: #ffd208;
  color: #000;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e6bc00;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.connect-btn {
  background-color: #ffd208;
  color: #000;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.connect-btn:hover {
  background-color: #e6bc00;
}

.connect-btn-header {
  background-color: #ffd208;
  color: #000;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  font-size: 0.85rem;
  min-width: 100px;
}

.connect-btn-header:hover {
  background-color: #e6bc00;
}

.disconnect-btn-header {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  font-size: 0.85rem;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.disconnect-btn-header:hover {
  background-color: #c82333;
}

.lucide-icon {
  flex-shrink: 0;
}

.disconnect-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
}


.result {
  color: #4caf50;
  font-weight: bold;
  font-size: 1.1rem;
}

.message {
  padding: 1rem;
  background-color: #000;
  border-radius: 8px;
  margin-top: 1rem;
  color: #e0e0e0;
  border-left: 4px solid #ffd208;
  border: 1px solid #333;
}

.success {
  color: #4caf50;
}

.error {
  color: #f44336;
}

.note {
  font-size: 0.9em;
  color: #888;
  margin-top: 1rem;
  padding: 1rem;
  background-color: #000;
  border-radius: 8px;
  border: 1px solid #333;
}


/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .main-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .app-title {
    font-size: 1.5rem;
  }
  
  .section {
    margin-bottom: 1rem;
  }
  
  .section-header {
    padding: 1rem;
  }
  
  .section-content {
    padding: 1rem;
  }
  
  .button-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn {
    width: 100%;
    margin-right: 0;
  }
  
  .demo-controls {
    gap: 1rem;
  }
  
  .control-group {
    gap: 0.5rem;
  }
}
</style>
