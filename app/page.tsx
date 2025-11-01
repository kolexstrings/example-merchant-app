'use client';

import { useState, useEffect } from 'react';
import PlanCard from '@/components/PlanCard';
import PlanDetail from '@/components/PlanDetail';
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

  useEffect(() => {
    loadMerchantPlans();
  }, []);

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

  const handleSubscribe = async (
    userEmail: string,
    selectedToken: string,
    promoCode?: string
  ) => {
    if (!selectedPlan) return;

    try {
      const subscriptionData = {
        planId: parseInt(selectedPlan.id),
        payerToken: selectedToken,
        subscriberEmail: userEmail
      };

      const result: SubscriptionResponse = await createSubscription(subscriptionData);

      console.log('Subscription created:', result);

      // Redirect to payment link instead of showing alert
      if (result.success && result.data.paymentLink) {
        console.log('Redirecting to payment link:', result.data.paymentLink);

        // In development, show alert with payment link instead of redirecting
        if (process.env.NODE_ENV === 'development') {
          alert(`✅ Subscription created successfully!\n\nPlan: ${selectedPlan.name}\nEmail: ${userEmail}\nToken: ${selectedToken}\nPayment Link: ${result.data.paymentLink}\n\nIn production, you would be redirected to this payment link.`);
        } else {
          window.location.href = result.data.paymentLink;
        }
      } else {
        alert('❌ Failed to create subscription. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create subscription:', error);
      alert('❌ Failed to create subscription. Please try again.');
    }
  };

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <PlanDetail
            plan={planToSubscriptionPlan(selectedPlan)}
            allowedTokens={selectedPlan.allowedTokens}
            onBack={handleBack}
            onSubscribe={handleSubscribe}
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
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Select the perfect plan for your needs
          </p>
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
