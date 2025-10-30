import {
  Plan,
  ApiResponse,
  MerchantPlansResponse,
  SubscriptionRequest,
  SubscriptionResponse,
  SubscriptionPlan,
  formatTokenAmount,
  getTokenInfo,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.billingbase.com";

// Generic API fetch function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  if (!process.env.NEXT_PUBLIC_MERCHANT_API_KEY) {
    console.error(
      "NEXT_PUBLIC_MERCHANT_API_KEY is not set in environment variables"
    );
  }
  const url = `${API_BASE_URL}${endpoint}`;

  console.log("Debug - Auth Token:", {
    tokenPresent: !!process.env.NEXT_PUBLIC_MERCHANT_API_KEY,
    tokenPrefix:
      process.env.NEXT_PUBLIC_MERCHANT_API_KEY?.substring(0, 5) + "...",
  });

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_MERCHANT_API_KEY || ""}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    console.error("API Request Details:", {
      status: response.status,
      statusText: response.statusText,
      url: url,
      headers: Object.fromEntries(response.headers.entries()),
      apiKey: process.env.MERCHANT_API_KEY ? "Set" : "Not Set",
    });
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `API request failed: ${response.status} ${
        response.statusText
      }\n${JSON.stringify(errorData, null, 2)}`
    );
  }

  return response.json();
}

// Get all plans for a merchant
export async function getMerchantPlans(
  merchantAddress?: string
): Promise<Plan[]> {
  try {
    const address =
      merchantAddress || process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS;
    if (!address) {
      throw new Error("Merchant wallet address is required");
    }
    const response = await apiRequest<Plan[]>(`/api/plans/merchant/${address}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch merchant plans:", error);
    throw error;
  }
}

// Get a single plan by ID
export async function getPlanById(planId: string): Promise<Plan> {
  try {
    const response = await apiRequest<Plan>(`/api/plans/${planId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch plan:", error);
    throw error;
  }
}

// Create a subscription
export async function createSubscription(
  subscriptionData: SubscriptionRequest
): Promise<SubscriptionResponse> {
  try {
    const response = await apiRequest<SubscriptionResponse["data"]>(
      "/api/subscriptions",
      {
        method: "POST",
        body: JSON.stringify(subscriptionData),
      }
    );
    return {
      success: true,
      message: "Subscription created successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to create subscription:", error);
    throw error;
  }
}

// Calculate amount for a token by price in cents
export async function calculateTokenAmount(token: string, priceInCents: number) {
  const response = await apiRequest<any>(
    '/api/charges/calculate-token-amount',
    {
      method: 'POST',
      body: JSON.stringify({ token, priceInCents }),
    }
  );
  return response.data; // shape depends on backend, expected: { amount, token, ... }
}

// Utility function to convert API Plan to internal SubscriptionPlan format
export function planToSubscriptionPlan(plan: Plan): SubscriptionPlan {
  // Convert price from cents to dollars
  const priceInDollars = parseFloat(plan.priceInCents) / 100;

  // Convert billing interval from seconds to readable format
  const billingInterval = getBillingInterval(plan.billingIntervalSeconds);

  // Convert allowed tokens to features (for display purposes)
  const features = plan.allowedTokens.map((tokenAddress) => {
    const token = getTokenInfo(tokenAddress);
    return token
      ? `Pay with ${token.symbol}`
      : `Pay with ${tokenAddress.slice(0, 10)}...`;
  });

  return {
    id: plan.id,
    name: plan.name,
    price: priceInDollars,
    currency: plan.currency,
    billingInterval,
    features,
    description: `Pay ${formatTokenAmount(
      plan.priceInCents,
      plan.allowedTokens[0] || ""
    )} ${billingInterval}`,
    popular: plan.active, // Use active status as popular flag
  };
}

// Helper function to convert billing interval from seconds to readable format
function getBillingInterval(
  seconds: string
): "monthly" | "yearly" | "weekly" | "daily" {
  const secondsNum = parseInt(seconds);

  if (secondsNum >= 2592000 && secondsNum < 31536000) {
    // 30-365 days
    return "monthly";
  } else if (secondsNum >= 31536000) {
    // 365+ days
    return "yearly";
  } else if (secondsNum >= 604800) {
    // 7+ days
    return "weekly";
  } else {
    return "daily";
  }
}

// Mock functions for development (when API is not available)
export async function mockGetMerchantPlans(
  merchantAddress: string
): Promise<Plan[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: "1",
      merchant: merchantAddress,
      name: "Basic Plan",
      priceInCents: "1000", // $10.00
      currency: "USD",
      billingIntervalSeconds: "2592000", // 30 days
      allowedTokens: [
        "0xA0b86a33E6441A8c5e4D6E5E5E5E5E5E5E5E5E5E5", // USDC
        "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
      ],
      active: true,
    },
    {
      id: "2",
      merchant: merchantAddress,
      name: "Pro Plan",
      priceInCents: "2500", // $25.00
      currency: "USD",
      billingIntervalSeconds: "2592000", // 30 days
      allowedTokens: [
        "0xA0b86a33E6441A8c5e4D6E5E5E5E5E5E5E5E5E5E5", // USDC
        "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
        "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
      ],
      active: true,
    },
    {
      id: "3",
      merchant: merchantAddress,
      name: "Premium Plan",
      priceInCents: "5000", // $50.00
      currency: "USD",
      billingIntervalSeconds: "2592000", // 30 days
      allowedTokens: [
        "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582", // WETH
        "0xA0b86a33E6441A8c5e4D6E5E5E5E5E5E5E5E5E5E5", // USDC
        "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
      ],
      active: false,
    },
  ];
}

export async function mockGetPlanById(planId: string): Promise<Plan> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Use env or default address as fallback
  const merchantAddress = process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS || '0x9e82428d48f3a5DBCAC584Aa3746d2d182A12d5d';
  const mockPlans = await mockGetMerchantPlans(merchantAddress);
  const plan = mockPlans.find((p) => p.id === planId);

  if (!plan) {
    throw new Error("Plan not found");
  }
  return plan;
}

export async function mockCreateSubscription(
  subscriptionData: SubscriptionRequest
): Promise<SubscriptionResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    message: "Subscription created successfully",
    data: {
      subscriptionId: "13",
      transactionHash:
        "0xf499687e9fabfa78159dd687d81f93b2b9f3e9ae2163982f29df9a337c49bc5c",
      invoiceNumber: "INV-13-" + Date.now(),
      invoiceDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      paymentLink: "https://your-domain.com/payment?subscriptionId=13",
    },
  };
}
