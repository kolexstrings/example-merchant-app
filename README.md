# BillingBase Merchant App

A modern subscription management application built with Next.js 16 and React 19, featuring real-time API integration with the BillingBase platform.

## Features

- 🚀 **Real API Integration**: Connects to BillingBase API endpoints for plans and subscriptions
- 💰 **Multi-Token Support**: Support for WETH, USDC, DAI, and USDT payments
- 🎨 **Modern UI**: Clean, responsive design with dark mode support
- 🔄 **Fallback System**: Automatic fallback to mock data when API is unavailable
- 📱 **Mobile Responsive**: Works seamlessly across all devices
- 🎯 **Type Safe**: Full TypeScript support with comprehensive type definitions

## API Endpoints

The application integrates with the following BillingBase API endpoints:

- `GET /api/plans/merchant/{address}` - Fetch all plans for a merchant
- `GET /api/plans/{id}` - Get detailed plan information
- **POST /api/subscriptions** - Create new subscriptions with automatic payment redirect

## Environment Setup

Create a `.env.local` file to configure the API connection:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.billingbase.com

# Set to 'production' to enable automatic payment redirects
NODE_ENV=production
```

## Getting Started

First, install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) to view the application.

## Project Structure

- `lib/api.ts` - API utility functions and mock data
- `lib/types.ts` - TypeScript type definitions and token mapping
- `components/` - React components (PlanCard, PlanDetail, etc.)
- `app/` - Next.js app directory with pages and layouts

## Token Integration

The application supports the following payment tokens:

- **WETH** (Wrapped Ethereum)
- **USDC** (USD Coin)
- **DAI** (Dai Stablecoin)
- **USDT** (Tether USD)

## Payment Flow

1. **Plan Selection**: Users browse and select subscription plans
2. **Token Selection**: Users choose their preferred payment token (WETH, USDC, DAI, USDT)
3. **Subscription Creation**: System creates subscription and generates payment link
4. **Payment Redirect**: Users are automatically redirected to complete payment
5. **Payment Completion**: Users complete payment on the redirected payment page

**Development Mode**: Shows payment link in alert instead of redirecting
**Production Mode**: Automatically redirects to payment link

## Subscription Response

When a subscription is created, the API returns:

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

Users are then redirected to the `paymentLink` to complete their payment.

## Development Features

- **Mock API Fallback**: Includes comprehensive mock data for development and testing
- **Error Handling**: Graceful error handling with user-friendly messages
- **Loading States**: Beautiful loading animations and states
- **Responsive Design**: Mobile-first design approach

## Port Configuration

The application runs on port 5000 by default. To change the port:

1. **Using package.json scripts**: Update the `-p` flag in the `dev` and `start` scripts
2. **Using environment variables**: Set the `PORT` environment variable
3. **Using command line**: Run `npm run dev -- -p <port>`
4. **Using convenience scripts**: Use `npm run dev:3000`, `npm run dev:5000`, or `npm run dev:8000`

Example:
```bash
# Change to port 3000
PORT=3000 npm run dev

# Or use convenience scripts
npm run dev:3000

# Or modify package.json scripts directly
"dev": "next dev -p 3000"
```

## Building for Production

```bash
npm run build
npm start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features
- [React Documentation](https://react.dev) - Learn about React 19
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - TypeScript guide

## Deployment

The app can be deployed on any platform supporting Next.js, including Vercel, Netlify, or your own server.

For more details, see the [API_README.md](API_README.md) file for comprehensive API documentation.
