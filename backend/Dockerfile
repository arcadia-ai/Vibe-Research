FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
COPY frontend/package.json /frontend/package.json
RUN useradd --create-home --uid 10001 vibe && mkdir -p /data && chown -R vibe:vibe /data /app
USER vibe
EXPOSE 8900
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8900", "--proxy-headers", "--forwarded-allow-ips=*"]
