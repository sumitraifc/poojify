import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import { useSettingsStore } from "../store/settingsStore";

export default function About() {
  const html = useSettingsStore((s) => s.getContent("About Us"));

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section max-w-3xl">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "About Us" }]} />
          <h1 className="mb-4 text-2xl font-bold">About Us</h1>
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
