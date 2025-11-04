import { useState, useEffect } from "react";
import {
  SubscriptionPlan,
  getTokenInfo,
  formatTokenAmount,
  TokenInfo,
} from "@/lib/types";
import { calculateTokenAmount } from "@/lib/api";

interface PlanDetailProps {
  plan: SubscriptionPlan;
  allowedTokens: string[];
  onBack: () => void;
  onSubscribe: (params: {
    userEmail: string;
    selectedToken: string;
    subscriberWallet: string;
    promoCode?: string;
  }) => void;
  isSubscribing: boolean;
}

export default function PlanDetail({
  plan,
  allowedTokens,
  onBack,
  onSubscribe,
  isSubscribing,
}: PlanDetailProps) {
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [tokenPrices, setTokenPrices] = useState<Record<string, string>>({});
  const [loadingToken, setLoadingToken] = useState<Record<string, boolean>>({});

  // Filter to only known tokens
  const knownTokens = allowedTokens.filter(
    (tokenAddress) => getTokenInfo(tokenAddress) !== null
  );

  // Set initial selected token
  useEffect(() => {
    if (knownTokens.length > 0 && !selectedToken) {
      setSelectedToken(knownTokens[0]);
    }
  }, [knownTokens, selectedToken]);

  useEffect(() => {
    // Fetch all tokens' prices on mount/plan/allowedTokens change
    const fetchAll = async () => {
      const prices: Record<string, string> = {};
      const loading: Record<string, boolean> = {};
      for (const tokenAddress of allowedTokens) {
        loading[tokenAddress] = true;
        try {
          const result = await calculateTokenAmount(
            tokenAddress,
            parseInt(plan.priceInCents)
          );
          const token = getTokenInfo(tokenAddress);
          if (result?.tokenAmount && token) {
            const amount =
              parseFloat(result.tokenAmount) / Math.pow(10, token.decimals);
            prices[tokenAddress] = amount.toFixed(6);
          } else {
            prices[tokenAddress] = "Unavailable";
          }
        } catch {
          prices[tokenAddress] = "Error";
        }
        loading[tokenAddress] = false;
      }
      setTokenPrices(prices);
      setLoadingToken(loading);
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id, plan.priceInCents, JSON.stringify(allowedTokens)]);

  const handleSubscribeClick = () => {
    console.log("Subscribe button clicked");
    console.log("selectedToken:", selectedToken);
    if (!selectedToken) {
      console.log("No token selected, alerting user");
      alert("Please select a payment token");
      return;
    }

    // Get user email from sessionStorage
    const userStr = sessionStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const userEmail = user?.email || "demo@example.com";
    const subscriberWallet = (user?.walletAddress || "").trim();

    if (!subscriberWallet) {
      alert("Please log in with a wallet address before subscribing.");
      return;
    }

    console.log("userEmail:", userEmail);
    console.log("Calling onSubscribe with:", {
      userEmail,
      selectedToken,
      subscriberWallet,
      promoCode: undefined,
    });
    onSubscribe({
      userEmail,
      selectedToken,
      subscriberWallet,
      promoCode: undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
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

        {/* Price heading area */}
        <div className="mb-6">
          <div className="flex items-baseline justify-center flex-col">
            <div className="flex items-baseline">
              <span className="text-5xl font-bold text-gray-900 dark:text-white">
                ${(parseFloat(plan.priceInCents) / 100).toFixed(2)}
              </span>
              <span className="text-xl text-gray-500 dark:text-gray-400 ml-2">
                / mo
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Billed monthly • {plan.currency}
            </p>
            {plan.pricingBreakdown && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Price before VAT:</span>
                  <span>
                    $
                    {(
                      plan.pricingBreakdown.priceBeforeVatInCents / 100
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VAT ({plan.pricingBreakdown.vatPercentage}%):</span>
                  <span>
                    ${(plan.pricingBreakdown.vatAmountInCents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-gray-900 dark:text-white">
                  <span>Total:</span>
                  <span>
                    ${(parseFloat(plan.priceInCents) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
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
          Payment Token
        </h2>
        <div className="space-y-3">
          {knownTokens.map((tokenAddress) => {
            const token = getTokenInfo(tokenAddress)!; // Safe to assert since filtered
            return (
              <label
                key={tokenAddress}
                className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
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
                        {token.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {token.symbol}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {loadingToken[tokenAddress] ||
                        !tokenPrices[tokenAddress] ? (
                          <div className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        ) : (
                          tokenPrices[tokenAddress]
                        )}
                      </div>
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
          disabled={!selectedToken || isSubscribing}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
        >
          {isSubscribing
            ? "Redirecting to payment page to complete payment..."
            : `Subscribe & Pay${
                selectedToken
                  ? ` with ${
                      getTokenInfo(selectedToken)?.symbol || "Selected Token"
                    }`
                  : ""
              }`}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          You will be redirected to complete payment after subscription creation
        </p>
      </div>
    </div>
  );
}
