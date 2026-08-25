import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LoadingScreen } from './components/ui/LoadingSpinner';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

const ForceChangePasswordPage = lazy(() => import('./pages/auth/ForceChangePasswordPage'));

// Dashboard
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// CRUD pages
const EmployeesPage = lazy(() => import('./pages/employees/EmployeesPage'));
const EmployeeDetail = lazy(() => import('./pages/employees/EmployeeDetail'));
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage'));
const CustomerDetail = lazy(() => import('./pages/customers/CustomerDetail'));
const SuppliersPage = lazy(() => import('./pages/suppliers/SuppliersPage'));
const SupplierDetail = lazy(() => import('./pages/suppliers/SupplierDetail'));
const CategoriesPage = lazy(() => import('./pages/categories/CategoriesPage'));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const ProductDetail = lazy(() => import('./pages/products/ProductDetail'));

// Advanced modules
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage'));
const InventoryHistoryPage = lazy(() => import('./pages/inventory/InventoryHistoryPage'));
const SalesPage = lazy(() => import('./pages/sales/SalesPage'));
const CreateSalePage = lazy(() => import('./pages/sales/CreateSalePage'));
const SaleDetailPage = lazy(() => import('./pages/sales/SaleDetailPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage'));

// Other
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'));
const ForbiddenPage = lazy(() => import('./pages/errors/ForbiddenPage'));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Force Password Change (Protected but allows mustChangePassword=true) */}
        <Route element={<ProtectedRoute requirePasswordChange={false} />}>
          <Route element={<AuthLayout />}>
            <Route path="/force-change-password" element={<ForceChangePasswordPage />} />
          </Route>
        </Route>

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Employees - Admin only */}
            <Route element={<RoleRoute roles={['ADMIN']} />}>
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} />
            </Route>

            {/* Customers */}
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />

            {/* Suppliers - Admin/Manager */}
            <Route element={<RoleRoute roles={['ADMIN', 'MANAGER']} />}>
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/suppliers/:id" element={<SupplierDetail />} />
            </Route>

            {/* Categories */}
            <Route path="/categories" element={<CategoriesPage />} />

            {/* Products */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* Inventory - All authenticated users (Staff view inventory) */}
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/history" element={<InventoryHistoryPage />} />

            {/* Sales */}
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/sales/new" element={<CreateSalePage />} />
            <Route path="/sales/:id" element={<SaleDetailPage />} />

            {/* Reports & Analytics - Admin/Manager */}
            <Route element={<RoleRoute roles={['ADMIN', 'MANAGER']} />}>
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>

            {/* Profile */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Settings - Admin only */}
            <Route element={<RoleRoute roles={['ADMIN']} />}>
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Error routes */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
