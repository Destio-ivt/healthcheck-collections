import json
import os

from flask import jsonify, send_file
from utils.utils import BASE_DIR


def open_file(collection_name, cluster_name, file_name, file_type="generic", server_name=None):
    try:
        # Validate query parameters
        if not all([collection_name, cluster_name, file_name]):
            return jsonify({"error": "Missing required parameters."}), 400

        # Determine subdirectory based on file type
        subdirectory_map = {
            "chart": "charts",
            "summary": "summaries",
            "server": f"servers/{server_name}" if server_name else None,
            "generic": ""
        }

        subdirectory = subdirectory_map.get(file_type)
        if subdirectory is None:
            return jsonify({"error": f"Unsupported file type: {file_type}"}), 400

        # Construct the file path
        file_path = os.path.join(BASE_DIR, collection_name, cluster_name, subdirectory, file_name)

        # Check if the file exists
        if not os.path.isfile(file_path):
            return jsonify({"error": "File not found."}), 404

        # Check the file type (by extension)
        file_extension = os.path.splitext(file_name)[1].lower()
        if file_extension == '.json':
            # Handle JSON file
            with open(file_path, 'r') as file:
                file_content = json.load(file)
            return jsonify(file_content), 200
        elif file_extension in ['.png', '.jpg', '.jpeg']:
            # Handle image file
            return send_file(file_path, mimetype=f"image/{file_extension.strip('.')}"), 200
        else:
            return jsonify({"error": "Unsupported file type."}), 400

    except json.JSONDecodeError:
        return jsonify({"error": "File content is not valid JSON."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
