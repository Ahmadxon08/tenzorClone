// src/layouts/AdminLayout.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

const AdminLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleTabChange = (path: string) => {
    navigate(path);
  };
  return (
    <div
      className={`min-h-screen flex flex-nowrap`}
      style={{
        background:
          "radial-gradient(70% 55% at 50% 50%, #2a5d77 0%, #184058 18%, #0f2a43 34%, #0a1b30 50%, #071226 66%, #040d1c 80%, #020814 92%, #01040d 97%, #000309 100%), radial-gradient(160% 130% at 10% 10%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%), radial-gradient(160% 130% at 90% 90%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%)",
      }}
    >
      <AdminSidebar activeTab={pathname} onTabChange={handleTabChange} />
      <div className="flex-1 flex flex-col overflow-x-auto">
        <AdminHeader />
        <main className="flex-1 p-8 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
