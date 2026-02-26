import time

import anthropic

client = anthropic.Anthropic()

CHATBOT_SYSTEM_PROMPT = """You are a helpful customer support agent for BillPro, a SaaS billing platform used by thousands of businesses.

Your responsibilities:
- Answer questions about invoices, charges, payment methods, and subscription plans
- Help with account access issues (login, password reset, MFA)
- Handle refund and cancellation requests professionally
- Provide clear, accurate guidance on product features and how-tos

Guidelines:
- Be concise and professional (2-4 sentences unless more detail is needed)
- Show empathy for frustrated customers
- If you cannot directly resolve an issue (e.g., process a refund), explain the steps or escalation path
- Never make up specific account details — acknowledge you'd need to verify identity for account-specific actions"""

CLASSIFICATION_PROMPT = """You are a support ticket classifier. Classify the following customer support conversation into exactly one category.

Categories:
- Billing: Questions about invoices, charges, payment methods, pricing, or subscription fees
- Refund: Requests to return a product, get money back, dispute a charge, or process a credit
- Account Access: Issues logging in, resetting passwords, locked accounts, or MFA problems
- Cancellation: Requests to cancel a subscription, downgrade a plan, or close an account
- General Inquiry: Anything that doesn't fit the above — feature questions, product info, how-to questions, etc.

Classification rules:
1. Identify the PRIMARY intent of the customer message — use that category even if other topics are mentioned
2. Refund vs Billing: if the customer wants money back (not just asking about a charge), use Refund
3. Cancellation vs Billing: if the customer wants to cancel (not just asking about pricing), use Cancellation
4. Account Access vs General Inquiry: if the issue is logging in or authentication, use Account Access
5. When genuinely ambiguous, prefer the more specific category over General Inquiry

Customer Message:
{user_message}

Support Response:
{bot_response}

Respond with ONLY the category name. No explanation, no punctuation — just the exact category name from the list above."""


def chat(user_message: str) -> tuple[str, int]:
    start = time.time()
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        system=CHATBOT_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )
    elapsed_ms = int((time.time() - start) * 1000)
    return response.content[0].text, elapsed_ms


def classify(user_message: str, bot_response: str) -> str:
    prompt = CLASSIFICATION_PROMPT.format(
        user_message=user_message, bot_response=bot_response
    )
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=10,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = response.content[0].text.strip()

    valid = ["Billing", "Refund", "Account Access", "Cancellation", "General Inquiry"]
    for cat in valid:
        if cat.lower() in raw.lower():
            return cat

    return "General Inquiry"
