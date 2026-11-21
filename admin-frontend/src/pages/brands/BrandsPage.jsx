import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { brandService } from '@/services/brandService'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/hooks/useConfirm'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { slugify, thumb, initials } from '@/utils/formatters'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import AppIcon from '@/components/ui/AppIcon'
import UiModal from '@/components/ui/UiModal'
import ImageUploader from '@/components/ui/ImageUploader'
import UiToggle from '@/components/ui/UiToggle'

export default function BrandsPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const { confirm } = useConfirm()
  const errorMessage = useApiErrorMessage()

  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    document.title = `${t('nav.brands')} | Vimean Baby Admin`
  }, [t])

  const loadBrands = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await brandService.getBrands()
      setBrands(data || [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBrands()
  }, [loadBrands])

  const blank = () => ({
    name: '',
    slug: '',
    logoUrl: null,
    active: true,
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [slugTouched, setSlugTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q
      ? brands.filter((b) => `${b.name} ${b.slug}`.toLowerCase().includes(q))
      : brands
  }, [search, brands])

  const handleNameChange = (e) => {
    const value = e.target.value
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: !slugTouched ? slugify(value) : prev.slug,
    }))
  }

  const errors = useMemo(() => {
    if (!submitted) return {}
    const result = {}
    if (!form.name.trim()) result.name = t('validation.required')
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) result.slug = t('validation.slug')
    return result
  }, [submitted, form, t])

  function openModal(brand) {
    setEditing(brand)
    setForm(brand ? { ...brand } : blank())
    setSlugTouched(Boolean(brand))
    setSubmitted(false)
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSubmitted(true)
    if (!form.name.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      return
    }
    setSaving(true)
    try {
      const body = { ...form, name: form.name.trim() }
      if (editing) {
        await brandService.updateBrand(editing.id, body)
        toast.success(t('brands.saved'))
      } else {
        await brandService.createBrand(body)
        toast.success(t('brands.created'))
      }
      setModalOpen(false)
      loadBrands()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(brand) {
    if (brand.active) {
      const ok = await confirm({
        title: t('brands.deactivateTitle'),
        message: t('brands.deactivateMessage', { name: brand.name }),
        confirmLabel: t('common.deactivate'),
        danger: true,
      })
      if (!ok) return
    }
    try {
      if (brand.active) {
        await brandService.deleteBrand(brand.id)
      } else {
        await brandService.updateBrand(brand.id, { ...brand, active: true })
      }
      toast.success(brand.active ? t('common.deactivated') : t('common.activated'))
      loadBrands()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader
        title={t('nav.brands')}
        description={t('brands.subtitle')}
        actions={
          <button type="button" className="btn-primary" onClick={() => openModal(null)}>
            <AppIcon name="plus" size={16} /> {t('brands.add')}
          </button>
        }
      />

      <div className="card overflow-hidden">
        <div className="border-b border-line/70 p-4">
          <label className="relative block max-w-md">
            <span className="sr-only">{t('common.search')}</span>
            <AppIcon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              className="field-input pl-10"
              placeholder={t('common.search')}
            />
          </label>
        </div>

        {error ? (
          <div className="p-6">
            <EmptyState icon="alert" title={t('errors.loadTitle')} description={errorMessage(error)}>
              <button type="button" className="btn-primary" onClick={loadBrands}>
                {t('common.retry')}
              </button>
            </EmptyState>
          </div>
        ) : loading && !brands.length ? (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        ) : !filtered.length ? (
          <EmptyState
            icon="brands"
            title={search ? t('common.noResults') : t('brands.empty')}
          >
            {!search && (
              <button type="button" className="btn-primary" onClick={() => openModal(null)}>
                {t('brands.add')}
              </button>
            )}
          </EmptyState>
        ) : (
          <ul className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((brand) => (
              <li
                key={brand.id}
                className={`flex items-center gap-3 rounded-xl border border-line/80 p-3 ${
                  brand.active ? '' : 'opacity-70'
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white">
                  {brand.logoUrl ? (
                    <img src={thumb(brand.logoUrl, 96)} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-ink-muted">{initials(brand.name)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{brand.name}</p>
                  <span className={`mt-1 ${brand.active ? 'badge-success' : 'badge-neutral'}`}>
                    {brand.active ? t('common.active') : t('common.inactive')}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    className="btn-icon"
                    aria-label={t('common.edit')}
                    onClick={() => openModal(brand)}
                  >
                    <AppIcon name="edit" size={18} />
                  </button>
                  <button
                    type="button"
                    className={`btn-icon ${brand.active ? 'hover:text-danger' : 'hover:text-ink'}`}
                    aria-label={brand.active ? t('common.deactivate') : t('common.activate')}
                    onClick={() => handleToggleActive(brand)}
                  >
                    <AppIcon name={brand.active ? 'trash' : 'refresh'} size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <UiModal
        open={modalOpen}
        title={editing ? t('brands.edit') : t('brands.add')}
        size="sm"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" form="brand-form" className="btn-primary" disabled={saving}>
              {t('common.save')}
            </button>
          </>
        }
      >
        <form id="brand-form" className="space-y-4" noValidate onSubmit={handleSave}>
          <div>
            <label className="field-label" htmlFor="b-name">{t('brands.name')} *</label>
            <input
              id="b-name"
              value={form.name}
              onChange={handleNameChange}
              className={`field-input ${errors.name ? 'border-danger' : ''}`}
              maxLength={150}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="b-slug">{t('products.slug')} *</label>
            <input
              id="b-slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                setForm((prev) => ({ ...prev, slug: e.target.value }))
              }}
              className={`field-input font-mono ${errors.slug ? 'border-danger' : ''}`}
              maxLength={180}
            />
            {errors.slug && <p className="field-error">{errors.slug}</p>}
          </div>
          <ImageUploader
            value={form.logoUrl}
            onChange={(url) => setForm((prev) => ({ ...prev, logoUrl: url }))}
            label={t('brands.logo')}
            folder="vimeanbaby/brands"
          />
          <UiToggle
            value={form.active}
            onChange={(val) => setForm((prev) => ({ ...prev, active: val }))}
            label={t('common.active')}
          />
        </form>
      </UiModal>
    </div>
  )
}
