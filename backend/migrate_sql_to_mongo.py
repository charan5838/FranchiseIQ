import os
import sys
import sqlite3
import logging
from typing import Dict, Any, List

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.database import get_mongo_db, test_mongo_connection

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("MigrateSQLToMongo")

SQLITE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "franchiseiq.db")

def row_to_dict(cursor, row):
    return {cursor.description[idx][0]: value for idx, value in enumerate(row)}

def fetch_all(cursor, query, params=()):
    cursor.execute(query, params)
    return [row_to_dict(cursor, row) for row in cursor.fetchall()]

def migrate():
    if not os.path.exists(SQLITE_PATH):
        logger.error(f"SQLite database not found at: {SQLITE_PATH}")
        return False

    logger.info(f"Connecting to SQLite database: {SQLITE_PATH}")
    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    cur = sqlite_conn.cursor()

    mongo_db = get_mongo_db()
    diag = test_mongo_connection()
    logger.info(f"Target MongoDB: {diag['connection_type']} ({diag['database_name']})")

    # 1. SECTORS
    logger.info("Migrating sectors...")
    sectors = fetch_all(cur, "SELECT * FROM sectors")
    if sectors:
        mongo_db["sectors"].delete_many({})
        for s in sectors:
            s["is_active"] = bool(s.get("is_active", 1))
        mongo_db["sectors"].insert_many(sectors)
        mongo_db["sectors"].create_index("id", unique=True)
        mongo_db["sectors"].create_index("name", unique=True)
        logger.info(f"Migrated {len(sectors)} sectors.")

    # 2. USERS & PREFERENCES
    logger.info("Migrating users...")
    users = fetch_all(cur, "SELECT * FROM users")
    prefs = fetch_all(cur, "SELECT * FROM user_preferences")
    prefs_map = {p["user_id"]: p for p in prefs}

    if users:
        mongo_db["users"].delete_many({})
        for u in users:
            u_id = u["id"]
            if u_id in prefs_map:
                pref_obj = dict(prefs_map[u_id])
                del pref_obj["id"]
                del pref_obj["user_id"]
                u["preferences"] = pref_obj
            else:
                u["preferences"] = None
        mongo_db["users"].insert_many(users)
        mongo_db["users"].create_index("id", unique=True)
        mongo_db["users"].create_index("email", unique=True)
        logger.info(f"Migrated {len(users)} users.")

    # 3. LOCATIONS & COMPETITORS
    logger.info("Migrating locations...")
    locations = fetch_all(cur, "SELECT * FROM locations")
    competitors = fetch_all(cur, "SELECT * FROM competitors")
    comp_map = {}
    for c in competitors:
        loc_id = c.get("location_id")
        if loc_id not in comp_map:
            comp_map[loc_id] = []
        comp_map[loc_id].append(c)

    if locations:
        mongo_db["locations"].delete_many({})
        for l in locations:
            l["competitors"] = comp_map.get(l["id"], [])
        mongo_db["locations"].insert_many(locations)
        mongo_db["locations"].create_index("id", unique=True)
        mongo_db["locations"].create_index("city")
        logger.info(f"Migrated {len(locations)} locations with competitor data.")

    # 4. FRANCHISES & EMBEDDED CHILD TABLES
    logger.info("Migrating franchises and child models...")
    franchises = fetch_all(cur, "SELECT * FROM franchises")

    # Fetch all child tables
    investments = {row["franchise_id"]: row for row in fetch_all(cur, "SELECT * FROM franchise_investments")}
    financials = {row["franchise_id"]: row for row in fetch_all(cur, "SELECT * FROM franchise_financials")}
    operating_costs = {row["franchise_id"]: row for row in fetch_all(cur, "SELECT * FROM operating_costs")}
    fees = {row["franchise_id"]: row for row in fetch_all(cur, "SELECT * FROM franchise_fees")}
    supports = {row["franchise_id"]: row for row in fetch_all(cur, "SELECT * FROM franchisor_support")}
    outlets = {row["franchise_id"]: row for row in fetch_all(cur, "SELECT * FROM outlets")}
    sources = {row["franchise_id"]: row for row in fetch_all(cur, "SELECT * FROM franchise_sources")}

    # Group 1-to-many children
    def group_by_f_id(rows):
        res = {}
        for r in rows:
            f_id = r.get("franchise_id")
            if f_id not in res:
                res[f_id] = []
            res[f_id].append(r)
        return res

    hist_fin_map = group_by_f_id(fetch_all(cur, "SELECT * FROM historical_financials ORDER BY year ASC"))
    outlet_hist_map = group_by_f_id(fetch_all(cur, "SELECT * FROM outlet_history ORDER BY year ASC"))
    data_sources_map = group_by_f_id(fetch_all(cur, "SELECT * FROM data_sources"))
    obs_map = group_by_f_id(fetch_all(cur, "SELECT * FROM data_observations ORDER BY fetched_at DESC"))
    reviews_map = group_by_f_id(fetch_all(cur, "SELECT * FROM reviews"))
    reports_map = group_by_f_id(fetch_all(cur, "SELECT * FROM franchisee_reports"))
    loc_analyses_map = group_by_f_id(fetch_all(cur, "SELECT * FROM location_analysis"))

    sectors_dict = {s["id"]: s for s in sectors}

    if franchises:
        mongo_db["franchises"].delete_many({})
        franchise_docs = []
        for f in franchises:
            f_id = f["id"]
            sec_id = f["sector_id"]
            sec = sectors_dict.get(sec_id)

            f_doc = dict(f)
            f_doc["is_active"] = bool(f.get("is_active", 1))
            f_doc["sector"] = {
                "id": sec["id"],
                "name": sec["name"],
                "category": sec["category"],
                "icon": sec["icon"],
                "description": sec["description"]
            } if sec else None

            # Embed 1-to-1 records
            f_doc["investment"] = investments.get(f_id)
            f_doc["financial"] = financials.get(f_id)
            f_doc["operating_costs"] = operating_costs.get(f_id)
            f_doc["fees"] = fees.get(f_id)
            f_doc["support"] = supports.get(f_id)
            f_doc["outlet_info"] = outlets.get(f_id)
            f_doc["source_config"] = sources.get(f_id)

            # Embed 1-to-many records
            f_doc["historical_financials"] = hist_fin_map.get(f_id, [])
            f_doc["outlet_history"] = outlet_hist_map.get(f_id, [])
            f_doc["data_sources"] = data_sources_map.get(f_id, [])
            f_doc["observations"] = obs_map.get(f_id, [])
            f_doc["reviews"] = reviews_map.get(f_id, [])
            f_doc["franchisee_reports"] = reports_map.get(f_id, [])
            f_doc["location_analyses"] = loc_analyses_map.get(f_id, [])

            franchise_docs.append(f_doc)

        mongo_db["franchises"].insert_many(franchise_docs)
        mongo_db["franchises"].create_index("id", unique=True)
        mongo_db["franchises"].create_index("slug", unique=True)
        mongo_db["franchises"].create_index("sector_id")
        mongo_db["franchises"].create_index("name")
        logger.info(f"Migrated {len(franchise_docs)} franchises with fully embedded unit economics.")

    # 5. SUPPORT REQUESTS & FEEDBACK
    support_requests = fetch_all(cur, "SELECT * FROM support_requests")
    if support_requests:
        mongo_db["support_requests"].delete_many({})
        mongo_db["support_requests"].insert_many(support_requests)
        mongo_db["support_requests"].create_index("id", unique=True)
        mongo_db["support_requests"].create_index("user_id")
        logger.info(f"Migrated {len(support_requests)} support requests.")

    feedback_entries = fetch_all(cur, "SELECT * FROM feedback")
    if feedback_entries:
        mongo_db["feedback"].delete_many({})
        mongo_db["feedback"].insert_many(feedback_entries)
        mongo_db["feedback"].create_index("id", unique=True)
        logger.info(f"Migrated {len(feedback_entries)} feedback entries.")

    # 6. WATCHLISTS, REVIEWS & SOURCES STANDALONE
    watchlists = fetch_all(cur, "SELECT * FROM watchlists")
    if watchlists:
        mongo_db["watchlists"].delete_many({})
        mongo_db["watchlists"].insert_many(watchlists)
        mongo_db["watchlists"].create_index("id", unique=True)
        mongo_db["watchlists"].create_index("user_id")
        logger.info(f"Migrated {len(watchlists)} watchlist entries.")

    all_reviews = fetch_all(cur, "SELECT * FROM reviews")
    if all_reviews:
        mongo_db["reviews"].delete_many({})
        mongo_db["reviews"].insert_many(all_reviews)
        mongo_db["reviews"].create_index("id", unique=True)
        logger.info(f"Migrated {len(all_reviews)} reviews.")

    all_sources = fetch_all(cur, "SELECT * FROM franchise_sources")
    if all_sources:
        mongo_db["sources"].delete_many({})
        mongo_db["sources"].insert_many(all_sources)
        mongo_db["sources"].create_index("id", unique=True)
        mongo_db["sources"].create_index("franchise_id")
        logger.info(f"Migrated {len(all_sources)} source configurations.")

    sqlite_conn.close()
    logger.info("Migration from SQL to MongoDB completed successfully!")
    logger.info("SQLite database franchiseiq.db has been preserved 100% intact.")
    return True

if __name__ == "__main__":
    migrate()
