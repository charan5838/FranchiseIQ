import datetime
import urllib.parse
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models.franchise import Franchise, FranchiseInvestment, FranchiseFinancial, FranchiseFee
from app.models.source import FranchiseSource, DataObservation, DataFetchLog
from app.models.user import Watchlist, Notification
from app.models.verification import DataSource
from app.services.data_ingestion.official_website_fetcher import OfficialWebsiteFetcher, FetchResult
from app.services.data_ingestion.website_parser import WebsiteParser, ExtractedField
from app.services.data_ingestion.source_verifier import SourceVerifier
from app.services.claim_gap_engine import analyze_claim_gap
from app.services.risk_engine import calculate_risk_score

class IngestionManager:
    """
    Coordinates the full data pipeline from official website retrieval to
    observation storage, delta detection, watchlist alerting, and franchise record updates.
    """

    def __init__(self):
        self.fetcher = OfficialWebsiteFetcher(timeout_seconds=12, min_domain_interval=1.5)
        self.parser = WebsiteParser()

    def get_or_create_source_config(self, franchise: Franchise, db: Session) -> FranchiseSource:
        source = db.query(FranchiseSource).filter(FranchiseSource.franchise_id == franchise.id).first()
        if not source:
            official_url = franchise.website or f"https://{franchise.slug.replace('-', '')}.com"
            source = FranchiseSource(
                franchise_id=franchise.id,
                official_website=official_url,
                franchise_information_url=f"{official_url.rstrip('/')}/franchise",
                fetch_status="PENDING",
                source_mode="DEMO"
            )
            db.add(source)
            db.commit()
            db.refresh(source)
        return source

    def refresh_franchise(self, franchise_id: int, db: Any) -> Dict[str, Any]:
        if hasattr(db, "__getitem__") and not hasattr(db, "query"):
            f = db["franchises"].find_one({"id": franchise_id})
            if not f:
                return {"status": "ERROR", "message": f"Franchise with ID {franchise_id} not found."}
            src = f.get("source_config") or {}
            target_url = src.get("franchise_information_url") or src.get("official_website") or f.get("website") or f"https://{f.get('slug', 'brand')}.com"
            is_valid, reason = SourceVerifier.verify_official_url(target_url, src.get("official_website", target_url))
            if not is_valid:
                db["franchises"].update_one(
                    {"id": franchise_id},
                    {"$set": {"source_config.fetch_status": "BLOCKED", "source_config.error_message": reason}}
                )
                return {
                    "status": "BLOCKED",
                    "franchise_id": f["id"],
                    "franchise_name": f["name"],
                    "url": target_url,
                    "error": reason,
                    "fields_updated": 0,
                    "fields_unavailable": 0
                }
            now = datetime.datetime.utcnow()
            fetch_res: FetchResult = self.fetcher.fetch_page(target_url)
            if fetch_res.status != "SUCCESS" or not fetch_res.content:
                db["franchises"].update_one(
                    {"id": franchise_id},
                    {"$set": {
                        "source_config.fetch_status": fetch_res.status,
                        "source_config.error_message": fetch_res.error_message or "Failed to retrieve content",
                        "source_config.last_fetched_at": now
                    }}
                )
                return {
                    "status": fetch_res.status,
                    "franchise_id": f["id"],
                    "franchise_name": f["name"],
                    "url": target_url,
                    "http_status": fetch_res.http_status,
                    "error": fetch_res.error_message,
                    "source_mode": src.get("source_mode", "DEMO"),
                    "message": f"Website fetch resulted in {fetch_res.status}. Stored data preserved.",
                    "fields_updated": 0,
                    "fields_unavailable": 15
                }
            extracted: Dict[str, ExtractedField] = self.parser.parse_html(fetch_res.content, target_url)
            db["franchises"].update_one(
                {"id": franchise_id},
                {"$set": {
                    "source_config.fetch_status": "SUCCESS",
                    "source_config.source_mode": "LIVE",
                    "source_config.last_successful_fetch_at": now,
                    "source_config.last_fetched_at": now,
                    "source_config.error_message": None
                }}
            )
            return {
                "status": "SUCCESS",
                "franchise_id": f["id"],
                "franchise_name": f["name"],
                "url": target_url,
                "source_mode": "LIVE",
                "fields_updated": len(extracted),
                "fields_unavailable": max(0, 12 - len(extracted)),
                "last_successful_update": now.strftime("%d %b %Y, %I:%M %p"),
                "deltas_detected": []
            }

        franchise = db.query(Franchise).filter(Franchise.id == franchise_id).first()
        if not franchise:
            return {"status": "ERROR", "message": f"Franchise with ID {franchise_id} not found."}


        source = self.get_or_create_source_config(franchise, db)
        target_url = source.franchise_information_url or source.official_website

        # 1. Verify URL structure & domain policy
        is_valid, reason = SourceVerifier.verify_official_url(target_url, source.official_website)
        if not is_valid:
            source.fetch_status = "BLOCKED"
            source.error_message = reason
            db.commit()
            return {
                "status": "BLOCKED",
                "franchise_id": franchise.id,
                "franchise_name": franchise.name,
                "url": target_url,
                "error": reason,
                "fields_updated": 0,
                "fields_unavailable": 0
            }

        # 2. Fetch public page
        source.last_fetched_at = datetime.datetime.utcnow()
        fetch_res: FetchResult = self.fetcher.fetch_page(target_url)

        # Record fetch log
        log_entry = DataFetchLog(
            franchise_id=franchise.id,
            source_id=source.id,
            url=target_url,
            status=fetch_res.status,
            http_status=fetch_res.http_status,
            error_message=fetch_res.error_message,
            response_time_ms=fetch_res.response_time_ms
        )
        db.add(log_entry)

        # 3. Handle failure modes gracefully (Preserve existing data without crashing)
        if fetch_res.status != "SUCCESS" or not fetch_res.content:
            source.fetch_status = fetch_res.status
            source.error_message = fetch_res.error_message or "Failed to retrieve public content from official website."
            # Retain fallback/demo mode if it was never successfully fetched
            if not source.last_successful_fetch_at:
                source.source_mode = "DEMO"
            else:
                source.source_mode = "FALLBACK"

            db.commit()
            return {
                "status": fetch_res.status,
                "franchise_id": franchise.id,
                "franchise_name": franchise.name,
                "url": target_url,
                "http_status": fetch_res.http_status,
                "error": source.error_message,
                "source_mode": source.source_mode,
                "message": f"Website fetch resulted in {fetch_res.status}. Stored data has been preserved.",
                "fields_updated": 0,
                "fields_unavailable": 15
            }

        # 4. Parse content
        extracted: Dict[str, ExtractedField] = self.parser.parse_html(fetch_res.content, target_url)
        parsed_domain = urllib.parse.urlparse(target_url).netloc

        fields_updated = 0
        now = datetime.datetime.utcnow()
        deltas_detected: List[str] = []

        # 5. Store Observations & Detect Meaningful Changes
        for field_name, item in extracted.items():
            # Check latest observation for delta detection
            latest_obs = db.query(DataObservation).filter(
                DataObservation.franchise_id == franchise.id,
                DataObservation.field_name == field_name
            ).order_by(DataObservation.fetched_at.desc()).first()

            if latest_obs and latest_obs.normalized_value and item.normalized_value:
                if abs(latest_obs.normalized_value - item.normalized_value) > 1.0:
                    deltas_detected.append(
                        f"{field_name.replace('_', ' ').title()} changed from "
                        f"₹{latest_obs.normalized_value:,.0f} to ₹{item.normalized_value:,.0f}"
                    )

            obs = DataObservation(
                franchise_id=franchise.id,
                source_id=source.id,
                field_name=field_name,
                original_value=item.original_value,
                normalized_value=item.normalized_value,
                normalized_text=item.normalized_text,
                source_url=target_url,
                source_domain=parsed_domain,
                source_type="OFFICIAL_WEBSITE",
                data_classification=item.data_classification,
                confidence_score=item.confidence_score,
                fetched_at=now,
                valid_from=now
            )
            db.add(obs)
            fields_updated += 1

        # 6. Apply live values to Franchise records
        inv = franchise.investment
        fin = franchise.financial
        fees = franchise.fees

        if "total_investment" in extracted and extracted["total_investment"].normalized_value and inv:
            new_inv = extracted["total_investment"].normalized_value
            inv.total_estimated_investment = new_inv
            inv.min_investment = extracted.get("min_investment", extracted["total_investment"]).normalized_value or new_inv * 0.8
            inv.max_investment = extracted.get("max_investment", extracted["total_investment"]).normalized_value or new_inv * 1.2
            inv.last_updated = now.strftime("%B %Y")

        if "franchise_fee" in extracted and extracted["franchise_fee"].normalized_value and inv:
            inv.franchise_fee = extracted["franchise_fee"].normalized_value

        if "claimed_monthly_revenue" in extracted and extracted["claimed_monthly_revenue"].normalized_value and fin:
            fin.claimed_monthly_revenue = extracted["claimed_monthly_revenue"].normalized_value

        if "claimed_roi" in extracted and extracted["claimed_roi"].normalized_value and fin:
            # Store as claimed ROI, don't automatically make it actual ROI
            fin.roi_annual = min(fin.roi_annual, extracted["claimed_roi"].normalized_value)

        if "claimed_payback_months" in extracted and extracted["claimed_payback_months"].normalized_value and fin:
            fin.payback_months = extracted["claimed_payback_months"].normalized_value

        if "royalty_percentage" in extracted and extracted["royalty_percentage"].normalized_value and fees:
            fees.royalty_percentage = extracted["royalty_percentage"].normalized_value

        if "space_min_sqft" in extracted and extracted["space_min_sqft"].normalized_value:
            franchise.space_min_sqft = extracted["space_min_sqft"].normalized_value
        if "space_max_sqft" in extracted and extracted["space_max_sqft"].normalized_value:
            franchise.space_max_sqft = extracted["space_max_sqft"].normalized_value

        if "total_outlets" in extracted and extracted["total_outlets"].normalized_value and franchise.outlet_info:
            franchise.outlet_info.total_outlets = int(extracted["total_outlets"].normalized_value)

        # 7. Update Source status
        source.last_successful_fetch_at = now
        source.fetch_status = "SUCCESS" if fields_updated >= 2 else "PARTIAL_SUCCESS"
        source.source_mode = "LIVE"
        source.error_message = None

        log_entry.fields_extracted_count = fields_updated
        log_entry.fields_unavailable_count = max(0, 12 - fields_updated)

        # 8. Notify watched users if deltas were detected
        if deltas_detected:
            watchers = db.query(Watchlist).filter(Watchlist.franchise_id == franchise.id).all()
            for w in watchers:
                notif = Notification(
                    user_id=w.user_id,
                    franchise_id=franchise.id,
                    title=f"Official Update: {franchise.name}",
                    message=f"Official website update detected for {franchise.name}: {'; '.join(deltas_detected)}.",
                    type="investment_change",
                    created_at=now
                )
                db.add(notif)

        # 9. Update Primary DataSource in database
        ds = db.query(DataSource).filter(
            DataSource.franchise_id == franchise.id,
            DataSource.metric_name == "Core Financials & Unit Economics"
        ).first()
        if ds:
            ds.source_type = "OFFICIAL_WEBSITE"
            ds.source_name = f"Official Website ({parsed_domain})"
            ds.methodology = f"Retrieved and parsed directly from official company page: {target_url}"
            ds.verification_date = now.strftime("%d %b %Y")
            ds.verified_by = "FranchiseIQ Automated Ingestion Engine"

        db.commit()

        return {
            "status": "SUCCESS",
            "franchise_id": franchise.id,
            "franchise_name": franchise.name,
            "url": target_url,
            "source_mode": "LIVE",
            "fields_updated": fields_updated,
            "fields_unavailable": max(0, 12 - fields_updated),
            "last_successful_update": now.strftime("%d %b %Y, %I:%M %p"),
            "deltas_detected": deltas_detected
        }

    def refresh_all_configured_sources(self, db: Any) -> Dict[str, Any]:
        if hasattr(db, "__getitem__") and not hasattr(db, "query"):
            franchises = list(db["franchises"].find({"is_active": True}))
            results = []
            for f in franchises:
                res = self.refresh_franchise(f["id"], db)
                results.append(res)
            return {
                "total_processed": len(results),
                "successful": sum(1 for r in results if r.get("status") == "SUCCESS"),
                "details": results
            }

        sources = db.query(FranchiseSource).all()
        results = []
        for s in sources:
            res = self.refresh_franchise(s.franchise_id, db)
            results.append(res)
        return {
            "total_processed": len(results),
            "successful": sum(1 for r in results if r.get("status") == "SUCCESS"),
            "details": results
        }

