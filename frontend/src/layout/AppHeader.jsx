// layout/AppHeader.jsx  (updated — added NotificationBell)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search, TrendingUp, TrendingDown, X } from 'lucide-react';
import NotificationBell from '../components/NotificationBell'; // ← NEW

function AppHeader({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchStocks = useCallback(async (query) => {
    if (!query || query.trim().length < 1) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    if (!FINNHUB_API_KEY) {
      console.error('API key not configured');
      return;
    }
    setLoading(true);
    setShowResults(true);
    try {
      const searchResponse = await fetch(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
      );
      if (!searchResponse.ok) throw new Error('Failed to search stocks');
      const searchData = await searchResponse.json();
      const usStocks = (searchData.result || [])
        .filter(stock => stock.type === 'Common Stock' && !stock.symbol.includes('.'))
        .slice(0, 5);
      const stocksWithQuotes = await Promise.all(
        usStocks.map(async (stock) => {
          try {
            const quoteResponse = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_API_KEY}`
            );
            const quoteData = await quoteResponse.json();
            return {
              symbol: stock.symbol,
              description: stock.description,
              currentPrice: quoteData.c || 0,
              change: quoteData.d || 0,
              changePercent: quoteData.dp || 0,
              previousClose: quoteData.pc || 0,
            };
          } catch (err) {
            return null;
          }
        })
      );
      setSearchResults(stocksWithQuotes.filter(Boolean));
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [FINNHUB_API_KEY]);

  useEffect(() => {
    const timeoutId = setTimeout(() => searchStocks(searchQuery), 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchStocks]);

  const handleSelectStock = (stock) => {
    onNavigate('predictions', {
      selectedStock: {
        symbol: stock.symbol,
        company: stock.description,
        currentPrice: stock.currentPrice,
        change: stock.change,
        changePercent: stock.changePercent,
      }
    });
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(price);

  const formatPercent = (percent) =>
    `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />

      {/* Global Search */}
      <div className="relative flex-1 max-w-md" ref={searchRef}>
        <div className="flex items-center gap-2">
          <Search className="size-4 text-muted-foreground" />
          <div className="relative flex-1">
            <input
              type="search"
              placeholder="Search companies"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              className="w-full px-3 py-1 text-sm border border-input rounded-md bg-background
                         focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2
                           text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border
                          rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground text-center">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock)}
                    className="w-full px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">{stock.symbol}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {stock.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-medium">{formatPrice(stock.currentPrice)}</span>
                          <span className={`flex items-center gap-1 ${
                            stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.change >= 0
                              ? <TrendingUp className="size-3" />
                              : <TrendingDown className="size-3" />}
                            {formatPrice(Math.abs(stock.change))} ({formatPercent(stock.changePercent)})
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No stocks found. Try a different search term.
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* ── Notification Bell — sits at the right edge of the header ── */}
      <div className="ml-auto">
        <NotificationBell />
      </div>
    </header>
  );
}

export default AppHeader;