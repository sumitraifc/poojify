import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, SearchX } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import SearchResultCard from "../components/common/SearchResultCard";
import { ProductCardSkeleton } from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import { products } from "../data/products";

function fetchSearchResults(q) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!q) return resolve([]);
      resolve(products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())));
    }, 450);
  });
}

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [tab, setTab] = useState("products");

  const { data, isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: () => fetchSearchResults(q),
  });

  const results = data || [];

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Search" }]} />

          <div className="mb-1 flex items-center gap-2 border-l-4 border-primary-500 pl-3">
            <h1 className="text-xl font-bold sm:text-2xl">
              {isLoading ? "Searching..." : `${results.length} results`} for <span className="text-primary-600">"{q}"</span>
            </h1>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setTab("products")}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                tab === "products" ? "border-primary-500 bg-primary-50 text-primary-700" : "border-ink-500/15 text-ink-500"
              }`}
            >
              <ShoppingBag size={15} /> Products
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1 text-[11px] text-white">
                {results.length}
              </span>
            </button>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <ShoppingBag size={16} className="text-primary-600" />
            <h2 className="font-semibold">Products</h2>
            <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600">
              {results.length} found
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : results.map((p, i) => <SearchResultCard key={p.id} product={p} index={i} />)}
          </div>

          {!isLoading && results.length === 0 && (
            <EmptyState
              icon={SearchX}
              title={q ? `No results for "${q}"` : "Start typing to search"}
              subtitle="Try a different keyword or browse our categories instead."
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
