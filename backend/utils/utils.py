import os
import re
import json
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables from a .env file
load_dotenv()

# Base directories for clusters, reports, and templates
TEMP_DIR = os.getenv("TEMP_DIR", os.path.abspath("__temp__"))
BASE_DIR = os.getenv("BASE_DIR", os.path.abspath("__collections__"))
REPORTS_DIR = os.getenv("REPORTS_DIR", os.path.abspath("__reports__"))
TEMPLATES_DIR = os.getenv("TEMPLATES_DIR", os.path.abspath("__templates__"))

# Ensure the directories exist
os.makedirs(BASE_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)

# Utility Functions
def validate_filename(filename):
    """Validates file or folder name to prevent path traversal."""
    if not filename or any(char in filename for char in ('..', '/', '\\')):
        return False
    return True


def validate_cluster_names(cluster_names):
    """Validates the input cluster names."""
    if not cluster_names or not isinstance(cluster_names, list):
        return {"error": "Invalid or missing 'cluster_names'. Must be a non-empty list."}, 400
    return None


def validate_date_format(date_text):
    """Validates and parses a date string into a datetime object."""
    try:
        return datetime.strptime(date_text, "%Y-%m-%d")
    except ValueError:
        return None


def get_path(*args):
    """Joins and returns a file path."""
    return os.path.join(*args)


def ensure_directory_exists(directory_path):
    """Ensures the existence of a directory."""
    os.makedirs(directory_path, exist_ok=True)


def create_and_get_path(*path_parts):
    """Creates a directory and returns its path."""
    path = os.path.join(*path_parts)
    ensure_directory_exists(path)
    return path


def is_valid_name(name):
    """Validates names to prevent invalid characters."""
    if not name or any(char in name for char in ('..', '/', '\\')):
        return False
    return True


def get_subdirectories(path):
    """Returns a list of subdirectories in a given path."""
    try:
        subdirs = [folder for folder in os.listdir(path) if os.path.isdir(os.path.join(path, folder))]
        return subdirs
    except FileNotFoundError:
        return []


def parse_log_date(log_date):
    """Parses the log date string to a datetime object."""
    current_year = datetime.now().year
    try:
        date_format = "%b %d %H:%M %Y" if ":" in log_date else "%b %d %Y"
        return datetime.strptime(f"{log_date} {current_year}" if ":" in log_date else log_date, date_format)
    except ValueError:
        raise ValueError(f"Invalid log date format: {log_date}")


def generate_collection_name():
    """Generates a unique collection name based on timestamp."""
    return f"healthcheck_{datetime.now().strftime('%Y-%m-%d-%H.%M')}"


def is_file_empty(file_path):
    """Check if a file is empty or contains invalid JSON data."""
    try:
        if os.path.getsize(file_path) == 0:
            return True

        with open(file_path, "r") as file:
            content = file.read().strip()
            return not content or content == "[]"
    except Exception:
        return True


def extract_server_name(file_name):
    """Extract the server name from the file name."""
    return file_name.split("_")[-1].split(".")[0] if "_" in file_name else None


def extract_cluster_name(file_name):
    """Extract the cluster name based on predefined mapping."""
    mapping = {
        "rhc1vault": "AZ1EAAS",
        "rhc2vault": "AZ2EAAS",
        "rh3vaultdr": "EAASDR",
        "rh1vault": "KP1EAAS",
        "rh2vault": "KP2EAAS",
        "rh3vault": "KP3EAAS"
    }
    for key, value in mapping.items():
        if key in file_name.lower():
            return value
    return None


def convert_logs_to_json(input_file, output_file):
    """Convert log data to JSON format."""
    try:
        with open(input_file, 'r') as infile:
            lines = infile.readlines()

        result = {"total": 0, "logs": []}
        for line in lines:
            parts = line.split()
            if line.startswith("total"):
                result["total"] = int(parts[1])
            elif len(parts) >= 9:
                result["logs"].append({
                    "permissions": parts[0],
                    "links": int(parts[1]),
                    "owner": parts[2],
                    "group": parts[3],
                    "size": int(parts[4]),
                    "date": f"{parts[5]} {parts[6]} {parts[7]}",
                    "name": parts[8]
                })

        with open(output_file, 'w') as outfile:
            json.dump(result, outfile, indent=4)
    except Exception:
        pass


def fix_and_save_json(input_file, output_file):
    """Fix and save malformed JSON data."""
    try:
        with open(input_file, "r") as file:
            raw_data = file.read().strip()

        json_data = []
        for obj in re.split(r"}\s*{", raw_data):
            obj = obj.strip()
            if not obj.startswith("{"):
                obj = "{" + obj
            if not obj.endswith("}"):
                obj += "}"
            try:
                json_data.append(json.loads(obj))
            except json.JSONDecodeError:
                pass

        with open(output_file, "w") as out_file:
            json.dump(json_data, out_file, indent=4)
    except Exception:
        pass


def create_directory(path):
    """Create a directory if it doesn't exist."""
    try:
        os.makedirs(path, exist_ok=True)
    except Exception:
        pass


def is_safe_path(part):
    import re
    return re.match(r'^[a-zA-Z0-9_\-\.]+$', part) is not None