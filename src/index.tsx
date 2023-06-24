import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./Firebase";
import "./index.scss";

const el = document.getElementById("root") as HTMLElement;

if (el) {
    const root = ReactDOM.createRoot(el);
    root.render(<App/>);
} else {
    console.error("Root element not found. Could not render Application.");
}
