import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Zap, 
  TrendingDown, 
  ExternalLink, 
  ShieldCheck, 
  HardDrive, 
  Cpu, 
  Smartphone, 
  Monitor,
  Loader2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Globe,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Trash2,
  ArrowLeftRight,
  Clock,
  LayoutGrid,
  List,
  Gift,
  User,
  Coins
} from 'lucide-react';
import { scanForDeals } from './services/scannerService';
import { Deal, SearchResult, SearchLocation, SavedSearch, SavedItem } from './types';
import { cn } from './lib/utils';

const QUICK_SEARCHES = [
  { label: '8-12TB Hard Drive', icon: HardDrive, query: '8-12TB internal hard drive cheapest price' },
  { label: 'RTX 4070 Super', icon: Cpu, query: 'NVIDIA RTX 4070 Super best price' },
  { label: 'iPhone 15 Pro', icon: Smartphone, query: 'iPhone 15 Pro deals' },
  { label: '4K Gaming Monitor', icon: Monitor, query: '27 inch 4K 144Hz gaming monitor deals' },
];

const LOCATIONS: { value: SearchLocation; label: string; flag: string }[] = [
  { value: 'DK', label: 'Danmark', flag: '🇩🇰' },
  { value: 'Nordics', label: 'Norden', flag: '🇪🇺' },
  { value: 'EU', label: 'Europa', flag: '🇪🇺' },
  { value: 'Global', label: 'Verden', flag: '🌐' },
];

