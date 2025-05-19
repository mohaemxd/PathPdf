import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
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
import GoogleDriveCallback from "./pages/GoogleDriveCallback";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/roadmap/:id" element={<ViewRoadmap />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/roadmaps" element={<Roadmaps />} />
        <Route path="/account" element={<AccountSettings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/google-drive-callback" element={<GoogleDriveCallback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}