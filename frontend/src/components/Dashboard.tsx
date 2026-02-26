import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Search, X } from "lucide-react";
import { getTraces, getAnalytics, Trace, Analytics } from "../api";
import AnalyticsPanel from "./Analytics";
import TraceTable from "./TraceTable";

const CATEGORIES = [
  "All",
  "Billing",
  "Refund",
  "Account Access",
  "Cancellation",
  "General Inquiry",
];

export default function Dashboard() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const cat = selectedCategory === "All" ? undefined : selectedCategory;
        const q = debouncedSearch.trim() || undefined;
        const [t, a] = await Promise.all([getTraces(cat, q), getAnalytics()]);
        setTraces(t);
        setAnalytics(a);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategory, debouncedSearch]
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Observability Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time view of all support conversations
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Analytics */}
      {analytics && <AnalyticsPanel analytics={analytics} />}

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages…"
            className="w-full pl-8 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Trace table */}
      <TraceTable traces={traces} loading={loading} />
    </div>
  );
}
