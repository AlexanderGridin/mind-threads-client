import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ChakraUIProvider } from "@/components/lib";

import { App } from "./App";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraUIProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </ChakraUIProvider>
  </StrictMode>
);
