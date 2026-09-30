# LAZYPAY Frontend

LazyPay's credit card discovery site (Next.js), powered by BankKaro's partner API.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Setup

All variables are listed in [`.env.example`](.env.example). For local dev:

```bash
cp .env.example .env.local   # then fill in PARTNER_API_KEY
```

`.env.local` is git-ignored — never commit real keys. In production, set the same
variables in Vercel → Project Settings → Environment Variables and redeploy.

## Features

- **Card Genius** — AI-powered card recommendations based on monthly spending
- **Category Card Genius** — Best cards for a specific spending category
- **Beat My Card** — Compare your current card against smarter alternatives
- **Card Listing** — Browse and filter 100+ credit cards with GST-inclusive fee display
- **Card Details** — Full breakdown of benefits, fees, and rewards
- **Card Comparison** — Side-by-side comparison of up to 3 cards

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**

## Project Structure

```
src/
├── app/               # Next.js App Router pages
├── components/        # Shared UI components
│   └── comparison/    # Card comparison panel
├── config/
│   └── brand.config.ts  # Central brand/theme config
├── lib/
│   ├── cardGenius.ts  # Card Genius recommendation engine
│   └── feeUtils.ts    # GST-inclusive fee calculations
├── services/          # API calls (card data, auth)
├── utils/
│   └── redirectHandler.ts  # Card application redirect logic
└── views/             # Page-level view components
```

## Deployment (Vercel)

1. Connect this repo to the LazyPay Vercel project.
2. In **Project Settings → Environment Variables**, add every variable from `.env.example` with real values.
3. Deploy.
