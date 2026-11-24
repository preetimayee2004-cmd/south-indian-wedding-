import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/great-vibes/400.css";
import "@fontsource/eb-garamond/400.css";
import "@fontsource/eb-garamond/500.css";
import "@fontsource/eb-garamond/700.css";
import "@fontsource/eb-garamond/600.css";
import "@fontsource/eb-garamond/400-italic.css";
import "@fontsource/eb-garamond/500-italic.css";
import "@fontsource/tiro-devanagari-hindi/devanagari-400.css";
import "@fontsource/yeseva-one/400.css";
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "./styles/index.css";
import "./styles/premium.css";
import weddingConfig from "@/config/wedding.config";
import { WeddingProvider } from "@/context/WeddingContext";
import { ThemeProvider } from "@/context/ThemeProvider";
import { GuestProvider } from "@/context/GuestContext";
import { AudioProvider } from "@/context/AudioContext";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WeddingProvider config={weddingConfig}>
      <ThemeProvider>
        <GuestProvider>
          <AudioProvider>
            <App />
          </AudioProvider>
        </GuestProvider>
      </ThemeProvider>
    </WeddingProvider>
  </StrictMode>,
);
