import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SectionHeader({ title, viewAllLink }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-6 flex items-center justify-between"
    >
      <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
      {viewAllLink && (
        <Link to={viewAllLink} className="link flex items-center gap-1 text-sm font-semibold">
          View All <ArrowRight size={15} />
        </Link>
      )}
    </motion.div>
  );
}
