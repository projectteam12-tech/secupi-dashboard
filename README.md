# secuPi-dashboard

A production-ready network security monitoring, detection & response dashboard that ingests logs from Raspberry Pi agents and can trigger responses to ESP32 hardware.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │◄───────►│   Nginx      │◄───────►│   Django    │
│  Frontend   │         │ Reverse Proxy│         │   Backend   │
│  (Vite)     │         │              │         │  (DRF+WS)   │
└─────────────┘         └──────────────┘         └──────┬──────┘
                                                         │
                                                         ▼
                                                  ┌─────────────┐
                                                  │ PostgreSQL  │
                                                  │  Database   │
                                                  └─────────────┘
                                                         │
                                                         ▼
                                                  ┌─────────────┐
                                                  │   Redis     │
                                                  │  (Optional) │
                                                  └─────────────┘
```

## Tech Stack

- **Backend**: Python 3.10+, Django 4.x, Django REST Framework, Django Channels (WebSockets), Gunicorn
- **Frontend**: React (Vite) + Tailwind CSS, Chart.js
- **Database**: PostgreSQL
- **Dev Infrastructure**: Docker, Docker Compose, Nginx (reverse proxy)
- **Optional**: Redis + Celery for background jobs

## User Registration

The application supports separate registration for different user roles:

### Observer Registration
- **URL**: http://localhost:3000/signup/observer
- **Access**: Open to everyone
- **Features**: Can view dashboard, logs, and alerts (read-only access)

### Admin Registration
- **URL**: http://localhost:3000/signup/admin
- **Access**: Requires admin registration key
- **Default Key**: `admin-secret-key-change-in-production` (change in production!)
- **Features**: Full access including firewall rules management, ML models, and user management
- **Configuration**: Set `ADMIN_REGISTRATION_KEY` in backend `.env` file

**Security Note**: Change the `ADMIN_REGISTRATION_KEY` in production to a strong, unique value.

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git

### Environment Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd secuPi-dashboard
```

2. Copy environment files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Update `.env` files with your configuration (see Environment Variables section)

### Running with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Nginx: http://localhost:80

### Initial Setup

1. Create admin user and seed demo data:
```bash
docker-compose exec backend python scripts/seed_demo.py
```

Or manually create superuser:
```bash
docker-compose exec backend python manage.py createsuperuser
```

2. Login with default credentials:
   - Username: `admin`
   - Password: `admin123` (change after first login)

## Environment Variables

### Backend (.env)

```env
# Django Settings
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,backend

# Database
DB_NAME=secupi_db
DB_USER=secupi_user
DB_PASSWORD=secupi_password
DB_HOST=postgres
DB_PORT=5432

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DELTA=86400

# Redis (Optional)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout

### Logs

- `POST /api/logs` - Ingest network logs
- `GET /api/logs` - List logs (paginated, filterable)
- `GET /api/logs/:id` - Get log details

### Alerts

- `POST /api/alerts` - Create alert
- `GET /api/alerts` - List alerts (paginated, filterable)
- `GET /api/alerts/:id` - Get alert details
- `PATCH /api/alerts/:id/resolve` - Resolve alert

### Dashboard

- `GET /api/dashboard/summary` - Get dashboard summary metrics

### Firewall Rules

- `GET /api/firewall/rules` - List firewall rules
- `POST /api/firewall/rules` - Create firewall rule
- `GET /api/firewall/rules/:id` - Get firewall rule details
- `DELETE /api/firewall/rules/:id` - Delete firewall rule

### ML Models

- `GET /api/ml/models` - List ML models
- `POST /api/ml/models` - Upload ML model
- `POST /api/ml/models/:id/retrain` - Trigger model retraining

## Acceptance Test Examples

### 1. Create Admin User and Seed Demo Data

```bash
docker-compose exec backend python scripts/seed_demo.py
```

### 2. Post Sample Log

```bash
curl -X POST http://localhost:8000/api/logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "timestamp": "2025-01-01T12:00:00Z",
    "src_ip": "192.168.1.50",
    "dst_ip": "8.8.8.8",
    "proto": "TCP",
    "packet_size": 512,
    "action": "allow"
  }'
