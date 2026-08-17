import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, SearchX, Sparkles } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import SearchResultCard from "../components/common/SearchResultCard";
import { ProductCardSkeleton } from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import { searchProducts } from "../api/homeApi";
import { useDebounce } from "../hooks/useDebounce";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const debouncedQ = useDebounce(q, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQ],
    queryFn: () => searchProducts(debouncedQ),
    enabled: debouncedQ.length > 0,
    select: (res) => res?.data !== undefined ? res : { data: [], suggestions: [] },
  });

  const results = data?.data ?? [];
  const suggestions = data?.suggestions ?? [];

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Search" }]} />

          <div className="mb-1 flex items-center gap-2 border-l-4 border-primary-500 pl-3">
            <h1 className="text-xl font-bold sm:text-2xl">
              {isLoading ? "Searching..." : `${results.length} results`} for{" "}
              <span className="text-primary-600">"{q}"</span>
            </h1>
          </div>

          {/* Results */}
          {(isLoading || results.length > 0) && (
            <>
              <div className="mt-6 flex items-center gap-2">
                <ShoppingBag size={16} className="text-primary-600" />
                <h2 className="font-semibold">Results</h2>
                {!isLoading && (
                  <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600">
                    {results.length} found
                  </span>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : results.map((p, i) => <SearchResultCard key={p.id} product={p} index={i} />)}
              </div>
            </>
          )}

          {/* Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <>
              <div className="mt-8 flex items-center gap-2">
                <Sparkles size={16} className="text-primary-600" />
                <h2 className="font-semibold">You may also like</h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {suggestions.map((p, i) => <SearchResultCard key={p.id} product={p} index={i} />)}
              </div>
            </>
          )}

          {!isLoading && results.length === 0 && q && (
            <EmptyState
              icon={SearchX}
              title={`No results for "${q}"`}
              subtitle="Try a different keyword or browse our categories instead."
            />
          )}

          {!q && (
            <EmptyState
              icon={SearchX}
              title="Start typing to search"
              subtitle="Search for pooja items, pandits and more."
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
