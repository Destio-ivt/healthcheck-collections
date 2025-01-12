import os
import logging
from dotenv import load_dotenv
from utils.cluster_handler import process_clusters
from utils.file_handler import process_file
from utils.utils import BASE_DIR, REPORTS_DIR, create_and_get_path, generate_collection_name, get_subdirectories

# Load environment variables from a .env file
load_dotenv()

# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO),
                    format="%(asctime)s - %(levelname)s - %(message)s")

def upload_files(collection_name, files):
    if not files:
        logging.error("Missing required field: 'files'")
        raise ValueError("Missing required field: 'files'")

    collection_name = collection_name or generate_collection_name()

    try:
        # Use BASE_DIR and REPORTS_DIR from environment variables
        clusters_path = create_and_get_path(BASE_DIR, collection_name)
        reports_path = create_and_get_path(REPORTS_DIR, collection_name)

        # Process each file
        for file in files:
            process_file(collection_name, file)

        # Validate cluster directories
        cluster_folders = get_subdirectories(clusters_path)
        if not cluster_folders:
            logging.error("No cluster folders found.")
            raise FileNotFoundError("No cluster folders found.")

        # Process clusters
        errors, results = process_clusters(collection_name, cluster_folders)

        logging.info(f"Processing completed. Success: {len(results)}, Errors: {len(errors)}")

        if errors:
            logging.warning(f"Some clusters failed to process: {errors}")

    except Exception as e:
        logging.exception("An unexpected error occurred.")
        raise e
