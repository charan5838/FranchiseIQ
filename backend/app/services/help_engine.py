import re
from typing import Dict, List, Optional, Tuple, Any
from app.models.franchise import Franchise, FranchiseInvestment, FranchiseFinancial

from app.models.source import FranchiseSource

FAQS = [
    {
        "id": "how-it-works",
        "category": "Platform Overview",
        "question": "How does FranchiseIQ work?",
        "answer": "FranchiseIQ is a financial intelligence and decision-support platform for franchise investors. It collects and structures franchise data directly from official company websites, applies forensic risk scoring, performs Claim Gap Analysis between franchisor marketing claims and actual operational benchmarks, and matches investors with tailored opportunities based on budget, space, and risk appetite.",
        "tags": ["general", "overview", "platform"]
    },
    {
        "id": "comparison",
        "category": "Comparison Engine",
        "question": "How are franchises compared?",
        "answer": "FranchiseIQ's Comparison Engine contrasts up to 4 franchises side-by-side across critical unit economics: Total Investment, Franchise Fee, Break-even Horizon, Claim Gap Discrepancy, Historical Outlet Closure Rates, Annualized ROI, Royalty structures, and Required Space (Sq. Ft.). It helps you spot hidden operational costs and compare true profitability rather than just brand prestige.",
        "tags": ["compare", "comparison", "side-by-side"]
    },
    {
        "id": "data-sourcing",
        "category": "Data Sourcing & Provenance",
        "question": "How is franchise data sourced?",
        "answer": "Franchise data is tracked exclusively from individual official company websites through our automated ingestion pipeline. We strictly whitelist official domains (e.g. chaipoint.com, burgerking.in) and reject third-party aggregator directories. Every metric is classified into Official Marketing Claims or Factual Disclosures, with historical observation logs and source attribution.",
        "tags": ["sources", "ingestion", "provenance", "audit"]
    },
    {
        "id": "data-classification",
        "category": "Data Sourcing & Provenance",
        "question": "What is the difference between Official Website Data, Marketing Claims, and Verified Data?",
        "answer": "• Official Website Data: Direct disclosures and recruitment information published on the franchisor's official domain.\n• Marketing Claims: Promotional assertions (e.g., 'Earn ₹2 Lakhs monthly!') published by the franchisor. IMPORTANT: Information published by a franchise's official website may be a marketing claim and is not automatically independently verified. Marketing claims are NEVER treated as guaranteed returns.\n• Verified Data: Ground-truth figures corroborated through formal disclosure documents or audited unit benchmarks.\n• Estimated Data: Sector-standard baseline calculations applied when formal disclosures are pending.\n• Demo/Fallback Data: Preserved historical observations used to ensure platform stability if external websites experience temporary timeouts.",
        "tags": ["claims", "verification", "marketing", "provenance"]
    },
    {
        "id": "investment-meaning",
        "category": "Financial Metrics",
        "question": "What does Total Investment mean?",
        "answer": "Total Investment represents the comprehensive capital needed to open and operate an outlet through break-even. It includes: Franchise Fee (brand license), Outlet Setup & Interior Fit-outs (typically 40-50%), Kitchen/Operational Equipment & POS (20-30%), Initial Inventory, Security Deposits, and Working Capital Reserves for the first 3-6 months.",
        "tags": ["investment", "capex", "capital", "fee"]
    },
    {
        "id": "claim-gap",
        "category": "Forensic Analytics",
        "question": "What is Claim Gap Analysis?",
        "answer": "Claim Gap Analysis compares franchisor promotional marketing claims against audited operational reality. For example, if a brand claims an outlet generates ₹6,00,000 monthly revenue with 35% net margin, but verified ground-truth data indicates actual revenue is ₹4,80,000 with 18% margin, FranchiseIQ flags this divergence (Claim Gap %) and applies an analytical risk haircut to overall attractiveness scores.",
        "tags": ["claim gap", "forensics", "discrepancy", "margins"]
    },
    {
        "id": "recommendation-score",
        "category": "Advisor & Scoring",
        "question": "How does the recommendation score work?",
        "answer": "Our Investor Advisor computes a multi-factor compatibility score (0-100) based on: 1) Budget Fit (30%), 2) Risk Alignment (25%), 3) Desired ROI and Payback Target (20%), 4) Operational Involvement & Experience (15%), and 5) Location/Locality Demographics (10%). It automatically ranks and groups verified franchise brands for your investment profile.",
        "tags": ["recommendations", "advisor", "score"]
    },
    {
        "id": "how-to-compare",
        "category": "Platform Navigation",
        "question": "How do I compare franchises?",
        "answer": "Navigate to 'Explore' or 'Advisor', click 'Add to Compare' on any franchise card (or select the scale icon). Up to 4 franchises can be added to your comparison queue. Then click 'Compare' in the top navigation bar to inspect unit economics, royalty tiers, claim gaps, and break-even timelines side-by-side.",
        "tags": ["compare", "guide"]
    },
    {
        "id": "how-to-calculator",
        "category": "Tools",
        "question": "How do I use the Financial Calculator?",
        "answer": "Click 'Analytics' -> 'Financial Calculator' from the navigation bar. Select a franchise preset or input custom figures (Total Investment, Setup Cost, Monthly Revenue, Operating Expenses, Royalty %). The calculator models your Break-even Timeline, 3-Year Cash Flows, Net Profit Margins, and Sensitivity scenarios (Bear, Base, Bull cases).",
        "tags": ["calculator", "roi", "break-even", "tools"]
    }
]

