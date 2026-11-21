import React, { useMemo } from 'react'
import { useI18n } from '@/hooks/useI18n'
import { passwordScore } from '@/utils/validators'

export default function PasswordStrength({ password = '' }) {
  const { t } = useI18n()

  const score = useMemo(() => passwordScore(password), [password])
  const labels = useMemo(() => [
    '',
    t('auth.strength.weak'),
    t('auth.strength.fair'),
    t('auth.strength.good'),
    t('auth.strength.strong'),
  ], [t])

  const barClass = useMemo(() => [
    '',
    'bg-danger',
    'bg-warn',
    'bg-mint',
    'bg-mint',
  ][score], [score])

  const rules = useMemo(() => [
    { ok: password.length >= 8, label: t('auth.rules.length') },
    { ok: /[A-Za-z]/.test(password), label: t('auth.rules.letter') },
    { ok: /\d/.test(password), label: t('auth.rules.number') },
  ], [password, t])

  if (!password) return null

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-colors ${i <= score ? barClass : 'bg-line'}`}
            />
          ))}
        </div>
        <span className="w-16 text-right text-xs font-semibold text-muted">{labels[score]}</span>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={`inline-flex items-center gap-1.5 ${rule.ok ? 'text-ink' : 'text-muted'}`}
          >
            <span
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                rule.ok ? 'bg-mint text-ink' : 'bg-line text-muted'
              }`}
            >
              {rule.ok ? '✓' : '•'}
            </span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
