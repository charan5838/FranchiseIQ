import urllib.parse
from typing import Tuple, List

# Prohibited sources: Never scrape or accept third-party unverified sources
DISALLOWED_DOMAINS = [
    "wikipedia.org", "reddit.com", "quora.com", "medium.com", "blogspot.com",
    "wordpress.com", "facebook.com", "instagram.com", "linkedin.com", "twitter.com",
    "franchiseindia.com", "topfranchise.com", "genericdirectory.com"
]

class SourceVerifier:
    """
    Validates that URLs correspond strictly to the franchise's genuine official website domain.
    Rejects generic aggregators, social forums, and unverified blogs.
    """

    @staticmethod
    def verify_official_url(url: str, expected_official_domain: str = "") -> Tuple[bool, str]:
        if not url:
            return False, "URL cannot be empty"

        parsed = urllib.parse.urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return False, "Invalid URL structure (must include http/https)"

        domain = parsed.netloc.lower().split(":")[0]

        # Check blacklist
        for bad_domain in DISALLOWED_DOMAINS:
            if bad_domain in domain:
                return False, f"Source '{domain}' is a prohibited third-party aggregator/forum. Only official franchise domains are accepted."

        # Check against expected domain if provided
        if expected_official_domain:
            exp_parsed = urllib.parse.urlparse(expected_official_domain)
            exp_netloc = exp_parsed.netloc if exp_parsed.netloc else expected_official_domain
            exp_clean = exp_netloc.lower().replace("www.", "").split(":")[0].split("/")[0]
            dom_clean = domain.replace("www.", "")
            if not (dom_clean == exp_clean or dom_clean.endswith("." + exp_clean)):
                return False, f"Domain mismatch: '{domain}' does not match official company domain '{expected_official_domain}'."

        return True, "Valid official domain"

    @staticmethod
    def compute_source_confidence(
        fetch_status: str,
        fields_extracted: int,
        has_marketing_claims: bool = False
    ) -> float:
        """
        Calculates a transparent confidence score (0-100%).
        Official website data is weighted high (80-92%), with appropriate discounts for pure marketing claims.
        """
        if fetch_status != "SUCCESS":
            return 40.0

        base = 75.0
        # Completeness bonus
        completeness_boost = min(15.0, fields_extracted * 2.5)
        
        # Marketing claim calibration
        claim_discount = 5.0 if has_marketing_claims else 0.0

        return round(min(95.0, max(50.0, base + completeness_boost - claim_discount)), 1)
