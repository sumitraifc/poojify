import { Phone, Mail, MapPin } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { showToast } from "../components/common/Toast";

export default function Contact() {
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
            <div className="space-y-4 text-sm">
              <p className="flex items-center gap-3"><Phone className="text-primary-500" size={18} /> +91 98765 43210</p>
              <p className="flex items-center gap-3"><Mail className="text-primary-500" size={18} /> support@poojify.com</p>
              <p className="flex items-center gap-3"><MapPin className="text-primary-500" size={18} /> Jaipur, Rajasthan, India</p>
            </div>
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
