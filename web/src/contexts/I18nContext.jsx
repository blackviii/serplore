import { createContext, useContext, useCallback } from 'react'
import en from '../i18n/en.json'

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const t = useCallback((key) => {
    const keys = key.split('.')
    let value = en
    for (const k of keys) {
      if (value == null) return key
      value = value[k]
    }
    return value ?? key
  }, [])

  return (
    <I18nContext.Provider value={{ t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
