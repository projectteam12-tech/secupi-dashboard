FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (cache this layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Don't run collectstatic during build - do it at runtime or in entrypoint
# RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Use a startup script instead
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput || true && gunicorn secupi.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 120"]