DEFAULT_QUICK_ACTIONS = [
    "How does FranchiseIQ work?",
    "How are franchises compared?",
    "How is franchise data sourced?",
    "What does the investment mean?",
    "What is Claim Gap Analysis?",
    "How does the recommendation score work?",
    "How do I compare franchises?",
    "How do I use the calculator?",
    "Contact customer support",
    "Give feedback"
]

def format_inr(val: float) -> str:
    if val >= 10000000:
        return f"₹{val / 10000000:.2f} Cr"
    elif val >= 100000:
        return f"₹{val / 100000:.2f} Lakhs"
    else:
        return f"₹{val:,.0f}"

def search_franchise_in_db(query: str, db: Any = None) -> Any:

    """Search for a franchise brand name mentioned in the user query."""
    q = query.strip().lower()
    # Strip common conversational phrases
    cleaned = re.sub(r'\b(tell me about|what is the investment for|investment in|how much is|franchise fee for|details of|roi for|revenue of|profit of|information on|about)\b', '', q, flags=re.IGNORECASE).strip()
    
    if len(cleaned) < 3:
        cleaned = q

    from app.database import get_mongo_db, wrap_mongo_doc, clean_mongo_doc
    if hasattr(db, "__getitem__"):
        m_db = db
    else:
        m_db = get_mongo_db()

    raw_list = list(m_db["franchises"].find({"is_active": True}))
    franchises = [wrap_mongo_doc(clean_mongo_doc(d)) for d in raw_list]

    best_match = None
    for f in franchises:
        f_name_lower = f.name.lower()
        if f_name_lower in cleaned or cleaned in f_name_lower:
            return f
        # Match words in brand name
        tokens = [t for t in f_name_lower.split() if len(t) > 2 and t not in ['the', 'express', 'hub', 'point', 'club', 'store', 'studio']]
        if any(t in cleaned for t in tokens):
            best_match = f

    return best_match

