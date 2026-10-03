import { createRoot } from "react-dom/client";
import CaseStatus from "./CaseStatus";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('React sandbox mount element "#root" was not found.');
}

createRoot(rootElement).render(<CaseStatus />);