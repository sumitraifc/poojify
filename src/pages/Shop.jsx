import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, List } from "lucide-react";
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
  const [page, setPage] = useState(1);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ limit: 50, offset: 0 }),
    select: (res) => res?.data ?? [],
  });

  const { data: subCategories = [] } = useQuery({
    queryKey: ["subcategories", activeCat],
    queryFn: () => getSubCategories(activeCat),
    select: (res) => res?.data ?? [],
    enabled: !!activeCat,
  });

  useEffect(() => {
    if (categories.length > 0 && !activeCat) setActiveCat(categories[0].id);
  }, [categories]);

  useEffect(() => {
    if (subCategories.length > 0) { setActiveSub(subCategories[0].id); setPage(1); }
  }, [subCategories]);

  const ITEMS_PER_PAGE = 12;

  const { data: productsRes, isLoading: productsLoading } = useQuery({
    queryKey: ["products-by-sub", activeSub, page],
    queryFn: () => getProductsBySub(activeSub, { limit: ITEMS_PER_PAGE, offset: (page - 1) * ITEMS_PER_PAGE }),
    enabled: !!activeSub,
    keepPreviousData: true,
  });

  const products = productsRes?.data ?? [];
  const totalCount = productsRes?.total_products ?? 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === "priceLowHigh") list.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
    if (sort === "priceHighLow") list.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
    if (sort === "rating") list.sort((a, b) => (b.product_rating ?? 0) - (a.product_rating ?? 0));
    return list;
  }, [products, sort]);

  function goToPage(p) {
    setPage(p);
    document.getElementById("shop-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectCategory(id) {
    setActiveCat(id);
    setActiveSub(null);
    setPage(1);
  }

  function normalize(p) {
    return { ...p, image: p.image ?? p.main_image, price: p.discount_price ?? p.price, mrp: p.price };
  }

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Shop" }]} />

          {/* Main layout: left cat sidebar + right content */}
          <div className="flex sm:gap-3 gap-1">

            {/* ── Left: Category sidebar (all screens) ── */}
            <aside className="w-16 shrink-0 sm:w-20 lg:w-52">
              <div className="sticky top-20 max-h-[80vh] overflow-y-auto scrollbar-hide rounded-xl border border-ink-500/10 bg-cream-50 py-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.id)}
                    className={cn(
                      "flex w-full flex-col items-center gap-1 px-1 py-2.5 text-center transition lg:flex-row lg:gap-2 lg:px-3 lg:text-left",
                      activeCat === cat.id
                        ? "bg-primary-50 text-primary-600"
                        : "text-ink-600 hover:bg-cream-100"
                    )}
                  >
                    {cat.image && (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-9 w-9 shrink-0 rounded-lg object-cover sm:h-10 sm:w-10 lg:h-7 lg:w-7 lg:rounded"
                      />
                    )}
                    <span className="line-clamp-2 text-[10px] font-medium leading-tight sm:text-xs lg:text-sm">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {/* ── Right: Subcategories + Products ── */}
            <div className="min-w-0 flex-1">

              {/* Subcategory chips */}
              {subCategories.length > 0 && (
                <div className="mb-3 flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                  {subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSub(sub.id)}
                      className={cn(
                        "shrink-0 flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition",
                        activeSub === sub.id
                          ? "border-primary-500 bg-primary-50 text-primary-600"
                          : "border-ink-500/15 text-ink-600 hover:border-primary-300"
                      )}
                    >
                      {sub.image && <img src={sub.image} alt="" className="h-5 w-5 rounded-full object-cover" />}
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Toolbar */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="truncate text-xs text-ink-500 sm:text-sm">
                  {activeSub ? `${sorted.length} products` : ""}
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rounded-lg border border-ink-500/15 bg-cream-50 px-2 py-1 text-xs outline-none focus:border-primary-500"
                  >
                    <option value="popularity">Popular</option>
                    <option value="priceLowHigh">Price ↑</option>
                    <option value="priceHighLow">Price ↓</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  {/* <div className="hidden gap-1 rounded-lg border border-ink-500/15 p-1 sm:flex">
                    <button onClick={() => setView("grid")} className={cn("rounded p-1", view === "grid" && "bg-primary-50 text-primary-600")}><LayoutGrid size={14} /></button>
                    <button onClick={() => setView("list")} className={cn("rounded p-1", view === "list" && "bg-primary-50 text-primary-600")}><List size={14} /></button>
                  </div> */}
                </div>
              </div>

              {/* Products */}
              {!activeSub ? (
                <EmptyState icon={PackageSearch} title="Select a subcategory" subtitle="Choose a subcategory above to browse products" />
              ) : productsLoading ? (
                <div className={cn("grid gap-1 sm:gap-3", view === "grid" ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
                  {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : sorted.length === 0 ? (
                <EmptyState icon={PackageSearch} title="No products found" subtitle="No products in this subcategory yet." />
              ) : (
                <>
                  <div id="shop-products" className={cn("grid gap-1 sm:gap-3", view === "grid" ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
                    {sorted.map((p, i) => <ProductCard key={p.id} product={normalize(p)} index={i} />)}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                        className="rounded-lg border border-ink-500/15 px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 transition"
                      >← Prev</button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                        .reduce((acc, n, idx, arr) => {
                          if (idx > 0 && n - arr[idx - 1] > 1) acc.push("...");
                          acc.push(n);
                          return acc;
                        }, [])
                        .map((n, i) =>
                          n === "..." ? (
                            <span key={`dot-${i}`} className="px-1 text-xs text-ink-400">...</span>
                          ) : (
                            <button
                              key={n}
                              onClick={() => goToPage(n)}
                              className={cn(
                                "h-8 w-8 rounded-lg text-xs font-medium transition",
                                page === n
                                  ? "bg-primary-500 text-white"
                                  : "border border-ink-500/15 text-ink-600 hover:border-primary-400 hover:text-primary-600"
                              )}
                            >{n}</button>
                          )
                        )}

                      <button
                        onClick={() => goToPage(page + 1)}
                        disabled={page === totalPages}
                        className="rounded-lg border border-ink-500/15 px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 transition"
                      >Next →</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
