import logging
import os
from dotenv import load_dotenv
from services.collection_services import get_cluster_by_id
from utils.report_generator import (
    generate_summary_report,
    process_cluster_report,
    update_summary_placeholders,
    wrap_report
)
from utils.utils import get_path

# Load environment variables
load_dotenv()

# Environment variables
TEMPLATES_DIR = os.getenv("TEMPLATES_DIR", "./templates")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s - %(levelname)s - %(message)s"
)

def generate_reports(collection_name, cluster_names):
    try:
        # Validate template paths
        template_path = get_path(TEMPLATES_DIR, 'cluster.docx')
        summary_template_path = get_path(TEMPLATES_DIR, 'summary.docx')


        if not os.path.exists(template_path):
            logging.error("Cluster report template file not found.")
            raise FileNotFoundError("Cluster report template file not found.")
        if not os.path.exists(summary_template_path):
            logging.error("Summary report template file not found.")
            raise FileNotFoundError("Summary report template file not found.")

        # Initialize variables
        reports_created = []
        summary_placeholders = {}
        summary_warning_counts = {}

        # Iterate through clusters
        for cluster_index, cluster_name in enumerate(cluster_names, start=1):
            # Fetch cluster data
            response_data = get_cluster_by_id(collection_name, cluster_name)

            if not response_data:
                logging.warning(f"No data found for cluster '{cluster_name}' in collection '{collection_name}'.")
                continue

            # Process document
            output_path, placeholders = process_cluster_report(
                template_path, collection_name, cluster_name, response_data
            )
            reports_created.append(output_path)

            # Update summary placeholders
            update_summary_placeholders(summary_placeholders, summary_warning_counts, cluster_index, placeholders)

        # Generate summary report
        generate_summary_report(summary_template_path, collection_name, summary_placeholders, summary_warning_counts)

        # After all reports are created, generate the ZIP file and return the download URL
        download_report_url = wrap_report(collection_name)
        
        logging.info("Reports created successfully and ready to download.")
        return reports_created, download_report_url

    except FileNotFoundError as fnfe:
        logging.error(f"File error: {str(fnfe)}")
        raise
    except KeyError as ke:
        logging.error(f"Missing key: {str(ke)}")
        raise
    except Exception as e:
        logging.error(f"An unexpected error occurred: {str(e)}")
        raise
