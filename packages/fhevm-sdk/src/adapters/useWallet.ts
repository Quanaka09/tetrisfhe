/**
 * Wagmi-like hook for wallet connection
 */

import { useState, useCallback } from 'react';

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















