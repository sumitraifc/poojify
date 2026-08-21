import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import MainLayout from "./components/layout/MainLayout";
import { PageLoader } from "./components/common/Loader";
import PrivateRoute from "./components/common/PrivateRoute";

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
const PanditDashboard = lazy(() => import("./pages/PanditDashboard"));
const Search = lazy(() => import("./pages/Search"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const ManageAddress = lazy(() => import("./pages/ManageAddress"));
const SendFeedback = lazy(() => import("./pages/SendFeedback"));

const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PolicyPage = lazy(() => import("./pages/PolicyPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/shop" element={<Shop />} />
          <Route path="/search" element={<Search />} />
          <Route path="/shop/product/:id" element={<ProductDetail type="product" />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/combo-offers" element={<ComboOffersPage />} />
          <Route path="/combo-offers/:id" element={<ProductDetail type="combo" />} />

          <Route path="/purohit-booking" element={<PurohitBooking />} />
          <Route path="/purohit-booking/:id" element={<PurohitDetail />} />
          <Route path="/purohit-booking/:id/confirm" element={<PrivateRoute><BookingConfirm /></PrivateRoute>} />
          <Route path="/purohit-booking/:id/success" element={<PrivateRoute><BookingSuccess /></PrivateRoute>} />
          <Route path="/purohit-registration" element={<PrivateRoute><PurohitRegister /></PrivateRoute>} />
          <Route path="/pandit-dashboard" element={<PrivateRoute><PanditDashboard /></PrivateRoute>} />
          <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
          <Route path="/my-bookings/:id" element={<PrivateRoute><BookingSuccess /></PrivateRoute>} />

          <Route path="/orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
          <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/language" element={<Language />} />
          <Route path="/profile/edit" element={<PrivateRoute><ProfileEdit /></PrivateRoute>} />
          <Route path="/profile/address" element={<PrivateRoute><ManageAddress /></PrivateRoute>} />
          <Route path="/profile/feedback" element={<PrivateRoute><SendFeedback /></PrivateRoute>} />

          <Route path="/policy/about-us" element={<About />} />
          <Route path="/policy/contact-us" element={<Contact />} />
          <Route path="/policy/terms-conditions" element={<PolicyPage />} />
          <Route path="/policy/privacy-policy" element={<PolicyPage />} />
          <Route path="/shipping-policy" element={<PolicyPage />} />
          <Route path="/policy/refund-and-cancellation-policy" element={<PolicyPage />} />
          <Route path="/policy/child-safety-policy" element={<PolicyPage />} />
          <Route path="/faq" element={<PolicyPage />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
