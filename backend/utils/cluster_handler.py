from collections import defaultdict
import json
import logging
import os

import pandas as pd
from config.settings import CHART_CONFIG
from services.server_services import open_file
from utils.chart_generator import create_chart
from utils.utils import BASE_DIR, create_and_get_path, get_path, get_subdirectories, is_valid_name, parse_log_date


def process_clusters(collection_name, cluster_folders):
    errors, results = [], []
    for cluster_name in cluster_folders:
        if not is_valid_name(cluster_name):
            errors.append(f"Invalid cluster name: {cluster_name}")
            logging.warning(f"Skipping invalid cluster name: {cluster_name}")
            continue
        try:
            results.append(process_single_cluster(collection_name, cluster_name))
        except Exception as e:
            logging.error(f"Error processing cluster '{cluster_name}': {e}")
            errors.append(f"Cluster '{cluster_name}': {str(e)}")
    return errors, results


def process_single_cluster(collection_name, cluster_name):
    cluster_path = get_path(BASE_DIR, collection_name, cluster_name, "servers")
    server_folders = get_subdirectories(cluster_path)

    if not server_folders:
        raise ValueError(f"No servers found in cluster '{cluster_name}'.")

    dates = [
        get_server_log_dates(collection_name, cluster_name, server_name)
        for server_name in server_folders
    ]
    earliest_date = min(date[0] for date in dates)
    latest_date = max(date[1] for date in dates)

    create_summary_and_generate_charts(
        collection_name, cluster_name, cluster_path, earliest_date, latest_date
    )
    logging.info(f"Charts created for cluster '{cluster_name}'.")


def get_server_log_dates(collection_name, cluster_name, server_name):
    log_file = "0_listing-audit-logs.json"
    response, status = open_file(collection_name, cluster_name, log_file, "server", server_name)

    if status != 200:
        raise FileNotFoundError(f"Logs not found for server '{server_name}'.")

    log_data = response.get_json()
    if not log_data or 'logs' not in log_data:
        raise ValueError(f"Invalid log data for server '{server_name}'.")

    dates = [
        parse_log_date(entry["date"])
        for entry in log_data["logs"] if "date" in entry
    ]
    if not dates:
        raise ValueError(f"No valid log dates for server '{server_name}'.")

    return min(dates), max(dates)


def create_summary_and_generate_charts(collection_name, cluster_name, cluster_path, start_date, end_date):
    summary_path = create_and_get_path(BASE_DIR, collection_name, cluster_name, "summaries")
    chart_path = create_and_get_path(BASE_DIR, collection_name, cluster_name, "charts")

    json_files = [
        ("2_req-resp.json", "Operation"),
        ("3_auth-resp.json", "DisplayName"),
        ("5_req-paths.json", "Path"),
        ("6_error-count.json", "Errors"),
        ("7_remote-addr-count.json", "RemoteAddress"),
    ]

    merge_and_save_json(summary_path, cluster_path, json_files)

    subtitle = f"{start_date.strftime('%d %b %Y')} ~ {end_date.strftime('%d %b %Y')}"
    generate_charts_from_summary(chart_path, summary_path, subtitle)


def merge_and_save_json(summary_path, cluster_path, json_files):
    for file_name, key in json_files:
        merged_data = defaultdict(int)

        for server_folder in get_subdirectories(cluster_path):
            json_file_path = os.path.join(cluster_path, server_folder, file_name)
            if os.path.exists(json_file_path):
                try:
                    with open(json_file_path, "r") as f:
                        for entry in json.load(f):
                            if key in entry:
                                merged_data[entry[key]] += entry.get("Count", 0)
                except json.JSONDecodeError:
                    logging.error(f"Failed to read JSON file: {json_file_path}")

        output_file = os.path.join(summary_path, file_name)
        with open(output_file, "w") as f:
            json.dump([{key: k, "Count": v} for k, v in merged_data.items()], f, indent=4)


def generate_charts_from_summary(chart_path, summary_path, subtitle):
    for file_name in os.listdir(summary_path):
        if file_name.endswith(".json"):
            try:
                df = pd.read_json(os.path.join(summary_path, file_name))
                chart_key = next((k for k in CHART_CONFIG if k in file_name), None)
                if not chart_key:
                    continue

                create_chart(
                    df,
                    CHART_CONFIG[chart_key],
                    get_path(chart_path, f"{chart_key}.png"),
                    subtitle,
                )
            except Exception as e:
                logging.error(f"Error creating chart for {file_name}: {e}")

