"""
Seed the database with 25 realistic pre-classified traces.
Run: python seed.py
"""

import sys
import uuid
from datetime import datetime, timedelta
import random

sys.path.insert(0, ".")

from database import SessionLocal, engine, Base
from models import Trace, Category

Base.metadata.create_all(bind=engine)

SEED_TRACES = [
    # --- Billing (5) ---
    {
        "user_message": "Why was I charged $49 this month? I thought I was on the $29 plan.",
        "bot_response": "I understand your concern about an unexpected charge. It looks like your account was upgraded to the Professional plan on the 3rd of this month, which is billed at $49/month. If you didn't initiate this change, please contact our billing team at billing@billpro.com so we can investigate and issue a correction if needed.",
        "category": Category.BILLING,
        "response_time_ms": 1240,
    },
    {
        "user_message": "How do I update my credit card? My old card expired.",
        "bot_response": "You can update your payment method by going to Settings → Billing → Payment Methods and clicking 'Update Card'. Your new card will be charged on your next billing date. Let me know if you run into any issues!",
        "category": Category.BILLING,
        "response_time_ms": 890,
    },
    {
        "user_message": "Do you offer annual billing? Is there a discount?",
        "bot_response": "Yes! We offer annual billing at a 20% discount compared to monthly. You can switch to annual billing from Settings → Billing → Subscription. The discount is applied immediately and you'll receive a prorated credit for any remaining time on your current month.",
        "category": Category.BILLING,
        "response_time_ms": 1050,
    },
    {
        "user_message": "I see a charge for 'BillPro Add-on' on my invoice — what is that?",
        "bot_response": "The 'BillPro Add-on' charge corresponds to the Advanced Analytics add-on that was enabled on your account. This is billed at $15/month. You can view and manage your add-ons under Settings → Billing → Add-ons. If you believe this was added in error, please reach out to our support team.",
        "category": Category.BILLING,
        "response_time_ms": 1320,
    },
    {
        "user_message": "What payment methods do you accept?",
        "bot_response": "We accept all major credit and debit cards (Visa, Mastercard, Amex, Discover), as well as ACH bank transfers for annual plans over $500. We do not currently accept PayPal or cryptocurrency. Is there a specific payment method you'd like to use?",
        "category": Category.BILLING,
        "response_time_ms": 780,
    },
    # --- Refund (5) ---
    {
        "user_message": "I was double charged this month. I need a refund immediately.",
        "bot_response": "I'm sorry about the double charge — that's definitely not right. I can see this has been flagged on your account. Our billing team will process a full refund for the duplicate charge within 3-5 business days. You'll receive a confirmation email once it's been issued. I apologize for the inconvenience.",
        "category": Category.REFUND,
        "response_time_ms": 1480,
    },
    {
        "user_message": "I cancelled last week but still got charged. Can I get my money back?",
        "bot_response": "I'm sorry to hear that — a charge after cancellation should not happen. If the charge occurred after your cancellation date, you're entitled to a full refund. Please email billing@billpro.com with your cancellation confirmation and we'll process the refund within 5 business days.",
        "category": Category.REFUND,
        "response_time_ms": 1150,
    },
    {
        "user_message": "The product didn't work as advertised. I want my money back for this month.",
        "bot_response": "I'm sorry the product didn't meet your expectations. We do offer refunds on a case-by-case basis for the most recent billing period if the service didn't perform as described. Please contact billing@billpro.com with details about the issues you experienced and our team will review your request within 2 business days.",
        "category": Category.REFUND,
        "response_time_ms": 1390,
    },
    {
        "user_message": "Can I get a refund for the unused portion of my annual plan?",
        "bot_response": "We can offer a prorated refund for the unused months of your annual plan, minus any promotional discount applied at signup. To initiate this, please contact billing@billpro.com with your account email and the reason for the refund request. Our team will process it within 5-7 business days.",
        "category": Category.REFUND,
        "response_time_ms": 1230,
    },
    {
        "user_message": "My team never used the enterprise features I paid for. I'd like a partial refund.",
        "bot_response": "I understand — paying for features you didn't use is frustrating. While we don't offer automatic refunds for unused features, I'd recommend reaching out to our billing team at billing@billpro.com to discuss a credit or partial refund. They can review your usage history and work with you on a fair resolution.",
        "category": Category.REFUND,
        "response_time_ms": 1560,
    },
    # --- Account Access (5) ---
    {
        "user_message": "I forgot my password and the reset email isn't arriving.",
        "bot_response": "Let's get this sorted! First, check your spam/junk folder for an email from noreply@billpro.com. If it's not there, try again with a 5-minute wait. If you're still not receiving it, your email address on file may be different — contact support@billpro.com from your registered email address and we can manually trigger a reset.",
        "category": Category.ACCOUNT_ACCESS,
        "response_time_ms": 1020,
    },
    {
        "user_message": "My account got locked after too many login attempts. How do I unlock it?",
        "bot_response": "Account lockouts are lifted automatically after 30 minutes as a security measure. If you need immediate access, you can use the 'Forgot Password' link to reset your credentials, which will also unlock your account. If the issue persists, please contact support@billpro.com with your account email.",
        "category": Category.ACCOUNT_ACCESS,
        "response_time_ms": 940,
    },
    {
        "user_message": "I lost access to my authenticator app. Can't log in due to 2FA.",
        "bot_response": "Losing your 2FA device can be stressful, but we can help. Please email security@billpro.com from your registered email address with a photo ID to verify your identity. Once verified, we can disable 2FA on your account so you can log in and set up a new authenticator. This typically takes 1-2 business days.",
        "category": Category.ACCOUNT_ACCESS,
        "response_time_ms": 1110,
    },
    {
        "user_message": "One of my team members can't log into their seat. The password doesn't work.",
        "bot_response": "As an admin, you can reset any team member's password from Settings → Team → Members — click the three-dot menu next to their name and select 'Reset Password'. They'll receive an email to set a new one. If you're not the admin or this doesn't resolve it, contact support@billpro.com.",
        "category": Category.ACCOUNT_ACCESS,
        "response_time_ms": 870,
    },
    {
        "user_message": "I keep getting logged out every time I close the browser. Is there a stay-logged-in option?",
        "bot_response": "Yes! On the login page, check the 'Keep me signed in' checkbox before logging in — this will keep your session active for 30 days. Note that if your organization has enforced session timeouts for security compliance, this option may be disabled by your admin.",
        "category": Category.ACCOUNT_ACCESS,
        "response_time_ms": 760,
    },
    # --- Cancellation (5) ---
    {
        "user_message": "I'd like to cancel my subscription. How do I do that?",
        "bot_response": "I'm sorry to hear you'd like to cancel. You can cancel anytime from Settings → Billing → Subscription → Cancel Plan. Your access will continue until the end of your current billing period at no additional charge. If there's anything we can do to address your concerns before you go, we'd love to hear it.",
        "category": Category.CANCELLATION,
        "response_time_ms": 960,
    },
    {
        "user_message": "We're shutting down our startup. Please cancel our account and stop all charges.",
        "bot_response": "I'm sorry to hear about the shutdown. You can cancel immediately from Settings → Billing → Subscription → Cancel Plan to stop future charges. If you've been charged for a period you won't use, please email billing@billpro.com and we'll review your account for a prorated refund. We wish your team well.",
        "category": Category.CANCELLATION,
        "response_time_ms": 1190,
    },
    {
        "user_message": "Can I downgrade to the free plan instead of cancelling?",
        "bot_response": "Absolutely! You can downgrade to our free tier at any time from Settings → Billing → Subscription → Change Plan. You'll retain access to Professional features until your current period ends, then automatically move to the free plan limits. No payment info needed for the free tier.",
        "category": Category.CANCELLATION,
        "response_time_ms": 850,
    },
    {
        "user_message": "I want to pause my subscription for 2 months while we're between projects.",
        "bot_response": "We don't offer a formal pause feature, but we do have a few options: you can downgrade to the free plan and upgrade again when ready, or cancel now and resubscribe later — your data is retained for 90 days after cancellation. If you'd like to discuss a custom arrangement, please reach out to sales@billpro.com.",
        "category": Category.CANCELLATION,
        "response_time_ms": 1280,
    },
    {
        "user_message": "If I cancel today, will I lose my data immediately?",
        "bot_response": "No — your data is not deleted immediately. You'll have full access until your billing period ends, and after that, your data is retained for 90 days in a read-only state. During this window, you can export everything from Settings → Data → Export. After 90 days, data is permanently deleted per our retention policy.",
        "category": Category.CANCELLATION,
        "response_time_ms": 1090,
    },
    # --- General Inquiry (5) ---
    {
        "user_message": "Does BillPro integrate with QuickBooks?",
        "bot_response": "Yes! BillPro has a native QuickBooks integration available on Professional and Enterprise plans. You can connect it from Settings → Integrations → QuickBooks. It syncs invoices, payments, and customer records bi-directionally. Setup takes about 5 minutes. Would you like a link to our integration guide?",
        "category": Category.GENERAL_INQUIRY,
        "response_time_ms": 920,
    },
    {
        "user_message": "How many team seats are included in the Starter plan?",
        "bot_response": "The Starter plan includes up to 3 team seats. If you need more, the Professional plan supports up to 15 seats, and the Enterprise plan has unlimited seats. You can compare all plans at billpro.com/pricing or from Settings → Billing → Compare Plans.",
        "category": Category.GENERAL_INQUIRY,
        "response_time_ms": 810,
    },
    {
        "user_message": "Is there an API I can use to pull invoice data into our own system?",
        "bot_response": "Yes! BillPro has a REST API available on Professional and Enterprise plans. You can generate an API key from Settings → Developer → API Keys. Our API documentation covers all endpoints for invoices, customers, and payments. Check it out at docs.billpro.com/api.",
        "category": Category.GENERAL_INQUIRY,
        "response_time_ms": 1030,
    },
    {
        "user_message": "What's the difference between the Starter and Professional plans?",
        "bot_response": "The main differences: Starter supports 3 users, 100 invoices/month, and basic reporting. Professional supports 15 users, unlimited invoices, advanced analytics, API access, and priority support. Professional is billed at $49/month or $39/month annually. You can see the full comparison at billpro.com/pricing.",
        "category": Category.GENERAL_INQUIRY,
        "response_time_ms": 990,
    },
    {
        "user_message": "Does BillPro support multiple currencies?",
        "bot_response": "Yes, BillPro supports over 135 currencies. You can set a default currency for your account in Settings → General → Currency, and individual invoices can be issued in any supported currency. Exchange rates are updated daily. Note that your billing currency (what we charge you) is always USD.",
        "category": Category.GENERAL_INQUIRY,
        "response_time_ms": 880,
    },
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(Trace).count()
        if existing >= 20:
            print(f"Database already has {existing} traces. Skipping seed.")
            return

        base_time = datetime.utcnow() - timedelta(days=7)
        for i, data in enumerate(SEED_TRACES):
            offset_minutes = i * random.randint(20, 90)
            trace = Trace(
                id=str(uuid.uuid4()),
                user_message=data["user_message"],
                bot_response=data["bot_response"],
                category=data["category"],
                timestamp=base_time + timedelta(minutes=offset_minutes),
                response_time_ms=data["response_time_ms"],
            )
            db.add(trace)

        db.commit()
        print(f"Seeded {len(SEED_TRACES)} traces successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
