import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import SectionHeader from "../../components/common/SectionHeader";
import ProductCard from "../../components/common/ProductCard";
import { ProductCardSkeleton } from "../../components/common/Loader";
import { products } from "../../data/products";

// Simulated API call — swap with axiosClient.get("/products/popular") when backend is ready
function fetchPopularProducts() {
  return new Promise((resolve) => setTimeout(() => resolve(products.slice(0, 6)), 500));
}

export default function PopularProducts() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["popular-products"],
    queryFn: fetchPopularProducts,
  });

  return (
    <section className="section-y pt-0">
      <div className="section">
        <SectionHeader title={t("home.popularProducts")} viewAllLink="/shop" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : data.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
