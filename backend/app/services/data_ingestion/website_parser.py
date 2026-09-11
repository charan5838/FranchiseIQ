import re
import json
from typing import Dict, Any, Optional, List
from bs4 import BeautifulSoup
from app.services.data_ingestion.data_normalizer import DataNormalizer

class ExtractedField:
    def __init__(
        self,
        field_name: str,
        original_value: str,
        normalized_value: Optional[float] = None,
        normalized_text: Optional[str] = None,
        data_classification: str = "FACTUAL_DISCLOSURE",
        confidence_score: float = 85.0
    ):
        self.field_name = field_name
        self.original_value = original_value
        self.normalized_value = normalized_value
        self.normalized_text = normalized_text
        self.data_classification = data_classification
        self.confidence_score = confidence_score

class WebsiteParser:
    """
    Parses publicly accessible HTML from official franchise websites.
    Extracts structured metrics, tables, meta disclosures, and separates
    promotional claims from factual operational attributes.
    """

    def parse_html(self, html_content: str, url: str) -> Dict[str, ExtractedField]:
        if not html_content:
            return {}

        soup = BeautifulSoup(html_content, "html.parser")
        extracted: Dict[str, ExtractedField] = {}

        # 1. Inspect JSON-LD Structured Data
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string or "{}")
                self._extract_from_json_ld(data, extracted)
            except Exception:
                pass

        # 2. Extract Plain Text Lines & Key-Value Blocks
        # Strip script/style tags for clean textual scanning
        for s in soup(["script", "style", "noscript", "svg"]):
            s.decompose()

        text_content = soup.get_text(separator="\n")
        lines = [line.strip() for line in text_content.splitlines() if line.strip()]

        # 3. Look for Definition Lists and Tables
        for tr in soup.find_all("tr"):
            tds = tr.find_all(["td", "th"])
            if len(tds) >= 2:
                label = tds[0].get_text(strip=True).lower()
                val = tds[1].get_text(strip=True)
                self._match_field_from_kv(label, val, extracted)

        # 4. Sequential Pattern Scanning across Paragraphs and Headings
        full_text = " \n ".join(lines)
        self._extract_metrics_from_text(full_text, extracted)

        return extracted

    def _extract_from_json_ld(self, data: Any, extracted: Dict[str, ExtractedField]):
        if isinstance(data, list):
            for item in data:
                self._extract_from_json_ld(item, extracted)
            return

        if not isinstance(data, dict):
            return

        # Check for LocalBusiness, Organization, or Offer
        if "description" in data and "description" not in extracted:
            desc = str(data["description"]).strip()
            if len(desc) > 20:
                extracted["description"] = ExtractedField(
                    field_name="description",
                    original_value=desc[:500],
                    normalized_text=desc[:500],
                    data_classification="FACTUAL_DISCLOSURE",
                    confidence_score=90.0
                )

        if "telephone" in data and "contact_phone" not in extracted:
            extracted["contact_phone"] = ExtractedField(
                field_name="contact_phone",
                original_value=str(data["telephone"]),
                normalized_text=str(data["telephone"]),
                data_classification="FACTUAL_DISCLOSURE",
                confidence_score=95.0
            )

        if "email" in data and "contact_email" not in extracted:
            extracted["contact_email"] = ExtractedField(
                field_name="contact_email",
                original_value=str(data["email"]),
                normalized_text=str(data["email"]),
                data_classification="FACTUAL_DISCLOSURE",
                confidence_score=95.0
            )

    def _match_field_from_kv(self, label: str, val: str, extracted: Dict[str, ExtractedField]):
        if not val or len(val) > 200:
            return

        # Investment
        if any(k in label for k in ["investment", "capital required", "setup cost"]) and "total_investment" not in extracted:
            mn, mx = DataNormalizer.parse_range_inr(val)
            if mn or mx:
                tot = mx or mn
                extracted["total_investment"] = ExtractedField(
                    field_name="total_investment",
                    original_value=val,
                    normalized_value=tot,
                    data_classification="MARKETING_CLAIM",
                    confidence_score=85.0
                )
                if mn:
                    extracted["min_investment"] = ExtractedField(
                        field_name="min_investment",
                        original_value=val,
                        normalized_value=mn,
                        data_classification="MARKETING_CLAIM",
                        confidence_score=85.0
                    )
                if mx:
                    extracted["max_investment"] = ExtractedField(
                        field_name="max_investment",
                        original_value=val,
                        normalized_value=mx,
                        data_classification="MARKETING_CLAIM",
                        confidence_score=85.0
                    )

        # Franchise Fee
        elif "franchise fee" in label and "franchise_fee" not in extracted:
            fee = DataNormalizer.parse_inr_amount(val)
            if fee:
                extracted["franchise_fee"] = ExtractedField(
                    field_name="franchise_fee",
                    original_value=val,
                    normalized_value=fee,
                    data_classification="FACTUAL_DISCLOSURE",
                    confidence_score=90.0
                )

        # Royalty
        elif "royalty" in label and "royalty_percentage" not in extracted:
            royalty = DataNormalizer.parse_percentage(val)
            if royalty is not None:
                extracted["royalty_percentage"] = ExtractedField(
                    field_name="royalty_percentage",
                    original_value=val,
                    normalized_value=royalty,
                    data_classification="FACTUAL_DISCLOSURE",
                    confidence_score=90.0
                )

        # Area / Space
        elif any(k in label for k in ["space", "area", "carpet area", "sq ft"]) and "space_min_sqft" not in extracted:
            s_min, s_max = DataNormalizer.parse_area_sqft(val)
            if s_min:
                extracted["space_min_sqft"] = ExtractedField(
                    field_name="space_min_sqft",
                    original_value=val,
                    normalized_value=s_min,
                    data_classification="FACTUAL_DISCLOSURE",
                    confidence_score=85.0
                )
            if s_max:
                extracted["space_max_sqft"] = ExtractedField(
                    field_name="space_max_sqft",
                    original_value=val,
                    normalized_value=s_max,
                    data_classification="FACTUAL_DISCLOSURE",
                    confidence_score=85.0
                )

        # ROI Claim
        elif "roi" in label and "claimed_roi" not in extracted:
            roi = DataNormalizer.parse_percentage(val)
            if roi:
                extracted["claimed_roi"] = ExtractedField(
                    field_name="claimed_roi",
                    original_value=val,
                    normalized_value=roi,
                    data_classification="MARKETING_CLAIM",
                    confidence_score=75.0
                )

        # Payback Claim
        elif any(k in label for k in ["payback", "break even", "breakeven"]) and "claimed_payback_months" not in extracted:
            pb = DataNormalizer.parse_months(val)
            if pb:
                extracted["claimed_payback_months"] = ExtractedField(
                    field_name="claimed_payback_months",
                    original_value=val,
                    normalized_value=pb,
                    data_classification="MARKETING_CLAIM",
                    confidence_score=75.0
                )

    def _extract_metrics_from_text(self, text: str, extracted: Dict[str, ExtractedField]):
        # Regex scans for text patterns like "Investment: ₹15-25 Lakhs"
        if "total_investment" not in extracted:
            inv_pat = re.search(r'(?:total\s+)?investment\s*(?:required|starts\s+from|range)?\s*[:\-–]\s*([^\n\.,]{3,40})', text, re.IGNORECASE)
            if inv_pat:
                raw = inv_pat.group(1).strip()
                mn, mx = DataNormalizer.parse_range_inr(raw)
                if mn or mx:
                    tot = mx or mn
                    extracted["total_investment"] = ExtractedField(
                        field_name="total_investment",
                        original_value=raw,
                        normalized_value=tot,
                        data_classification="MARKETING_CLAIM",
                        confidence_score=80.0
                    )

        # Franchise fee pattern
        if "franchise_fee" not in extracted:
            fee_pat = re.search(r'franchise\s+fee\s*[:\-–]\s*([^\n\.,]{3,35})', text, re.IGNORECASE)
            if fee_pat:
                raw = fee_pat.group(1).strip()
                amt = DataNormalizer.parse_inr_amount(raw)
                if amt:
                    extracted["franchise_fee"] = ExtractedField(
                        field_name="franchise_fee",
                        original_value=raw,
                        normalized_value=amt,
                        data_classification="FACTUAL_DISCLOSURE",
                        confidence_score=85.0
                    )

        # Royalty pattern
        if "royalty_percentage" not in extracted:
            roy_pat = re.search(r'royalty\s*(?:fee)?\s*[:\-–]\s*([^\n\.,]{2,25})', text, re.IGNORECASE)
            if roy_pat:
                raw = roy_pat.group(1).strip()
                pct = DataNormalizer.parse_percentage(raw)
                if pct is not None:
                    extracted["royalty_percentage"] = ExtractedField(
                        field_name="royalty_percentage",
                        original_value=raw,
                        normalized_value=pct,
                        data_classification="FACTUAL_DISCLOSURE",
                        confidence_score=85.0
                    )

        # ROI Marketing Claim pattern
        if "claimed_roi" not in extracted:
            roi_pat = re.search(r'(?:expected\s+)?roi\s*(?:up\s+to|of)?\s*[:\-–]?\s*([^\n\.,]{2,25})', text, re.IGNORECASE)
            if roi_pat:
                raw = roi_pat.group(1).strip()
                pct = DataNormalizer.parse_percentage(raw)
                if pct:
                    extracted["claimed_roi"] = ExtractedField(
                        field_name="claimed_roi",
                        original_value=raw,
                        normalized_value=pct,
                        data_classification="MARKETING_CLAIM",
                        confidence_score=70.0
                    )

        # Space / Carpet Area pattern
        if "space_min_sqft" not in extracted:
            space_pat = re.search(r'(?:carpet\s+area|space\s+required|minimum\s+area)\s*[:\-–]\s*([^\n\.,]{3,35})', text, re.IGNORECASE)
            if space_pat:
                raw = space_pat.group(1).strip()
                s_min, s_max = DataNormalizer.parse_area_sqft(raw)
                if s_min:
                    extracted["space_min_sqft"] = ExtractedField(
                        field_name="space_min_sqft",
                        original_value=raw,
                        normalized_value=s_min,
                        data_classification="FACTUAL_DISCLOSURE",
                        confidence_score=80.0
                    )
                if s_max:
                    extracted["space_max_sqft"] = ExtractedField(
                        field_name="space_max_sqft",
                        original_value=raw,
                        normalized_value=s_max,
                        data_classification="FACTUAL_DISCLOSURE",
                        confidence_score=80.0
                    )

        # Outlets count pattern
        if "total_outlets" not in extracted:
            outlets_cnt = DataNormalizer.parse_outlets(text)
            if outlets_cnt:
                extracted["total_outlets"] = ExtractedField(
                    field_name="total_outlets",
                    original_value=f"{outlets_cnt}+ outlets",
                    normalized_value=float(outlets_cnt),
                    data_classification="FACTUAL_DISCLOSURE",
                    confidence_score=80.0
                )

        # Franchise Model pattern (FOFO, FOCO, COCO)
        if "franchise_model" not in extracted:
            model_pat = re.search(r'\b(FOFO|FOCO|COCO)\b', text)
            if model_pat:
                model_str = model_pat.group(1).upper()
                extracted["franchise_model"] = ExtractedField(
                    field_name="franchise_model",
                    original_value=model_str,
                    normalized_text=model_str,
                    data_classification="FACTUAL_DISCLOSURE",
                    confidence_score=90.0
                )

        # Revenue Claim pattern (e.g. "Earn up to ₹5 Lakh per month")
        if "claimed_monthly_revenue" not in extracted:
            rev_pat = re.search(r'(?:earn\s+up\s+to|monthly\s+turnover\s+of|monthly\s+revenue\s*[:\-–]?)\s*([^\n\.,]{3,35})', text, re.IGNORECASE)
            if rev_pat:
                raw = rev_pat.group(1).strip()
                amt = DataNormalizer.parse_inr_amount(raw)
                if amt:
                    extracted["claimed_monthly_revenue"] = ExtractedField(
                        field_name="claimed_monthly_revenue",
                        original_value=raw,
                        normalized_value=amt,
                        data_classification="MARKETING_CLAIM",
                        confidence_score=70.0
                    )
