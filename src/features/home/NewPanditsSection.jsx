import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";

const listClass = "flex gap-4 overflow-x-auto pb-2 scrollbar-hide";
const gridClass = "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4";

export default function NewPanditsSection({ data }) {
  const items = data?.items || [];
  const title = data?.title || "Pandits";
  const viewType = data?.view_type || "list";

  if (!items.length) return null;

  return (
    <section className="section-y pt-0">
      <div className="section">
        <SectionHeader title={title} viewAllLink="/purohit-booking" viewAllLabel="See All" />
        <div className={viewType === "grid" ? gridClass : listClass}>
          {items.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`card text-center ${
                viewType === "list" ? "w-44 shrink-0" : "w-auto"
              }`}
            >
              <Link
      to={`/purohit-booking/${p.id}`}  >
              <img src={p.profile_image} alt={p.full_name} className="mx-auto h-20 w-20 rounded-full object-cover border-2 border-yellow-400" />
              <p className="mt-3 line-clamp-1 font-semibold">{p.full_name}</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink-500">
                <MapPin size={12} /> {p.city}
              </p>
              <span className="badge mt-2">{p.experience_years} yrs exp</span>
              <span className="btn-primary btn-sm mt-3 w-full">
                Book Now
              </span>
              {/* <Link to={`/purohit-booking/${p.id}`} className="btn-primary btn-sm mt-3 w-full">
                Book Now
              </Link> */}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
