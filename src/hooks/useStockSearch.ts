import { useState, useMemo, useEffect, useCallback } from 'react'
import stocksData from '@/data/stocks.json'

interface Stock {
  symbol: string
  name: string
  sector: string
}

const RECENT_SEARCHES_KEY = 'stock-recent-searches'
const MAX_RECENT_SEARCHES = 5

export function useStockSearch() {
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Load recent searches from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to load recent searches:', e)
        }
      }
    }
  }, [])

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Search logic with fuzzy matching
  const searchResults = useMemo(() => {
    const trimmedQuery = debouncedQuery.trim().toLowerCase()

    if (!trimmedQuery) {
      return []
    }

    const stocks = stocksData as Stock[]

    return stocks
      .filter(stock => {
        const symbolMatch = stock.symbol.toLowerCase().includes(trimmedQuery)
        const nameMatch = stock.name.toLowerCase().includes(trimmedQuery)
        return symbolMatch || nameMatch
      })
      .sort((a, b) => {
        // Prioritize symbol matches over name matches
        const aSymbolMatch = a.symbol.toLowerCase().startsWith(trimmedQuery)
        const bSymbolMatch = b.symbol.toLowerCase().startsWith(trimmedQuery)

        if (aSymbolMatch && !bSymbolMatch) return -1
        if (!aSymbolMatch && bSymbolMatch) return 1

        // Then alphabetically by symbol
        return a.symbol.localeCompare(b.symbol)
      })
      .slice(0, 10) // Limit to top 10 results
  }, [debouncedQuery])

  // Add to recent searches
  const addRecentSearch = useCallback((ticker: string) => {
    const upperTicker = ticker.toUpperCase()

    setRecentSearches(prev => {
      // Remove if already exists and add to front
      const filtered = prev.filter(t => t !== upperTicker)
      const updated = [upperTicker, ...filtered].slice(0, MAX_RECENT_SEARCHES)

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      }

      return updated
    })
  }, [])

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
    }
  }, [])

  // Get stock by symbol
  const getStockBySymbol = useCallback((symbol: string) => {
    const stocks = stocksData as Stock[]
    return stocks.find(s => s.symbol.toLowerCase() === symbol.toLowerCase())
  }, [])

  // Validate if a ticker exists
  const isValidTicker = useCallback((ticker: string) => {
    return getStockBySymbol(ticker) !== undefined
  }, [getStockBySymbol])

  return {
    query,
    setQuery,
    searchResults,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    getStockBySymbol,
    isValidTicker,
    isSearching: query !== debouncedQuery,
  }
}
