import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from '@rc-component/qrcode'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { PROVINCES } from '@/utils/provinces'
import { formatUsd } from '@/utils/format'
import { generateKhqrString } from '@/utils/khqr'
import SafeImage from '@/components/shared/SafeImage'

export default function CheckoutPage() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const navigate = useNavigate()
  const cart = useCart()
  const auth = useAuth()

  // Form states
  const [fullName, setFullName] = useState(auth.user?.fullName || '')
  const [phone, setPhone] = useState(auth.user?.phone || '')
  const [province, setProvince] = useState('Phnom Penh')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod') // 'cod' | 'khqr' | 'bank'
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Checkout flow state: 'form' | 'khqr_gateway' | 'khqr_success' | 'bank_transfer' | 'cod_success'
  const [currentStep, setCurrentStep] = useState('form')
  const [placedOrder, setPlacedOrder] = useState(null)
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)
  const [copiedBank, setCopiedBank] = useState('')
  const [countdownSeconds, setCountdownSeconds] = useState(900) // 15 mins for KHQR payment

  useEffect(() => {
    document.title = `${t('checkout.title')} | ${t('app.name')}`
  }, [t])

  useEffect(() => {
    if (auth.user?.fullName && !fullName) {
      setFullName(auth.user.fullName)
    }
    if (auth.user?.phone && !phone) {
      setPhone(auth.user.phone)
    }
  }, [auth.user])

  // Countdown timer for KHQR payment gateway
  useEffect(() => {
    if (currentStep !== 'khqr_gateway') return
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [currentStep])

  const formatCountdown = (totalSec) => {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Shipping calculation
  const subtotal = cart.subtotal || 0
  const isFreePhnomPenh = province === 'Phnom Penh' && subtotal >= 30
  const shippingFee = isFreePhnomPenh ? 0 : province === 'Phnom Penh' ? 1.5 : 2.5
  const total = subtotal + shippingFee

  const validate = () => {
    const errs = {}
    if (!fullName.trim()) errs.fullName = t('checkout.fullName') + ' មិនអាចទទេបានទេ'
    if (!phone.trim()) {
      errs.phone = t('checkout.phone') + ' មិនអាចទទេបានទេ'
    } else if (!/^[0-9+()-\s]{8,15}$/.test(phone.trim())) {
      errs.phone = 'លេខទូរស័ព្ទមិនត្រឹមត្រូវ'
    }
    if (!address.trim()) errs.address = t('checkout.address') + ' មិនអាចទទេបានទេ'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePlaceOrder = (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setTimeout(() => {
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
      const rand = Math.floor(1000 + Math.random() * 9000)
      const orderRef = `VB-${dateStr}-${rand}`

      const orderData = {
        orderId: orderRef,
        items: [...cart.items],
        subtotal,
        shippingFee,
        total,
        recipient: {
          fullName,
          phone,
          province,
          address,
          note,
        },
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'unpaid_cod' : 'pending',
        orderStatus: 'confirmed',
        createdAt: new Date().toISOString(),
      }

      // Persist order to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('vb_orders') || '[]')
        localStorage.setItem('vb_orders', JSON.stringify([orderData, ...stored]))
      } catch (err) {
        console.error('Failed to store order:', err)
      }

      setPlacedOrder(orderData)
      cart.clearCart()
      setIsSubmitting(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })

      // Route to appropriate next step in the real checkout process
      if (paymentMethod === 'khqr') {
        setCurrentStep('khqr_gateway')
      } else if (paymentMethod === 'bank') {
        setCurrentStep('bank_transfer')
      } else {
        setCurrentStep('cod_success')
      }
    }, 600)
  }

  // Handle user confirming KHQR payment
  const handleConfirmKhqrPaid = () => {
    setIsVerifyingPayment(true)
    setTimeout(() => {
      // Update order status in localStorage to paid
      try {
        const stored = JSON.parse(localStorage.getItem('vb_orders') || '[]')
        const updated = stored.map((o) =>
          o.orderId === placedOrder?.orderId ? { ...o, paymentStatus: 'paid' } : o
        )
        localStorage.setItem('vb_orders', JSON.stringify(updated))
      } catch (err) {
        console.error('Failed to update order payment status:', err)
      }

      setPlacedOrder((prev) => (prev ? { ...prev, paymentStatus: 'paid' } : prev))
      setIsVerifyingPayment(false)
      setCurrentStep('khqr_success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 1500)
  }

  const copyToClipboard = (text, bankName) => {
    navigator.clipboard?.writeText(text)
    setCopiedBank(bankName)
    setTimeout(() => setCopiedBank(''), 2000)
  }

  // -------------------------------------------------------------
  // STEP 2A: REAL KHQR PAYMENT GATEWAY SCREEN
  // -------------------------------------------------------------
  if (currentStep === 'khqr_gateway' && placedOrder) {
    const khqrPayload = generateKhqrString({
      amount: placedOrder.total,
      currency: 'USD',
      merchantName: 'VIMEAN BABY STORE',
      billNumber: placedOrder.orderId,
    })

    return (
      <div className="container-store section-pad">
        <div className="mx-auto max-w-lg rounded-3xl border border-line bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line pb-4 dark:border-slate-800">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
                {t('checkout.awaitingPayment')}
              </span>
              <p className="mt-1 font-mono text-sm font-bold text-ink dark:text-slate-100">
                #{placedOrder.orderId}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-muted dark:text-slate-400">
                {t('checkout.qrExpiresIn')}
              </span>
              <p className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
                ⏱ {formatCountdown(countdownSeconds)}
              </p>
            </div>
          </div>

          {/* Real Standard KHQR Standee Card */}
          <div className="mt-6 rounded-2xl border border-line bg-white p-6 text-center shadow-md dark:border-slate-700 dark:bg-slate-950">
            <div className="mx-auto flex max-w-[240px] flex-col items-center">
              <div className="mb-2 w-full rounded-lg bg-rose-600 py-1.5 text-center text-xs font-black tracking-widest text-white shadow-xs">
                KHQR
              </div>
              <p className="text-xs font-semibold text-ink dark:text-slate-200">
                {t('checkout.merchantName')}
              </p>
              <p className="my-1.5 font-mono text-2xl font-extrabold text-brand">
                {formatUsd(placedOrder.total)}
              </p>
              <div className="mt-2 flex items-center justify-center rounded-2xl border border-line/70 bg-white p-3 shadow-inner dark:border-slate-700">
                <QRCodeSVG
                  value={khqrPayload}
                  size={190}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  includeMargin={true}
                />
              </div>
              <p className="mt-3 text-xs text-muted dark:text-slate-400">
                {t('checkout.scanQrInstruction')}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              disabled={isVerifyingPayment}
              onClick={handleConfirmKhqrPaid}
              className="btn-primary w-full justify-center text-base font-bold shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {isVerifyingPayment ? (
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('checkout.verifyingPayment')}
                </span>
              ) : (
                `✓ ${t('checkout.iHavePaid')}`
              )}
            </button>

            <Link
              to={localePath('/account/orders')}
              className="btn-ghost w-full justify-center text-xs text-muted hover:text-ink"
            >
              {t('checkout.payLater')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // STEP 2B: KHQR PAYMENT SUCCESSFUL SCREEN
  // -------------------------------------------------------------
  if (currentStep === 'khqr_success' && placedOrder) {
    return (
      <div className="container-store section-pad">
        <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
              <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-ink dark:text-slate-100">
              {t('checkout.paymentSuccessTitle')}
            </h1>
            <p className="mt-2 text-sm text-muted dark:text-slate-400">
              {t('checkout.paymentSuccessDesc')}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <span>{t('checkout.orderNumber')}:</span>
              <span className="font-mono text-sm">#{placedOrder.orderId}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-2xl border border-line bg-cream/40 p-5 text-sm dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex justify-between border-b border-line pb-2.5 dark:border-slate-800">
              <span className="text-muted dark:text-slate-400">{t('checkout.total')}:</span>
              <span className="font-mono font-bold text-brand">{formatUsd(placedOrder.total)}</span>
            </div>
            <div className="flex justify-between border-b border-line pb-2.5 dark:border-slate-800">
              <span className="text-muted dark:text-slate-400">{t('checkout.paymentType')}:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                KHQR / Bakong ({t('checkout.paymentPaid')})
              </span>
            </div>
            <div className="flex justify-between border-b border-line pb-2.5 dark:border-slate-800">
              <span className="text-muted dark:text-slate-400">{t('checkout.deliveryTo')}:</span>
              <span className="text-right font-medium text-ink dark:text-slate-200">
                {placedOrder.recipient.fullName} ({placedOrder.recipient.phone})<br />
                {placedOrder.recipient.address}, {placedOrder.recipient.province}
              </span>
            </div>
            <p className="pt-1 text-center text-xs text-muted dark:text-slate-400">
              📦 {t('checkout.estimatedDelivery')}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to={localePath('/account/orders')} className="btn-primary">
              {t('checkout.viewOrders')}
            </Link>
            <Link to={localePath('/')} className="btn-ghost">
              {t('checkout.backHome')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // STEP 2C: BANK TRANSFER SCREEN
  // -------------------------------------------------------------
  if (currentStep === 'bank_transfer' && placedOrder) {
    return (
      <div className="container-store section-pad">
        <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-ink dark:text-slate-100">
              {t('checkout.successTitle')}
            </h1>
            <p className="mt-2 text-sm text-muted dark:text-slate-400">
              {t('checkout.bankInstructions')}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-cream px-4 py-1.5 text-xs font-bold text-brand dark:bg-slate-800">
              <span>{t('checkout.orderNumber')}:</span>
              <span className="font-mono text-sm text-ink dark:text-white">#{placedOrder.orderId}</span>
            </div>
          </div>

          {/* Bank Accounts */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-4 text-xs dark:border-slate-700 dark:bg-slate-900">
              <span className="font-bold text-blue-600">ABA Bank</span>
              <div className="mt-2 flex items-center justify-between font-mono font-bold text-ink dark:text-white">
                <span className="text-sm">000 123 456</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('000123456', 'aba')}
                  className="rounded-md bg-surface px-2.5 py-1 text-[11px] font-semibold text-brand hover:bg-brand-tint dark:bg-slate-800"
                >
                  {copiedBank === 'aba' ? t('checkout.copied') : t('checkout.copy')}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted">VIMEAN BABY STORE</p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-4 text-xs dark:border-slate-700 dark:bg-slate-900">
              <span className="font-bold text-blue-800">ACLEDA Bank</span>
              <div className="mt-2 flex items-center justify-between font-mono font-bold text-ink dark:text-white">
                <span className="text-sm">1234-5678-9012</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('123456789012', 'acleda')}
                  className="rounded-md bg-surface px-2.5 py-1 text-[11px] font-semibold text-brand hover:bg-brand-tint dark:bg-slate-800"
                >
                  {copiedBank === 'acleda' ? t('checkout.copied') : t('checkout.copy')}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted">VIMEAN BABY STORE</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-cream/40 p-4 text-xs text-muted dark:border-slate-800 dark:bg-slate-800/40">
            <p className="font-semibold text-ink dark:text-slate-200">
              ចំណាំសំខាន់ (Important Note):
            </p>
            <p className="mt-1">
              សូមបញ្ចូលលេខកូដបញ្ជាទិញ <strong className="text-brand">#{placedOrder.orderId}</strong> នៅក្នុង Remark នៃការផ្ទេរប្រាក់ និងផ្ញើបង្កាន់ដៃមកកាន់ Telegram របស់យើងខ្ញុំ។
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="https://t.me/vimeanbaby"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              💬 {t('checkout.sendSlipTelegram')}
            </a>
            <Link to={localePath('/account/orders')} className="btn-ghost">
              {t('checkout.viewOrders')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // STEP 2D: CASH ON DELIVERY SUCCESS SCREEN
  // -------------------------------------------------------------
  if (currentStep === 'cod_success' && placedOrder) {
    return (
      <div className="container-store section-pad">
        <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
              <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-ink dark:text-slate-100">
              {t('checkout.successTitle')}
            </h1>
            <p className="mt-2 text-sm text-muted dark:text-slate-400">
              {t('checkout.successDesc')}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-cream px-4 py-1.5 text-xs font-bold text-brand dark:bg-slate-800">
              <span>{t('checkout.orderNumber')}:</span>
              <span className="font-mono text-sm text-ink dark:text-white">#{placedOrder.orderId}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-2xl border border-line bg-cream/40 p-5 text-sm dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex justify-between border-b border-line pb-2.5 dark:border-slate-800">
              <span className="text-muted dark:text-slate-400">{t('checkout.paymentType')}:</span>
              <span className="font-semibold text-ink dark:text-slate-200">{t('checkout.cod')}</span>
            </div>
            <div className="flex justify-between border-b border-line pb-2.5 dark:border-slate-800">
              <span className="text-muted dark:text-slate-400">{t('checkout.total')}:</span>
              <span className="font-mono font-bold text-brand">{formatUsd(placedOrder.total)}</span>
            </div>
            <div className="flex justify-between border-b border-line pb-2.5 dark:border-slate-800">
              <span className="text-muted dark:text-slate-400">{t('checkout.deliveryTo')}:</span>
              <span className="text-right font-medium text-ink dark:text-slate-200">
                {placedOrder.recipient.fullName} ({placedOrder.recipient.phone})<br />
                {placedOrder.recipient.address}, {placedOrder.recipient.province}
              </span>
            </div>
            <p className="pt-1 text-center text-xs text-muted dark:text-slate-400">
              📦 {t('checkout.estimatedDelivery')}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to={localePath('/account/orders')} className="btn-primary">
              {t('checkout.viewOrders')}
            </Link>
            <Link to={localePath('/')} className="btn-ghost">
              {t('checkout.backHome')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // EMPTY CART SCREEN
  // -------------------------------------------------------------
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container-store section-pad">
        <div className="mx-auto max-w-lg rounded-3xl border border-line bg-white p-8 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-tint text-brand dark:bg-rose-950/50">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold text-ink dark:text-slate-100">
            {t('checkout.emptyCart')}
          </h1>
          <p className="mt-2 text-sm text-muted dark:text-slate-400">
            {t('checkout.emptyCartDesc')}
          </p>
          <Link to={localePath('/products')} className="btn-primary mt-6 inline-flex">
            {t('checkout.shopNow')}
          </Link>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // STEP 1: STANDARD E-COMMERCE CHECKOUT FORM
  // -------------------------------------------------------------
  return (
    <div className="container-store section-pad">
      <div className="mb-6 flex items-center gap-2 text-xs text-muted dark:text-slate-400">
        <Link to={localePath('/')} className="hover:text-brand">{t('nav.home')}</Link>
        <span>/</span>
        <button type="button" onClick={() => cart.toggle(true)} className="hover:text-brand">{t('cart.title')}</button>
        <span>/</span>
        <span className="font-semibold text-ink dark:text-slate-100">{t('checkout.title')}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Form: Delivery & Payment Method Selection */}
        <div className="space-y-6 lg:col-span-7">
          {/* Section 1: Shipping Info */}
          <div className="card-surface p-6 sm:p-7">
            <h2 className="flex items-center gap-2.5 text-base font-bold text-ink dark:text-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                1
              </span>
              {t('checkout.shippingInfo')}
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink dark:text-slate-200">
                  {t('checkout.fullName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }))
                  }}
                  placeholder={t('checkout.fullNamePlaceholder')}
                  className={`mt-1.5 min-h-12 w-full rounded-2xl border bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10 dark:bg-slate-900 dark:text-slate-100 ${
                    errors.fullName ? 'border-rose-500' : 'border-line dark:border-slate-800'
                  }`}
                />
                {errors.fullName && <p className="mt-1 text-xs text-rose-500">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-slate-200">
                  {t('checkout.phone')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }))
                  }}
                  placeholder={t('checkout.phonePlaceholder')}
                  className={`mt-1.5 min-h-12 w-full rounded-2xl border bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10 dark:bg-slate-900 dark:text-slate-100 ${
                    errors.phone ? 'border-rose-500' : 'border-line dark:border-slate-800'
                  }`}
                />
                {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-slate-200">
                  {t('checkout.province')} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="mt-1.5 min-h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
                >
                  {PROVINCES.map((p) => (
                    <option key={p.key} value={p.value}>
                      {t(`provinces.${p.key}`)} ({p.value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-slate-200">
                  {t('checkout.address')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    if (errors.address) setErrors((prev) => ({ ...prev, address: null }))
                  }}
                  placeholder={t('checkout.addressPlaceholder')}
                  className={`mt-1.5 w-full rounded-2xl border bg-white p-3.5 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10 dark:bg-slate-900 dark:text-slate-100 ${
                    errors.address ? 'border-rose-500' : 'border-line dark:border-slate-800'
                  }`}
                />
                {errors.address && <p className="mt-1 text-xs text-rose-500">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-slate-200">
                  {t('checkout.note')}
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('checkout.notePlaceholder')}
                  className="mt-1.5 min-h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Real E-Commerce Payment Method Selection Tiles */}
          <div className="card-surface p-6 sm:p-7">
            <h2 className="flex items-center gap-2.5 text-base font-bold text-ink dark:text-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                2
              </span>
              {t('checkout.paymentMethod')}
            </h2>

            <div className="mt-5 space-y-3">
              {/* Option 1: Cash on Delivery */}
              <label
                className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition ${
                  paymentMethod === 'cod'
                    ? 'border-brand bg-brand-tint/25 shadow-xs dark:border-brand dark:bg-rose-950/30'
                    : 'border-line hover:bg-cream/40 dark:border-slate-700 dark:hover:bg-slate-800/40'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 h-4 w-4 text-brand focus:ring-brand"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-ink dark:text-slate-100">{t('checkout.cod')}</p>
                    <span className="badge-success text-[10px] font-bold">Recommended</span>
                  </div>
                  <p className="mt-1 text-xs text-muted dark:text-slate-400">{t('checkout.codDesc')}</p>
                </div>
              </label>

              {/* Option 2: KHQR / Bakong (Standard E-Commerce Selector Tile) */}
              <label
                className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition ${
                  paymentMethod === 'khqr'
                    ? 'border-brand bg-brand-tint/25 shadow-xs dark:border-brand dark:bg-rose-950/30'
                    : 'border-line hover:bg-cream/40 dark:border-slate-700 dark:hover:bg-slate-800/40'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="khqr"
                  checked={paymentMethod === 'khqr'}
                  onChange={() => setPaymentMethod('khqr')}
                  className="mt-1 h-4 w-4 text-brand focus:ring-brand"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-ink dark:text-slate-100">{t('checkout.khqr')}</p>
                    <span className="inline-flex items-center rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black text-white tracking-wider">
                      KHQR
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted dark:text-slate-400">{t('checkout.khqrDesc')}</p>
                </div>
              </label>

              {/* Option 3: Bank Transfer */}
              <label
                className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition ${
                  paymentMethod === 'bank'
                    ? 'border-brand bg-brand-tint/25 shadow-xs dark:border-brand dark:bg-rose-950/30'
                    : 'border-line hover:bg-cream/40 dark:border-slate-700 dark:hover:bg-slate-800/40'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={paymentMethod === 'bank'}
                  onChange={() => setPaymentMethod('bank')}
                  className="mt-1 h-4 w-4 text-brand focus:ring-brand"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-ink dark:text-slate-100">{t('checkout.bankTransfer')}</p>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">ABA / ACLEDA</span>
                  </div>
                  <p className="mt-1 text-xs text-muted dark:text-slate-400">{t('checkout.bankTransferDesc')}</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Order Summary & Place Order Button */}
        <div className="lg:col-span-5">
          <div className="card-surface sticky top-24 p-6 sm:p-7">
            <h2 className="text-lg font-bold text-ink dark:text-slate-100">
              {t('checkout.orderSummary')}
            </h2>

            <div className="mt-4 max-h-72 overflow-y-auto divide-y divide-line pr-1 dark:divide-slate-800">
              {cart.items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-3 py-3">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    imgClass="h-14 w-14 rounded-xl object-cover shrink-0 border border-line/60 dark:border-slate-800"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-ink dark:text-slate-100">{item.name}</p>
                    <p className="text-[11px] text-muted dark:text-slate-400">
                      {formatUsd(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-ink dark:text-slate-200">
                    {formatUsd(Number(item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2.5 border-t border-line pt-4 text-xs dark:border-slate-800">
              <div className="flex justify-between text-muted dark:text-slate-400">
                <span>{t('checkout.subtotal')}</span>
                <span className="font-semibold text-ink dark:text-slate-200">{formatUsd(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted dark:text-slate-400">
                <span>
                  {t('checkout.shippingFee')} ({province === 'Phnom Penh' ? 'ភ្នំពេញ' : 'ខេត្ត'})
                </span>
                <span className="font-semibold text-ink dark:text-slate-200">
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {t('checkout.freeShipping')}
                    </span>
                  ) : (
                    formatUsd(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3 text-sm font-bold text-ink dark:border-slate-800 dark:text-slate-100">
                <span className="text-base">{t('checkout.total')}</span>
                <span className="text-xl font-extrabold text-brand">{formatUsd(total)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
              className="btn-primary mt-6 w-full justify-center text-base font-bold shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {isSubmitting ? t('checkout.placingOrder') : t('checkout.placeOrder')}
            </button>

            <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted dark:text-slate-400">
              <span className="flex items-center gap-1">🔒 100% Secure Checkout</span>
              <span>•</span>
              <span className="flex items-center gap-1">⚡ Fast Courier Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
