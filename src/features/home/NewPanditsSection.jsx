import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import { purohits } from "../../data/purohits";

export default function NewPanditsSection() {
  return (
    <section className="section-y pt-0">
      <div className="section">
        <SectionHeader title="New Pandits Section" viewAllLink="/purohit-booking" viewAllLabel="See All" />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {purohits.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="card w-48 shrink-0 text-center"
            >
              <img src={p.image} alt={p.name} className="mx-auto h-20 w-20 rounded-full object-cover" />
              <p className="mt-3 line-clamp-1 font-semibold">{p.name}</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink-500">
                <MapPin size={12} /> {p.location.split(",")[0]}
              </p>
              <span className="badge mt-2">{p.experience} yrs exp</span>
              <Link to={`/purohit-booking/${p.id}`} className="btn-primary btn-sm mt-3 w-full">
                Book Now
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
