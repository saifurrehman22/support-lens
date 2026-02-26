import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const cat = selectedCategory === "All" ? undefined : selectedCategory;
        const [t, a] = await Promise.all([getTraces(cat), getAnalytics()]);
        setTraces(t);
        setAnalytics(a);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategory]
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

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Filter:
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

      {/* Trace table */}
      <TraceTable traces={traces} loading={loading} />
    </div>
  );
}
