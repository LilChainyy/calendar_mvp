'use client'

import { useStockSearch } from '@/hooks/useStockSearch'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StockSearchBar() {
  const router = useRouter()
  const {
    query,
    setQuery,
    searchResults,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    getStockBySymbol,
    isSearching,
  } = useStockSearch()

  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Show dropdown when focused
  const handleFocus = () => {
    setIsOpen(true)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setHighlightedIndex(-1)
    setIsOpen(true)
  }

  // Handle stock selection
  const handleSelectStock = (symbol: string) => {
    addRecentSearch(symbol)
    setQuery('')
    setIsOpen(false)
    router.push(`/calendar/${symbol}`)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const results = query ? searchResults : recentSearches.map(s => getStockBySymbol(s)).filter(Boolean)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && results[highlightedIndex]) {
        const stock = results[highlightedIndex]
        if (stock && 'symbol' in stock) {
          handleSelectStock(stock.symbol)
        }
      } else if (query) {
        // Try to find exact match or first result
        const exactMatch = searchResults.find(
          s => s.symbol.toLowerCase() === query.toLowerCase()
        )
        if (exactMatch) {
          handleSelectStock(exactMatch.symbol)
        } else if (searchResults.length > 0) {
          handleSelectStock(searchResults[0].symbol)
        }
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsOpen(false)
    }
  }

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text

    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-gray-900">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    )
  }

  // Determine what to show in dropdown
  const showRecentSearches = !query && recentSearches.length > 0
  const showSearchResults = query && searchResults.length > 0
  const showNoResults = query && !isSearching && searchResults.length === 0

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search stocks by ticker or company name..."
          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Search stocks"
          aria-autocomplete="list"
          aria-controls="stock-search-results"
          aria-expanded={isOpen}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isSearching ? (
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          ) : (
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          id="stock-search-results"
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
          role="listbox"
        >
          {showRecentSearches && (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                <span className="text-xs font-semibold text-gray-600 uppercase">
                  Recent Searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-blue-500 hover:text-blue-700"
                  aria-label="Clear recent searches"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((ticker, index) => {
                const stock = getStockBySymbol(ticker)
                if (!stock) return null

                return (
                  <button
                    key={ticker}
                    onClick={() => handleSelectStock(stock.symbol)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      highlightedIndex === index ? 'bg-blue-50' : ''
                    }`}
                    role="option"
                    aria-selected={highlightedIndex === index}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {stock.symbol}
                        </span>
                        <span className="text-gray-500 ml-2">- {stock.name}</span>
                      </div>
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stock.sector}</div>
                  </button>
                )
              })}
            </>
          )}

          {showSearchResults && (
            <>
              {!showRecentSearches && (
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                  <span className="text-xs font-semibold text-gray-600 uppercase">
                    Search Results
                  </span>
                </div>
              )}
              {searchResults.map((stock, index) => {
                const adjustedIndex = showRecentSearches ? index + recentSearches.length : index

                return (
                  <button
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock.symbol)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      highlightedIndex === adjustedIndex ? 'bg-blue-50' : ''
                    }`}
                    role="option"
                    aria-selected={highlightedIndex === adjustedIndex}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {highlightMatch(stock.symbol, query)}
                        </span>
                        <span className="text-gray-500 ml-2">
                          - {highlightMatch(stock.name, query)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stock.sector}</div>
                  </button>
                )
              })}
            </>
          )}

          {showNoResults && (
            <div className="px-4 py-6 text-center text-gray-500">
              <svg
                className="h-12 w-12 mx-auto mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-medium">No stocks found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try searching by ticker symbol or company name
              </p>
            </div>
          )}

          {!showRecentSearches && !showSearchResults && !showNoResults && !query && (
            <div className="px-4 py-6 text-center text-gray-500">
              <svg
                className="h-12 w-12 mx-auto mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="font-medium">Start typing to search</p>
              <p className="text-sm text-gray-400 mt-1">
                Search by ticker (e.g., AAPL) or company name
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
