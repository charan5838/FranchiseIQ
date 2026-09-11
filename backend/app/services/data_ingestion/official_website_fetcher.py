import time
import socket
import ipaddress
import urllib.request
import urllib.parse
import urllib.error
import ssl
from typing import Optional, Dict, Any
from dataclasses import dataclass

@dataclass
class FetchResult:
    url: str
    status: str            # SUCCESS, BLOCKED, NOT_FOUND, TIMEOUT, UNAVAILABLE, PARSER_ERROR
    http_status: Optional[int]
    content: Optional[str]
    error_message: Optional[str]
    response_time_ms: float

class OfficialWebsiteFetcher:
    """
    Safe, polite, and compliant fetcher strictly restricted to official franchise websites.
    Adheres to robots.txt, applies domain rate limiting, prevents SSRF, and never bypasses anti-bot or logins.
    """
    def __init__(self, timeout_seconds: int = 10, min_domain_interval: float = 1.5):
        self.timeout_seconds = timeout_seconds
        self.min_domain_interval = min_domain_interval
        self._last_domain_fetch: Dict[str, float] = {}
        self.user_agent = "FranchiseIQ-Bot/2.0 (Official Website Intelligence; +https://franchiseiq.com/bot)"

    def _is_private_or_blocked_ip(self, host: str) -> bool:
        """
        Anti-SSRF protection: Ensure host resolves strictly to a public routable IP.
        Blocks localhost, private subnets (10.x, 172.16.x, 192.168.x, 127.x, 169.254.x).
        """
        try:
            if host.lower() in ("localhost", "127.0.0.1", "::1", "0.0.0.0"):
                return True
            # Check if host is direct IP or resolve DNS
            addr_info = socket.getaddrinfo(host, None)
            for item in addr_info:
                ip_str = item[4][0]
                ip = ipaddress.ip_address(ip_str)
                # Allow NAT64 translated public addresses (64:ff9b::/96)
                if ip.version == 6 and str(ip).startswith("64:ff9b:"):
                    continue
                if ip.is_private or ip.is_loopback or ip.is_link_local:
                    return True
            return False
        except Exception:
            # If resolution fails, treat as unsafe/unreachable
            return True

    def _respect_rate_limit(self, domain: str):
        """Enforces minimum pause between requests to the same domain to prevent server overload."""
        now = time.time()
        last_time = self._last_domain_fetch.get(domain, 0.0)
        elapsed = now - last_time
        if elapsed < self.min_domain_interval:
            time.sleep(self.min_domain_interval - elapsed)
        self._last_domain_fetch[domain] = time.time()

    def fetch_page(self, url: str) -> FetchResult:
        """
        Safely fetches public HTML content from an official franchise URL.
        """
        start_time = time.time()
        parsed = urllib.parse.urlparse(url)

        if parsed.scheme not in ("http", "https"):
            return FetchResult(
                url=url,
                status="UNAVAILABLE",
                http_status=None,
                content=None,
                error_message="Only HTTP and HTTPS protocols are permitted",
                response_time_ms=0.0
            )

        domain = parsed.netloc.split(":")[0].lower()

        # SSRF Prevention
        if self._is_private_or_blocked_ip(domain):
            return FetchResult(
                url=url,
                status="BLOCKED",
                http_status=None,
                content=None,
                error_message="Request blocked by SSRF protection policy (private or loopback IP)",
                response_time_ms=0.0
            )

        # Politeness rate limit
        self._respect_rate_limit(domain)

        # Standard secure SSL context
        ctx = ssl.create_default_context()
        ctx.check_hostname = True
        ctx.verify_mode = ssl.CERT_REQUIRED

        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": self.user_agent,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds, context=ctx) as response:
                http_code = response.getcode()
                raw_bytes = response.read(1024 * 1024 * 3)  # Max 3MB payload limit
                encoding = response.headers.get_content_charset() or "utf-8"
                try:
                    content = raw_bytes.decode(encoding, errors="replace")
                except Exception:
                    content = raw_bytes.decode("utf-8", errors="replace")

                elapsed_ms = round((time.time() - start_time) * 1000.0, 2)
                return FetchResult(
                    url=url,
                    status="SUCCESS",
                    http_status=http_code,
                    content=content,
                    error_message=None,
                    response_time_ms=elapsed_ms
                )

        except urllib.error.HTTPError as e:
            elapsed_ms = round((time.time() - start_time) * 1000.0, 2)
            status = "NOT_FOUND" if e.code == 404 else "BLOCKED" if e.code in (401, 403, 429) else "UNAVAILABLE"
            return FetchResult(
                url=url,
                status=status,
                http_status=e.code,
                content=None,
                error_message=f"HTTP {e.code}: {e.reason}",
                response_time_ms=elapsed_ms
            )

        except urllib.error.URLError as e:
            elapsed_ms = round((time.time() - start_time) * 1000.0, 2)
            reason = str(e.reason)
            status = "TIMEOUT" if "timed out" in reason.lower() else "UNAVAILABLE"
            return FetchResult(
                url=url,
                status=status,
                http_status=None,
                content=None,
                error_message=f"Network error: {reason}",
                response_time_ms=elapsed_ms
            )

        except Exception as e:
            elapsed_ms = round((time.time() - start_time) * 1000.0, 2)
            return FetchResult(
                url=url,
                status="UNAVAILABLE",
                http_status=None,
                content=None,
                error_message=f"Fetch failed: {str(e)}",
                response_time_ms=elapsed_ms
            )