```

### 3. Post Sample Alert

```bash
curl -X POST http://localhost:8000/api/alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "alert_type": "port_scan",
    "severity": "high",
    "src_ip": "192.168.1.100",
    "message": "multiple SYN from same host",
    "timestamp": "2025-01-01T12:01:00Z"
  }'
```

### 4. Get Dashboard Summary

```bash
curl -X GET http://localhost:8000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Logs (Paginated)

```bash
curl -X GET "http://localhost:8000/api/logs?page=1&page_size=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Create Firewall Rule

```bash
curl -X POST http://localhost:8000/api/firewall/rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Block Suspicious IP",
    "src": "192.168.1.100",
    "dst": "*",
    "proto": "*",
    "port": "*",
    "action": "block"
  }'
```

## Demo Script (10 Minutes)

1. **Start the application** (2 min)
   ```bash
   docker-compose up --build
   ```

2. **Seed demo data** (1 min)
   ```bash
   docker-compose exec backend python scripts/seed_demo.py
   ```

3. **Login to dashboard** (1 min)
   - Navigate to http://localhost:3000
   - Login with `admin` / `admin123`

4. **View Dashboard** (1 min)
   - Observe summary cards (active alerts, blocked IPs, traffic rate)
   - Check time-series chart showing traffic over time

5. **Post test logs** (2 min)
   - Use curl commands from Acceptance Test Examples
   - Watch Live Traffic Feed update in real-time via WebSocket

6. **Create and resolve alert** (1 min)
   - Post an alert via API
   - See it appear in Alerts page
   - Resolve it through UI

7. **Manage firewall rules** (1 min)
   - Add a firewall rule via UI
   - Verify it appears in the list
   - Delete a rule

8. **View settings** (1 min)
   - Check user management
   - Review threshold configurations

## Development

### Running Tests

```bash
# Backend tests
docker-compose exec backend pytest

# Frontend tests (if configured)
docker-compose exec frontend npm test
```

### Linting and Formatting

```bash
# Backend
docker-compose exec backend flake8 .
docker-compose exec backend black .

# Frontend
docker-compose exec frontend npm run lint
docker-compose exec frontend npm run format
```

### Database Migrations

```bash
# Create migrations
docker-compose exec backend python manage.py makemigrations

# Apply migrations
docker-compose exec backend python manage.py migrate
```

## Production Deployment

1. Update `docker-compose.prod.yml` with production settings
2. Set `DEBUG=False` in backend `.env`
3. Configure proper `ALLOWED_HOSTS`
4. Set strong `SECRET_KEY` and `JWT_SECRET_KEY`
5. Use HTTPS with proper SSL certificates in Nginx
6. Configure firewall and security groups
7. Set up monitoring and logging

### Production Nginx Configuration

The production Nginx config enforces HTTPS and includes security headers. Update SSL certificate paths in `nginx/nginx.prod.conf`.

## Security Notes

- **Password Security**: Uses Django's PBKDF2 password hashing by default
- **Account Lockout**: Implement rate limiting middleware (see README notes)
- **CSRF Protection**: Enabled for all non-API pages
- **Input Sanitization**: All inputs are validated and sanitized
- **Role-Based Access**: Admin and Observer roles enforced
- **HTTPS**: Enforced in production Nginx configuration
- **Secret Management**: Use environment variables, never commit secrets

## Project Structure

```
secuPi-dashboard/
├── backend/                 # Django backend
│   ├── secupi/            # Main Django project
│   ├── apps/              # Django apps
│   │   ├── authentication/
│   │   ├── logs/
│   │   ├── alerts/
│   │   ├── firewall/
│   │   └── ml/
│   ├── scripts/           # Utility scripts
│   ├── tests/             # Test files
│   └── requirements.txt
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── nginx/                 # Nginx configurations
├── docker-compose.yml     # Development setup
├── docker-compose.prod.yml # Production setup
└── README.md
```

## License

MIT License

## Support

For issues and questions, please open an issue on the repository.


