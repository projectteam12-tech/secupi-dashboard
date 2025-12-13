# Quick Start Guide

## Prerequisites

- Docker and Docker Compose installed
- Git

## Setup Steps

1. **Clone and navigate to the project:**
```bash
cd secuPi-dashboard
```

2. **Create environment files:**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env if needed
```

3. **Start the application:**
```bash
docker-compose up --build
```

4. **Wait for services to be ready** (check logs: `docker-compose logs -f`)

5. **Run migrations and seed data:**
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python scripts/seed_demo.py
```

6. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

7. **Login credentials:**
- Username: `admin`
- Password: `admin123`

## Testing the Application

### 1. Post a sample log:
```bash
# First, get a token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.access')

# Post a log
curl -X POST http://localhost:8000/api/logs/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "timestamp": "2025-01-01T12:00:00Z",
    "src_ip": "192.168.1.50",
    "dst_ip": "8.8.8.8",
    "proto": "TCP",
    "packet_size": 512,
    "action": "allow"
  }'
```

### 2. Post a sample alert:
```bash
curl -X POST http://localhost:8000/api/alerts/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "alert_type": "port_scan",
    "severity": "high",
    "src_ip": "192.168.1.100",
    "message": "multiple SYN from same host",
    "timestamp": "2025-01-01T12:01:00Z"
  }'
```

### 3. View dashboard:
Navigate to http://localhost:3000/dashboard and verify the metrics update.

### 4. Check Live Feed:
Navigate to http://localhost:3000/live-feed and verify logs appear in real-time via WebSocket.

## Troubleshooting

- **Services not starting**: Check `docker-compose logs` for errors
- **Database connection issues**: Ensure PostgreSQL container is healthy
- **WebSocket not working**: Check Redis container is running
- **Frontend not loading**: Check if backend API is accessible

## Stopping the Application

```bash
docker-compose down
```

To remove volumes (clears database):
```bash
docker-compose down -v
```



