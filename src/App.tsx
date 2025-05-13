import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/layout/Header";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Demo from "./pages/Demo";
import Roadmaps from "./pages/Roadmaps";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AccountSettings from "./pages/AccountSettings";
import NotFound from "./pages/NotFound";
import ViewRoadmap from "./pages/ViewRoadmap";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/roadmaps" element={<Roadmaps />} />
        <Route path="/roadmap/:id" element={<ViewRoadmap />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/account" element={<AccountSettings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}