import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { productService } from '@/services/productService'
import { useToast } from '@/hooks/useToast'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import AppIcon from '@/components/ui/AppIcon'
import ProductForm from './components/ProductForm'

export default function ProductFormPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const errorMessage = useApiErrorMessage()

  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = `${
      isEditing ? t('products.edit') : t('products.add')
    } | Vimean Baby Admin`

    if (isEditing) {
      setLoading(true)
      productService
        .getProduct(id)
        .then((res) => setInitialData(res))
        .catch((err) => setError(err))
        .finally(() => setLoading(false))
    }
  }, [id, isEditing, t])

  const handleSubmit = async (payload) => {
    setSaving(true)
    try {
      if (isEditing) {
        await productService.updateProduct(id, payload)
        toast.success(t('products.saved'))
      } else {
        await productService.createProduct(payload)
        toast.success(t('products.created'))
      }
      navigate('/products')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? t('products.edit') : t('products.add')}
        description={isEditing ? initialData?.nameEn : t('products.addSubtitle')}
        breadcrumb={
          <Link to="/products" className="mb-1 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
            <AppIcon name="chevronLeft" size={16} /> {t('nav.products')}
          </Link>
        }
      />

      {loading ? (
        <div className="card h-96 animate-pulse" aria-busy="true" />
      ) : error ? (
        <div className="card p-6">
          <EmptyState icon="alert" title={t('errors.loadTitle')} description={errorMessage(error)}>
            <Link to="/products" className="btn-secondary">{t('nav.products')}</Link>
          </EmptyState>
        </div>
      ) : (
        <ProductForm initialData={initialData} saving={saving} onSubmit={handleSubmit} />
      )}
    </div>
  )
}
