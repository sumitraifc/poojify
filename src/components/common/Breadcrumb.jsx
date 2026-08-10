import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center flex-wrap gap-1 text-sm text-ink-500 mb-4">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} className="flex items-center gap-1">
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-primary-600">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-primary-600 font-medium" : ""}>{item.label}</span>
            )}
            {!isLast && <ChevronRight size={14} />}
          </span>
        );
      })}
    </nav>
  );
}
