import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import { PageLoader } from "./components/common/Loader";

// --- Lazy-loaded pages: each route's code is only downloaded when visited ---
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ComboOffersPage = lazy(() => import("./pages/ComboOffersPage"));

const PurohitBooking = lazy(() => import("./pages/PurohitBooking"));
const PurohitDetail = lazy(() => import("./pages/PurohitDetail"));
const BookingConfirm = lazy(() => import("./pages/BookingConfirm"));
const BookingSuccess = lazy(() => import("./pages/BookingSuccess"));

const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Language = lazy(() => import("./pages/Language"));
const PurohitRegister = lazy(() => import("./pages/PurohitRegister"));

const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PolicyPage = lazy(() => import("./pages/PolicyPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/combo-offers" element={<ComboOffersPage />} />
          <Route path="/combo-offers/:id" element={<ProductDetail />} />

          <Route path="/purohit-booking" element={<PurohitBooking />} />
          <Route path="/purohit-booking/:id" element={<PurohitDetail />} />
          <Route path="/purohit-booking/:id/confirm" element={<BookingConfirm />} />
          <Route path="/purohit-booking/:id/success" element={<BookingSuccess />} />
          <Route path="/purohit-registration" element={<PurohitRegister />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-bookings/:id" element={<BookingSuccess />} />

          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/language" element={<Language />} />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<PolicyPage />} />
          <Route path="/privacy-policy" element={<PolicyPage />} />
          <Route path="/shipping-policy" element={<PolicyPage />} />
          <Route path="/refund-policy" element={<PolicyPage />} />
          <Route path="/faq" element={<PolicyPage />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
