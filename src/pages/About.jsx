import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import { ShieldCheck, Users, Heart } from "lucide-react";

export default function About() {
  return (
    <PageTransition>
      <div className="section-y">
        <div className="section max-w-3xl">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "About Us" }]} />
          <h1 className="mb-4 text-2xl font-bold">About Poojify</h1>
          <p className="mb-6 text-ink-500">
            Poojify connects devotees with verified purohits and authentic pooja essentials, delivered right to your
            doorstep. Our mission is to make every sacred ritual simple, trustworthy, and accessible.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card text-center">
              <ShieldCheck className="mx-auto mb-2 text-primary-500" />
              <p className="font-semibold">Verified Priests</p>
            </div>
            <div className="card text-center">
              <Users className="mx-auto mb-2 text-primary-500" />
              <p className="font-semibold">50,000+ Devotees</p>
            </div>
            <div className="card text-center">
              <Heart className="mx-auto mb-2 text-primary-500" />
              <p className="font-semibold">Made with Devotion</p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
