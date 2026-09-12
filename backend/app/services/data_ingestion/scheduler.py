import os
import asyncio
import logging
from app.database import get_mongo_db
from app.services.data_ingestion.ingestion_manager import IngestionManager

logger = logging.getLogger("FranchiseIQ.Scheduler")

REFRESH_INTERVAL_HOURS = int(os.getenv("DATA_REFRESH_INTERVAL_HOURS", "24"))

class DataRefreshScheduler:
    """
    Background asynchronous scheduler that periodically refreshes official franchise websites.
    Runs once every 24 hours by default without continuous scraping.
    """
    def __init__(self, interval_hours: int = REFRESH_INTERVAL_HOURS):
        self.interval_seconds = interval_hours * 3600
        self._running = False
        self._task: asyncio.Task = None

    async def _run_loop(self):
        logger.info(f"DataRefreshScheduler started with interval: {REFRESH_INTERVAL_HOURS} hours.")
        while self._running:
            try:
                # Sleep first on startup so app boots up instantly
                await asyncio.sleep(self.interval_seconds)
                if not self._running:
                    break

                logger.info("Executing scheduled official website refresh...")
                try:
                    db = get_mongo_db()
                    manager = IngestionManager()
                    summary = manager.refresh_all_configured_sources(db)
                    logger.info(f"Scheduled refresh complete: {summary.get('successful')}/{summary.get('total_processed')} successful.")
                except Exception as ex:
                    logger.error(f"Error during scheduled refresh: {ex}")

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in data refresh scheduler loop: {e}")
                await asyncio.sleep(60)

    def start(self):
        if not self._running:
            self._running = True
            try:
                loop = asyncio.get_running_loop()
                self._task = loop.create_task(self._run_loop())
            except RuntimeError:
                # Loop not running yet
                pass

    def stop(self):
        self._running = False
        if self._task and not self._task.done():
            self._task.cancel()

scheduler = DataRefreshScheduler()
