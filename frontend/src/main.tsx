import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";
import IndexPage from "./pages/IndexPage.tsx";
import Kanban from "./pages/Kanban.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import PlanPhases from "./pages/PlanPhases.tsx";
import ManageDevs from "./pages/ManageDevs.tsx";
import Unauthorized from "./pages/Unauthorized.tsx";
import NotFound from "./pages/NotFound.tsx";
import { BrowserRouter, Routes, Route } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<IndexPage />}></Route>
          <Route path="login" element={<LoginPage />}></Route>
          <Route path="unauthorized" element={<Unauthorized />}></Route>
          <Route path="kanban" element={<Kanban />}></Route>
          <Route path="phases" element={<PlanPhases />}></Route>
          <Route path="team" element={<ManageDevs />}></Route>
        </Route>
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
