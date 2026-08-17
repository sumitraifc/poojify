import { useLocation } from "react-router-dom";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import { useSettingsStore } from "../store/settingsStore";

const routeTypeMap = {
  "/terms": "Terms Conditions",
  "/privacy-policy": "Privacy Policy",
  "/refund-policy": "Refund & Cancellation Policy",
  "/child-safety": "Child Safety Policy",
};

const routeTitleMap = {
  "/terms": "Terms & Conditions",
  "/privacy-policy": "Privacy Policy",
  "/refund-policy": "Refund & Cancellation Policy",
  "/child-safety": "Child Safety Policy",
  "/shipping-policy": "Shipping Policy",
  "/faq": "Frequently Asked Questions",
};

export default function PolicyPage() {
  const { pathname } = useLocation();
  const title = routeTitleMap[pathname] || "Policy";
  const apiType = routeTypeMap[pathname];
  const html = useSettingsStore((s) => (apiType ? s.getContent(apiType) : null));

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section max-w-3xl">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: title }]} />
          <h1 className="mb-4 text-2xl font-bold">{title}</h1>
          <div className="card text-sm text-ink-600 dark:text-cream-100/70 prose prose-sm max-w-none">
            {html ? (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p>Content coming soon.</p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
