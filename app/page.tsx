'use client';

import { useState, useEffect } from 'react';
import PlanCard from '@/components/PlanCard';
import PlanDetail from '@/components/PlanDetail';
import Login from '@/components/Login';
import { Plan, SubscriptionPlan, SubscriptionResponse } from '@/lib/types';
import { getMerchantPlans, planToSubscriptionPlan, createSubscription } from '@/lib/api';
import { AuthProvider } from '@/contexts/AuthContext';

// Dynamic default for Next.js SSR/CSR
const MERCHANT_ADDRESS = process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS || '0x9e82428d48f3a5DBCAC584Aa3746d2d182A12d5d';

function SubscriptionApp() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

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

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  useEffect(() => {
    if (isLoggedIn) {
      loadMerchantPlans();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    setSelectedPlan(null);
    setPlans([]);
  };

  const loadMerchantPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const merchantPlans = await getMerchantPlans(MERCHANT_ADDRESS);

      // Filter only active plans
      const activePlans = merchantPlans.filter(plan => plan.active);
      setPlans(activePlans);
    } catch (error) {
      console.error('Failed to load merchant plans:', error);
      setError('Failed to load subscription plans. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
          >
            Logout
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">No active subscription plans available.</p>
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
