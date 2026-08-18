import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import ProductCard from "../components/common/ProductCard";
import { ProductCardSkeleton } from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import { getCategories, getSubCategories, getProductsBySub } from "../api/productApi";
import { PackageSearch } from "lucide-react";
import { cn } from "../utils/cn";

export default function Shop() {
  const [activeCat, setActiveCat] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("popularity");

  // Categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ limit: 50, offset: 0 }),
    select: (res) => res?.data ?? [],
  });

  // Subcategories — fetch when category selected
  const { data: subCategories = [] } = useQuery({
    queryKey: ["subcategories", activeCat],
    queryFn: () => getSubCategories(activeCat),
    select: (res) => res?.data ?? [],
    enabled: !!activeCat,
  });

  // Auto-select first category
  useEffect(() => {
    if (categories.length > 0 && !activeCat) {
      setActiveCat(categories[0].id);
    }
  }, [categories]);

  // Auto-select first subcategory
  useEffect(() => {
    if (subCategories.length > 0 && !activeSub) {
      setActiveSub(subCategories[0].id);
    }
  }, [subCategories]);

  // Products — fetch when subcategory selected
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products-by-sub", activeSub],
    queryFn: () => getProductsBySub(activeSub, { limit: 50, offset: 0 }),
    select: (res) => res?.data ?? [],
    enabled: !!activeSub,
  });

  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === "priceLowHigh") list.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
    if (sort === "priceHighLow") list.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
    if (sort === "rating") list.sort((a, b) => (b.product_rating ?? 0) - (a.product_rating ?? 0));
    return list;
  }, [products, sort]);

  function selectCategory(id) {
    setActiveCat(id);
    setActiveSub(null);
  }

  // Normalize product shape for ProductCard
  function normalize(p) {
    return {
      ...p,
      image: p.image ?? p.main_image,
      price: p.discount_price ?? p.price,
      mrp: p.price,
    };
  }

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Shop" }]} />

          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            {/* Sidebar — categories */}
            <aside className="hidden lg:block">
              <div className="card sticky top-24">
                <h3 className="mb-3 font-semibold">Categories</h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => { setActiveCat(null); setActiveSub(null); }}
                      className={cn("w-full rounded-lg px-3 py-2 text-left text-sm", !activeCat ? "bg-primary-50 font-medium text-primary-600" : "text-ink-700 hover:bg-cream-100")}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => selectCategory(cat.id)}
                        className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm", activeCat === cat.id ? "bg-primary-50 font-medium text-primary-600" : "text-ink-700 hover:bg-cream-100")}
                      >
                        {cat.image && <img src={cat.image} alt="" className="h-6 w-6 rounded object-cover" />}
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-lg bg-primary-50 p-3 text-xs">
                  <p className="font-semibold">Free Delivery</p>
                  <p className="text-ink-500">On all orders above ₹499</p>
                </div>
              </div>
            </aside>

            {/* Main */}
            <div>
              {/* Mobile category scroll */}
              <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide lg:hidden">
                <button
                  onClick={() => { setActiveCat(null); setActiveSub(null); }}
                  className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium", !activeCat ? "border-primary-500 bg-primary-50 text-primary-600" : "border-ink-500/15 text-ink-600")}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.id)}
                    className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium", activeCat === cat.id ? "border-primary-500 bg-primary-50 text-primary-600" : "border-ink-500/15 text-ink-600")}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Subcategory chips */}
              {subCategories.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSub(sub.id)}
                      className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition", activeSub === sub.id ? "border-primary-500 bg-primary-50 text-primary-600" : "border-ink-500/15 text-ink-600 hover:border-primary-300")}
                    >
                      {sub.image && <img src={sub.image} alt="" className="h-4 w-4 rounded-full object-cover" />}
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Toolbar */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold">
                    {activeCat ? categories.find((c) => c.id === activeCat)?.name : "All Products"}
                  </h1>
                  {activeSub && <p className="text-sm text-ink-500">{sorted.length} products found</p>}
                </div>
                <div className="flex items-center gap-2">
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !w-auto py-2 text-sm">
                    <option value="popularity">Popularity</option>
                    <option value="priceLowHigh">Price: Low to High</option>
                    <option value="priceHighLow">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <div className="hidden gap-1 rounded-lg border border-ink-500/15 p-1 sm:flex">
                    <button onClick={() => setView("grid")} className={cn("rounded p-1.5", view === "grid" && "bg-primary-50 text-primary-600")}><LayoutGrid size={16} /></button>
                    <button onClick={() => setView("list")} className={cn("rounded p-1.5", view === "list" && "bg-primary-50 text-primary-600")}><List size={16} /></button>
                  </div>
                </div>
              </div>

              {/* Products */}
              {!activeSub ? (
                <EmptyState icon={PackageSearch} title="Select a category" subtitle="Choose a category and subcategory to browse products" />
              ) : productsLoading ? (
                <div className={cn("grid gap-4", view === "grid" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
                  {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : sorted.length === 0 ? (
                <EmptyState icon={PackageSearch} title="No products found" subtitle="No products in this subcategory yet." />
              ) : (
                <div className={cn("grid gap-4", view === "grid" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
                  {sorted.map((p, i) => <ProductCard key={p.id} product={normalize(p)} index={i} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
