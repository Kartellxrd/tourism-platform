import Sidebar from '../../components/Sidebar';
import NavbarDashboard from '../../components/NavbarDashboard';
import { WishlistProvider } from '../../components/WishListContext';

export default function DashboardLayout({ children, active }) {
  return (
    <WishlistProvider>
    <div className="min-h-screen bg-slate-50">
      <Sidebar active={active} />
      <NavbarDashboard />
      
      <div className="ml-0 lg:ml-64 pt-16 transition-all duration-300">
        {children}
      </div>
    </div>
    </WishlistProvider>
  );
}