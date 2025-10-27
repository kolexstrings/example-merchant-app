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
- `POST /api/subscriptions` - Create new subscriptions

## Environment Setup

Create a `.env.local` file to configure the API connection:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.billingbase.com
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

Open [http://localhost:3000](http://localhost:3000) to view the application.

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

Users can select their preferred payment token during the subscription process, and prices are dynamically displayed in the chosen token format.

## Development Features

- **Mock API Fallback**: Includes comprehensive mock data for development and testing
- **Error Handling**: Graceful error handling with user-friendly messages
- **Loading States**: Beautiful loading animations and states
- **Responsive Design**: Mobile-first design approach

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
