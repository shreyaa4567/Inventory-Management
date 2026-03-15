import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InventoryProvider } from './context/InventoryContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import SuppliersPage from './pages/SuppliersPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import PurchaseOrderPage from './pages/PurchaseOrderPage';
import UserPage from './pages/UserPage';
import WarehouseMapPage from './pages/WarehouseMapPage';
import PickRoutePage from './pages/PickRoutePage';
import SupplierBillsPage from './pages/SupplierBillsPage';
import CustomerBillsPage from './pages/CustomerBillsPage';

const App: React.FC = () => {
  return (
    <InventoryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/purchase-orders" element={<PurchaseOrderPage />} />
            <Route path="/supplier-bills" element={<SupplierBillsPage />} />
            <Route path="/customer-bills" element={<CustomerBillsPage />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="/warehouse-map" element={<WarehouseMapPage />} />
            <Route path="/pick-route" element={<PickRoutePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </InventoryProvider>
  );
};

export default App;

