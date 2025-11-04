import { SubscriptionPlan } from '@/lib/types';

interface PlanCardProps {
  plan: SubscriptionPlan;
  onClick: () => void;
}

export default function PlanCard({ plan, onClick }: PlanCardProps) {
  const usdPrice = parseFloat(plan.priceInCents) / 100;

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

        {/* Display USD price */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ${usdPrice.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
          {plan.description}
        </p>

        <div className="space-y-2 mb-6">
          {plan.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4 text-green-500 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
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

        <button className={`w-full py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer ${
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
