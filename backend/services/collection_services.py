import os
import shutil
from flask import abort
from utils.utils import BASE_DIR, REPORTS_DIR

def get_directory_contents(path, subdirs_only=False):
    if not os.path.exists(path):
        return []
    return [
        name for name in os.listdir(path)
        if not subdirs_only or os.path.isdir(os.path.join(path, name))
    ]

def validate_path_exists(path, error_message):
    if not os.path.isdir(path):
        abort(404, description=error_message)

def get_cluster_data(cluster_path):
    return {
        "charts": get_directory_contents(os.path.join(cluster_path, "charts")),
        "servers": [
            {
                "server_name": server_name,
                "files": get_directory_contents(os.path.join(cluster_path, "servers", server_name))
            }
            for server_name in get_directory_contents(os.path.join(cluster_path, "servers"), subdirs_only=True)
        ],
        "summaries": get_directory_contents(os.path.join(cluster_path, "summaries"))
    }

def get_collections():
    return [
        {
            "collection_name": collection_name,
            "clusters": [
                {
                    "cluster_name": cluster_name,
                    **get_cluster_data(os.path.join(BASE_DIR, collection_name, cluster_name))
                }
                for cluster_name in get_directory_contents(os.path.join(BASE_DIR, collection_name), subdirs_only=True)
            ]
        }
        for collection_name in get_directory_contents(BASE_DIR, subdirs_only=True)
    ]

def get_collection_by_id(collection_id):
    collection_path = os.path.join(BASE_DIR, collection_id)
    validate_path_exists(collection_path, "Collection not found")
    return {
        "collection_name": collection_id,
        "clusters": [
            {
                "cluster_name": cluster_name,
                **get_cluster_data(os.path.join(collection_path, cluster_name))
            }
            for cluster_name in get_directory_contents(collection_path, subdirs_only=True)
        ]
    }

def get_cluster_by_id(collection_name, cluster_name):
    cluster_path = os.path.join(BASE_DIR, collection_name, cluster_name)
    validate_path_exists(cluster_path, "Cluster not found")
    return {
        "colection_name": collection_name,
        "cluster_name": cluster_name,
        **get_cluster_data(cluster_path)
    }

def delete_directory(path):
    if os.path.exists(path):
        shutil.rmtree(path)

def delete_collection(collection_id):
    delete_directory(os.path.join(BASE_DIR, collection_id))

def delete_cluster(collection_id, cluster_id):
    delete_directory(os.path.join(BASE_DIR, collection_id, cluster_id))

def delete_report(collection_name):
    delete_directory(os.path.join(REPORTS_DIR, collection_name))

def get_reports():
    return [
        {
            "collection_name": collection_name,
            "report_files": get_directory_contents(collection_path, subdirs_only=False)
        }
        for collection_name in get_directory_contents(REPORTS_DIR, subdirs_only=True)
        if (collection_path := os.path.join(REPORTS_DIR, collection_name))
    ]

def get_report_by_id(collection_name):
    collection_path = os.path.join(REPORTS_DIR, collection_name)
    validate_path_exists(collection_path, "Report collection not found")
    return {
        "collection_name": collection_name,
        "report_files": get_directory_contents(collection_path, subdirs_only=False)
    }
