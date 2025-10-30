# API Configuration

The application is configured to use the BillingBase API endpoints. You can set the API base URL using the `NEXT_PUBLIC_API_BASE_URL` environment variable.

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.billingbase.com

# Example for development/testing
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## API Endpoints

The application integrates with the following API endpoints:

### 1. Get Merchant Plans
- **Endpoint**: `GET /api/plans/merchant/{address}`
- **Description**: Retrieves all subscription plans for a specific merchant
- **Usage**: Fetches active plans and displays them in the UI

### 2. Get Plan by ID
- **Endpoint**: `GET /api/plans/{id}`
- **Description**: Retrieves detailed information about a specific subscription plan
- **Usage**: Shows plan details when a user clicks on a plan card

### 3. Create a subscription
- **Endpoint**: `POST /api/subscriptions`
- **Description**: Creates a new subscription for a user and returns a payment link
- **Request Body**:
```json
{
  "planId": 0,
  "payerToken": "string",
  "subscriberEmail": "user@example.com"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "subscriptionId": "13",
    "transactionHash": "0xf499687e9fabfa78159dd687d81f93b2b9f3e9ae2163982f29df9a337c49bc5c",
    "invoiceNumber": "INV-13-1761583078332",
    "invoiceDueAt": "2025-10-28T04:37:55.720Z",
    "paymentLink": "https://your-domain.com/payment?subscriptionId=13"
  }
}
```
- **Usage**: After subscription creation, users are automatically redirected to the payment link to complete their payment

## Token Integration

The application supports multiple payment tokens:

- **WETH** (Wrapped Ethereum): `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582`
- **USDC** (USD Coin): `0xA0b86a33E6441A8c5e4D6E5E5E5E5E5E5E5E5E5E5`
- **DAI** (Dai Stablecoin): `0x6B175474E89094C44Da98b954EedeAC495271d0F`
- **USDT** (Tether USD): `0xdAC17F958D2ee523a2206206994597C13D831ec7`

Users can select their preferred payment token during the subscription process.

## Features Implemented

✅ **API Integration**: Real API calls with fallback to mock data
✅ **Token Selection**: Users can choose from available payment tokens
✅ **Dynamic Pricing**: Prices displayed in the selected token's format
✅ **Responsive UI**: Clean, modern interface with dark mode support
✅ **Error Handling**: Graceful fallbacks and user-friendly error messages
✅ **Type Safety**: Full TypeScript support with proper type definitions

## Development

The application includes both real API integration and mock data fallbacks for development and testing purposes.

To run in development mode:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```
