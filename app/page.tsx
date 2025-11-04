'use client';

import { useState, useEffect, useCallback } from 'react';
import PlanCard from '@/components/PlanCard';
import PlanDetail from '@/components/PlanDetail';
import Login from '@/components/Login';
import MerchantConfigModal from '@/components/MerchantConfigModal';
import { Plan, SubscriptionPlan, SubscriptionResponse } from '@/lib/types';
import { getMerchantPlans, planToSubscriptionPlan, createSubscription } from '@/lib/api';
import { AuthProvider } from '@/contexts/AuthContext';
import { useMerchantConfig } from '@/contexts/MerchantConfigContext';

function SubscriptionApp() {
  const {
    config: merchantConfig,
    isConfigured,
    isLoaded: isMerchantConfigLoaded,
    updateConfig,
    clearConfig,
  } = useMerchantConfig();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Get user from sessionStorage
  const getUser = () => {
    try {
      const userStr = sessionStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const user = getUser();

  const loadMerchantPlans = useCallback(async () => {
    if (!isConfigured || !merchantConfig?.walletAddress) {
      setPlans([]);
      setSelectedPlan(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const merchantPlans = await getMerchantPlans(merchantConfig.walletAddress);

      // Filter only active plans
      const activePlans = merchantPlans.filter(plan => plan.active);
      setPlans(activePlans);
    } catch (error) {
      console.error('Failed to load merchant plans:', error);
      setError('Failed to load subscription plans. Please check your merchant configuration and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured, merchantConfig?.walletAddress]);

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  useEffect(() => {
    if (!isMerchantConfigLoaded) {
      return;
    }

    if (!isConfigured) {
      setShowConfigModal(true);
    }
  }, [isMerchantConfigLoaded, isConfigured]);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    if (!isMerchantConfigLoaded) {
      return;
    }

    loadMerchantPlans();
  }, [isLoggedIn, isMerchantConfigLoaded, loadMerchantPlans]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    setSelectedPlan(null);
    setPlans([]);
  };

  const handleOpenConfig = () => {
    setShowConfigModal(true);
  };

  const handleCloseConfig = () => {
    setShowConfigModal(false);
  };

  const merchantConfigModal = (
    <MerchantConfigModal
      isOpen={showConfigModal}
      onClose={handleCloseConfig}
      onSave={(config) => {
        updateConfig(config);
        setShowConfigModal(false);
      }}
      onClear={() => {
        clearConfig();
        setShowConfigModal(true);
      }}
      initialConfig={merchantConfig}
      requireConfiguration={!isConfigured}
    />
  );

  const handlePlanClick = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleBack = () => {
    setSelectedPlan(null);
  };

  const handleSubscribe = async ({
    userEmail,
    selectedToken,
    subscriberWallet,
    promoCode,
  }: {
    userEmail: string;
    selectedToken: string;
    subscriberWallet: string;
    promoCode?: string;
  }) => {
    console.log("handleSubscribe called with:", {
      userEmail,
      selectedToken,
      subscriberWallet,
      promoCode,
    });
    if (!selectedPlan) {
      console.log("No selectedPlan, returning");
      return;
    }

    setIsSubscribing(true);

    try {
      const subscriptionData = {
        planId: parseInt(selectedPlan.id),
        payerToken: selectedToken,
        subscriberEmail: userEmail,
        subscriberWallet,
      };
      console.log("subscriptionData:", subscriptionData);

      const result = await createSubscription(subscriptionData);
      console.log('Subscription created:', result);

      if (result && result.paymentLink) {
        console.log('Redirecting to payment link:', result.paymentLink);
        window.location.href = result.paymentLink;
      } else {
        alert('❌ Failed to create subscription. Please try again.');
        setIsSubscribing(false);
      }
    } catch (error) {
      console.error('Failed to create subscription:', error);
      alert('❌ Failed to create subscription. Please try again.');
      setIsSubscribing(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Login onSuccess={handleLoginSuccess} />
        {merchantConfigModal}
      </div>
    );
  }

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <PlanDetail
            plan={planToSubscriptionPlan(selectedPlan)}
            allowedTokens={selectedPlan.allowedTokens}
            onBack={handleBack}
            onSubscribe={handleSubscribe}
            isSubscribing={isSubscribing}
          />
        </div>
        {merchantConfigModal}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading subscription plans...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={loadMerchantPlans}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Select the perfect plan for your needs
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleOpenConfig}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm cursor-pointer dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Configure merchant
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            {isConfigured ? (
              <p className="text-gray-600 dark:text-gray-300">
                No active subscription plans available.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                  Configure your merchant credentials to load subscription plans.
                </p>
                <button
                  onClick={handleOpenConfig}
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                >
                  Open configuration
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={planToSubscriptionPlan(plan)}
                onClick={() => handlePlanClick(plan)}
              />
            ))}
          </div>
        )}
      </div>
      {merchantConfigModal}
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <SubscriptionApp />
    </AuthProvider>
  );
}
