import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { categoryService } from '@/services/categoryService'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/hooks/useConfirm'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { slugify, thumb } from '@/utils/formatters'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import AppIcon from '@/components/ui/AppIcon'
import UiModal from '@/components/ui/UiModal'
import ImageUploader from '@/components/ui/ImageUploader'
import UiToggle from '@/components/ui/UiToggle'

export default function CategoriesPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language || 'km'
  const toast = useToast()
  const { confirm } = useConfirm()
  const errorMessage = useApiErrorMessage()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    document.title = `${t('nav.categories')} | Vimean Baby Admin`
  }, [t])

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await categoryService.getCategories()
      setCategories(data || [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const blank = () => ({
    nameEn: '',
    nameKm: '',
    slug: '',
    imageUrl: null,
    sortOrder: (categories.length || 0) + 1,
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
      ? categories.filter((c) => `${c.nameEn} ${c.nameKm} ${c.slug}`.toLowerCase().includes(q))
      : categories
  }, [search, categories])

  const handleNameEnChange = (e) => {
    const value = e.target.value
    setForm((prev) => ({
      ...prev,
      nameEn: value,
      slug: !slugTouched ? slugify(value) : prev.slug,
    }))
  }

  const errors = useMemo(() => {
    if (!submitted) return {}
    const result = {}
    if (!form.nameEn.trim()) result.nameEn = t('validation.required')
    if (!form.nameKm.trim()) result.nameKm = t('validation.required')
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) result.slug = t('validation.slug')
    return result
  }, [submitted, form, t])

  function openModal(category) {
    setEditing(category)
    setForm(category ? { ...category } : blank())
    setSlugTouched(Boolean(category))
    setSubmitted(false)
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSubmitted(true)
    if (!form.nameEn.trim() || !form.nameKm.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      return
    }
    setSaving(true)
    try {
      const body = {
        ...form,
        nameEn: form.nameEn.trim(),
        nameKm: form.nameKm.trim(),
        sortOrder: Number(form.sortOrder) || 0,
      }
      if (editing) {
        await categoryService.updateCategory(editing.id, body)
        toast.success(t('categories.saved'))
      } else {
        await categoryService.createCategory(body)
        toast.success(t('categories.created'))
      }
      setModalOpen(false)
      loadCategories()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(category) {
    if (category.active) {
      const ok = await confirm({
        title: t('categories.deactivateTitle'),
        message: t('categories.deactivateMessage', { name: category.nameEn }),
        confirmLabel: t('common.deactivate'),
        danger: true,
      })
      if (!ok) return
    }
    try {
      if (category.active) {
        await categoryService.deleteCategory(category.id)
      } else {
        await categoryService.updateCategory(category.id, { ...category, active: true })
      }
      toast.success(category.active ? t('common.deactivated') : t('common.activated'))
      loadCategories()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader
        title={t('nav.categories')}
        description={t('categories.subtitle')}
        actions={
          <button type="button" className="btn-primary" onClick={() => openModal(null)}>
            <AppIcon name="plus" size={16} /> {t('categories.add')}
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
              <button type="button" className="btn-primary" onClick={loadCategories}>
                {t('common.retry')}
              </button>
            </EmptyState>
          </div>
        ) : loading && !categories.length ? (
          <div className="space-y-2 p-4" aria-busy="true">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-surface" />
            ))}
          </div>
        ) : !filtered.length ? (
          <EmptyState
            icon="categories"
            title={search ? t('common.noResults') : t('categories.empty')}
          >
            {!search && (
              <button type="button" className="btn-primary" onClick={() => openModal(null)}>
                {t('categories.add')}
              </button>
            )}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">{t('categories.name')}</th>
                  <th className="px-4 py-3">{t('products.slug')}</th>
                  <th className="px-4 py-3 text-right">{t('categories.sortOrder')}</th>
                  <th className="px-4 py-3">{t('common.status')}</th>
                  <th className="px-4 py-3"><span className="sr-only">{t('common.actions')}</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((category) => (
                  <tr key={category.id} className="hover:bg-surface/60">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white">
                          {category.imageUrl ? (
                            <img src={thumb(category.imageUrl, 80)} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <AppIcon name="categories" size={18} className="text-ink-muted" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{locale === 'km' ? category.nameKm : category.nameEn}</p>
                          <p className="text-xs text-ink-muted">{locale === 'km' ? category.nameEn : category.nameKm}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-xs text-ink-muted">{category.slug}</td>
                    <td className="table-cell text-right">{category.sortOrder}</td>
                    <td className="table-cell">
                      <span className={category.active ? 'badge-success' : 'badge-neutral'}>
                        {category.active ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/products?categoryId=${category.id}`}
                          className="btn-icon"
                          aria-label={t('categories.viewProducts')}
                        >
                          <AppIcon name="products" size={18} />
                        </Link>
                        <button
                          type="button"
                          className="btn-icon"
                          aria-label={t('common.edit')}
                          onClick={() => openModal(category)}
                        >
                          <AppIcon name="edit" size={18} />
                        </button>
                        <button
                          type="button"
                          className="btn-secondary min-h-8 px-3 text-xs"
                          onClick={() => handleToggleActive(category)}
                        >
                          {category.active ? t('common.deactivate') : t('common.activate')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UiModal
        open={modalOpen}
        title={editing ? t('categories.edit') : t('categories.add')}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" form="category-form" className="btn-primary" disabled={saving}>
              {t('common.save')}
            </button>
          </>
        }
      >
        <form id="category-form" className="space-y-4" noValidate onSubmit={handleSave}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="c-en">{t('products.nameEn')} *</label>
              <input
                id="c-en"
                value={form.nameEn}
                onChange={handleNameEnChange}
                className={`field-input ${errors.nameEn ? 'border-danger' : ''}`}
                maxLength={150}
              />
              {errors.nameEn && <p className="field-error">{errors.nameEn}</p>}
            </div>
            <div>
              <label className="field-label" htmlFor="c-km">{t('products.nameKm')} *</label>
              <input
                id="c-km"
                value={form.nameKm}
                onChange={(e) => setForm((prev) => ({ ...prev, nameKm: e.target.value }))}
                className={`field-input ${errors.nameKm ? 'border-danger' : ''}`}
                maxLength={150}
              />
              {errors.nameKm && <p className="field-error">{errors.nameKm}</p>}
            </div>
            <div>
              <label className="field-label" htmlFor="c-slug">{t('products.slug')} *</label>
              <input
                id="c-slug"
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
            <div>
              <label className="field-label" htmlFor="c-sort">{t('categories.sortOrder')}</label>
              <input
                id="c-sort"
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                type="number"
                min="0"
                className="field-input"
              />
            </div>
          </div>
          <ImageUploader
            value={form.imageUrl}
            onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
            label={t('categories.image')}
            folder="vimeanbaby/categories"
          />
          <UiToggle
            value={form.active}
            onChange={(val) => setForm((prev) => ({ ...prev, active: val }))}
            label={t('common.active')}
            description={t('categories.activeHint')}
          />
        </form>
      </UiModal>
    </div>
  )
}
