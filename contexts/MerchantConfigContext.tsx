'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { MerchantConfig, STORAGE_KEYS } from '@/lib/types';
import {
  applyMerchantConfig,
  clearMerchantConfigOverride,
} from '@/lib/api';

interface MerchantConfigContextValue {
  config: MerchantConfig | null;
  isConfigured: boolean;
  isLoaded: boolean;
  updateConfig: (config: MerchantConfig) => void;
  clearConfig: () => void;
}

const MerchantConfigContext = createContext<MerchantConfigContextValue | undefined>(
  undefined
);

export function MerchantConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<MerchantConfig | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedConfig = localStorage.getItem(STORAGE_KEYS.MERCHANT_CONFIG);
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig) as MerchantConfig;
        setConfigState({
          apiKey: parsedConfig.apiKey,
          walletAddress: parsedConfig.walletAddress,
        });
      }
    } catch (error) {
      console.error('Failed to parse merchant configuration from storage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const persistConfig = (newConfig: MerchantConfig) => {
    const sanitizedConfig: MerchantConfig = {
      apiKey: newConfig.apiKey.trim(),
      walletAddress: newConfig.walletAddress.trim(),
    };

    setConfigState(sanitizedConfig);

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        STORAGE_KEYS.MERCHANT_CONFIG,
        JSON.stringify(sanitizedConfig)
      );
    }
  };

  const clearConfig = () => {
    setConfigState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.MERCHANT_CONFIG);
    }
  };

  const value = useMemo<MerchantConfigContextValue>(() => {
    const isConfigured = Boolean(
      config?.apiKey?.trim() && config?.walletAddress?.trim()
    );

    return {
      config,
      isConfigured,
      isLoaded,
      updateConfig: persistConfig,
      clearConfig,
    };
  }, [config, isLoaded]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (config && config.apiKey && config.walletAddress) {
      applyMerchantConfig(config);
    } else {
      clearMerchantConfigOverride();
    }
  }, [config, isLoaded]);

  return (
    <MerchantConfigContext.Provider value={value}>
      {children}
    </MerchantConfigContext.Provider>
  );
}

export function useMerchantConfig(): MerchantConfigContextValue {
  const context = useContext(MerchantConfigContext);
  if (!context) {
    throw new Error('useMerchantConfig must be used within a MerchantConfigProvider');
  }
  return context;
}
