import { useLocation } from "react-router-dom";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import { useSettingsStore } from "../store/settingsStore";

const routeTypeMap = {
  "/policy/terms-conditions": "Terms Conditions",
  "/policy/privacy-policy": "Privacy Policy",
  "/policy/refund-and-cancellation-policy": "Refund & Cancellation Policy",
  "/policy/child-safety-policy": "Child Safety Policy",
};

const routeTitleMap = {
  "/policy/terms-conditions": "Terms & Conditions",
  "/policy/privacy-policy": "Privacy Policy",
  "/policy/refund-and-cancellation-policy": "Refund & Cancellation Policy",
  "/policy/child-safety-policy": "Child Safety Policy",
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
          <div className="card text-sm text-ink-600 dark:text-cream-100/70">
            {html ? (
              <div
                className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:text-ink-900 [&_h1]:dark:text-cream-100
                  [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:text-ink-900 [&_h2]:dark:text-cream-100
                  [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2
                  [&_p]:mb-3 [&_p]:leading-relaxed
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1
                  [&_a]:text-primary-600 [&_a]:underline
                  [&_strong]:font-semibold [&_strong]:text-ink-900 [&_strong]:dark:text-cream-100
                  [&_br]:block"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p>Content coming soon.</p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
