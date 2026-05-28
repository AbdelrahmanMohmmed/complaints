import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { setupMockBackend } from "./services/mockBackend";

// Initialize mock backend for development/testing with mock data
setupMockBackend();

createRoot(document.getElementById("root")!).render(<App />);
