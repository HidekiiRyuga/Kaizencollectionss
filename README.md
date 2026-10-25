# KaizenCollectionss 🛍️

**An anime-inspired e-commerce platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.**

KaizenCollectionss is a full-stack online storefront for anime-themed accessories, collectibles, and cute merchandise. It combines a responsive shopping experience with persistent cart functionality, database-backed order management, administrative workflows, and secure order-tracking capabilities.

## ✨ Features

- **Product Catalog** — Browse anime-inspired products through a clean, responsive storefront.
- **Persistent Shopping Cart** — Manage cart items with browser local storage to preserve cart state across page refreshes.
- **Stock-Aware Cart** — Enforce product stock availability and quantity limits during cart interactions.
- **Checkout & Order Management** — Collect customer and delivery details and submit orders through backend APIs.
- **Supabase Integration** — Use Supabase for database operations, authentication, and backend services.
- **Admin Dashboard** — Support administrative workflows for managing products, orders, and store operations, with server-side admin authorization checks.
- **Role-Aware Account Interface** — Present an Admin Dashboard entry for administrators and a My Orders entry for regular customers.
- **Guest Order Tracking** — Allow customers to look up orders without logging in using their order ID and phone number.
- **Delhivery Tracking Support** — Store courier details and tracking/AWB numbers for shipped orders and provide access to the courier's tracking page.
- **Tracking API Security** — Validate incoming requests, enforce a request-body size limit, and apply rate limiting using Upstash Redis.
- **Customer Order History** — Provide logged-in customers with access to their orders and individual order details.
- **Responsive UI** — Deliver a mobile-friendly storefront with reusable components and consistent styling.

## 🧰 Tech Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling & UI | Tailwind CSS, shadcn/ui |
| Backend | Next.js App Router, API Routes, Server Actions |
| Database & Authentication | Supabase |
| State Management | React Context API |
| Cart Persistence | Browser Local Storage |
| API Rate Limiting | Upstash Redis, `@upstash/ratelimit` |
| Shipping Workflow | Manual Delhivery AWB/tracking integration |
| Deployment | Vercel |

## 🎨 Design Philosophy

The storefront uses a minimal, anime-inspired aesthetic with warm brown accents, blush tones, rounded components, and product-focused layouts.

The interface prioritizes usability, visual consistency, and responsive design over unnecessary animations or clutter.

## 🔒 Security & Access Control

- **Server-Side Authorization** — Verify administrator privileges on protected administrative routes and actions.
- **Protected Customer Data** — Scope logged-in customer order access to the authenticated user.
- **Validated Tracking Requests** — Validate order IDs and phone numbers before querying tracking information.
- **Request Size Limits** — Enforce a maximum request-body size for the public tracking endpoint.
- **Rate Limiting** — Use Upstash Redis to limit repeated tracking requests and reduce automated abuse.
- **Restricted Tracking Response** — Return only the order information required for tracking rather than exposing the complete order record.
- **Environment-Based Secrets** — Keep Supabase and Upstash credentials in environment variables instead of committing secrets to source control.

## 🚚 Order Tracking Workflow

KaizenCollectionss supports a manual shipping-tracking workflow:

1. An administrator processes an order and updates its shipping details.
2. After creating the shipment separately, the administrator records the Delhivery AWB/tracking number in the order.
3. A customer can visit the public Track Order page and submit their order ID and phone number.
4. The backend validates the request, applies rate limiting, and calls a Supabase RPC function to retrieve the permitted tracking details.
5. The customer can view the order status and available tracking information and follow the link to Delhivery's tracking service.

**Note:** The current workflow stores tracking details manually. Automatic shipment creation and synchronization of live courier statuses are potential future enhancements.

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- A Supabase project with the required database schema, authentication configuration, and RPC functions
- An Upstash Redis database for rate limiting

### Installation

1. Clone the repository:

   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd <YOUR_PROJECT_DIRECTORY>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root and configure the environment variables required by the application:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

   UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
   ```

   Check the existing project configuration for any additional variables. Never commit real credentials or secret tokens.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment

The frontend is deployed on Vercel. Configure the required Supabase and Upstash environment variables in the Vercel project settings for the relevant deployment environments.

**Live Demo:** https://kaizencollectionss.vercel.app

## 📁 Project Overview

The application uses the Next.js App Router architecture, with pages, reusable components, shared application state, backend endpoints, and server-side logic organized by responsibility.

```text
app/          → Pages, layouts, and API routes
components/   → Reusable UI components
context/      → Shared application state
lib/          → Shared utilities and service clients
public/       → Static assets
```

*This is a conceptual overview; directory names may vary with the current repository structure.*

## 🌱 Future Improvements

- Payment gateway integration with Razorpay or Cashfree
- Automated shipment creation and live courier-status synchronization
- Transactional order confirmation and shipping notifications
- Product reviews and ratings
- Enhanced product discovery, filtering, and search
- Expanded administrative analytics as the store grows

## 👩‍💻 Developer

Built as a full-stack web development project to explore modern React architecture, e-commerce workflows, database integration, authentication, API security, and deployment.

**Live Demo:** https://kaizencollections.vercel.app

---

*KaizenCollectionss — anime-inspired finds, thoughtfully presented.*
