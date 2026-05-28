import { Route, Routes } from "react-router-dom";
import { Topbar } from "@/components/Topbar";
import DashboardPage from "@/pages/DashboardPage";
import AgreementPage from "@/pages/AgreementPage";
import AdminPage from "@/pages/AdminPage";

export default function App() {
  return (
    <div className="app-shell">
      <Topbar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/agreement/:address" element={<AgreementPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}
