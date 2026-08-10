import { motion } from "framer-motion";
import { Package, Crown, Truck, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

const features = [
  { icon: Package, title: "Wide Range of Products", subtitle: "All puja essentials at one place" },
  { icon: Crown, title: "Trusted by Thousands", subtitle: "Happy customers across India" },
  { icon: Truck, title: "Fast & Secure Delivery", subtitle: "Delivery at your doorstep" },
  { icon: RefreshCw, title: "Easy Returns", subtitle: "Hassle-free return policy" },
];

export default function WhyShop() {
  const { t } = useTranslation();
  return (
    <section className="section-y pt-0">
      <div className="section rounded-2xl bg-primary-50 py-8">
        <div className="grid grid-cols-2 gap-6 px-6 sm:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-500 shadow-card">
                <f.icon size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-ink-500">{f.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
