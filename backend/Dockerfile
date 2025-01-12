# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose the Flask port
EXPOSE 2020

# Start Flask server on the specified port
CMD ["flask", "run", "--host=0.0.0.0", "--port=2020"]
