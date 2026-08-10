import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import ProductCard from "../components/common/ProductCard";
import { ProductCardSkeleton } from "../components/common/Loader";
import { categories, products } from "../data/products";
import { cn } from "../utils/cn";

function fetchProducts({ category, q }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let list = products;
      if (category) list = list.filter((p) => p.category === category);
      if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
      resolve(list);
    }, 400);
  });
}

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const q = params.get("q") || "";
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("popularity");

  const { data, isLoading } = useQuery({
    queryKey: ["shop-products", category, q],
    queryFn: () => fetchProducts({ category, q }),
  });

  const sorted = useMemo(() => {
    if (!data) return [];
    const list = [...data];
    if (sort === "priceLowHigh") list.sort((a, b) => a.price - b.price);
    if (sort === "priceHighLow") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [data, sort]);

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Shop" }]} />

          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="card sticky top-24">
                <h3 className="mb-3 font-semibold">Shop by Categories</h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setParams(q ? { q } : {})}
                      className={cn(
                        "w-full rounded-lg px-3 py-2 text-left text-sm",
                        !category ? "bg-primary-50 font-medium text-primary-600" : "text-ink-700 hover:bg-cream-100"
                      )}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setParams({ category: cat.id })}
                        className={cn(
                          "w-full rounded-lg px-3 py-2 text-left text-sm",
                          category === cat.id ? "bg-primary-50 font-medium text-primary-600" : "text-ink-700 hover:bg-cream-100"
                        )}
                      >
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
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold">
                    {category ? categories.find((c) => c.id === category)?.name : "All Products"}
                  </h1>
                  <p className="text-sm text-ink-500">{sorted.length} products found</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="input !w-auto py-2 text-sm"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="priceLowHigh">Price: Low to High</option>
                    <option value="priceHighLow">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <button className="btn-outline btn-sm lg:hidden">
                    <SlidersHorizontal size={14} /> Filter
                  </button>
                  <div className="hidden gap-1 rounded-lg border border-ink-500/15 p-1 sm:flex">
                    <button onClick={() => setView("grid")} className={cn("rounded p-1.5", view === "grid" && "bg-primary-50 text-primary-600")}>
                      <LayoutGrid size={16} />
                    </button>
                    <button onClick={() => setView("list")} className={cn("rounded p-1.5", view === "list" && "bg-primary-50 text-primary-600")}>
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className={cn("grid gap-4", view === "grid" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : sorted.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>

              {!isLoading && sorted.length === 0 && (
                <p className="py-16 text-center text-ink-500">No products found. Try a different search.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
