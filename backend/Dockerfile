FROM python:3.12-slim

ENV PYTHONPATH=/usr/src/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# application source code in the container
WORKDIR /usr/src/app


RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    pkg-config \
    librdkafka-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
# copy the requirements.txt to the destination folder
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# copy the rest of code 
COPY . .

# expose the port 
EXPOSE 8000

# running fastapi bound to all network interfaces (0.0.0.0)
CMD ["fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8000"]