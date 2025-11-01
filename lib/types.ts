// API Response Types
export interface PlanPricingBreakdown {
  priceBeforeVatInCents: number;
  vatPercentage: string;
  vatAmountInCents: number;
  currency: string;
}

export interface Plan {
  id: string;
  merchant: string;
  name: string;
  description: string;
  features: string[];
  totalPriceInCents: string;
  currency: string;
  billingIntervalSeconds: string;
  allowedTokens: string[];
  active: boolean;
  pricingBreakdown: PlanPricingBreakdown;
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
  subscriberWallet?: string;
}

export interface SubscriptionResponse {
  subscriptionId: string;
  transactionHash: string;
  invoiceNumber: string;
  invoiceDueAt: string;
  paymentLink: string;
}

export interface PaymentDetailsResponse {
  subscriptionId: string;
  subscriberAddress: string | null;
  planId: string;
  planName: string;
  planCurrency: string;
  invoiceId: string;
  invoiceNumber: string;
  amountCents: number;
  tokenAmountRaw: string | null;
  tokenAddress: string | null;
  dueAt: string;
  invoiceStatus: string;
  allowedTokens: string[];
  pricingBreakdown?: PlanPricingBreakdown;
}

// Token mapping system
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

export const TOKEN_MAPPING: Record<string, TokenInfo> = {
  "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582": {
    address: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
  },
  "0x777fd819dc63418c648c1b9437d0f8d8211b3c08": {
    address: "0x777fd819dc63418c648c1b9437d0f8d8211b3c08",
    name: "Tether USD",
    symbol: "USDT",
    decimals: 18,
  },
};

export const getTokenInfo = (address: string): TokenInfo | null => {
  if (!address) return null;
  return TOKEN_MAPPING[address.toLowerCase()] || null;
};

export const formatTokenAmount = (
  amountInCents: string,
  tokenAddress: string
): string => {
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
  priceInCents: string;
  currency: string;
  billingInterval: "monthly" | "yearly" | "weekly" | "daily";
  allowedTokens: string[];
  features: string[];
  description: string;
  popular?: boolean;
  pricingBreakdown?: {
    priceBeforeVatInCents: number;
    vatPercentage: string;
    vatAmountInCents: number;
    currency: string;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PromoCode {
  code: string;
  discountType: "percentage" | "fixed";
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

export const validatePromoCode = (
  code: string,
  planPrice: number,
  promoCodes: PromoCode[]
): DiscountResult => {
  const promoCode = promoCodes.find(
    (pc) => pc.code.toLowerCase() === code.toLowerCase() && pc.valid
  );

  if (!promoCode) {
    return {
      isValid: false,
      discountAmount: 0,
      finalPrice: planPrice,
    };
  }

  let discountAmount = 0;
  if (promoCode.discountType === "percentage") {
    discountAmount = (planPrice * promoCode.discountValue) / 100;
  } else {
    discountAmount = Math.min(promoCode.discountValue, planPrice);
  }

  const finalPrice = Math.max(0, planPrice - discountAmount);

  return {
    isValid: true,
    discountAmount,
    finalPrice,
    promoCode,
  };
};

// Auth utility functions
export const generateUserId = (): string => {
  return "user_" + Math.random().toString(36).substr(2, 9);
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
  USERS: "subscription_app_users",
  CURRENT_USER: "subscription_app_current_user",
} as const;
