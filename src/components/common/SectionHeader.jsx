import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Shared section title bar used across every home-page section
 * (Popular Products, Combo Offers, New Pandits, New Best Offers...).
 * A dashed rule fills the gap between the title and "View All",
 * matching the reference design.
 */
export default function SectionHeader({ title, viewAllLink, viewAllLabel = "View All" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-6 flex items-center gap-3"
    >
      <h2 className="shrink-0 text-xl font-bold sm:text-2xl">{title}</h2>
      <span className="h-0 flex-1 border-t border-dashed border-primary-300" />
      {viewAllLink && (
        <Link to={viewAllLink} className="link flex shrink-0 items-center gap-1 text-sm font-semibold">
          {viewAllLabel} <ArrowRight size={15} />
        </Link>
      )}
    </motion.div>
  );
}
