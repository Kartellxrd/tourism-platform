import Sidebar from "../../components/Sidebar";
import NavbarDashboard from "../../components/NavbarDashboard";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0b0f1a]">
      <Sidebar />
      <NavbarDashboard />
      <div className="ml-64 pt-20">
        {children}
      </div>
    </div>
  );
}