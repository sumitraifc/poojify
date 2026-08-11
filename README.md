# Poojify — React Frontend

Full frontend for the Poojify pooja-essentials & purohit-booking platform, built with **React + Vite + Tailwind CSS + Zustand + React Query + Axios**, fully responsive, animated with **Framer Motion**, and multi-language ready with **i18next**.

> 🔄 **Continuing this project in a new chat?** Read [`CONTINUATION_PROMPT.md`](./CONTINUATION_PROMPT.md) first — paste it into a fresh Claude conversation along with this zip to resume with full context.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 📁 Project Structure

```
src/
├── api/axiosClient.js        # Central axios instance (interceptors, auth token, error toasts)
├── assets/                   # Local images imported directly in JS (rarely needed — see public/assets)
├── components/
│   ├── common/                # Shared UI atoms used everywhere (Button, Loader, Toast, ProductCard...)
│   └── layout/                # Header, Footer, MainLayout, ProfileDropdown, MobileMenu
├── data/                      # Mock data (swap for real API calls when backend is ready)
├── features/                  # Page-specific composed sections (home hero, category grid, etc.)
├── hooks/                     # useDebounce, useMediaQuery, useClickOutside
├── i18n/                      # Language config + locale JSON files (en, hi)
├── pages/                     # One file per route
├── store/                     # Zustand stores: authStore, cartStore, wishlistStore
├── utils/                     # cn(), formatINR(), formatDate()...
├── index.css                  # GLOBAL design tokens + reusable classes (.btn, .card, .input...)
├── main.jsx                   # App bootstrap (providers: React Query, Router, Toaster)
└── Routes.jsx                 # All routes, lazy-loaded with React.lazy + Suspense

public/assets/                 # Real images go here (hero, categories, products, purohits)
```

## 🎨 Global styling — change once, updates everywhere

All shared visual language lives in **two files**:

1. `tailwind.config.js` → color palette (`primary`, `maroon`, `cream`, `ink`), fonts, shadows, animations.
2. `src/index.css` → reusable classes: `.btn-primary`, `.btn-outline`, `.card`, `.input`, `.badge`, `.section`, etc.

Example — change the brand orange everywhere:
```js
// tailwind.config.js
primary: { 500: "#F5960F" } // change this one line
```

Use the shared `<Button />` component (`src/components/common/Button.jsx`) instead of raw `<button>` tags so every button stays consistent:
```jsx
<Button variant="primary" size="lg" icon={ShoppingCart}>Add to Cart</Button>
```

## 🌍 Changing app language

Go to **Settings → Language** (`/language` route) in the running app, or programmatically:
```js
import { useTranslation } from "react-i18next";
const { i18n } = useTranslation();
i18n.changeLanguage("hi"); // switches every translated string instantly
```
To add a new language: duplicate `src/i18n/locales/en.json`, translate the values, register it in `src/i18n/index.js`, and add it to the `languages` array in `src/pages/Language.jsx`.

## 🛒 State management (Zustand)

- `useCartStore` — cart items, quantities, totals (persisted to localStorage)
- `useWishlistStore` — wishlist items (persisted)
- `useAuthStore` — logged-in user + token (persisted)

## 🔄 Data fetching (React Query + Axios)

Mock data in `src/data/` simulates API responses with `setTimeout`. Replace with real calls, e.g.:
```js
// Before (mock)
const fetchProducts = () => new Promise((r) => setTimeout(() => r(products), 500));

// After (real API)
import axiosClient from "../api/axiosClient";
const fetchProducts = () => axiosClient.get("/products/popular");
```
Everything else (loading states, error toasts, caching) keeps working unchanged.

## ⚡ Lazy loading

Every route in `src/Routes.jsx` uses `React.lazy()`, so each page's JS is only downloaded when the user visits it. A shared `<PageLoader />` shows while a chunk loads.

## 📱 Responsiveness

Every component was built mobile-first with Tailwind breakpoints (`sm:`, `lg:`). Test at 375px, 768px, and 1280px+ — header collapses into `MobileMenu.jsx`, grids reflow via `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`, etc.

## 🖼️ Replacing placeholder images

Generated placeholder images live in `public/assets/{hero,categories,products,purohits}/`. Drop in your real photos using the **same filenames** (or update the paths in `src/data/products.js` and `src/data/purohits.js`) and they'll appear everywhere automatically.

## 🏦 "Bank list + Add Bank" panel

Not included yet — tell me which flow (user payout account, or a pharmacy-style admin panel?) and I'll add a `features/bank/` module with a bank list + "Add Bank Account" modal/drawer using the same design system.

## ✅ Still to wire up for production

- Real backend endpoints in `src/api/axiosClient.js` (`VITE_API_BASE_URL` in `.env`)
- Payment gateway integration (Razorpay/Stripe) on the Checkout & Booking Confirm pages
- Real OTP/auth API on the Login page
