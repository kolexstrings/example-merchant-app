import {
  Plan,
  ApiResponse,
  MerchantPlansResponse,
  SubscriptionRequest,
  SubscriptionResponse,
  SubscriptionPlan,
  formatTokenAmount,
  getTokenInfo
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.billingbase.com';

// Generic API fetch function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get all plans for a merchant
export async function getMerchantPlans(merchantAddress: string): Promise<Plan[]> {
  try {
    const response = await apiRequest<Plan[]>(`/api/plans/merchant/${merchantAddress}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch merchant plans:', error);
    throw error;
  }
}

// Get a single plan by ID
export async function getPlanById(planId: string): Promise<Plan> {
  try {
    const response = await apiRequest<Plan>(`/api/plans/${planId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch plan:', error);
    throw error;
  }
}

// Create a subscription
export async function createSubscription(subscriptionData: SubscriptionRequest): Promise<SubscriptionResponse> {
  try {
    const response = await apiRequest<SubscriptionResponse['data']>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Failed to create subscription:', error);
    throw error;
  }
}

// Utility function to convert API Plan to internal SubscriptionPlan format
export function planToSubscriptionPlan(plan: Plan): SubscriptionPlan {
  // Convert price from cents to dollars
  const priceInDollars = parseFloat(plan.priceInCents) / 100;

  // Convert billing interval from seconds to readable format
  const billingInterval = getBillingInterval(plan.billingIntervalSeconds);

  // Convert allowed tokens to features (for display purposes)
  const features = plan.allowedTokens.map(tokenAddress => {
    const token = getTokenInfo(tokenAddress);
    return token ? `Pay with ${token.symbol}` : `Pay with ${tokenAddress.slice(0, 10)}...`;
  });

  return {
    id: plan.id,
    name: plan.name,
    price: priceInDollars,
    currency: plan.currency,
    billingInterval,
    features,
    description: `Pay ${formatTokenAmount(plan.priceInCents, plan.allowedTokens[0] || '')} ${billingInterval}`,
    popular: plan.active, // Use active status as popular flag
  };
}

// Helper function to convert billing interval from seconds to readable format
function getBillingInterval(seconds: string): 'monthly' | 'yearly' | 'weekly' | 'daily' {
  const secondsNum = parseInt(seconds);

  if (secondsNum >= 2592000 && secondsNum < 31536000) { // 30-365 days
    return 'monthly';
  } else if (secondsNum >= 31536000) { // 365+ days
    return 'yearly';
  } else if (secondsNum >= 604800) { // 7+ days
    return 'weekly';
  } else {
    return 'daily';
  }
}

// Mock functions for development (when API is not available)
export async function mockGetMerchantPlans(merchantAddress: string): Promise<Plan[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return [
    {
      id: '1',
      merchant: merchantAddress,
      name: 'Basic Plan',
      priceInCents: '1000', // $10.00
      currency: 'USD',
      billingIntervalSeconds: '2592000', // 30 days
      allowedTokens: [
        '0xA0b86a33E6441A8c5e4D6E5E5E5E5E5E5E5E5E5E5', // USDC
        '0xdAC17F958D2ee523a2206206994597C13D831ec7'  // USDT
      ],
      active: true,
    },
    {
      id: '2',
      merchant: merchantAddress,
      name: 'Pro Plan',
      priceInCents: '2500', // $25.00
      currency: 'USD',
      billingIntervalSeconds: '2592000', // 30 days
      allowedTokens: [
        '0xA0b86a33E6441A8c5e4D6E5E5E5E5E5E5E5E5E5E5', // USDC
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        '0x6B175474E89094C44Da98b954EedeAC495271d0F'  // DAI
      ],
      active: true,
    },
    {
      id: '3',
      merchant: merchantAddress,
      name: 'Premium Plan',
      priceInCents: '5000', // $50.00
      currency: 'USD',
      billingIntervalSeconds: '2592000', // 30 days
      allowedTokens: [
        '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // WETH
        '0xA0b86a33E6441A8c5e4D6E5E5E5E5E5E5E5E5E5E5', // USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F'  // DAI
      ],
      active: false,
    }
  ];
}

export async function mockGetPlanById(planId: string): Promise<Plan> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const mockPlans = await mockGetMerchantPlans('0xa5819482339b0e914ab12f98265fdb0e6400bf91');
  const plan = mockPlans.find(p => p.id === planId);

  if (!plan) {
    throw new Error('Plan not found');
  }

  return plan;
}

export async function mockCreateSubscription(subscriptionData: SubscriptionRequest): Promise<SubscriptionResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    success: true,
    data: {
      subscriptionId: 'sub_' + Math.random().toString(36).substr(2, 9),
      status: 'active',
      message: 'Subscription created successfully',
    },
  };
}
