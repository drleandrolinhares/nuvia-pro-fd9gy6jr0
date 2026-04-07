import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface CacheContextType {
  dataVersion: number
  invalidateCache: () => void
}

const CacheContext = createContext<CacheContextType | undefined>(undefined)

export const useCache = () => {
  const context = useContext(CacheContext)
  if (!context) throw new Error('useCache must be used within a CacheProvider')
  return context
}

export const CacheProvider = ({ children }: { children: ReactNode }) => {
  const [dataVersion, setDataVersion] = useState(Date.now())

  const invalidateCache = useCallback(() => {
    setDataVersion(Date.now())
  }, [])

  return (
    <CacheContext.Provider value={{ dataVersion, invalidateCache }}>
      {children}
    </CacheContext.Provider>
  )
}