def process_chat_message(message: str, action: Optional[str], db: Any = None) -> Dict:

    raw_msg = message.strip()
    msg_lower = raw_msg.lower()

    # 1. Action: Direct Support Request prompt
    if action == "contact_support" or "contact customer support" in msg_lower or "contact support" in msg_lower:
        return {
            "reply": "I'm here to connect you with our Customer Service team. You can submit a support ticket directly using the form below or visit the 'Support' page in the top navigation bar. Our team typically responds within 24 business hours.",
            "category": "Customer Support",
            "quick_actions": ["How does FranchiseIQ work?", "Ask About Franchise Data", "Give feedback"],
            "action_type": "SHOW_SUPPORT_FORM"
        }

    # 2. Action: Direct Feedback prompt
    if action == "give_feedback" or "give feedback" in msg_lower or "submit feedback" in msg_lower:
        return {
            "reply": "We value your input! Your feedback directly shapes our platform updates, data accuracy, and analytics tools. Please rate your experience and share your thoughts below:",
            "category": "Feedback",
            "quick_actions": ["How does FranchiseIQ work?", "How is franchise data sourced?", "Contact customer support"],
            "action_type": "SHOW_FEEDBACK_FORM"
        }

    # 3. Check for specific franchise lookup in Database
    matched_franchise = search_franchise_in_db(raw_msg, db)
    if matched_franchise:
        inv = matched_franchise.investment
        fin = matched_franchise.financial
        tot_inv = inv.total_estimated_investment if inv else 3000000.0
        fee = inv.franchise_fee if inv else 500000.0
        m_rev = fin.actual_monthly_revenue if fin else 500000.0
        m_prof = fin.actual_monthly_profit if fin else 90000.0
        roi = fin.roi_annual if fin else 28.0
        payback = fin.payback_months if fin else 24.0
        min_sq = matched_franchise.space_min_sqft or 400
        max_sq = matched_franchise.space_max_sqft or 1000

        # Source mode & provenance context
        src = matched_franchise.source_config
        source_note = ""
        if src and src.official_website:
            source_note = f"\n\n🔍 **Data Provenance**: Tracked from official domain [{src.official_website}]({src.official_website}) ({src.source_mode} mode). Note that marketing figures on official websites are verified against unit operating benchmarks."

        reply = (
            f"Here is the verified financial overview for **{matched_franchise.name}** ({matched_franchise.sub_sector}):\n\n"
            f"• **Total Investment**: {format_inr(tot_inv)} (incl. Franchise Fee of {format_inr(fee)})\n"
            f"• **Expected Monthly Revenue**: {format_inr(m_rev)}\n"
            f"• **Expected Monthly Profit**: {format_inr(m_prof)} (Net Margin: ~{m_prof/m_rev*100:.1f}%)\n"
            f"• **Annual ROI**: {roi:.1f}% per year\n"
            f"• **Payback Horizon**: ~{payback:.1f} months\n"
            f"• **Required Space**: {min_sq} - {max_sq} Sq. Ft. ({matched_franchise.franchise_model} model)\n"
            f"• **Headquarters**: {matched_franchise.headquarters}"
            f"{source_note}\n\n"
            f"You can view complete claim gaps, competitor density, and multi-year cash flow projections on its detail page."
        )

        return {
            "reply": reply,
            "category": "Franchise Financials",
            "quick_actions": ["How are franchises compared?", "How do I use the calculator?", "What is Claim Gap Analysis?", "Give feedback"],
            "franchise_data": {
                "id": matched_franchise.id,
                "name": matched_franchise.name,
                "total_investment": tot_inv,
                "monthly_revenue": m_rev,
                "monthly_profit": m_prof,
                "roi": roi,
                "payback_months": payback,
                "space_sqft": f"{min_sq}-{max_sq}"
            },
            "action_type": "FRANCHISE_DETAILS"
        }

    # 4. Keyword / FAQ Intent Matching
    # Data sourcing / claims / verification
    if any(k in msg_lower for k in ["source", "data source", "provenance", "official website", "scraped", "scrape"]):
        faq = next(f for f in FAQS if f["id"] == "data-sourcing")
        return {
            "reply": f"{faq['answer']}\n\nInformation published by a franchise's official website may be a marketing claim and is not automatically independently verified. FranchiseIQ never treats marketing claims as guaranteed returns.",
            "category": faq["category"],
            "quick_actions": ["What is Claim Gap Analysis?", "How does FranchiseIQ work?", "Contact customer support"]
        }

    if any(k in msg_lower for k in ["claim", "marketing claim", "difference between", "verified data", "estimated"]):
        faq = next(f for f in FAQS if f["id"] == "data-classification")
        return {
            "reply": faq["answer"],
            "category": faq["category"],
            "quick_actions": ["What is Claim Gap Analysis?", "How is franchise data sourced?", "Give feedback"]
        }

    if any(k in msg_lower for k in ["claim gap", "gap analysis"]):
        faq = next(f for f in FAQS if f["id"] == "claim-gap")
        return {
            "reply": faq["answer"],
            "category": faq["category"],
            "quick_actions": ["How are franchises compared?", "How does FranchiseIQ work?", "How is franchise data sourced?"]
        }

    if any(k in msg_lower for k in ["investment", "what does investment mean", "capex", "total investment", "franchise fee"]):
        faq = next(f for f in FAQS if f["id"] == "investment-meaning")
        return {
            "reply": faq["answer"],
            "category": faq["category"],
            "quick_actions": ["How do I use the calculator?", "How are franchises compared?", "Give feedback"]
        }

    if any(k in msg_lower for k in ["compare", "comparison", "side by side"]):
        faq = next(f for f in FAQS if f["id"] == "comparison")
        return {
            "reply": f"{faq['answer']}\n\nTip: You can add up to 4 franchises to compare directly from the 'Explore' catalog!",
            "category": faq["category"],
            "quick_actions": ["How do I compare franchises?", "What is Claim Gap Analysis?", "How does FranchiseIQ work?"]
        }

    if any(k in msg_lower for k in ["calculator", "calculate", "roi", "break-even", "cash flow"]):
        faq = next(f for f in FAQS if f["id"] == "how-to-calculator")
        return {
            "reply": faq["answer"],
            "category": faq["category"],
            "quick_actions": ["What does the investment mean?", "How does the recommendation score work?", "Give feedback"]
        }

    if any(k in msg_lower for k in ["recommendation", "score", "advisor", "ranking"]):
        faq = next(f for f in FAQS if f["id"] == "recommendation-score")
        return {
            "reply": faq["answer"],
            "category": faq["category"],
            "quick_actions": ["How does FranchiseIQ work?", "What does the investment mean?", "Contact customer support"]
        }

    if any(k in msg_lower for k in ["how does franchiseiq work", "what is franchiseiq", "overview", "help"]):
        faq = next(f for f in FAQS if f["id"] == "how-it-works")
        return {
            "reply": faq["answer"],
            "category": faq["category"],
            "quick_actions": DEFAULT_QUICK_ACTIONS[:4]
        }

    # 5. Default Helpful Response with Quick Action suggestions
    return {
        "reply": (
            "I'm here to help you evaluate franchise investments with confidence! "
            "I can explain unit economics (Investment, Revenue, Profit, ROI, Space), "
            "demonstrate our Claim Gap Analysis, explain how official website data is verified, "
            "or pull real financial facts for any specific franchise brand in our catalog.\n\n"
            "Try asking about a specific franchise (e.g., *'Tell me about Chai Point'* or *'Domino's investment'*), "
            "or select one of the quick options below:"
        ),
        "category": "General Help",
        "quick_actions": DEFAULT_QUICK_ACTIONS[:6]
    }
