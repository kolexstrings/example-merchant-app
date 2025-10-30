import { SubscriptionPlan } from '@/lib/types';
import { useEffect, useState } from 'react';
import { calculateTokenAmount } from '@/lib/api';
import { getTokenInfo } from '@/lib/types';

interface PlanCardProps {
  plan: SubscriptionPlan;
  onClick: () => void;
}

export default function PlanCard({ plan, onClick }: PlanCardProps) {
  const [tokenPrices, setTokenPrices] = useState<Record<string, string>>({});
  const [loadingTokens, setLoadingTokens] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchAll = async () => {
      const prices: Record<string, string> = {};
      const loading: Record<string, boolean> = {};
      for (const tokenAddress of plan.allowedTokens) {
        loading[tokenAddress] = true;
        try {
          const result = await calculateTokenAmount(tokenAddress, parseInt(plan.priceInCents));
          // If you want to format, you could use result.amount or whatever the API returns
          // Save as e.g. '0.0032 ETH'
          const token = getTokenInfo(tokenAddress);
          prices[tokenAddress] = result?.amount ? `${result.amount} ${token ? token.symbol : ''}` : 'Unavailable';
        } catch {
          prices[tokenAddress] = 'Error';
        }
        loading[tokenAddress] = false;
      }
      setTokenPrices(prices);
      setLoadingTokens(loading);
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id, plan.priceInCents, JSON.stringify(plan.allowedTokens)]);

  const formatPrice = (price: number, currency: string, interval: string) => {
    return `$${price}/${interval === 'monthly' ? 'mo' : interval === 'yearly' ? 'yr' : interval}`;
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-6 bg-white dark:bg-gray-900 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
        plan.popular
          ? 'border-blue-500 shadow-md'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {plan.name}
        </h3>

        {/* Display all token prices here */}
        <div className="mb-4">
          {plan.allowedTokens?.length > 0 ? (
            <div className="space-y-1 flex flex-col items-center">
              {plan.allowedTokens.map(tokenAddress => {
                const token = getTokenInfo(tokenAddress);
                return (
                  <div key={tokenAddress} className="flex items-center gap-2">
                    <span className="text-base text-gray-800 dark:text-gray-200">{token ? token.symbol : tokenAddress.slice(0,6)}</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {loadingTokens[tokenAddress] ? 'Loading...' : tokenPrices[tokenAddress] || '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <span>--</span>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
          {plan.description}
        </p>

        <div className="space-y-2 mb-6">
          {plan.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {feature}
            </div>
          ))}
          {plan.features.length > 3 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              +{plan.features.length - 3} more features
            </div>
          )}
        </div>

        <button className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          plan.popular
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}>
          View Details
        </button>
      </div>
    </div>
  );
}
