// API Response Types
export interface Plan {
  id: string;
  merchant: string;
  name: string;
  priceInCents: string;
  currency: string;
  billingIntervalSeconds: string;
  allowedTokens: string[];
  active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface MerchantPlansResponse {
  success: boolean;
  data: Plan[];
}

export interface SubscriptionRequest {
  planId: number;
  payerToken: string;
  subscriberEmail: string;
}

export interface SubscriptionResponse {
  success: boolean;
  data: {
    subscriptionId: string;
    status: string;
    message: string;
  };
}

// Token mapping system
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

export const TOKEN_MAPPING: Record<string, TokenInfo> = {
  '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582': {
    address: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
    name: 'Wrapped Ethereum',
    symbol: 'WETH',
    decimals: 18
  },
  '0xA0b86a33E6441A8c5e4D6E5E5E5E5E5E5E5E5E5E5': {
    address: '0xA0b86a33E6441A8c5e4D6E5E5E5E5E5E5E5E5E5E5',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  },
  '0x6B175474E89094C44Da98b954EedeAC495271d0F': {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18
  },
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6
  }
};

export const getTokenInfo = (address: string): TokenInfo | null => {
  return TOKEN_MAPPING[address] || null;
};

export const formatTokenAmount = (amountInCents: string, tokenAddress: string): string => {
  const token = getTokenInfo(tokenAddress);
  if (!token) return `${amountInCents} units`;

  const amount = parseFloat(amountInCents);
  const formattedAmount = (amount / Math.pow(10, token.decimals)).toFixed(6);
  return `${formattedAmount} ${token.symbol}`;
};

export const getAllTokens = (): TokenInfo[] => {
  return Object.values(TOKEN_MAPPING);
};

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingInterval: 'monthly' | 'yearly' | 'weekly' | 'daily';
  features: string[];
  description: string;
  popular?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  description: string;
  valid: boolean;
}

export interface DiscountResult {
  isValid: boolean;
  discountAmount: number;
  finalPrice: number;
  promoCode?: PromoCode;
}

// Mock subscription plans for testing
export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 9.99,
    currency: 'USD',
    billingInterval: 'monthly',
    description: 'Perfect for individuals getting started',
    features: [
      'Up to 5 projects',
      'Basic analytics',
      'Email support',
      'Standard templates'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 29.99,
    currency: 'USD',
    billingInterval: 'monthly',
    description: 'Ideal for growing businesses',
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      'Custom templates',
      'API access',
      'Team collaboration'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 99.99,
    currency: 'USD',
    billingInterval: 'monthly',
    description: 'For large organizations with advanced needs',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced security',
      '24/7 phone support',
      'SLA guarantee'
    ]
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    price: 4.99,
    currency: 'USD',
    billingInterval: 'monthly',
    description: 'Great for trying out our service',
    features: [
      '1 project',
      'Basic support',
      'Community templates'
    ]
  }
];

// Mock promo codes for testing
export const mockPromoCodes: PromoCode[] = [
  {
    code: 'SAVE20',
    discountType: 'percentage',
    discountValue: 20,
    description: '20% off your subscription',
    valid: true
  },
  {
    code: 'WELCOME10',
    discountType: 'fixed',
    discountValue: 10,
    description: '$10 off your first month',
    valid: true
  },
  {
    code: 'FIRST50',
    discountType: 'percentage',
    discountValue: 50,
    description: '50% off first month',
    valid: true
  }
];

export const validatePromoCode = (code: string, planPrice: number): DiscountResult => {
  const promoCode = mockPromoCodes.find(
    pc => pc.code.toLowerCase() === code.toLowerCase() && pc.valid
  );

  if (!promoCode) {
    return {
      isValid: false,
      discountAmount: 0,
      finalPrice: planPrice
    };
  }

  let discountAmount = 0;
  if (promoCode.discountType === 'percentage') {
    discountAmount = (planPrice * promoCode.discountValue) / 100;
  } else {
    discountAmount = Math.min(promoCode.discountValue, planPrice);
  }

  const finalPrice = Math.max(0, planPrice - discountAmount);

  return {
    isValid: true,
    discountAmount,
    finalPrice,
    promoCode
  };
};

// Auth utility functions
export const generateUserId = (): string => {
  return 'user_' + Math.random().toString(36).substr(2, 9);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

// Local storage keys
export const STORAGE_KEYS = {
  USERS: 'subscription_app_users',
  CURRENT_USER: 'subscription_app_current_user'
} as const;
