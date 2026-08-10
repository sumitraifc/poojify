import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Button from "../components/common/Button";

export default function NotFound() {
  return (
    <PageTransition>
      <div className="section-y flex flex-col items-center justify-center py-20 text-center">
        <Compass size={48} className="mb-4 text-primary-500" />
        <h1 className="text-3xl font-bold">404</h1>
        <p className="mt-1 text-ink-500">The page you're looking for doesn't exist.</p>
        <Link to="/"><Button className="mt-5">Back to Home</Button></Link>
      </div>
    </PageTransition>
  );
}
