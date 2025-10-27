import { useState, useEffect } from "react";
import {
  SubscriptionPlan,
  getTokenInfo,
  formatTokenAmount,
  TokenInfo,
} from "@/lib/types";

interface PlanDetailProps {
  plan: SubscriptionPlan;
  allowedTokens: string[];
  onBack: () => void;
  onSubscribe: (userEmail: string, selectedToken: string, promoCode?: string) => void;
}

export default function PlanDetail({
  plan,
  allowedTokens,
  onBack,
  onSubscribe,
}: PlanDetailProps) {
  const [selectedToken, setSelectedToken] = useState<string>("");

  // Set initial selected token
  useEffect(() => {
    if (allowedTokens.length > 0 && !selectedToken) {
      setSelectedToken(allowedTokens[0]);
    }
  }, [allowedTokens, selectedToken]);

  const handleSubscribeClick = () => {
    if (!selectedToken) {
      alert("Please select a payment token");
      return;
    }

    // For now, use a demo email since we removed auth
    const demoEmail = 'demo@example.com';
    onSubscribe(demoEmail, selectedToken, undefined);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Plans
        </button>

        {plan.popular && (
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        )}
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {plan.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {plan.description}
        </p>

        <div className="mb-6">
          <div className="flex items-baseline justify-center flex-col">
            <div className="flex items-baseline">
              <span
                className="text-5xl font-bold text-gray-900 dark:text-white"
              >
                {formatTokenAmount(plan.price.toString(), selectedToken)}
              </span>
              <span className="text-xl text-gray-500 dark:text-gray-400 ml-2">
                /
                {plan.billingInterval === "monthly"
                  ? "mo"
                  : plan.billingInterval === "yearly"
                  ? "yr"
                  : plan.billingInterval}
              </span>
            </div>

            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Billed {plan.billingInterval} • {plan.currency}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          What's included:
        </h2>
        <div className="space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Payment Method
        </h2>
        <div className="space-y-3">
          {allowedTokens.map((tokenAddress) => {
            const token = getTokenInfo(tokenAddress);
            return (
              <label key={tokenAddress} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <input
                  type="radio"
                  name="paymentToken"
                  value={tokenAddress}
                  checked={selectedToken === tokenAddress}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {token ? token.name : 'Unknown Token'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {token ? token.symbol : tokenAddress.slice(0, 10) + '...'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatTokenAmount(plan.price.toString(), tokenAddress)}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <button
          onClick={handleSubscribeClick}
          disabled={!selectedToken}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
        >
          Subscribe Now
          {selectedToken && ` - Pay with ${getTokenInfo(selectedToken)?.symbol || 'Selected Token'}`}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          30-day money-back guarantee • Cancel anytime
        </p>
      </div>
    </div>
  );
}
