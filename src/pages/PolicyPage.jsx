import { useLocation } from "react-router-dom";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";

const titles = {
  "/terms": "Terms & Conditions",
  "/privacy-policy": "Privacy Policy",
  "/shipping-policy": "Shipping Policy",
  "/refund-policy": "Return & Refund Policy",
  "/faq": "Frequently Asked Questions",
};

export default function PolicyPage() {
  const { pathname } = useLocation();
  const title = titles[pathname] || "Policy";

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section max-w-3xl">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: title }]} />
          <h1 className="mb-4 text-2xl font-bold">{title}</h1>
          <div className="card space-y-3 text-sm text-ink-500">
            <p>This page explains our {title.toLowerCase()} in detail. Replace this placeholder copy with your actual policy content.</p>
            <p>Last updated: January 2026</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
