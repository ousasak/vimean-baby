import React, { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './guards/ProtectedRoute'
import GuestRoute from './guards/GuestRoute'
import DefaultLayout from '@/components/layout/DefaultLayout'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

import AccountLayout from '@/pages/account/AccountLayout'
import AccountOverviewPage from '@/pages/account/AccountOverviewPage'
import AccountProfilePage from '@/pages/account/AccountProfilePage'
import AccountOrdersPage from '@/pages/account/AccountOrdersPage'
import AccountAddressesPage from '@/pages/account/AccountAddressesPage'
import AccountSecurityPage from '@/pages/account/AccountSecurityPage'

const HomePage = lazy(() => import('@/pages/home/HomePage'))
const ProductsPage = lazy(() => import('@/pages/products/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/products/ProductDetailPage'))
const CategoriesPage = lazy(() => import('@/pages/categories/CategoriesPage'))
const CategoryProductsPage = lazy(() => import('@/pages/categories/CategoryProductsPage'))
const ContactPage = lazy(() => import('@/pages/contact/ContactPage'))
const CheckoutPage = lazy(() => import('@/pages/checkout/CheckoutPage'))

const NotFoundPage = lazy(() => import('@/pages/common/NotFoundPage'))

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/:slug" element={<CategoryProductsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="checkout" element={<CheckoutPage />} />

        {/* Guest only routes */}
        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Protected Account routes */}
        <Route path="account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
          <Route index element={<AccountOverviewPage />} />
          <Route path="profile" element={<AccountProfilePage />} />
          <Route path="orders" element={<AccountOrdersPage />} />
          <Route path="addresses" element={<AccountAddressesPage />} />
          <Route path="security" element={<AccountSecurityPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
