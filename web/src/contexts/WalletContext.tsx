'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { WalletContextType, WalletState } from '../types/wallet';

const initialState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  isConnecting: false,
  error: null,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<WalletState>(initialState);

  useEffect(() => {
    const checkConnection = async () => {
      try {

        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);

          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const address = accounts[0].address;
            const network = await provider.getNetwork();
            const chainId = Number(network.chainId);
            
            setState({
              isConnected: true,
              address,
              chainId,
              isConnecting: false,
              error: null,
            });
          }
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      }
    };

    checkConnection();

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (...args) => {
        const accounts = args[0] as string[];
        if (accounts.length > 0) {
          setState(prev => ({
            ...prev,
            isConnected: true,
            address: accounts[0],
          }));
        } else {
          setState(initialState);
        }
      });

      window.ethereum.on('chainChanged', (...args) => {
        const chainId = args[0] as string;
        setState(prev => ({
          ...prev,
          chainId: parseInt(chainId, 16),
        }));
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setState({
        ...state,
        error: new Error('No Ethereum wallet found in browser. Please install MetaMask or another compatible wallet.'),
      });
      return;
    }

    setState({
      ...state,
      isConnecting: true,
      error: null,
    });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await provider.listAccounts();
      
      const address = accounts[0].address;
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      setState({
        isConnected: true,
        address,
        chainId,
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setState({
        ...state,
        isConnecting: false,
        error: error instanceof Error ? error : new Error('Failed to connect wallet'),
      });
    }
  };

  const disconnect = () => {

    setState(initialState);
  };

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum?: {
      request: (args: {method: string, params?: unknown[]}) => Promise<unknown>;
      on: (event: string, listener: (...args: unknown[]) => void) => void;
      removeAllListeners: () => void;
    };
  }
} 