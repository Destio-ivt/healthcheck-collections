import logging
import os
import shutil
import zipfile
from dotenv import load_dotenv
from utils.utils import (
    BASE_DIR,
    convert_logs_to_json,
    create_directory,
    extract_cluster_name,
    extract_server_name,
    fix_and_save_json,
    get_path,
    is_file_empty,
    validate_filename
)

# Load environment variables
load_dotenv()

# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO),
                    format="%(asctime)s - %(levelname)s - %(message)s")


def process_file(collection_name, file):
    if not file.filename.lower().endswith('.zip'):
        logging.error(f"File '{file.filename}' must be a ZIP archive.")
        raise ValueError("File must be a ZIP archive")

    server_name = extract_server_name(file.filename)
    cluster_name = extract_cluster_name(file.filename)

    if not server_name or not cluster_name:
        logging.error(f"Invalid file name format for file '{file.filename}'.")
        raise ValueError("Invalid file name format")

    create_cluster(collection_name, cluster_name)
    add_server(collection_name, cluster_name, server_name, file)


def create_cluster(collection_name, cluster_name):
    if not validate_filename(cluster_name):
        logging.error(f"Invalid or missing cluster name: '{cluster_name}'.")
        raise ValueError("Invalid or missing cluster name")

    cluster_path = get_path(BASE_DIR, collection_name, cluster_name, "servers")
    create_directory(cluster_path)


def add_server(collection_name, cluster_name, server_name, file):
    cluster_path = get_path(BASE_DIR, collection_name, cluster_name, "servers")
    server_path = get_path(cluster_path, server_name)

    if os.path.exists(server_path):
        shutil.rmtree(server_path)

    create_directory(server_path)
    zip_path = get_path(server_path, f"{file.filename}_uploaded.zip")

    try:
        file.save(zip_path)
        json_found = extract_and_process_json(zip_path, server_path)

        if not json_found:
            shutil.rmtree(server_path)
            logging.error(f"No JSON files found in the ZIP for server '{server_name}'.")
            raise FileNotFoundError("No JSON files found in the ZIP")

        clean_up_folders_and_empty_files(server_path)

    except zipfile.BadZipFile:
        logging.error(f"Invalid ZIP file: {file.filename}")
        raise ValueError("Invalid ZIP file")
    except Exception as e:
        logging.error(f"Error processing server '{server_name}': {str(e)}")
        shutil.rmtree(server_path, ignore_errors=True)
        raise
    finally:
        if os.path.exists(zip_path):
            os.remove(zip_path)


def extract_and_process_json(zip_path, server_path):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(server_path)

    json_found = False
    for root, _, files in os.walk(server_path):
        for file_name in files:
            if file_name.lower().endswith(".json"):
                json_found = True
                input_file_path = get_path(root, file_name)
                output_file_path = get_path(server_path, file_name)

                if file_name == "0_listing-audit-logs.json":
                    convert_logs_to_json(input_file_path, output_file_path)
                else:
                    fix_and_save_json(input_file_path, output_file_path)

    return json_found


def clean_up_folders_and_empty_files(server_path):
    for root, dirs, files in os.walk(server_path, topdown=False):
        for file_name in files:
            file_path = get_path(root, file_name)
            try:
                if is_file_empty(file_path):
                    os.remove(file_path)
            except OSError as e:
                logging.error(f"Failed to delete file {file_path}: {e}")

        for dir_name in dirs:
            dir_path = get_path(root, dir_name)
            try:
                if os.listdir(dir_path):
                    shutil.rmtree(dir_path)
            except OSError as e:
                logging.error(f"Failed to delete folder {dir_path}: {e}")
