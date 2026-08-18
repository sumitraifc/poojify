import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { showToast } from "../components/common/Toast";
import { useSettingsStore } from "../store/settingsStore";

const iconMap = {
  phone: Phone,
  email: Mail,
  Whatsapp: MessageCircle,
};

function serviceLabel(type, value) {
  if (type === "phone") return value.replace("tel:", "");
  if (type === "email") return value.replace("mailto:", "").replace("mailto:", "");
  if (type === "Whatsapp") return "WhatsApp";
  return value;
}

export default function Contact() {
  const customerService = useSettingsStore((s) => s.customerService);
  const html = useSettingsStore((s) => s.getContent("Contact Us"));

  function handleSubmit(e) {
    e.preventDefault();
    showToast.success("Message sent! We'll get back to you soon.");
    e.target.reset();
  }

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section grid gap-8 lg:grid-cols-2">
          <div>
            <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Contact Us" }]} />
            <h1 className="mb-4 text-2xl font-bold">Get in Touch</h1>

            {html && (
              <div
                className="text-sm text-ink-600 dark:text-cream-100/70 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}

            {!html && customerService.length > 0 && (
              <div className="space-y-4 text-sm">
                {customerService.map((item) => {
                  const Icon = iconMap[item.type] ?? MapPin;
                  return (
                    <a
                      key={item.id}
                      href={item.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:text-primary-600"
                    >
                      <Icon className="text-primary-500" size={18} />
                      {serviceLabel(item.type, item.value)}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input required className="input" placeholder="Your name" />
            </div>
            <div>
              <label className="label">Email</label>
              <input required type="email" className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea required rows={4} className="input" placeholder="How can we help you?" />
            </div>
            <Button type="submit" fullWidth>Send Message</Button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
