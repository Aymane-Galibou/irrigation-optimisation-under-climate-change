FROM python:3.11-slim

ENV PYTHONPATH=/usr/src/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Application source code in the container
WORKDIR /usr/src/app

# Install system dependencies needed for compiling C extensions (librdkafka, gcc, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    librdkafka-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt to destination
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Expose port 8000
EXPOSE 8000

# Run FastAPI (specifying host and app path explicitly)
CMD ["fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8000"]