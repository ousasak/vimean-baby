import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { categoryService } from '@/services/categoryService'
import { brandService } from '@/services/brandService'
import uploadService from '@/services/uploadService'
import { formatUsd, slugify, thumb } from '@/utils/formatters'
import AppIcon from '@/components/ui/AppIcon'
import UiToggle from '@/components/ui/UiToggle'

export default function ProductForm({ initialData, saving, onSubmit }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language || 'km'

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  useEffect(() => {
    categoryService.getCategories().then((res) => setCategories(res || [])).catch(() => {})
    brandService.getBrands().then((res) => setBrands(res || [])).catch(() => {})
  }, [])

  const defaultVariant = () => ({
    optionName: '',
    sku: '',
    price: '',
    compareAtPrice: '',
    stockQty: 0,
    expiryDate: '',
    barcode: '',
    active: true,
  })

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        nameEn: initialData.nameEn || '',
        nameKm: initialData.nameKm || '',
        slug: initialData.slug || '',
        descriptionEn: initialData.descriptionEn || '',
        descriptionKm: initialData.descriptionKm || '',
        categoryId: initialData.categoryId || '',
        brandId: initialData.brandId || '',
        originCountry: initialData.originCountry || '',
        targetAge: initialData.targetAge || '',
        published: initialData.published ?? true,
        featured: initialData.featured ?? false,
        variants: initialData.variants?.length
          ? initialData.variants.map((v) => ({ ...v, price: String(v.price), compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : '' }))
          : [defaultVariant()],
        images: initialData.images || [],
      }
    }
    return {
      nameEn: '',
      nameKm: '',
      slug: '',
      descriptionEn: '',
      descriptionKm: '',
      categoryId: '',
      brandId: '',
      originCountry: '',
      targetAge: '',
      published: true,
      featured: false,
      variants: [defaultVariant()],
      images: [],
    }
  })

  const [slugTouched, setSlugTouched] = useState(Boolean(initialData?.slug))
  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)

  const handleNameEnChange = (e) => {
    const val = e.target.value
    setForm((prev) => ({
      ...prev,
      nameEn: val,
      slug: !slugTouched ? slugify(val) : prev.slug,
    }))
  }

  const errors = useMemo(() => {
    if (!submitted) return {}
    const errs = {}
    if (!form.nameEn.trim()) errs.nameEn = t('validation.required')
    if (!form.nameKm.trim()) errs.nameKm = t('validation.required')
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) errs.slug = t('validation.slug')
    if (!form.categoryId) errs.categoryId = t('validation.required')

    const seenSkus = new Set()
    form.variants.forEach((v, idx) => {
      if (!v.sku.trim()) errs[`var_${idx}_sku`] = t('validation.required')
      else if (seenSkus.has(v.sku.trim().toUpperCase())) errs[`var_${idx}_sku`] = t('validation.duplicateSku')
      else seenSkus.add(v.sku.trim().toUpperCase())

      const p = Number(v.price)
      if (!v.price || Number.isNaN(p) || p <= 0) errs[`var_${idx}_price`] = t('validation.price')

      if (v.compareAtPrice) {
        const c = Number(v.compareAtPrice)
        if (Number.isNaN(c) || c <= p) errs[`var_${idx}_compareAt`] = t('validation.compareAt')
      }
    })

    return errs
  }, [submitted, form, t])

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, defaultVariant()],
    }))
  }

  const removeVariant = (index) => {
    if (form.variants.length <= 1) return
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }))
  }

  const updateVariant = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }))
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    setUploadError(null)
    try {
      const uploaded = []
      for (const file of files) {
        const res = await uploadService.uploadImage(file, 'vimeanbaby/products')
        uploaded.push({
          imageUrl: res.url,
          primaryImage: form.images.length === 0 && uploaded.length === 0,
          sortOrder: form.images.length + uploaded.length,
        })
      }
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded],
      }))
    } catch (err) {
      setUploadError(err?.message || t('upload.failed'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const setPrimaryImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, primaryImage: i === index })),
    }))
  }

  const removeImage = (index) => {
    setForm((prev) => {
      const next = prev.images.filter((_, i) => i !== index)
      if (next.length && !next.some((img) => img.primaryImage)) {
        next[0].primaryImage = true
      }
      return { ...prev, images: next }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length > 0) return

    const payload = {
      nameEn: form.nameEn.trim(),
      nameKm: form.nameKm.trim(),
      slug: form.slug.trim(),
      descriptionEn: form.descriptionEn.trim() || null,
      descriptionKm: form.descriptionKm.trim() || null,
      categoryId: Number(form.categoryId),
      brandId: form.brandId ? Number(form.brandId) : null,
      originCountry: form.originCountry.trim() || null,
      targetAge: form.targetAge.trim() || null,
      published: form.published,
      featured: form.featured,
      variants: form.variants.map((v) => ({
        ...v,
        optionName: v.optionName.trim() || 'Default',
        sku: v.sku.trim(),
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        stockQty: Number(v.stockQty) || 0,
        expiryDate: v.expiryDate || null,
        barcode: v.barcode?.trim() || null,
      })),
      images: form.images.map((img, i) => ({
        imageUrl: img.imageUrl,
        primaryImage: img.primaryImage,
        sortOrder: i,
      })),
    }

    onSubmit(payload)
  }

  return (
    <form className="space-y-8" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* General details */}
          <div className="card p-6">
            <h2 className="font-bold text-ink text-lg mb-4">{t('products.sections.details')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="p-nameEn">{t('products.nameEn')} *</label>
                <input
                  id="p-nameEn"
                  value={form.nameEn}
                  onChange={handleNameEnChange}
                  className={`field-input ${errors.nameEn ? 'border-danger' : ''}`}
                />
                {errors.nameEn && <p className="field-error">{errors.nameEn}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="p-nameKm">{t('products.nameKm')} *</label>
                <input
                  id="p-nameKm"
                  value={form.nameKm}
                  onChange={(e) => setForm((prev) => ({ ...prev, nameKm: e.target.value }))}
                  className={`field-input ${errors.nameKm ? 'border-danger' : ''}`}
                />
                {errors.nameKm && <p className="field-error">{errors.nameKm}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="p-slug">{t('products.slug')} *</label>
                <input
                  id="p-slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setForm((prev) => ({ ...prev, slug: e.target.value }))
                  }}
                  className={`field-input font-mono ${errors.slug ? 'border-danger' : ''}`}
                />
                {errors.slug && <p className="field-error">{errors.slug}</p>}
              </div>

              <div>
                <label className="field-label" htmlFor="p-descEn">{t('products.descriptionEn')}</label>
                <textarea
                  id="p-descEn"
                  rows={4}
                  value={form.descriptionEn}
                  onChange={(e) => setForm((prev) => ({ ...prev, descriptionEn: e.target.value }))}
                  className="field-input py-2"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="p-descKm">{t('products.descriptionKm')}</label>
                <textarea
                  id="p-descKm"
                  rows={4}
                  value={form.descriptionKm}
                  onChange={(e) => setForm((prev) => ({ ...prev, descriptionKm: e.target.value }))}
                  className="field-input py-2"
                />
              </div>
            </div>
          </div>

          {/* Variants and Pricing */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-ink text-lg">{t('products.sections.variants')}</h2>
                <p className="text-xs text-ink-muted">{t('products.variantsHint')}</p>
              </div>
              <button type="button" className="btn-secondary min-h-9 px-3 text-xs" onClick={addVariant}>
                <AppIcon name="plus" size={14} /> {t('products.addVariant')}
              </button>
            </div>

            <div className="space-y-4">
              {form.variants.map((v, i) => (
                <div key={i} className="rounded-xl border border-line/80 bg-surface/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                      {t('products.variantN', { n: i + 1 })}
                    </span>
                    {form.variants.length > 1 && (
                      <button
                        type="button"
                        className="text-xs text-danger hover:underline"
                        onClick={() => removeVariant(i)}
                      >
                        {t('common.remove')}
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="field-label">{t('products.optionName')}</label>
                      <input
                        value={v.optionName}
                        placeholder={t('products.optionPlaceholder')}
                        onChange={(e) => updateVariant(i, 'optionName', e.target.value)}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">SKU *</label>
                      <input
                        value={v.sku}
                        placeholder="SKU-100"
                        onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                        className={`field-input font-mono ${errors[`var_${i}_sku`] ? 'border-danger' : ''}`}
                      />
                      {errors[`var_${i}_sku`] && <p className="field-error">{errors[`var_${i}_sku`]}</p>}
                    </div>
                    <div>
                      <label className="field-label">{t('products.price')} ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={v.price}
                        placeholder="0.00"
                        onChange={(e) => updateVariant(i, 'price', e.target.value)}
                        className={`field-input ${errors[`var_${i}_price`] ? 'border-danger' : ''}`}
                      />
                      {errors[`var_${i}_price`] && <p className="field-error">{errors[`var_${i}_price`]}</p>}
                    </div>
                    <div>
                      <label className="field-label">{t('products.compareAtPrice')} ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={v.compareAtPrice}
                        placeholder="0.00"
                        onChange={(e) => updateVariant(i, 'compareAtPrice', e.target.value)}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">{t('products.stock')}</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={v.stockQty}
                        onChange={(e) => updateVariant(i, 'stockQty', e.target.value)}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">{t('products.expiryDate')}</label>
                      <input
                        type="date"
                        value={v.expiryDate || ''}
                        onChange={(e) => updateVariant(i, 'expiryDate', e.target.value)}
                        className="field-input"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="font-bold text-ink text-lg mb-1">{t('products.sections.images')}</h2>
            <p className="text-xs text-ink-muted mb-4">{t('products.imagesHint')}</p>

            <div className="grid gap-3 sm:grid-cols-4">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl border border-line bg-white overflow-hidden group">
                  <img src={thumb(img.imageUrl, 200)} alt="" className="h-full w-full object-contain" />
                  {img.primaryImage && (
                    <span className="absolute left-2 top-2 badge-brand text-[10px] py-0.5">
                      {t('products.primary')}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    {!img.primaryImage && (
                      <button
                        type="button"
                        className="p-1.5 rounded-lg bg-white/90 text-ink text-xs hover:bg-white"
                        onClick={() => setPrimaryImage(idx)}
                      >
                        {t('products.makePrimary')}
                      </button>
                    )}
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-danger text-white hover:bg-danger/90"
                      onClick={() => removeImage(idx)}
                    >
                      <AppIcon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <label className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface/50 hover:bg-white hover:border-brand/40 cursor-pointer transition text-center p-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleImageUpload}
                />
                {uploading ? (
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                ) : (
                  <>
                    <AppIcon name="photo" size={24} className="text-ink-muted" />
                    <span className="text-xs font-semibold text-ink mt-1">{t('products.addImages')}</span>
                  </>
                )}
              </label>
            </div>
            {uploadError && <p className="field-error mt-2">{uploadError}</p>}
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-ink text-lg">{t('products.sections.organization')}</h2>

            <div>
              <label className="field-label" htmlFor="p-category">{t('products.category')} *</label>
              <select
                id="p-category"
                value={form.categoryId}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                className={`field-input ${errors.categoryId ? 'border-danger' : ''}`}
              >
                <option value="">{t('products.selectCategory')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {locale === 'km' ? c.nameKm : c.nameEn}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="field-error">{errors.categoryId}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="p-brand">{t('products.brand')}</label>
              <select
                id="p-brand"
                value={form.brandId}
                onChange={(e) => setForm((prev) => ({ ...prev, brandId: e.target.value }))}
                className="field-input"
              >
                <option value="">{t('products.noBrand')}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="p-origin">{t('products.origin')}</label>
              <input
                id="p-origin"
                value={form.originCountry}
                placeholder={t('products.originPlaceholder')}
                onChange={(e) => setForm((prev) => ({ ...prev, originCountry: e.target.value }))}
                className="field-input"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="p-age">{t('products.ageRange')}</label>
              <input
                id="p-age"
                value={form.targetAge}
                placeholder={t('products.agePlaceholder')}
                onChange={(e) => setForm((prev) => ({ ...prev, targetAge: e.target.value }))}
                className="field-input"
              />
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-ink text-lg">{t('products.sections.status')}</h2>
            <UiToggle
              value={form.published}
              onChange={(val) => setForm((prev) => ({ ...prev, published: val }))}
              label={t('products.published')}
              description={t('products.publishedHint')}
            />
            <UiToggle
              value={form.featured}
              onChange={(val) => setForm((prev) => ({ ...prev, featured: val }))}
              label={t('products.featured')}
              description={t('products.featuredHint')}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link to="/products" className="btn-secondary">
              {t('common.cancel')}
            </Link>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? t('common.save') : t('common.saveChanges')}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
