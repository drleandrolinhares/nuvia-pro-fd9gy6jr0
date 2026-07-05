import { useState, useEffect, useCallback } from 'react'

function getStorageKey(route: string, key: string) {
  return `page-state:${route}:${key}`
}

function readValue<T>(route: string, key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(getStorageKey(route, key))
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeValue<T>(route: string, key: string, value: T) {
  try {
    localStorage.setItem(getStorageKey(route, key), JSON.stringify(value))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function usePageState<T>(
  route: string,
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => readValue(route, key, initialValue))

  useEffect(() => {
    writeValue(route, key, state)
  }, [route, key, state])

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => (typeof value === 'function' ? (value as (prev: T) => T)(prev) : value))
  }, [])

  return [state, setValue]
}

export function clearPageState(route: string) {
  try {
    const prefix = `page-state:${route}:`
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(prefix)) keysToRemove.push(k)
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
  } catch {
    // ignore
  }
}
