import { Clock, Hash, PieChart } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Analytics } from "../api";

const CATEGORY_COLORS: Record<string, string> = {
  Billing: "#6366f1",
  Refund: "#f59e0b",
  "Account Access": "#10b981",
  Cancellation: "#ef4444",
  "General Inquiry": "#3b82f6",
};

const CATEGORY_BG: Record<string, string> = {
  Billing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Refund: "bg-amber-50 text-amber-700 border-amber-200",
  "Account Access": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancellation: "bg-red-50 text-red-700 border-red-200",
  "General Inquiry": "bg-blue-50 text-blue-700 border-blue-200",
};

interface Props {
  analytics: Analytics;
}

export default function AnalyticsPanel({ analytics }: Props) {
  const chartData = analytics.by_category.map((c) => ({
    name: c.category,
    value: c.count,
    color: CATEGORY_COLORS[c.category] ?? "#94a3b8",
  }));

  // Ensure all 5 categories appear even if count is 0
  const ALL_CATS = [
    "Billing",
    "Refund",
    "Account Access",
    "Cancellation",
    "General Inquiry",
  ];
  const statsMap = Object.fromEntries(
    analytics.by_category.map((c) => [c.category, c])
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Summary cards */}
      <div className="lg:col-span-1 space-y-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">
            <Hash className="w-3.5 h-3.5" />
            Total Traces
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {analytics.total_traces}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">conversations logged</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">
            <Clock className="w-3.5 h-3.5" />
            Avg Response Time
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {analytics.avg_response_time_ms < 1000
              ? `${Math.round(analytics.avg_response_time_ms)}ms`
              : `${(analytics.avg_response_time_ms / 1000).toFixed(1)}s`}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">per chatbot response</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center justify-center min-h-[160px]">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide mb-2 self-start">
          <PieChart className="w-3.5 h-3.5" />
          By Category
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <RechartsPie>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} traces`, name]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
            </RechartsPie>
          </ResponsiveContainer>
        ) : (
          <div className="text-sm text-slate-400 py-8">No data yet</div>
        )}
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-3">
          Category Breakdown
        </div>
        <div className="space-y-2.5">
          {ALL_CATS.map((cat) => {
            const stat = statsMap[cat];
            const count = stat?.count ?? 0;
            const pct = stat?.percentage ?? 0;
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_BG[cat]}`}
                  >
                    {cat}
                  </span>
                  <span className="text-xs text-slate-500">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor:
                        CATEGORY_COLORS[cat] ?? "#94a3b8",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
