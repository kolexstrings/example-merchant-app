'use client';

import { useEffect, useState } from 'react';
import { MerchantConfig } from '@/lib/types';

interface MerchantConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: MerchantConfig) => void;
  onClear: () => void;
  initialConfig: MerchantConfig | null;
  requireConfiguration?: boolean;
}

export default function MerchantConfigModal({
  isOpen,
  onClose,
  onSave,
  onClear,
  initialConfig,
  requireConfiguration = false,
}: MerchantConfigModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isValid = apiKey.trim().length > 0 && walletAddress.trim().length > 0;

  useEffect(() => {
    if (isOpen) {
      setApiKey(initialConfig?.apiKey ?? '');
      setWalletAddress(initialConfig?.walletAddress ?? '');
      setHasSubmitted(false);
    }
  }, [initialConfig, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setHasSubmitted(true);

    if (!isValid) {
      return;
    }

    onSave({
      apiKey: apiKey.trim(),
      walletAddress: walletAddress.trim(),
    });
  };

  const handleClose = () => {
    if (requireConfiguration) {
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Configure Merchant Sandbox
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Enter the merchant credentials you want to test with. These are saved only on this device.
            </p>
          </div>
          {!requireConfiguration && (
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Close configuration"
            >
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Merchant API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Enter your merchant API key"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
            />
            {hasSubmitted && apiKey.trim().length === 0 && (
              <p className="mt-1 text-sm text-red-500">
                API key is required.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Merchant Wallet Address
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(event) => setWalletAddress(event.target.value)}
              placeholder="0x..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
            />
            {hasSubmitted && walletAddress.trim().length === 0 && (
              <p className="mt-1 text-sm text-red-500">
                Wallet address is required.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Configuration is stored in local storage and never sent to the server automatically.
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {initialConfig && !requireConfiguration && (
                <button
                  type="button"
                  onClick={() => {
                    onClear();
                    setApiKey('');
                    setWalletAddress('');
                    setHasSubmitted(false);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Clear settings
                </button>
              )}
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:bg-blue-300"
                disabled={!isValid}
              >
                Save settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
