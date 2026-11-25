# ==========================================
# Multi-Stage Dockerfile for Google Cloud Run
# Stage 1: Build Frontend (Vite + React)
# Stage 2: Production Python Backend + Gunicorn
# ==========================================

# --- Stage 1: Build React Frontend ---
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package manifests and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source code and build production bundle
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Production Python Backend + Static Host ---
FROM python:3.11-slim AS production

# Set environment variables for Python & Cloud Run
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH="/app:/app/backend" \
    PORT=8080

WORKDIR /app

# Install system dependencies (curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r ./requirements.txt

# Copy machine learning models and scripts
COPY ml/ ./ml/

# Copy backend application source
COPY backend/ ./backend/

# Copy root entrypoint
COPY main.py ./main.py

# Copy compiled frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose standard Cloud Run port
EXPOSE 8080

# Run production WSGI server
CMD ["sh", "-c", "exec gunicorn --bind 0.0.0.0:${PORT:-8080} --workers 1 --threads 8 --timeout 120 main:app"]
