import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import { PageLoader } from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import { getComboList } from "../api/comboApi";
import { formatINR } from "../utils/format";
import { PackageSearch } from "lucide-react";

export default function ComboOffersPage() {
  const { data: combos = [], isLoading } = useQuery({
    queryKey: ["combo-list"],
    queryFn: () => getComboList({ limit: 10, offset: 0 }),
    select: (res) => res?.data?.data ?? res?.data ?? [],
  });

  if (isLoading) return <PageLoader />;

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Combo Offers" }]} />
          <h1 className="mb-6 text-2xl font-bold">Combo Offers</h1>

          {combos.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No combo offers" subtitle="Check back soon for exciting combo deals!" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {combos.map((combo) => (
              
                    <Link
                key={combo.id}
                to={`/combo-offers/${combo.id}`}
                className="card relative block overflow-hidden transition hover:shadow-md"
              >
                  {combo.off && (
                    <span className="absolute left-3 top-3 badge bg-primary-500 text-white">{combo.off}% OFF</span>
                  )}
                  <img src={combo.image} alt={combo.name} className="h-auto w-full rounded-lg object-contain" />
                  <h3 className="mt-3 font-semibold">{combo.name}</h3>
                  {combo.desc && <p className="mt-1 text-xs text-ink-500">{combo.desc}</p>}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-bold text-primary-600">{formatINR(combo.discount_price ?? combo.price)}</span>
                    {combo.price && combo.discount_price && (
                      <span className="text-xs text-ink-500 line-through">{formatINR(combo.price)}</span>
                    )}
                  </div>
                  <div className="btn-outline btn-sm mt-3 w-full">View Details</div>
                </Link>
              
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
