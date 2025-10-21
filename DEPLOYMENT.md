# MedicalCopilot AI - Deployment Guide

## 🚀 Production Deployment Checklist

### Pre-Deployment

#### 1. Environment Configuration
```bash
# Create production .env file
cp .env .env.production

# Update with production keys
ANTHROPIC_API_KEY=your_production_key
OPENAI_API_KEY=your_production_key
GOOGLE_API_KEY=your_production_key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/medcopilot
REDIS_URL=redis://host:6379

# Security
SECRET_KEY=generate_strong_random_key
JWT_SECRET=generate_strong_random_key

# CORS
ALLOWED_ORIGINS=https://yourdomain.com

# Environment
ENVIRONMENT=production
DEBUG=false
```

#### 2. SSL/TLS Certificates
```bash
# Using Let's Encrypt
certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Copy certificates
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/
```

#### 3. Build Frontend
```bash
npm run build
npm run start  # Test production build locally
```

#### 4. Security Hardening
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable audit logging
- [ ] Configure CSP headers

---

## 🐳 Docker Deployment

### Option 1: Docker Compose (Recommended for Single Server)

```bash
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f api
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Option 2: Kubernetes (Recommended for Scale)

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment
kubectl get pods -n medicalcopilot
kubectl get services -n medicalcopilot

# Scale agents
kubectl scale deployment api --replicas=3 -n medicalcopilot

# Monitor
kubectl logs -f deployment/api -n medicalcopilot
```

---

## ☁️ Cloud Platform Deployment

### AWS Deployment

#### Using ECS (Elastic Container Service)

```bash
# 1. Push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker build -t medicalcopilot-api -f Dockerfile.api .
docker tag medicalcopilot-api:latest <account>.dkr.ecr.us-east-1.amazonaws.com/medicalcopilot-api:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/medicalcopilot-api:latest

# 2. Create ECS task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# 3. Create ECS service
aws ecs create-service --cluster medicalcopilot --service-name api --task-definition medicalcopilot-api --desired-count 2
```

#### Using EKS (Elastic Kubernetes Service)

```bash
# Create cluster
eksctl create cluster --name medicalcopilot --region us-east-1 --nodes 3

# Deploy application
kubectl apply -f k8s/

# Set up load balancer
kubectl apply -f k8s/ingress.yaml
```

### Azure Deployment

```bash
# Create resource group
az group create --name medicalcopilot-rg --location eastus

# Create container registry
az acr create --resource-group medicalcopilot-rg --name medicalcopilotacr --sku Basic

# Build and push
az acr build --registry medicalcopilotacr --image medicalcopilot-api:latest -f Dockerfile.api .

# Deploy to Azure Container Instances
az container create --resource-group medicalcopilot-rg --name medicalcopilot-api --image medicalcopilotacr.azurecr.io/medicalcopilot-api:latest --cpu 2 --memory 4 --ports 8000
```

### Google Cloud Platform

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/medicalcopilot-api

# Deploy to Cloud Run
gcloud run deploy medicalcopilot-api --image gcr.io/PROJECT_ID/medicalcopilot-api --platform managed --region us-central1 --allow-unauthenticated
```

---

## 🗄️ Database Setup

### PostgreSQL Production Setup

```sql
-- Create database
CREATE DATABASE medcopilot;

-- Create user
CREATE USER medcopilot WITH ENCRYPTED PASSWORD 'strong_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE medcopilot TO medcopilot;

-- Create tables
\c medcopilot

CREATE TABLE sessions (
    session_id UUID PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50),
    intake_data JSONB,
    results JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agent_executions (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(session_id),
    agent_name VARCHAR(100),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    confidence FLOAT,
    output JSONB
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT NOW(),
    event_type VARCHAR(100),
    session_id UUID,
    user_id VARCHAR(255),
    details JSONB
);

