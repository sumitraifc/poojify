import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import EmptyState from "../components/common/EmptyState";
import ProductCard from "../components/common/ProductCard";
import { useWishlistStore } from "../store/wishlistStore";

export default function Wishlist() {
  const items = useWishlistStore((s) => s.items);

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "My Wishlist" }]} />
          <h1 className="mb-1 text-2xl font-bold">My Wishlist ({items.length})</h1>
          <p className="mb-6 text-sm text-ink-500">All your favorite pooja items at one place</p>

          {items.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Your wishlist is empty"
              subtitle="Save items you love so you can find them easily later."
              actionLabel="Explore Products"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
