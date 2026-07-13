import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";
import IndexPage from "./pages/IndexPage.js";
import Template from "./pages/Template.js";
import Kanban from "./pages/Kanban.js";
import { BrowserRouter, Routes, Route } from "react-router";
createRoot(document.getElementById("root")).render(_jsx(StrictMode, { children: _jsx(Template, { children: _jsx(BrowserRouter, { children: _jsx(Routes, { children: _jsxs(Route, { path: "/", children: [_jsx(Route, { index: true, element: _jsx(IndexPage, {}) }), _jsx(Route, { path: "kanban", element: _jsx(Kanban, {}) })] }) }) }) }) }));
//# sourceMappingURL=main.js.map