-- Create indexes
CREATE INDEX idx_sessions_created ON sessions(created_at);
CREATE INDEX idx_agent_executions_session ON agent_executions(session_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

### Redis Configuration

```bash
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
```

---

## 📊 Monitoring Setup

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'medicalcopilot-api'
    static_configs:
      - targets: ['api:8000']
    metrics_path: /metrics

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Grafana Dashboards

Import pre-built dashboards:
- API Performance: `grafana/dashboards/api-performance.json`
- Agent Metrics: `grafana/dashboards/agent-metrics.json`
- System Health: `grafana/dashboards/system-health.json`

---

## 🔐 Security Configuration

### Nginx Configuration (SSL/TLS)

```nginx
# nginx.conf
upstream api {
    server api:8000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Rate Limiting

```python
# Add to api_server.py
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

@app.on_event("startup")
async def startup():
    redis = aioredis.from_url("redis://redis:6379")
    await FastAPILimiter.init(redis)

@app.post("/analyze", dependencies=[Depends(RateLimiter(times=10, seconds=60))])
async def analyze(...):
    # Limit to 10 requests per minute per IP
    ...
```

---

## 🧪 Health Checks & Readiness

```python
# Add to api_server.py
@app.get("/healthz")
async def health_check():
    """Kubernetes liveness probe"""
    return {"status": "healthy"}

@app.get("/readyz")
async def readiness_check():
    """Kubernetes readiness probe"""
    # Check database connection
    # Check Redis connection
    # Check AI model availability
    return {"status": "ready"}
```

---

## 📈 Scaling Considerations

### Horizontal Scaling

```yaml
# k8s/deployment.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Connection Pooling

```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm test
          pytest

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker images
        run: |
          docker build -t medicalcopilot-api -f Dockerfile.api .
          docker build -t medicalcopilot-frontend -f Dockerfile.frontend .

      - name: Push to registry
        run: |
          docker push your-registry/medicalcopilot-api:latest
          docker push your-registry/medicalcopilot-frontend:latest

      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/api api=your-registry/medicalcopilot-api:latest
          kubectl set image deployment/frontend frontend=your-registry/medicalcopilot-frontend:latest
```

---

## 📝 Backup & Disaster Recovery

### Database Backups

```bash
# Daily backup cron job
0 2 * * * pg_dump -U medcopilot medcopilot | gzip > /backups/medcopilot-$(date +\%Y\%m\%d).sql.gz

# Backup retention (keep 30 days)
find /backups -name "medcopilot-*.sql.gz" -mtime +30 -delete
```

### Disaster Recovery Plan

1. **Database Restore**
   ```bash
   gunzip -c backup.sql.gz | psql -U medcopilot medcopilot
   ```

2. **Redis Restore**
   ```bash
   redis-cli --rdb /backups/dump.rdb
   ```

3. **Application Deployment**
   ```bash
   kubectl rollout restart deployment/api
   kubectl rollout restart deployment/frontend
   ```

---

## 🎯 Performance Optimization

### Caching Strategy

```python
# Redis caching for common queries
from functools import lru_cache
import redis

redis_client = redis.Redis(host='redis', port=6379)

@app.get("/icd11/search")
async def search_icd11(query: str):
    # Check cache
    cache_key = f"icd11:{query}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # Perform search
    results = perform_search(query)

    # Cache for 24 hours
    redis_client.setex(cache_key, 86400, json.dumps(results))

    return results
```

### CDN Configuration

Use CDN for static assets:
- Frontend bundle
- Medical images
- Documentation

---

## ✅ Post-Deployment Verification

```bash
# 1. Health checks
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/healthz
curl https://api.yourdomain.com/readyz

# 2. API functionality
curl -X POST https://api.yourdomain.com/analyze \
  -F 'intake={"chief_complaint":"test"}' \
  -H "Authorization: Bearer $TOKEN"

# 3. WebSocket connection
wscat -c wss://api.yourdomain.com/ws/test-session

# 4. Monitor logs
kubectl logs -f deployment/api

# 5. Check metrics
curl https://api.yourdomain.com/metrics
```

---

## 🚨 Incident Response

### Monitoring Alerts

Set up alerts for:
- API response time > 5s
- Error rate > 1%
- Agent failures
- Database connection issues
- Memory usage > 90%
- CPU usage > 80%

### Rollback Procedure

```bash
# Kubernetes rollback
kubectl rollout undo deployment/api
kubectl rollout undo deployment/frontend

# Docker Compose rollback
docker-compose down
git checkout <previous-commit>
docker-compose up -d --build
```

---

## 📞 Support Contacts

- **Infrastructure**: DevOps team
- **Database**: DBA team
- **Security**: Security team
- **Clinical Validation**: Medical advisory board

---

## 📚 Additional Resources

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/index.html)
- [FDA Medical Device Software Guidance](https://www.fda.gov/medical-devices/software-medical-device-samd)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
