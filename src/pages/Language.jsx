import { useTranslation } from "react-i18next";
import { Check, Globe } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";

const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
];

export default function Language() {
  const { t, i18n } = useTranslation();

  function changeLanguage(code) {
    i18n.changeLanguage(code);
  }

  return (
    <PageTransition>
      <div className="section-y flex justify-center">
        <div className="w-full max-w-lg">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Language Settings" }]} />

          <div className="card">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                <Globe size={20} />
              </span>
              <div>
                <h1 className="text-lg font-bold">{t("language.title")}</h1>
                <p className="text-sm text-ink-500">{t("language.subtitle")}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {languages.map((lang) => {
                const active = i18n.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                      active ? "border-primary-500 bg-primary-50" : "border-ink-500/15 hover:border-primary-300"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{lang.native}</p>
                      <p className="text-xs text-ink-500">{lang.label}</p>
                    </div>
                    {active && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white">
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
