import {
  Plan,
  ApiPlan,
  ApiResponse,
  MerchantPlansResponse,
  SubscriptionRequest,
  SubscriptionResponse,
  SubscriptionPlan,
  formatTokenAmount,
  getTokenInfo,
  MerchantConfig,
} from "./types";

const PROD_API_BASE_URL = "https://api.billingbase.com";
const LOCAL_API_BASE_URL = "http://localhost:8080";
const LOG_PREFIX = "[MerchantAPI]";

let merchantConfigOverride: MerchantConfig | null = null;

export function applyMerchantConfig(config: MerchantConfig) {
  merchantConfigOverride = {
    apiKey: config.apiKey.trim(),
    walletAddress: config.walletAddress.trim(),
  };
}

export function clearMerchantConfigOverride() {
  merchantConfigOverride = null;
}

function resolveApiBaseUrl() {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (envBase) {
    return envBase;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return LOCAL_API_BASE_URL;
    }
  } else if (process.env.NODE_ENV === "development") {
    return LOCAL_API_BASE_URL;
  }

  return PROD_API_BASE_URL;
}

// Generic API fetch function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const apiBaseUrl = resolveApiBaseUrl();
  const apiKey = merchantConfigOverride?.apiKey;

  if (!apiKey) {
    console.warn("Merchant API key is not configured");
  }

  const url = `${apiBaseUrl}${endpoint}`;

  const headers = new Headers(options.headers as HeadersInit);
  headers.set("Content-Type", "application/json");
  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }

  const requestMetadata = {
    url,
    baseUrl: apiBaseUrl,
    endpoint,
    method: options.method || "GET",
    hasApiKey: Boolean(apiKey),
    origin: typeof window !== "undefined" ? window.location.origin : undefined,
  };

  console.info(`${LOG_PREFIX} Initiating request`, requestMetadata);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} Network error before response`, {
      ...requestMetadata,
      error,
      errorName: (error as any)?.name,
      errorMessage: (error as any)?.message,
      errorStack: (error as any)?.stack,
      errorToString: String(error),
    });
    throw error;
  }

  if (!response.ok) {
    console.error(`${LOG_PREFIX} Non-success response`, {
      ...requestMetadata,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `API request failed: ${response.status} ${
        response.statusText
      }\n${JSON.stringify(errorData, null, 2)}`,
    );
  }

  console.info(`${LOG_PREFIX} Request succeeded`, {
    ...requestMetadata,
    status: response.status,
  });

  return response.json();
}

function normalizeApiPlan(plan: ApiPlan): Plan {
  const pricingEntries = plan.pricing && Object.entries(plan.pricing);
  const [primaryCurrency, primaryEntry] = pricingEntries?.[0] || ["USD", {}];

  const amountMinorUnits = (() => {
    if (!primaryEntry) return 0;
    if (typeof primaryEntry.amountCents === "number") {
      return primaryEntry.amountCents;
    }
    if (typeof primaryEntry.amountInKobo === "number") {
      return primaryEntry.amountInKobo;
    }
    return 0;
  })();

  const totalPriceInCents = String(amountMinorUnits);
  const price = amountMinorUnits / 100;

  const allowedTokens = plan.allowedTokens.map((token) =>
    typeof token === "string" ? token : token.address,
  );

  return {
    id: plan.id,
    merchant: plan.merchant,
    name: plan.name || "Untitled Plan",
    description: plan.description || "",
    features: plan.features && plan.features.length > 0 ? plan.features : [],
    totalPriceInCents,
    currency: primaryCurrency,
    billingIntervalSeconds: plan.billingIntervalSeconds,
    allowedTokens,
    active: plan.active,
    pricingBreakdown: plan.pricingBreakdown,
    pricing: plan.pricing,
    price,
    priceInCents: totalPriceInCents,
    billingInterval: "monthly",
  } as Plan;
}

// Get all plans for a merchant
export async function getMerchantPlans(
  merchantAddress?: string,
): Promise<Plan[]> {
  try {
    const address = merchantAddress || merchantConfigOverride?.walletAddress;
    if (!address) {
      throw new Error(
        "Merchant wallet address is required. Please configure the merchant settings.",
      );
    }
    const response = await apiRequest<ApiPlan[]>(
      `/api/plans/merchant/${address}`,
    );
    console.log("API Response:", response);
    return response.data.map(normalizeApiPlan);
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
  data: SubscriptionRequest,
): Promise<SubscriptionResponse> {
  const response = await apiRequest<SubscriptionResponse>(
    "/api/subscriptions",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
  return response.data;
}

// Calculate amount for a token by price in cents
export async function calculateTokenAmount(
  token: string,
  priceInCents: number,
) {
  const response = await apiRequest<any>(
    "/api/charges/calculate-token-amount",
    {
      method: "POST",
      body: JSON.stringify({ token, priceInCents }),
    },
  );
  console.log("Token amount:", response);
  return response.data; // shape depends on backend, expected: { amount, token, ... }
}

// Utility function to convert API Plan to internal SubscriptionPlan format
export function planToSubscriptionPlan(plan: Plan): SubscriptionPlan {
  const normalizeTokenAddress = (token: any): string => {
    if (!token) return "";
    if (typeof token === "string") return token;
    if (typeof token === "object" && typeof token.address === "string") {
      return token.address;
    }
    return String(token ?? "");
  };

  // Convert price from cents to dollars
  const priceInDollars = parseFloat(plan.totalPriceInCents) / 100;

  // Convert billing interval from seconds to readable format
  const billingInterval = getBillingInterval(plan.billingIntervalSeconds);

  // Prepare token descriptions for potential fallback usage
  const tokenDescriptions = plan.allowedTokens.map((tokenAddress) => {
    const normalizedAddress = normalizeTokenAddress(tokenAddress);
    const token = getTokenInfo(normalizedAddress);
    return token
      ? `Pay with ${token.symbol}`
      : normalizedAddress
        ? `Pay with ${normalizedAddress.slice(0, 10)}...`
        : "Pay with supported token";
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
        normalizeTokenAddress(plan.allowedTokens[0]) || "",
      )} ${billingInterval}`,
    popular: plan.active, // Use active status as popular flag
    pricingBreakdown: plan.pricingBreakdown,
  };
}

// Helper function to convert billing interval from seconds to readable format
function getBillingInterval(
  seconds: string,
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
