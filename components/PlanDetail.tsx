import { useState } from "react";
import {
  SubscriptionPlan,
  validatePromoCode,
  DiscountResult,
} from "@/lib/types";

interface PlanDetailProps {
  plan: SubscriptionPlan;
  onBack: () => void;
  onSubscribe: (
    userEmail: string,
    finalPrice: number,
    promoCode?: string
  ) => void;
}

export default function PlanDetail({
  plan,
  onBack,
  onSubscribe,
}: PlanDetailProps) {
  const [promoCode, setPromoCode] = useState("");
  const [discountResult, setDiscountResult] = useState<DiscountResult | null>(
    null
  );
  const [isValidating, setIsValidating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authData, setAuthData] = useState({ name: "", email: "" });

  const formatPrice = (price: number, currency: string, interval: string) => {
    return `$${price}/${
      interval === "monthly" ? "mo" : interval === "yearly" ? "yr" : interval
    }`;
  };

  const getIntervalDisplay = (interval: string) => {
    switch (interval) {
      case "monthly":
        return "per month";
      case "yearly":
        return "per year";
      case "weekly":
        return "per week";
      case "daily":
        return "per day";
      default:
        return `per ${interval}`;
    }
  };

  const handlePromoCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsValidating(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = validatePromoCode(promoCode.trim(), plan.price);
    setDiscountResult(result);
    setIsValidating(false);
  };

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value);
    // Clear previous result when user types
    if (discountResult) {
      setDiscountResult(null);
    }
  };

  const handleSubscribeClick = () => {
    setShowAuthModal(true);
    setAuthMode("register");
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === "register") {
      if (!authData.name.trim() || !authData.email.trim()) {
        alert("Please fill in both name and email");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authData.email)) {
        alert("Please enter a valid email address");
        return;
      }
    } else {
      if (!authData.email.trim()) {
        alert("Please enter your email address");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authData.email)) {
        alert("Please enter a valid email address");
        return;
      }
    }

    // Save user data to localStorage (simulation)
    const userData = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      name: authMode === "register" ? authData.name.trim() : "User",
      email: authData.email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("current_user", JSON.stringify(userData));

    // Proceed with subscription
    handleSubscribeWithDiscount(userData.email);
  };

  const handleSubscribeWithDiscount = (userEmail: string) => {
    const finalPrice = discountResult?.finalPrice || plan.price;
    const promoInfo = discountResult?.promoCode
      ? discountResult.promoCode.code
      : undefined;

    setShowAuthModal(false);
    onSubscribe(userEmail, finalPrice, promoInfo);
  };

  const currentPrice = discountResult?.finalPrice || plan.price;
  const originalPrice = plan.price;
  const hasDiscount =
    discountResult?.isValid && discountResult.discountAmount > 0;

  if (showAuthModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {authMode === "register" ? "Create Account" : "Sign In"}
              </h2>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={authData.name}
                    onChange={(e) =>
                      setAuthData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={authData.email}
                  onChange={(e) =>
                    setAuthData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Continue to Subscription
              </button>

              <button
                type="button"
                onClick={() =>
                  setAuthMode(authMode === "register" ? "login" : "register")
                }
                className="w-full text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                {authMode === "register"
                  ? "Already have an account? Sign in"
                  : "Need an account? Sign up"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
              {hasDiscount && (
                <span className="text-2xl text-gray-400 line-through mr-2">
                  ${originalPrice}
                </span>
              )}
              <span
                className={`text-5xl font-bold ${
                  hasDiscount
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                ${currentPrice}
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

            {hasDiscount && discountResult?.promoCode && (
              <div className="mt-2">
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                  Save ${discountResult.discountAmount.toFixed(2)} with{" "}
                  {discountResult.promoCode.code}
                </span>
              </div>
            )}

            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Billed {getIntervalDisplay(plan.billingInterval)} •{" "}
              {plan.currency}
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
          Have a promo code?
        </h2>
        <form onSubmit={handlePromoCodeSubmit} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={promoCode}
              onChange={handlePromoCodeChange}
              placeholder="Enter promo code"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isValidating}
            />
            <button
              type="submit"
              disabled={!promoCode.trim() || isValidating}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
            >
              {isValidating ? "Validating..." : "Apply"}
            </button>
          </div>

          {discountResult && !discountResult.isValid && promoCode.trim() && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-600 dark:text-red-400 text-sm">
                Invalid promo code. Please check and try again.
              </p>
            </div>
          )}

          {discountResult?.isValid && discountResult.promoCode && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                ✅ {discountResult.promoCode.description}
              </p>
            </div>
          )}
        </form>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>
            Try these codes: <span className="font-mono">SAVE20</span>,{" "}
            <span className="font-mono">WELCOME10</span>,{" "}
            <span className="font-mono">FIRST50</span>
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please sign in or create an account to continue with your
            subscription.
          </p>
        </div>

        <button
          onClick={handleSubscribeClick}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
        >
          Continue to Subscribe
          {hasDiscount &&
            ` - Save $${discountResult?.discountAmount.toFixed(2)}`}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          30-day money-back guarantee • Cancel anytime
        </p>
      </div>
    </div>
  );
}