export default function App() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState<SearchLocation>('DK');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'scanner' | 'compare' | 'gift'>('scanner');
  
  // Gift Finder State
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftInterests, setGiftInterests] = useState('');
  const [giftBudget, setGiftBudget] = useState('');

  // Saved searches state
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem('pricepulse_saved');
    return saved ? JSON.parse(saved) : [];
  });

  // Saved individual items state
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    const saved = localStorage.getItem('pricepulse_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [compareSubView, setCompareSubView] = useState<'searches' | 'items'>('items');

  useEffect(() => {
    localStorage.setItem('pricepulse_saved', JSON.stringify(savedSearches));
  }, [savedSearches]);

  useEffect(() => {
    localStorage.setItem('pricepulse_items', JSON.stringify(savedItems));
  }, [savedItems]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    setIsScanning(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await scanForDeals(searchQuery, location);
      setResult(data);
      setView('scanner'); // Switch to scanner view to show results
    } catch (err) {
      setError('Kunne ikke gennemføre scanningen. Prøv venligst igen.');
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleGiftSearch = () => {
    const giftQuery = `Gave til ${giftRecipient} der er vild med ${giftInterests}, budget ca. ${giftBudget} kr. Find specifikke produkter og de bedste priser.`;
    setQuery(giftQuery);
    handleSearch(giftQuery);
  };

  const saveCurrentSearch = () => {
    if (!result) return;
    
    const newSaved: SavedSearch = {
      id: crypto.randomUUID(),
      query: query || 'Hurtig søgning',
      location,
      timestamp: Date.now(),
      result
    };
    
    setSavedSearches(prev => [newSaved, ...prev]);
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
  };

  const saveItem = (deal: Deal) => {
    const newItem: SavedItem = {
      id: crypto.randomUUID(),
      deal,
      query: query || 'Hurtig søgning',
      location,
      timestamp: Date.now()
    };
    setSavedItems(prev => [newItem, ...prev]);
  };

  const deleteSavedItem = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  const isItemSaved = (dealUrl: string) => {
    return savedItems.some(item => item.deal.url === dealUrl);
  };

  const isAlreadySaved = result && savedSearches.some(s => 
    s.query === query && s.location === location && s.result.deals[0]?.title === result.deals[0]?.title
  );

  return (
    <div className="min-h-screen bg-zinc-50 selection:bg-brand-100 selection:text-brand-700">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('scanner')}>
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight text-zinc-900">
              Price<span className="text-brand-600">Pulse</span>
            </span>
          </div>
          <nav className="flex items-center gap-4 md:gap-8">
            <button 
              onClick={() => setView('scanner')}
              className={cn(
                "text-sm font-medium transition-colors flex items-center gap-2",
                view === 'scanner' ? "text-brand-600" : "text-zinc-500 hover:text-brand-600"
              )}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Scanner</span>
            </button>
            <button 
              onClick={() => setView('gift')}
              className={cn(
                "text-sm font-medium transition-colors flex items-center gap-2",
                view === 'gift' ? "text-brand-600" : "text-zinc-500 hover:text-brand-600"
              )}
            >
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Gavefinder</span>
            </button>
            <button 
              onClick={() => setView('compare')}
              className={cn(
                "text-sm font-medium transition-colors flex items-center gap-2 relative",
                view === 'compare' ? "text-brand-600" : "text-zinc-500 hover:text-brand-600"
              )}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="hidden sm:inline">Sammenlign</span>
              {(savedSearches.length > 0 || savedItems.length > 0) && (
                <span className="absolute -top-2 -right-3 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {savedSearches.length + savedItems.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {view === 'scanner' ? (
            <motion.div
              key="scanner-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Hero Section */}
              <div className="text-center mb-12">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-6xl font-display font-bold text-zinc-900 mb-4 tracking-tight"
                >
                  Find de <span className="text-brand-600 italic">billigste</span> priser <br /> på tværs af nettet
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-zinc-500 max-w-2xl mx-auto"
                >
                  Vores AI-scanner gennemsøger tusindvis af butikker i realtid for at finde de bedste tilbud til dig.
                </motion.p>
              </div>

              {/* Search Bar */}
              <div className="max-w-3xl mx-auto mb-12">
                <div className="relative group">
                  <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full group-focus-within:bg-brand-500/30 transition-all duration-500 opacity-0 group-focus-within:opacity-100" />
                  <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-zinc-200 p-2 focus-within:border-brand-500 transition-all">
                    <div className="pl-4 pr-2 text-zinc-400">
                      <Search className="w-6 h-6" />
                    </div>
                    <input 
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Hvad leder du efter? (f.eks. 12TB Harddisk)"
                      className="flex-1 bg-transparent border-none focus:ring-0 text-lg py-3 placeholder:text-zinc-400"
                    />
                    
                    {/* Location Selector */}
                    <div className="hidden sm:flex items-center gap-1 border-l border-zinc-200 px-2 mr-2">
                      <div className="flex bg-zinc-100 p-1 rounded-lg">
                        {LOCATIONS.map((loc) => (
                          <button
                            key={loc.value}
                            onClick={() => setLocation(loc.value)}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                              location === loc.value 
                                ? "bg-white text-zinc-900 shadow-sm" 
                                : "text-zinc-500 hover:text-zinc-700"
                            )}
                            title={loc.label}
                          >
                            <span className="text-base leading-none">{loc.flag}</span>
                            <span className="hidden lg:inline">{loc.value}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleSearch()}
                      disabled={isScanning || !query.trim()}
                      className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Scanner...
                        </>
                      ) : (
                        <>
                          Scan Nu
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile Location Selector */}
                <div className="sm:hidden mt-4 flex justify-center">
                  <div className="flex bg-white border border-zinc-200 p-1 rounded-xl shadow-sm">
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc.value}
                        onClick={() => setLocation(loc.value)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                          location === loc.value 
                            ? "bg-brand-600 text-white shadow-md" 
                            : "text-zinc-500 hover:bg-zinc-50"
                        )}
                      >
                        <span>{loc.flag}</span>
                        {loc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Searches */}
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {QUICK_SEARCHES.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setQuery(item.label);
                        handleSearch(item.query);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full text-sm font-medium text-zinc-600 hover:border-brand-500 hover:text-brand-600 hover:shadow-md transition-all"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Section */}
              <div className="max-w-5xl mx-auto">
                <AnimatePresence mode="wait">
                  {isScanning && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center py-20"
                    >
                      <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 border-4 border-brand-100 rounded-full" />
                        <div className="absolute inset-0 border-4 border-brand-600 rounded-full border-t-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-brand-600 animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-xl font-display font-semibold text-zinc-900 mb-2">Gennemsøger nettet...</h3>
                      <p className="text-zinc-500">Vi analyserer priser fra hundredvis af forhandlere.</p>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4"
                    >
                      <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                      <div>
                        <h3 className="font-semibold text-red-900">Der opstod en fejl</h3>
                        <p className="text-red-700">{error}</p>
                      </div>
                    </motion.div>
                  )}

                  {result && !isScanning && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      {/* Summary Card */}
                      <div className="bg-brand-600 rounded-3xl p-8 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                          <TrendingDown className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-6 h-6" />
                              <span className="font-semibold uppercase tracking-wider text-sm">AI Analyse Færdig</span>
                            </div>
                            <button 
                              onClick={saveCurrentSearch}
                              disabled={isAlreadySaved}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                isAlreadySaved 
                                  ? "bg-white/20 text-white/60 cursor-default" 
                                  : "bg-white text-brand-600 hover:bg-brand-50 shadow-lg"
                              )}
                            >
                              {isAlreadySaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                              {isAlreadySaved ? 'Gemt' : 'Gem Søgning'}
                            </button>
                          </div>
                          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Scanning Resultater</h2>
                          <p className="text-brand-50 text-lg leading-relaxed max-w-3xl">
                            {result.summary}
                          </p>
                        </div>
                      </div>

                      {/* Deal Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {result.deals.map((deal, index) => (
                          <motion.div
                            key={deal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-xl hover:border-brand-500 transition-all flex flex-col"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="bg-zinc-100 px-3 py-1 rounded-full text-xs font-bold text-zinc-500 uppercase tracking-tight">
                                {deal.store}
                              </div>
                              <div className="flex items-center gap-2">
                                {deal.rating && (
                                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                                    ★ {deal.rating}
                                  </div>
                                )}
                                <button 
                                  onClick={() => isItemSaved(deal.url) ? null : saveItem(deal)}
                                  className={cn(
                                    "p-1.5 rounded-lg transition-all",
                                    isItemSaved(deal.url) 
                                      ? "text-brand-600 bg-brand-50" 
                                      : "text-zinc-400 hover:text-brand-600 hover:bg-zinc-100"
                                  )}
                                  title={isItemSaved(deal.url) ? "Gemt" : "Gem til sammenligning"}
                                >
                                  {isItemSaved(deal.url) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-brand-600 transition-colors">
                              {deal.title}
                            </h3>
                            <p className="text-zinc-500 text-sm mb-6 flex-1">
                              {deal.description}
                            </p>
                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-100">
                              <div className="text-2xl font-display font-black text-zinc-900">
                                {deal.price}
                              </div>
                              <a 
                                href={deal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-600 transition-colors"
                              >
                                Se Tilbud
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Sources */}
                      {result.sources.length > 0 && (
                        <div className="pt-8 border-t border-zinc-200">
                          <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">Kilder & Grounding</h4>
                          <div className="flex flex-wrap gap-4">
                            {result.sources.map((source, i) => (
                              <a 
                                key={i}
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-zinc-500 hover:text-brand-600 flex items-center gap-1 underline underline-offset-2"
                              >
                                {source.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : view === 'gift' ? (
            <motion.div
              key="gift-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-display font-bold text-zinc-900 mb-4">AI Gavefinder</h2>
                <p className="text-zinc-500">Fortæl os hvem gaven er til, og vi finder de bedste idéer og priser.</p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-brand-600" />
                      Hvem er gaven til?
                    </label>
                    <input 
                      type="text"
                      value={giftRecipient}
                      onChange={(e) => setGiftRecipient(e.target.value)}
                      placeholder="F.eks. Dreng på 8 år"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <Coins className="w-4 h-4 text-brand-600" />
                      Budget (kr.)
                    </label>
                    <input 
                      type="text"
                      value={giftBudget}
                      onChange={(e) => setGiftBudget(e.target.value)}
                      placeholder="F.eks. 300"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2 mb-8">
                  <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    Interesser / Tema
                  </label>
                  <textarea 
                    value={giftInterests}
                    onChange={(e) => setGiftInterests(e.target.value)}
                    placeholder="F.eks. Harry Potter, LEGO, gaming..."
                    rows={3}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <button 
                  onClick={handleGiftSearch}
                  disabled={isScanning || !giftRecipient || !giftInterests}
                  className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-zinc-900/10"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Finder gaver...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Find Perfekte Gaver
                    </>
                  )}
                </button>

                <div className="mt-8 pt-8 border-t border-zinc-100">
                  <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Populære eksempler</h4>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => {
                        setGiftRecipient('Dreng på 8 år');
                        setGiftInterests('Harry Potter');
                        setGiftBudget('300');
                      }}
                      className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-full text-xs font-bold text-zinc-600 hover:border-brand-500 hover:text-brand-600 transition-all"
                    >
                      ⚡️ Harry Potter (8 år)
                    </button>
                    <button 
                      onClick={() => {
                        setGiftRecipient('Pige på 10 år');
                        setGiftInterests('Kreativitet, tegning');
                        setGiftBudget('500');
                      }}
                      className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-full text-xs font-bold text-zinc-600 hover:border-brand-500 hover:text-brand-600 transition-all"
                    >
                      🎨 Kreativ (10 år)
                    </button>
                    <button 
                      onClick={() => {
                        setGiftRecipient('Mand på 30 år');
                        setGiftInterests('Kaffe, gadgets');
                        setGiftBudget('1000');
                      }}
                      className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-full text-xs font-bold text-zinc-600 hover:border-brand-500 hover:text-brand-600 transition-all"
                    >
                      ☕️ Kaffe-elsker (30 år)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="compare-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-3xl font-display font-bold text-zinc-900">Sammenlign</h2>
                  <p className="text-zinc-500">Hold styr på dine favorit-produkter og tidligere søgninger.</p>
                </div>
                
                <div className="flex bg-white border border-zinc-200 p-1 rounded-xl shadow-sm">
                  <button 
                    onClick={() => setCompareSubView('items')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                      compareSubView === 'items' ? "bg-brand-600 text-white shadow-md" : "text-zinc-500 hover:bg-zinc-50"
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Produkter ({savedItems.length})
                  </button>
                  <button 
                    onClick={() => setCompareSubView('searches')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                      compareSubView === 'searches' ? "bg-brand-600 text-white shadow-md" : "text-zinc-500 hover:bg-zinc-50"
                    )}
                  >
                    <Clock className="w-4 h-4" />
                    Søgninger ({savedSearches.length})
                  </button>
                </div>
              </div>

              {compareSubView === 'items' ? (
                <div className="space-y-6">
                  {savedItems.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-20 text-center">
                      <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                        <Bookmark className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 mb-2">Ingen gemte produkter</h3>
                      <p className="text-zinc-500 mb-6">Gem specifikke tilbud fra dine scanninger for at sammenligne dem her.</p>
                      <button 
                        onClick={() => setView('scanner')}
                        className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all"
                      >
                        Find produkter nu
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col relative group"
                        >
                          <button 
                            onClick={() => deleteSavedItem(item.id)}
                            className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="flex items-center gap-2 mb-4">
                            <div className="bg-zinc-100 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-500 uppercase">
                              {item.deal.store}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              Gemt {new Date(item.timestamp).toLocaleDateString('da-DK')}
                            </div>
                          </div>
                          
                          <h3 className="font-bold text-zinc-900 mb-2 line-clamp-2 min-h-[3rem]">
                            {item.deal.title}
                          </h3>
                          
                          <div className="text-3xl font-display font-black text-brand-600 mb-4">
                            {item.deal.price}
                          </div>
                          
                          <p className="text-xs text-zinc-500 mb-6 line-clamp-3 flex-1">
                            {item.deal.description}
                          </p>
                          
                          <div className="flex items-center gap-3">
                            <a 
                              href={item.deal.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-600 transition-all"
                            >
                              Gå til butik
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {savedSearches.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-20 text-center">
                      <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                        <Clock className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 mb-2">Ingen gemte søgninger</h3>
                      <p className="text-zinc-500 mb-6">Gem dine fulde scanninger for at se dem igen senere.</p>
                      <button 
                        onClick={() => setView('scanner')}
                        className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all"
                      >
                        Start en scanning
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {savedSearches.map((saved) => (
                        <div key={saved.id} className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                          <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-brand-100 text-brand-700 p-2 rounded-lg">
                                {LOCATIONS.find(l => l.value === saved.location)?.flag || '🌐'}
                              </div>
                              <div>
                                <h3 className="font-bold text-zinc-900">{saved.query}</h3>
                                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(saved.timestamp).toLocaleString('da-DK')}</span>
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {saved.location}</span>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => deleteSavedSearch(saved.id)}
                              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {saved.result.deals.slice(0, 3).map((deal) => (
                                <div key={deal.id} className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                                  <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">{deal.store}</div>
                                  <h4 className="font-bold text-zinc-900 text-sm line-clamp-1 mb-2">{deal.title}</h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-brand-600 font-black">{deal.price}</span>
                                    <a href={deal.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-brand-600">
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between items-center">
                              <p className="text-xs text-zinc-500 italic line-clamp-1 flex-1 mr-4">
                                "{saved.result.summary}"
                              </p>
                              <button 
                                onClick={() => {
                                  setQuery(saved.query);
                                  setLocation(saved.location);
                                  setResult(saved.result);
                                  setView('scanner');
                                }}
                                className="text-brand-600 text-xs font-bold hover:underline"
                              >
                                Gense fuld scanning
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <Zap className="w-5 h-5" />
            <span className="font-display font-bold">PricePulse</span>
          </div>
          <p className="text-zinc-400 text-sm">
            © {new Date().getFullYear()} PricePulse AI. Alle priser er vejledende og hentet i realtid.
          </p>
        </div>
      </footer>
    </div>
  );
}
