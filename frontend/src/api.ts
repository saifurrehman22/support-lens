const BASE = "/api";

export interface Trace {
  id: string;
  user_message: string;
  bot_response: string;
  category:
    | "Billing"
    | "Refund"
    | "Account Access"
    | "Cancellation"
    | "General Inquiry";
  timestamp: string;
  response_time_ms: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

export interface Analytics {
  total_traces: number;
  by_category: CategoryStat[];
  avg_response_time_ms: number;
}

export async function sendChat(
  message: string
): Promise<{ response: string; response_time_ms: number }> {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.statusText}`);
  return res.json();
}

export async function postTrace(
  user_message: string,
  bot_response: string,
  response_time_ms: number
): Promise<Trace> {
  const res = await fetch(`${BASE}/traces`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_message, bot_response, response_time_ms }),
  });
  if (!res.ok) throw new Error(`Save trace failed: ${res.statusText}`);
  return res.json();
}

export async function getTraces(category?: string): Promise<Trace[]> {
  const url = category
    ? `${BASE}/traces?category=${encodeURIComponent(category)}`
    : `${BASE}/traces`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch traces failed: ${res.statusText}`);
  return res.json();
}

export async function getAnalytics(): Promise<Analytics> {
  const res = await fetch(`${BASE}/analytics`);
  if (!res.ok) throw new Error(`Fetch analytics failed: ${res.statusText}`);
  return res.json();
}
