import React, { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/hooks/useI18n'
import accountService from '@/services/accountService'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import AccountSection from './components/AccountSection'
import AddressSummary from './components/AddressSummary'
import AddressForm from './components/AddressForm'
import AlertBanner from '@/components/common/AlertBanner'

export default function AccountAddressesPage() {
  const { t } = useI18n()
  const errorMessage = useApiErrorMessage()

  const [addresses, setAddresses] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    document.title = `${t('account.nav.addresses')} | ${t('app.name')}`
  }, [t])

  const fetchAddresses = useCallback(() => {
    setStatus('pending')
    accountService.getAddresses()
      .then((data) => {
        setAddresses(data || [])
        setStatus('success')
        setError(null)
      })
      .catch((err) => {
        setError(err)
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const openForm = (address = null) => {
    setEditing(address)
    setFormError(null)
    setNotice(null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
  }

  const save = async (payload) => {
    setSaving(true)
    setFormError(null)
    try {
      if (editing) {
        await accountService.updateAddress(editing.id, payload)
      } else {
        await accountService.createAddress(payload)
      }
      setNotice(t('address.saved'))
      closeForm()
      fetchAddresses()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const runAction = async (id, action, successMessage) => {
    setBusyId(id)
    setActionError(null)
    setNotice(null)
    try {
      await action()
      setNotice(successMessage)
      fetchAddresses()
    } catch (err) {
      setActionError(errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const makeDefault = (address) => {
    return runAction(
      address.id,
      () => accountService.setDefaultAddress(address.id),
      t('address.defaultUpdated')
    )
  }

  const remove = (address) => {
    if (!window.confirm(t('address.confirmDelete'))) return
    return runAction(
      address.id,
      () => accountService.deleteAddress(address.id),
      t('address.deleted')
    )
  }

  return (
    <AccountSection
      title={t('account.nav.addresses')}
      description={t('address.subtitle')}
      actions={
        !formOpen && addresses.length > 0 ? (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            onClick={() => openForm()}
          >
            <span>+</span>
            <span>{t('account.addAddress')}</span>
          </button>
        ) : null
      }
    >
      <div className="space-y-4">
        {notice && <AlertBanner variant="success" message={notice} />}
        {actionError && <AlertBanner variant="error" message={actionError} />}

        {formOpen && (
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-800/40">
            <h3 className="mb-5 font-semibold text-sm text-slate-900 dark:text-slate-100">
              {editing ? t('address.editTitle') : t('address.newTitle')}
            </h3>
            <AddressForm
              key={editing?.id ?? 'new'}
              address={editing}
              loading={saving}
              serverError={formError}
              onSubmit={save}
              onCancel={closeForm}
            />
          </div>
        )}

        {status === 'pending' && !addresses.length && (
          <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
            <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        )}

        {error && (
          <div className="space-y-3">
            <AlertBanner variant="error" message={t('errors.GENERIC')} />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              onClick={fetchAddresses}
            >
              {t('common.retry')}
            </button>
          </div>
        )}

        {!addresses.length && !formOpen && status !== 'pending' && !error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.14-7.5 11.25-7.5 11.25S4.5 17.64 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('address.emptyTitle')}</h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">{t('address.emptyBody')}</p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
              onClick={() => openForm()}
            >
              + {t('account.addAddress')}
            </button>
          </div>
        )}

        {addresses.length > 0 && !formOpen && (
          <ul className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <li
                key={address.id}
                className={`flex flex-col justify-between rounded-xl border p-5 shadow-2xs transition-all ${
                  address.defaultAddress
                    ? 'border-brand/40 bg-brand/5 dark:border-brand/30 dark:bg-brand/10'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex-1">
                  <AddressSummary address={address} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs font-semibold dark:border-slate-800">
                  <button
                    type="button"
                    className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                    disabled={busyId === address.id}
                    onClick={() => openForm(address)}
                  >
                    {t('account.edit')}
                  </button>
                  {!address.defaultAddress && (
                    <button
                      type="button"
                      className="text-brand hover:underline disabled:opacity-50"
                      disabled={busyId === address.id}
                      onClick={() => makeDefault(address)}
                    >
                      {t('address.makeDefault')}
                    </button>
                  )}
                  <button
                    type="button"
                    className="ml-auto text-rose-500 hover:text-rose-700 disabled:opacity-50"
                    disabled={busyId === address.id}
                    onClick={() => remove(address)}
                  >
                    {t('address.delete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AccountSection>
  )
}
