import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import { comboOffers } from "../data/products";
import { formatINR } from "../utils/format";
import { Link } from "react-router-dom";

export default function ComboOffersPage() {
  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Combo Offers" }]} />
          <h1 className="mb-6 text-2xl font-bold">Combo Offers</h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {comboOffers.map((combo) => (
              <div key={combo.id} className="card relative overflow-hidden">
                <span className="absolute left-3 top-3 badge bg-primary-500 text-white">{combo.off}% OFF</span>
                <img src={combo.image} alt={combo.name} className="h-36 w-full rounded-lg object-cover" />
                <h3 className="mt-3 font-semibold">{combo.name}</h3>
                <p className="mt-1 text-xs text-ink-500">{combo.desc}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-bold text-primary-600">{formatINR(combo.price)}</span>
                  <span className="text-xs text-ink-500 line-through">{formatINR(combo.mrp)}</span>
                </div>
                <Link to={`/combo-offers/${combo.id}`} className="btn-outline btn-sm mt-3 w-full">View Details</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
