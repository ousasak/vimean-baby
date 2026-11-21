export const NAVIGATION_GROUPS = [
  {
    key: 'overview',
    labelKey: 'nav.groups.overview',
    items: [
      { to: '/', icon: 'dashboard', labelKey: 'nav.dashboard' },
    ],
  },
  {
    key: 'sales',
    labelKey: 'nav.groups.sales',
    items: [
      { to: '/orders', icon: 'orders', labelKey: 'nav.orders' },
      { to: '/customers', icon: 'customers', labelKey: 'nav.customers' },
    ],
  },
  {
    key: 'catalog',
    labelKey: 'nav.groups.catalog',
    items: [
      { to: '/products', icon: 'products', labelKey: 'nav.products' },
      { to: '/inventory', icon: 'inventory', labelKey: 'nav.inventory' },
      { to: '/categories', icon: 'categories', labelKey: 'nav.categories' },
      { to: '/brands', icon: 'brands', labelKey: 'nav.brands' },
    ],
  },
  {
    key: 'system',
    labelKey: 'nav.groups.system',
    items: [
      { to: '/settings', icon: 'settings', labelKey: 'nav.settings' },
    ],
  },
]
