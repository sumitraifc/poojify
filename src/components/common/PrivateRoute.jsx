import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent("poojify:require-login"));
      navigate("/", { replace: true, state: { from: location.pathname } });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;
  return children;
}
