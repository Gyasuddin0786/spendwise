import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

import App from "./App";
import { FinanceProvider } from "./context/FinanceContext";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <FinanceProvider>
        <App />
      </FinanceProvider>
    </HelmetProvider>
  </StrictMode>
);