FROM python:3.14-slim

ENV PYTHONPATH=/usr/src/app

ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED=1

# application source code in the container
WORKDIR /usr/src/app

# copy the requirements.txt to the destination folder
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# copy the rest of code 
COPY . .

# expose the port 
EXPOSE 8000

# running fastapi
CMD ["fastapi","run"]
