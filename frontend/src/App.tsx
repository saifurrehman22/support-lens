import { useState } from "react";
import { Eye, MessageCircle } from "lucide-react";
import Chatbot from "./components/Chatbot";
import Dashboard from "./components/Dashboard";

type Tab = "chatbot" | "dashboard";

export default function App() {
  const [tab, setTab] = useState<Tab>("chatbot");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-lg tracking-tight">
              SupportLens
            </span>
          </div>
          <nav className="flex gap-1">
            <button
              onClick={() => setTab("chatbot")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === "chatbot"
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chatbot
            </button>
            <button
              onClick={() => setTab("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === "dashboard"
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Eye className="w-4 h-4" />
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {tab === "chatbot" ? <Chatbot /> : <Dashboard />}
      </main>
    </div>
  );
}
