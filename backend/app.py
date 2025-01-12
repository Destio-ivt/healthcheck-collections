import logging
import os
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
from flask_cors import CORS

from services.collection_services import (
    delete_cluster, delete_collection, get_collection_by_id, 
    get_collections, get_cluster_by_id, get_report_by_id, get_reports
)
from services.file_services import upload_files
from services.report_services import generate_reports
from services.server_services import open_file
from utils.utils import REPORTS_DIR, TEMP_DIR, is_safe_path

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load configurations from environment variables
DEBUG_MODE = os.getenv("FLASK_DEBUG", "False").lower() == "true"
PORT = int(os.getenv("FLASK_PORT", 5000))

# API Endpoints

# Get all collections
@app.route('/api/v1/chartapp/collection', methods=['GET'])
def get_all_collections_endpoint():
    try:
        data = get_collections()
        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get collection 
@app.route('/api/v1/chartapp/collection/', methods=['GET'])
def get_collection_by_id_endpoint():
    collection_id = request.args.get('collection_name')
    if not collection_id:
        return jsonify({"error": "Missing 'collection_name'"}), 400
    try:
        data = get_collection_by_id(collection_id)
        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Delete a collection
@app.route('/api/v1/chartapp/collection', methods=['DELETE'])
def delete_collection_endpoint():
    collection_name = request.json.get('collection_name')
    if not collection_name:
        return jsonify({"error": "Missing 'collection_name'"}), 400
    try:
        delete_collection(collection_name)
        return jsonify({"msg": "Collection deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get cluster 
@app.route('/api/v1/chartapp/cluster/', methods=['GET'])
def get_cluster_by_id_endpoint():
    collection_id = request.args.get('collection_name')
    cluster_id = request.args.get('cluster_name')
    if not collection_id or not cluster_id:
        return jsonify({"error": "Missing required fields"}), 400
    try:
        data = get_cluster_by_id(collection_id, cluster_id)
        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Delete a cluster
@app.route('/api/v1/chartapp/cluster', methods=['DELETE'])
def delete_clusters_endpoint():
    collection_name = request.json.get('collection_name')
    cluster_name = request.json.get('cluster_name')
    if not collection_name:
        return jsonify({"error": "Missing required fields"}), 400
    try:
        delete_cluster(collection_name, cluster_name)
        return jsonify({"msg": "Cluster deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get report 
@app.route('/api/v1/chartapp/report/', methods=['GET'])
def get_report_by_id_endpoint():
    collection_id = request.args.get('collection_name')
    if not collection_id:
        return jsonify({"error": "Missing 'collection_name'"}), 400
    try:
        data = get_report_by_id(collection_id)
        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get all reports
@app.route('/api/v1/chartapp/report', methods=['GET'])
def get_all_reports_endpoint():
    try:
        data = get_reports()
        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Upload files
@app.route('/api/v1/chartapp/server', methods=['POST'])
def upload_files_endpoint():
    collection_name = request.form.get('collection_name')
    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "Missing 'files'"}), 400
    try:
        upload_files(collection_name, files)
        return jsonify({"msg": "Files uploaded successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Generate reports
@app.route('/api/v1/chartapp/report/generate', methods=['POST'])
def generate_reports_endpoint():
    try:
        # Extract request data
        collection_name = request.json.get("collection_name")
        cluster_names = request.json.get("cluster_names", [])

        # Validate request data
        if not collection_name or not cluster_names:
            return jsonify({"error": "Missing required fields: 'collection_name' and/or 'cluster_names'"}), 400
        if not isinstance(collection_name, str) or not isinstance(cluster_names, list):
            return jsonify({"error": "Invalid input types: 'collection_name' must be a string and 'cluster_names' must be a list"}), 400

        # Generate reports
        reports_created, download_report_url = generate_reports(collection_name, cluster_names)

        # Return success response
        return jsonify({
            "msg": "Reports generated successfully",
            "reports_created": reports_created,
            "download_url": download_report_url
        }), 200

    except Exception as e:
        # Log the exception for debugging purposes
        return jsonify({"error": str(e)}), 500
    

# Donwload All Report
@app.route('/api/v1/chartapp/download/<filename>', methods=['GET'])
def download_zip(filename):
    if not is_safe_path(filename):
        return jsonify({"error": "Invalid path"}), 400
    try:
        return send_from_directory(TEMP_DIR, filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404


# Donwload Report
@app.route('/api/v1/chartapp/download/<collection>/<filename>', methods=['GET'])
def download_report(collection, filename):
    if not is_safe_path(collection) or not is_safe_path(filename):
        return jsonify({"error": "Invalid path"}), 400

    try:
        directory = os.path.join(REPORTS_DIR, collection)
        
        return send_from_directory(directory, filename, as_attachment=True, mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Open Server File
@app.route('/api/v1/chartapp/server/file/', methods=["GET"])
def open_server_file_endpoint():
    # Retrieve query parameters
    collection_name = request.args.get("collection_name")
    cluster_name = request.args.get("cluster_name")
    server_name = request.args.get("server_name")
    file_name = request.args.get("file_name")
    
    # Check for missing required fields
    if not all([collection_name, cluster_name, server_name, file_name]):
        logging.error("Missing required fields: %s", {
            "collection_name": collection_name,
            "cluster_name": cluster_name,
            "server_name": server_name,
            "file_name": file_name
        })
        return jsonify({"error": "Missing required field(s)"}), 400

    try:
        # Call the open_file function (implement this based on your needs)
        file_content, status_code = open_file(collection_name, cluster_name, file_name, "server", server_name)
        return file_content, status_code

    except FileNotFoundError as e:
        logging.error("File not found: %s", str(e))
        return jsonify({"error": "File not found"}), 404

    except Exception as e:
        logging.exception("An unexpected error occurred")
        return jsonify({"error": "Internal server error"}), 500
    

# Open Summary File
@app.route('/api/v1/chartapp/summary/file/', methods=["GET"])
def open_summary_file_endpoint():
    # Retrieve query parameters
    collection_name = request.args.get("collection_name")
    cluster_name = request.args.get("cluster_name")
    file_name = request.args.get("file_name")
    
    # Check for missing required fields
    if not all([collection_name, cluster_name, file_name]):
        logging.error("Missing required fields: %s", {
            "collection_name": collection_name,
            "cluster_name": cluster_name,
            "file_name": file_name
        })
        return jsonify({"error": "Missing required field(s)"}), 400

    try:
        # Call the open_file function (implement this based on your needs)
        file_content, status_code = open_file(collection_name, cluster_name, file_name, "summary")
        return file_content, status_code

    except FileNotFoundError as e:
        logging.error("File not found: %s", str(e))
        return jsonify({"error": "File not found"}), 404

    except Exception as e:
        logging.exception("An unexpected error occurred")
        return jsonify({"error": "Internal server error"}), 500


# Open Chart File
@app.route('/api/v1/chartapp/chart/file/', methods=["GET"])
def open_chart_file_endpoint():
    # Retrieve query parameters
    collection_name = request.args.get("collection_name")
    cluster_name = request.args.get("cluster_name")
    file_name = request.args.get("file_name")
    
    # Check for missing required fields
    if not all([collection_name, cluster_name, file_name]):
        logging.error("Missing required fields: %s", {
            "collection_name": collection_name,
            "cluster_name": cluster_name,
            "file_name": file_name
        })
        return jsonify({"error": "Missing required field(s)"}), 400

    try:
        # Call the open_file function (implement this based on your needs)
        file_content, status_code = open_file(collection_name, cluster_name, file_name, "chart")
        return file_content, status_code

    except FileNotFoundError as e:
        logging.error("File not found: %s", str(e))
        return jsonify({"error": "File not found"}), 404

    except Exception as e:
        logging.exception("An unexpected error occurred")
        return jsonify({"error": "Internal server error"}), 500

# Main Entry Point
if __name__ == '__main__':
    app.run(debug=DEBUG_MODE, port=PORT)
