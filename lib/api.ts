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

  console.log("API Base URL:", API_BASE_URL);
  console.log("Full URL:", url);

  console.log("Debug - Auth Token:", {
    tokenPresent: !!process.env.NEXT_PUBLIC_MERCHANT_API_KEY,
    tokenPrefix:
      process.env.NEXT_PUBLIC_MERCHANT_API_KEY?.substring(0, 5) + "...",
  });

  console.log(
    "API Key from .env:",
    process.env.NEXT_PUBLIC_MERCHANT_API_KEY ? "Loaded" : "Not found"
  );

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
      apiKey: process.env.NEXT_PUBLIC_MERCHANT_API_KEY ? "Set" : "Not Set",
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
    console.log("API Response:", response);
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
  data: SubscriptionRequest
): Promise<SubscriptionResponse> {
  const response = await apiRequest<SubscriptionResponse>("/api/subscriptions", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data;
}

// Calculate amount for a token by price in cents
export async function calculateTokenAmount(
  token: string,
  priceInCents: number
) {
  const response = await apiRequest<any>(
    "/api/charges/calculate-token-amount",
    {
      method: "POST",
      body: JSON.stringify({ token, priceInCents }),
    }
  );
  console.log("Token amount:", response);
  return response.data; // shape depends on backend, expected: { amount, token, ... }
}

// Utility function to convert API Plan to internal SubscriptionPlan format
export function planToSubscriptionPlan(plan: Plan): SubscriptionPlan {
  // Convert price from cents to dollars
  const priceInDollars = parseFloat(plan.totalPriceInCents) / 100;

  // Convert billing interval from seconds to readable format
  const billingInterval = getBillingInterval(plan.billingIntervalSeconds);

  // Prepare token descriptions for potential fallback usage
  const tokenDescriptions = plan.allowedTokens.map((tokenAddress) => {
    const token = getTokenInfo(tokenAddress);
    return token
      ? `Pay with ${token.symbol}`
      : `Pay with ${tokenAddress.slice(0, 10)}...`;
  });

  return {
    id: plan.id,
    name: plan.name,
    price: priceInDollars,
    priceInCents: plan.totalPriceInCents,
    currency: plan.currency,
    billingInterval,
    allowedTokens: plan.allowedTokens,
    features: plan.features.length ? plan.features : tokenDescriptions,
    description:
      plan.description ||
      `Pay ${formatTokenAmount(
        plan.totalPriceInCents,
        plan.allowedTokens[0] || ""
      )} ${billingInterval}`,
    popular: plan.active, // Use active status as popular flag
    pricingBreakdown: plan.pricingBreakdown,
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
