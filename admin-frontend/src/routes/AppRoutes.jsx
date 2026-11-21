import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './guards/ProtectedRoute'
import PublicRoute from './guards/PublicRoute'
import PageFallback from './components/PageFallback'
import AdminLayout from '@/components/layout/AdminLayout'

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const ProductsPage = lazy(() => import('@/pages/products/ProductsPage'))
const ProductFormPage = lazy(() => import('@/pages/products/ProductFormPage'))
const CategoriesPage = lazy(() => import('@/pages/categories/CategoriesPage'))
const BrandsPage = lazy(() => import('@/pages/brands/BrandsPage'))
const InventoryPage = lazy(() => import('@/pages/inventory/InventoryPage'))
const CustomersPage = lazy(() => import('@/pages/customers/CustomersPage'))
const CustomerDetailPage = lazy(() => import('@/pages/customers/CustomerDetailPage'))
const OrdersPage = lazy(() => import('@/pages/orders/OrdersPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const NotFoundPage = lazy(() => import('@/pages/common/NotFoundPage'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductFormPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
