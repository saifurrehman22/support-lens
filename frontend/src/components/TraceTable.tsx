import { Fragment, useState } from "react";
import { ChevronDown, ChevronUp, Clock, Loader2 } from "lucide-react";
import { Trace } from "../api";

const CATEGORY_BADGE: Record<string, string> = {
  Billing: "bg-indigo-100 text-indigo-700",
  Refund: "bg-amber-100 text-amber-700",
  "Account Access": "bg-emerald-100 text-emerald-700",
  Cancellation: "bg-red-100 text-red-700",
  "General Inquiry": "bg-blue-100 text-blue-700",
};

function truncate(text: string, max = 80) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function formatTime(iso: string) {
  const d = new Date(iso + "Z"); // treat as UTC
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  traces: Trace[];
  loading: boolean;
}

export default function TraceTable({ traces, loading }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (traces.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
        <span className="text-3xl">📭</span>
        <span className="text-sm">No traces found</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-[140px]">
              Timestamp
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
              User Message
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">
              Bot Response
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-[140px]">
              Category
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-[100px]">
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              Time
            </th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {traces.map((trace) => (
            <Fragment key={trace.id}>
              <tr
                onClick={() => toggle(trace.id)}
                className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {formatTime(trace.timestamp)}
                </td>
                <td className="px-4 py-3 text-slate-700 max-w-[200px]">
                  <span className="line-clamp-2">
                    {truncate(trace.user_message)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell max-w-[220px]">
                  <span className="line-clamp-2">
                    {truncate(trace.bot_response)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_BADGE[trace.category] ?? "bg-slate-100 text-slate-600"}`}
                  >
                    {trace.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {trace.response_time_ms < 1000
                    ? `${trace.response_time_ms}ms`
                    : `${(trace.response_time_ms / 1000).toFixed(1)}s`}
                </td>
                <td className="pr-3">
                  {expandedId === trace.id ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </td>
              </tr>

              {expandedId === trace.id && (
                <tr className="bg-slate-50 border-b border-slate-200">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                          User Message
                        </div>
                        <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg p-3 leading-relaxed">
                          {trace.user_message}
                        </p>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                          Bot Response
                        </div>
                        <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg p-3 leading-relaxed">
                          {trace.bot_response}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-4 text-xs text-slate-400">
                      <span>ID: {trace.id}</span>
                      <span>Classified as: {trace.category}</span>
                      <span>Response time: {trace.response_time_ms}ms</span>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100">
        {traces.length} trace{traces.length !== 1 ? "s" : ""} shown · click any
        row to expand
      </div>
    </div>
  );
}
