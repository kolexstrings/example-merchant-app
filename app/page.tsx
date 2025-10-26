'use client';

import { useState } from 'react';
import PlanCard from '@/components/PlanCard';
import PlanDetail from '@/components/PlanDetail';
import { mockSubscriptionPlans, SubscriptionPlan } from '@/lib/types';

function SubscriptionApp() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const handlePlanClick = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleBack = () => {
    setSelectedPlan(null);
  };

  const handleSubscribe = (userEmail: string, finalPrice: number, promoCode?: string) => {
    const planName = selectedPlan?.name;
    const promoInfo = promoCode ? ` with promo code ${promoCode}` : '';

    // Here you would send this data to your subscription endpoint
    const subscriptionData = {
      email: userEmail,
      plan: planName,
      finalPrice,
      promoCode,
      timestamp: new Date().toISOString()
    };

    console.log('Subscription data to send to API:', subscriptionData);

    alert(`✅ Subscription successful!\n\nPlan: ${planName}\nEmail: ${userEmail}\nFinal Price: $${finalPrice}${promoInfo}\n\nThis data would be sent to your subscription endpoint.`);
    setSelectedPlan(null);
  };

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <PlanDetail
            plan={selectedPlan}
            onBack={handleBack}
            onSubscribe={handleSubscribe}
          />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {mockSubscriptionPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onClick={() => handlePlanClick(plan)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return <SubscriptionApp />;
}
