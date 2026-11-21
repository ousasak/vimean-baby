import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { NAVIGATION_GROUPS } from '@/config/navigation'
import { STORE_URL } from '@/config/constants'
import { useThemeStore } from '@/stores/themeStore'
import AppIcon from '../ui/AppIcon'

export default function AppSidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const sidebarOpen = useThemeStore((state) => state.sidebarOpen)
  const closeSidebar = useThemeStore((state) => state.closeSidebar)

  function isActive(to) {
    return to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={closeSidebar}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label={t('nav.main')}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2" onClick={closeSidebar}>
            <img src="/logo.svg" alt="Vimean Baby" className="h-8 w-auto dark:hidden" width="133" height="32" />
            <img src="/logo-dark.svg" alt="Vimean Baby" className="hidden h-8 w-auto dark:block" width="133" height="32" />
          </Link>
          <span className="badge-brand">{t('app.adminBadge')}</span>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.key}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted/80 dark:text-slate-400">
                {t(group.labelKey)}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.to)
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                          active
                            ? 'bg-brand-tint text-brand font-semibold shadow-xs dark:bg-brand/20 dark:text-brand-light'
                            : 'text-ink-muted hover:bg-cream hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`}
                        aria-current={active ? 'page' : undefined}
                        onClick={closeSidebar}
                      >
                        <AppIcon
                          name={item.icon}
                          className={active ? 'text-brand dark:text-brand-light' : 'dark:text-slate-400'}
                        />
                        {t(item.labelKey)}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-4 dark:border-slate-800">
          <a
            href={STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-muted hover:bg-surface hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <AppIcon name="external" size={18} className="dark:text-slate-400" />
            {t('nav.viewStore')}
          </a>
        </div>
      </aside>
    </>
  )
}
