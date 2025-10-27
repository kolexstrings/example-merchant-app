'use client';

import { useState, useEffect } from 'react';
import PlanCard from '@/components/PlanCard';
import PlanDetail from '@/components/PlanDetail';
import { Plan, SubscriptionPlan } from '@/lib/types';
import {
  getMerchantPlans,
  mockGetMerchantPlans,
  planToSubscriptionPlan,
  createSubscription,
  mockCreateSubscription
} from '@/lib/api';
import { AuthProvider } from '@/contexts/AuthContext';

const MERCHANT_ADDRESS = '0xa5819482339b0e914ab12f98265fdb0e6400bf91';

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

      // Try real API first, fall back to mock if it fails
      let merchantPlans: Plan[];
      try {
        merchantPlans = await getMerchantPlans(MERCHANT_ADDRESS);
      } catch (error) {
        console.log('Using mock API data');
        merchantPlans = await mockGetMerchantPlans(MERCHANT_ADDRESS);
      }

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

      // Try real API first, fall back to mock if it fails
      try {
        const result = await createSubscription(subscriptionData);
        console.log('Subscription created:', result);
      } catch (error) {
        console.log('Using mock subscription');
        const result = await mockCreateSubscription(subscriptionData);
        console.log('Mock subscription created:', result);
      }

      alert(`✅ Subscription successful!\n\nPlan: ${selectedPlan.name}\nEmail: ${userEmail}\nToken: ${selectedToken}\n\nYour subscription has been created successfully!`);
      setSelectedPlan(null);
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
