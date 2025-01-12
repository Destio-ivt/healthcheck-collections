# Project Setup and Run Instructions

## How to Run

### 1. Add `.env` Files
Ensure you create `.env` files in both the `./backend` and `./frontend` folders. Below are the required configurations:

#### `./backend/.env`
| Variable       | Description                        | Example                     | Recommended Value |
|----------------|------------------------------------|-----------------------------|-------------------|
| `FLASK_DEBUG`  | Enable/Disable Flask debug mode    | `True`                      | `True`            |
| `FLASK_PORT`   | Port where the Flask server runs   | `2020`                      | `2020`            |
| `BASE_DIR`     | Folder to save collections         | `folder/to/save/collections`| `__collections__` |
| `REPORTS_DIR`  | Folder to save reports             | `folder/to/save/reports`    | `__reports__`     |
| `TEMPLATES_DIR`| Folder to save report templates    | `folder/to/save/report-templates` | `__templates__` |
| `TEMP_DIR`     | Temporary folder for downloads     | `folder/temporary/for/download/report` | `__temp__`   |
| `LOG_LEVEL`    | Logging level for the application | `INFO`                      | `INFO`            |

#### `./frontend/.env`
| Variable                   | Description                                    | Example                                |
|----------------------------|------------------------------------------------|----------------------------------------|
| `VITE_API_BASE_URL`        | URL where the backend is running              | `http://127.0.0.1:2020/api/v1/chartapp` |
| `VITE_GENERATE_REPORT_HEADER` | Enable/Disable report header generation      | `true`                                 |

### 2. Configure Ports in Dockerfile
Ensure the `Dockerfile` in both `./backend` and `./frontend` is configured to use the ports and environment variables from the respective `.env` files.

### 3. Configure `docker-compose.yml`
Set up the ports and environment variables for both the backend and frontend in `docker-compose.yml` to align with the `.env` files.

### 4. Build Docker Images
Run the following command to build the Docker images:
```bash
docker-compose build
```

## How to Use

### Input
Input file: `healthcheck_server_file.zip`, e.g., `healthcheck_2024-11-04_RH1VAULT03.zip`, which contains all the audit query JSON files. Ensure the server name is included within the filename.

### Output
Output: Cluster(s) and summary report in `.docx` format.

### Steps

#### Step 1: Add Healthcheck Collections
1. Click the **Add Collection** button.
2. In the **File Server(s)** field, upload all the input files (the **Collection Name** field is auto-generated).
3. Click the **Add** button and wait until the process is complete.
4. Click the **Detail** button to navigate to the collection details menu.
5. If you want to add more server files, click **Add Server** to upload additional input files.
6. Server files for each cluster are auto-generated in the **Server** menu. Click the **Servers** button to preview their content.
7. Charts for each cluster are also auto-generated in the **Chart** menu. Click the **Charts** button to preview their content.

#### Step 2: Generate Report
1. Choose the desired collection.
2. Click **Reports** in the navbar to navigate to the reports menu.
3. Click the **Generate Report** button.
4. Select which cluster(s) you want to generate report files for.
5. Click the **Generate** button and wait until the process is complete.
6. Click the **Download File** button to download individual report files.
7. Click the **Download All Reports** button to download all reports at once.

