import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import EmptyState from "../components/common/EmptyState";
import ProductCard from "../components/common/ProductCard";
import { useWishlistStore } from "../store/wishlistStore";
import { useAuthStore } from "../store/authStore";
import { getWishlist } from "../api/wishlistApi";

export default function Wishlist() {
  const navigate = useNavigate();
  const { items, setItems } = useWishlistStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (data?.items) {
      const normalized = data.items.map((p) => ({
        id: p.item_id ?? p.id,
        name: p.name,
        price: p.discount_price ?? p.price,
        mrp: p.price,
        image: p.image,
        type: p.type || "product",
      }));
      setItems(normalized);
    }
  }, [data, setItems]);

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
              onAction={() => navigate("/shop")}
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
