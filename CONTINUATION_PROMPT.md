# Poojify — Continuation Prompt

**Kaise use kare:** Agar Claude ka session expire ho jaye ya naya chat start karna pade, is poori file ko copy karke naye chat mein paste karo, saath mein `poojify-project.zip` upload kar dena. Isse Claude ko poora context mil jayega aur wahi se aage kaam kar payega.

---

## Prompt to paste in a new chat

```
Main ek React e-commerce + booking platform bana raha hoon jiska naam "Poojify" hai
(pooja/religious essentials shop + purohit/pandit booking service, India ke liye).

Maine tumhe ek zip file (poojify-project.zip) di hai jo poora existing codebase hai.
Ise /home/claude mein extract karke dekho aur README.md padho poora context lene ke liye.

TECH STACK (already set up, isi ko follow karna):
- React 18 + Vite
- Tailwind CSS (custom design tokens in tailwind.config.js — primary/maroon/cream/ink colors)
- Zustand for state (cart, wishlist, auth, theme, location — sab persisted to localStorage)
- @tanstack/react-query for data fetching (currently mock data with setTimeout, swap for
  real API later via src/api/axiosClient.js)
- react-router-dom v6, every route lazy-loaded via React.lazy in src/Routes.jsx
- framer-motion for animations
- react-i18next for language switching (English + Hindi, files in src/i18n/locales/)
- react-hot-toast for notifications (wrapped in src/components/common/Toast.jsx)
- lucide-react for icons

DESIGN SYSTEM RULES (important — follow these, don't invent new patterns):
1. ALL shared button/card/input styles live in src/index.css under @layer components
   (.btn-primary, .btn-outline, .card, .input, .badge, .label, .link, .section, .section-y).
   Change a style ONCE there — it updates everywhere. Don't hardcode one-off button styles.
2. Colors are defined ONCE in tailwind.config.js. Brand orange = primary-500 (#F5960F).
   ink-500/700/900 and cream-50/100/200 are NOT fixed hex — they're CSS variables
   (defined in src/index.css :root and .dark) so they automatically flip for dark mode.
   This means any component using text-ink-900 or bg-cream-100 already works in both
   themes without extra dark: classes. Only use manual dark: classes for things OUTSIDE
   the ink/cream family (e.g. dark:bg-[#1B140F] for a literal white surface, or accent
   color swaps like primary -> gold in dark mode).
3. Dark mode is class-based (darkMode: "class" in tailwind.config.js), toggled by
   src/store/themeStore.js which adds/removes "dark" class on <html>. The toggle lives
   in the Profile drawer under Appearance > Theme.
4. Font is Poppins everywhere (both font-display and font-body point to Poppins).
5. Logo is a real image (not built from CSS): public/assets/logo.png, rendered by
   src/components/layout/Logo.jsx. If a new logo file is provided, process it to remove
   white background (PIL: alpha out near-white pixels) before saving to that path.
6. Product cards (src/components/common/ProductCard.jsx) use a specific mobile-app
   style: rounded-3xl floating card, heart button overlapping top-right of the image,
   a floating "+" button overlapping the bottom-right of the image that MORPHS into a
   [trash][qty][+] stepper capsule once the item is in the cart. Price is green, MRP is
   struck through, discount shown as "X% OFF" with a dashed line filler. Match this
   exact pattern for any new product-card-like UI unless told otherwise.
7. Search results use a DIFFERENT card style (src/components/common/SearchResultCard.jsx)
   — "Products" pill tag top-left of image, price + "You save X%" in green, full-width
   pill-shaped orange "View" button with an eye icon at the bottom.
8. Section headers on the home page (src/components/common/SectionHeader.jsx) show
   "Title ----dashed-line---- View All →" — reuse this component, don't rebuild headers.
9. Right-side sliding drawers (Login/OTP, Profile menu) use the shared
   src/components/common/Drawer.jsx. IMPORTANT BUG HISTORY: the close (X) button used to
   live inside the same scrollable container as the drawer content, so scrolling down
   made it disappear, making it look broken. It's now fixed in its own non-scrolling
   header row — if you build any NEW drawer, always use this shared Drawer component
   rather than rebuilding the slide-in panel from scratch, so this bug can't reappear.
10. First-time-only geolocation capture: src/store/locationStore.js has a captureOnce()
    method that's called once in main.jsx on app boot. It marks `captured: true`
    immediately (persisted) so the browser's location permission prompt only ever
    appears on the user's very first visit, never again, even if permission was denied.

PAGES/FEATURES ALREADY BUILT (don't rebuild from scratch — extend/fix instead):
- Home (hero slider, category grid, popular products, New Pandits section, New Best
  Offers banners, combo offers, why-shop-with-us strip)
- Shop listing (sidebar categories + filters), Product Detail (with Customer Ratings
  breakdown / Customer Photos grid / Customer Reviews list sections), Search results page
- Cart, Checkout (address + payment method selection)
- Purohit Ji Booking: listing/search, purohit detail + puja selection + booking,
  booking confirm (bill breakdown), booking success, My Bookings (separate history list),
  Purohit (Pandit) multi-step registration form
- Login/OTP as a right-side drawer (NOT a full page), Profile menu as a right-side
  drawer ("Hello, {name}" with Orders/Wishlist/Bookings/Address/Feedback/Theme/Language/
  Support links + logout)
- My Orders + Order Detail (with rate & review), Wishlist
- Edit Profile page, Manage Address page (current-location via browser geolocation +
  simulated "pick on map" pin-drop that generates a mock address), Send Feedback page
- Language settings page (switches i18next locale for the whole app instantly)
- About, Contact, generic Policy pages, 404

WHAT I NEED YOU TO DO NEXT:
[Describe your next request here — e.g. "Add X page matching this screenshot",
"Fix Y bug", "The Z page doesn't match this design, here's the reference image", etc.
Attach reference screenshots whenever asking for a new page/section — this project is
being built to closely match a set of provided UI screenshots.]
```

---

## Notes for whoever continues this (human or Claude)

- Always run `npm run build` after changes to catch errors before handing back the zip —
  this project has been rebuilt from scratch multiple times and build-checking has caught
  real bugs (e.g. a CSS comment containing `*/` mid-sentence once broke the entire
  stylesheet).
- `public/assets/*` are placeholder images generated with PIL. Replace with real photos
  using the same filenames whenever the user provides them (see `src/data/products.js`,
  `src/data/purohits.js` for the filename → usage mapping).
- The user primarily communicates in Hinglish and shares reference screenshots — treat
  every screenshot as a literal spec to match (layout, copy, colors, iconography), not
  just inspiration.
- After finishing a batch of changes, always: `rm -rf node_modules dist`, re-zip the
  `poojify` folder, and re-present it — the user downloads the whole project each time,
  not individual files.
