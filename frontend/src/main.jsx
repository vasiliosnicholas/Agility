import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";
import IndexPage from "./pages/IndexPage.jsx";
import Template from "./pages/Template.jsx";
import { BrowserRouter, Routes, Route } from "react-router";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Template>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexPage />}></Route>
        </Routes>
      </BrowserRouter>
    </Template>
  </StrictMode>
);
