import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Leaf, Gem, Package, Heart as HeartHand, Star } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Rating from "../components/common/Rating";
import Button from "../components/common/Button";
import QuantityStepper from "../components/common/QuantityStepper";
import ProductCard from "../components/common/ProductCard";
import { PageLoader } from "../components/common/Loader";
import { getProductById, products } from "../data/products";
import { formatINR, discountPercent } from "../utils/format";
import { useCartStore } from "../store/cartStore";

function fetchProduct(id) {
  return new Promise((resolve) => setTimeout(() => resolve(getProductById(id)), 400));
}

const highlights = [
  { icon: Leaf, label: "Pure & Authentic" },
  { icon: Gem, label: "Premium Quality" },
  { icon: Package, label: "All Items Included" },
  { icon: HeartHand, label: "Delivered with Care" },
];

export default function ProductDetail() {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });

  if (isLoading) return <PageLoader />;
  if (!product) return <p className="section-y section text-center">Product not found.</p>;

  const off = discountPercent(product.mrp, product.price);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 5);

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Shop", to: "/shop" }, { label: product.name }]} />

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <div className="relative overflow-hidden rounded-xl">
                {off > 0 && <span className="absolute left-3 top-3 z-10 badge bg-primary-500 text-white">{off}% OFF</span>}
                <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <div className="mt-2">
                <Rating value={product.rating} count={product.reviews} />
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary-600">{formatINR(product.price)}</span>
                {off > 0 && (
                  <>
                    <span className="text-ink-500 line-through">{formatINR(product.mrp)}</span>
                    <span className="text-sm font-semibold text-success">({off}% OFF)</span>
                  </>
                )}
              </div>

              <p className="mt-4 text-sm text-ink-500">A complete, carefully sourced set of items for your pooja — pure, authentic, and ready to use.</p>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {highlights.map((h) => (
                  <div key={h.label} className="card flex flex-col items-center gap-1.5 py-3 text-center">
                    <h.icon size={18} className="text-primary-500" />
                    <span className="text-[11px] font-medium text-ink-700">{h.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-4">
                <QuantityStepper value={qty} onChange={setQty} />
                <Button className="flex-1" onClick={() => addItem(product, qty)}>Add to Cart</Button>
              </div>
              <Button variant="outline" fullWidth className="mt-3">Buy Now</Button>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-14">
              <h2 className="mb-5 text-xl font-bold">You may also like</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
