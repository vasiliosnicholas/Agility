import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";
import IndexPage from "./pages/IndexPage.tsx";
import Template from "./pages/Template.tsx";
import Kanban from "./pages/Kanban.tsx";
import { BrowserRouter, Routes, Route } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Template>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={<IndexPage />}></Route>
            <Route path="kanban" element={<Kanban />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </Template>
  </StrictMode>
);
