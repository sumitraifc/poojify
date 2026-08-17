import { Link } from "react-router-dom";
import SectionHeader from "../../components/common/SectionHeader";
import ProductCard from "../../components/common/ProductCard";

// list = hamesha horizontal scroll
// grid = hamesha grid
const listClass = "flex gap-4 overflow-x-auto pb-2 scrollbar-hide";
const gridClass = "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4";

export default function PopularProducts({ data }) {
  const items = data?.items || [];
  const title = data?.title || "Products";
  const viewType = data?.view_type || "list";

  if (!items.length) return null;

  const normalized = items.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.discount_price ?? p.price,
    mrp: p.price,
    image: p.image,
    images: p.images || [],
    rating: p.product_rating || 0,
    category_id: p.category_id,
    sub_category_id: p.sub_category_id,
  }));

  return (
    <section className="section-y pt-0">
      <div className="section">
        <SectionHeader title={title} viewAllLink="/shop" />
        <div className={viewType === "grid" ? gridClass : listClass}>
          {normalized.map((p, i) => (
            <div key={p.id} className={viewType === "list" ? "w-48 shrink-0" : ""}>
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
        {data?.has_more && (
          <div className="mt-6 text-center">
            <Link to="/shop" className="btn-outline">View All {data.total_count} Products</Link>
          </div>
        )}
      </div>
    </section>
  );
}
