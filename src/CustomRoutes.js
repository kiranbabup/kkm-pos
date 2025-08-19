import { Navigate, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import SuperAdminDashboard from "./layouts/superAdminPanel/SuperAdminDashboard";
import WarehouseAdminDashboard from "./layouts/warehousePanel/WarehouseAdminDashboard";
import StoreAdminDashboard from "./layouts/storePanel/storeAdminPanel/StoreAdminDashboard";
import CasherDashboard from "./layouts/storePanel/casherPanel/CasherDashboard";
import CategoriesPage from "./layouts/superAdminPanel/CategoriesPage";
import PaymentsReceived from "./layouts/superAdminPanel/EmployeePayments";
import SuppliersPage from "./layouts/superAdminPanel/SuppliersPage";
import BrandsPage from "./layouts/superAdminPanel/BrandsPage";
import UnitsPage from "./layouts/superAdminPanel/UnitsPage";
import StoresPage from "./layouts/superAdminPanel/StoresPage";
import UsersManagement from "./layouts/superAdminPanel/UsersManagement";
import ProductsPage from "./layouts/superAdminPanel/ProductsPage";
import CreateMainProducts from "./layouts/superAdminPanel/CreateMainProducts";
import AddStoreProducts from "./layouts/superAdminPanel/storeProducts/AddStoreProducts";

const CustomeRoutes = () => {
  return (
    <Routes>
      {/* home */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/super-admin" element={<SuperAdminDashboard />} />
      <Route path="/warehouse-admin" element={<WarehouseAdminDashboard />} />
      <Route path="/store-admin" element={<StoreAdminDashboard />} />
      <Route path="/casher-panel" element={<CasherDashboard />} />

      <Route path="/stores" element={<StoresPage />} />
      <Route path="/users_management" element={<UsersManagement />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/suppliers" element={<SuppliersPage />} />
      <Route path="/brands" element={<BrandsPage />} />
      <Route path="/units" element={<UnitsPage />} />
      <Route path="/employee-payments" element={<PaymentsReceived />} />

      <Route path="/products" element={<ProductsPage />} />
      <Route path="/add-to-main" element={<CreateMainProducts />} />
      <Route path="/add-store-products" element={<AddStoreProducts />} />
    </Routes>
  );
};

export default CustomeRoutes;
