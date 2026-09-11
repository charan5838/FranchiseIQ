import re
from typing import Optional, Tuple, Dict, Any

class DataNormalizer:
    """
    Normalizes Indian and global franchise metrics into clean standard numerical types
    while preserving raw textual representations.
    """

    @staticmethod
    def parse_inr_amount(text: str) -> Optional[float]:
        """
        Parses strings like '₹25 Lakhs', '25,00,000 INR', '1.5 Crore', 'Rs. 50,000' into a float.
        """
        if not text:
            return None
        cleaned = text.replace(",", "").strip()

        # Check for Crore
        cr_match = re.search(r'([\d\.]+)\s*(?:cr|crore|crores)', cleaned, re.IGNORECASE)
        if cr_match:
            try:
                return float(cr_match.group(1)) * 10000000.0
            except ValueError:
                pass

        # Check for Lakh / Lac
        lakh_match = re.search(r'([\d\.]+)\s*(?:lakh|lacs|lac|lakhs)', cleaned, re.IGNORECASE)
        if lakh_match:
            try:
                return float(lakh_match.group(1)) * 100000.0
            except ValueError:
                pass

        # Check for direct numeric pattern (e.g. ₹500000, Rs 500000)
        num_match = re.search(r'(?:₹|rs\.?|inr)?\s*([\d]+(?:\.[\d]+)?)', cleaned, re.IGNORECASE)
        if num_match:
            try:
                val = float(num_match.group(1))
                # Only return if it's a plausible financial quantity
                if val >= 1000.0:
                    return val
            except ValueError:
                pass

        return None

    @staticmethod
    def parse_range_inr(text: str) -> Tuple[Optional[float], Optional[float]]:
        """
        Extracts min and max investment from ranges like '₹15 - 25 Lakhs', 'Rs. 10 to 20 Lakh'.
        """
        if not text:
            return None, None
        
        # Look for range with Lakhs: e.g. "15 - 25 Lakhs" or "15 to 25 Lakh"
        range_lakh = re.search(r'([\d\.]+)\s*(?:-|to)\s*([\d\.]+)\s*(?:lakh|lacs|lac|lakhs)', text, re.IGNORECASE)
        if range_lakh:
            try:
                v1 = float(range_lakh.group(1)) * 100000.0
                v2 = float(range_lakh.group(2)) * 100000.0
                return min(v1, v2), max(v1, v2)
            except ValueError:
                pass

        # Look for range with Crores: e.g. "1 - 2 Cr"
        range_cr = re.search(r'([\d\.]+)\s*(?:-|to)\s*([\d\.]+)\s*(?:cr|crore|crores)', text, re.IGNORECASE)
        if range_cr:
            try:
                v1 = float(range_cr.group(1)) * 10000000.0
                v2 = float(range_cr.group(2)) * 10000000.0
                return min(v1, v2), max(v1, v2)
            except ValueError:
                pass

        # Single amount starting from: "Investment starts from ₹15 Lakh"
        single_amt = DataNormalizer.parse_inr_amount(text)
        if single_amt:
            return single_amt, single_amt

        return None, None

    @staticmethod
    def parse_percentage(text: str) -> Optional[float]:
        """
        Parses percentage strings like '5%', '5.5 %', 'Up to 30% ROI', '6% to 8%'.
        """
        if not text:
            return None
        match = re.search(r'([\d]+(?:\.[\d]+)?)\s*%', text)
        if match:
            try:
                val = float(match.group(1))
                if 0.0 <= val <= 100.0:
                    return val
            except ValueError:
                pass
        return None

    @staticmethod
    def parse_area_sqft(text: str) -> Tuple[Optional[float], Optional[float]]:
        """
        Parses floor area strings like '300 - 800 sq.ft', '500 sq ft', '1000 sqft'.
        """
        if not text:
            return None, None
        
        range_match = re.search(r'([\d]+)\s*(?:-|to)\s*([\d]+)\s*(?:sq\.?\s*ft|sqft|square\s*feet)', text, re.IGNORECASE)
        if range_match:
            try:
                a1 = float(range_match.group(1))
                a2 = float(range_match.group(2))
                return min(a1, a2), max(a1, a2)
            except ValueError:
                pass

        single_match = re.search(r'([\d]+)\s*(?:sq\.?\s*ft|sqft|square\s*feet)', text, re.IGNORECASE)
        if single_match:
            try:
                val = float(single_match.group(1))
                return val, val * 1.5
            except ValueError:
                pass

        return None, None

    @staticmethod
    def parse_months(text: str) -> Optional[float]:
        """
        Parses payback durations like '18 months', '12 - 18 months', '2 years'.
        """
        if not text:
            return None
        
        # Check years e.g. "2 years" -> 24 months
        yr_match = re.search(r'([\d\.]+)\s*(?:year|years|yrs)', text, re.IGNORECASE)
        if yr_match:
            try:
                return float(yr_match.group(1)) * 12.0
            except ValueError:
                pass

        # Check months range e.g. "12-18 months"
        range_m = re.search(r'([\d]+)\s*(?:-|to)\s*([\d]+)\s*(?:month|months)', text, re.IGNORECASE)
        if range_m:
            try:
                return (float(range_m.group(1)) + float(range_m.group(2))) / 2.0
            except ValueError:
                pass

        # Single months
        m_match = re.search(r'([\d]+)\s*(?:month|months)', text, re.IGNORECASE)
        if m_match:
            try:
                return float(m_match.group(1))
            except ValueError:
                pass

        return None

    @staticmethod
    def parse_outlets(text: str) -> Optional[int]:
        """
        Parses outlet counts like '500+ outlets', 'Over 250 stores across India'.
        """
        if not text:
            return None
        match = re.search(r'(?:over\s*)?([\d]+)\+?\s*(?:outlets|stores|locations|franchises|centers)', text, re.IGNORECASE)
        if match:
            try:
                return int(match.group(1))
            except ValueError:
                pass
        return None
