import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import "./i18n";
import "./index.css";
import { useThemeStore } from "./store/themeStore.js";
import { useLocationStore } from "./store/locationStore.js";
import AppRoutes from "./Routes.jsx";

// Apply saved theme immediately on boot to avoid a light-mode flash
document.documentElement.classList.toggle("dark", useThemeStore.getState().theme === "dark");

// Ask for the user's location only once, ever — first app load only (see captureOnce)
useLocationStore.getState().captureOnce();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 2500,
            style: {
              borderRadius: "10px",
              background: "#2E2521",
              color: "#fff",
              fontSize: "14px",
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
