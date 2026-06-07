# DevTrackr

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis_7-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/k3s-FF63AC?style=for-the-badge&logo=kubernetes&logoColor=white" />
  <img src="https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" />
  <img src="https://img.shields.io/badge/Ansible-EE0000?style=for-the-badge&logo=ansible&logoColor=white" />
  <img src="https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" />
  <img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white" />
</p>
**Intelligent Skill Execution System** — Track skills, log practice sessions, earn XP, maintain streaks, get AI coaching, and visualize your learning journey.

DevTrackr is a full-stack application with an AI-powered coaching engine, gamification system, and a complete DevOps pipeline deploying to AWS EC2 with k3s, Ansible, Prometheus + Grafana monitoring.

## Features

- **Skill Tracking** — Create skills with target hours, deadlines, difficulty levels, and phases
- **Session Logging** — Log practice sessions with hours, quality rating, and notes
- **Date-wise History** — Browse what you studied on any specific date
- **Progress Visualization** — Charts, heatmaps, weekly/monthly trends, consistency scores

### AI Engine (OpenRouter)

- **AI Chat Coach** — Conversational AI for learning tips and guidance
- **Daily Tips** — Auto-generated motivational and strategic tips
- **Skill Suggestions** — AI recommends what to learn next
- **AI Insights** — Per-skill analysis with behavioral pattern detection
- **Skill Planner** — Weekly plan generation with intensity levels
- **Completion Predictor** — Probability estimation for meeting deadlines
- **Burnout Detection** — Behavioral engine flags overwork patterns

### Gamification

- **XP System** — Earn XP per session: `hours × 10 × streak_multiplier × quality_bonus`
- **Streak Tracking** — Daily streaks with 7-day (1.5×), 14-day (2×), 30-day (3×) multipliers
- **Leveling** — Level up based on accumulated XP (sqrt curve)
- **Leaderboard** — Ranked by XP, level, streak, and longest streak
- **XP Audit Log** — Full history of every XP transaction

### Profile & Analytics

- **User Settings** — Avatar, bio, location, GitHub URL, public/private toggle
- **Analytics Dashboard** — Peak hours, consistency score, study patterns

---
## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · Vite 5 · Tailwind CSS 4 |
| Backend | FastAPI · SQLAlchemy Async · Pydantic v2 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| AI | OpenRouter API · nvidia/nemotron-nano-9b-v2:free |
| Auth | JWT (python-jose · passlib/bcrypt) |
| Containers | Docker · Docker Compose |
| Orchestration | k3s (lightweight Kubernetes) |
| Infrastructure | Terraform — AWS EC2, VPC, Security Groups |
| Deployment | Ansible — Automated setup & deployment |
| Monitoring | Prometheus · Grafana (20-panel dashboard) |
| Security Scans | Trivy · Gitleaks · Snyk · Docker Scout · tfsec · Bandit |

---

## Project Structure

```
devtrackr/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── config.py               # Pydantic settings
│   │   ├── database.py             # SQLAlchemy async engine
│   │   ├── dependencies.py         # Auth & DB deps
│   │   ├── agent/                  # AI engine
│   │   │   ├── agent.py            #   Reasoning engine (OpenRouter)
│   │   │   ├── behavioral.py       #   Consistency + burnout detection
│   │   │   ├── coach.py            #   Coaching response builder
│   │   │   ├── memory.py           #   Context from user data
│   │   │   ├── planner.py          #   Weekly plan generator
│   │   │   └── predictor.py        #   Completion probability
│   │   ├── models/                 # SQLAlchemy models
│   │   │   ├── user.py             #   User: xp, level, streak, profile
│   │   │   ├── skill.py            #   Skill: hours, phases, roadmap
│   │   │   ├── log.py              #   Session logs
│   │   │   ├── insight.py          #   AI-generated insights
│   │   │   └── xp.py              #   XP audit log
│   │   ├── routers/                # API endpoints
│   │   │   ├── auth.py             #   Register, login, me
│   │   │   ├── skills.py           #   CRUD skills
│   │   │   ├── logs.py             #   Session logging + XP/streak
│   │   │   ├── chat.py             #   AI chat, tips, suggestions
│   │   │   ├── insights.py         #   AI skill analysis
│   │   │   ├── analytics.py        #   User analytics
│   │   │   ├── leaderboard.py      #   XP rankings
│   │   │   └── settings.py         #   Profile management
│   │   ├── schemas/                # Pydantic request/response
│   │   ├── repositories/           # Database query layer
│   │   └── services/
│   │       ├── gamification.py     #   XP calculation + leveling
│   │       ├── streak_service.py   #   Streak calculation
│   │       ├── auth_service.py     #   JWT + password hashing
│   │       ├── skill_service.py    #   Skill operations
│   │       └── progress_engine.py  #   Progress tracking
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx / AppShell.jsx
│   │   ├── components/
│   │   │   ├── Navbar, Sidebar, SkillCard, StatCard
│   │   │   ├── ChartCard, HeatmapGrid, ProgressBar
│   │   │   ├── StudyTimer, AIInsightCard
│   │   │   └── SkillHistoryPanel
│   │   ├── pages/
│   │   │   ├── DashboardPage       # Main hub
│   │   │   ├── SkillDetailPage     # Skill detail + date history
│   │   │   ├── AIChatPage          # AI chat interface
│   │   │   ├── AnalyticsPage       # Charts & trends
│   │   │   ├── LeaderboardPage     # XP rankings
│   │   │   ├── SettingsPage        # Profile settings
│   │   │   ├── LoginPage
│   │   │   └── RegisterPage
│   │   ├── hooks/
│   │   ├── services/api.js
│   │   └── utils/
│   ├── Dockerfile                   # Dev (Node 20)
│   ├── Dockerfile.prod              # Production (multi-stage + nginx)
│   ├── nginx.conf
│   └── package.json
├── infra/
│   ├── docker-compose.yml
│   ├── .env
│   ├── kubernetes/
│   │   ├── namespace.yml
│   │   ├── configmap.yml
│   │   ├── secrets.yml
│   │   ├── backend-deployment.yml
│   │   ├── backend-service.yml
│   │   ├── frontend-deployment.yml
│   │   ├── frontend-service.yml
│   │   ├── postgres-statefulset.yml
│   │   ├── postgres-service.yml
│   │   ├── redis-statefulset.yml
│   │   ├── redis-service.yml
│   │   ├── nginx-configmap.yml
│   │   ├── ingress-domain.yml
│   │   ├── pv.yml                 # Optional for k3s
│   │   └── pvc.yml                # Optional for k3s
│   ├── terraform/
│   │   ├── EC2/
│   │   │   ├── main.tf           # AWS VPC, EC2, Security Groups
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   └── userdata.sh       # EC2 bootstrap script
│   │   └── backend_lock/
│   │       ├── main.tf           # S3 bucket + DynamoDB for state
│   │       └── terraform.tfstate
│   ├── ansible/
│   │   └── playbook-ec2.yml      # Automated deployment playbook
│   ├── scripts/
│   │   └── update-godaddy-dns.sh # Optional DNS update script
│   └── monitoring/
│       ├── namespace.yaml
│       ├── prometheus/
│       │   ├── config.yaml       # Scrape configs + alerts
│       │   ├── deployment.yaml   # Prometheus + RBAC
│       │   └── exporters.yaml    # kube-state-metrics + node-exporter
│       └── grafana/
│           ├── deployment.yaml
│           ├── secret.yaml
│           └── dashboards-configmap.yaml  # 20-panel dashboard
```

---

## Quick Start (Docker Compose)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Run

```bash
cd infra
docker compose up --build -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

### Stop

```bash
cd infra
docker compose down        # Keep data
docker compose down -v     # Delete everything
```

### Logs

```bash
docker compose logs -f             # All services
docker compose logs -f backend     # Backend only
```

### Rebuild Single Service

```bash
docker compose up --build -d backend
```

---

## Local Dev (Without Docker)

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL=postgresql+asyncpg://devtrackr:devtrackr@localhost:5432/devtrackr
export REDIS_URL=redis://localhost:6379/0
export JWT_SECRET=devtrackr_secret
export OPENROUTER_API_KEY=your_key_here

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Tests

```bash
cd backend && pytest tests/ -v
```

---

## Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL async connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT signing |
| `OPENROUTER_API_KEY` | ✅ | OpenRouter API key for AI features |
| `OPENROUTER_MODEL` | — | AI model (default: `nvidia/nemotron-nano-9b-v2:free`) |
| `POSTGRES_PASSWORD` | ✅ | PostgreSQL password (Docker Compose) |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/token` | Login → JWT |
| `GET` | `/auth/me` | Current user |

### Skills

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/skills/` | List all skills |
| `POST` | `/skills/` | Create skill |
| `GET` | `/skills/{id}` | Skill details |
| `PATCH` | `/skills/{id}` | Update skill |

### Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/logs/` | Log session → auto XP + streak update |
| `GET` | `/logs/skill/{id}` | All logs for a skill |
| `GET` | `/logs/skill/{id}/dates` | Distinct log dates |
| `GET` | `/logs/skill/{id}/by-date?d=YYYY-MM-DD` | Logs by specific date |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat/` | Chat with AI coach |
| `POST` | `/chat/daily-tip` | Get daily tip |
| `POST` | `/chat/skill-suggestions` | Get AI skill recommendations |
| `GET` | `/insights/{skill_id}` | AI-generated skill analysis |

### Analytics & Social

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/overview` | User stats & patterns |
| `GET` | `/leaderboard/` | XP rankings |
| `GET` | `/settings/` | Get profile settings |
| `PUT` | `/settings/` | Update profile |

Full interactive docs: http://localhost:8000/docs

---

## AWS Infrastructure (Terraform)

Provisions AWS EC2 instance with k3s for production deployment:

| Resource | Details |
|----------|---------|
| VPC | 10.0.0.0/16 CIDR block |
| Subnet | 10.0.1.0/24, public with internet gateway |
| EC2 Instance | Ubuntu with k3s pre-installed via userdata |
| Security Group | Ports: 22 (SSH), 80 (HTTP), 3000 (Frontend), 8000 (Backend), 5432 (PostgreSQL), 6379 (Redis) |
| S3 Backend | Remote state with DynamoDB locking |

### First-Time Setup (Backend State)

```bash
cd infra/terraform/backend_lock
terraform init
terraform apply
```

This creates:
- S3 bucket for Terraform state
- DynamoDB table for state locking

### Deploy EC2 Instance

```bash
cd infra/terraform/EC2
terraform init
terraform plan
terraform apply
```

**Required Terraform Variables:**
- `instance_type` - EC2 instance type (default: t3.medium)
- `key_name` - AWS key pair name for SSH access
- `godaddy_api_key` - (optional) GoDaddy API key for DNS
- `godaddy_api_secret` - (optional) GoDaddy API secret
---
## Deployment (Ansible + k3s)

The EC2 instance automatically runs the Ansible playbook via userdata script. The playbook handles:

### Automated Deployment Flow

1. **System Setup** - Update packages, install dependencies
2. **k3s Installation** - Lightweight Kubernetes with TLS SAN for public IP
3. **kubectl & Helm** - Install Kubernetes tools
4. **NGINX Ingress** - Install ingress controller
5. **Application Deploy** - Apply all Kubernetes manifests
6. **Monitoring Stack** - Deploy Prometheus & Grafana

### Manual Deployment (if needed)

If you need to manually deploy after SSH into EC2:

```bash
cd /home/ubuntu/DevTracker-mega-project/infra/ansible
ansible-playbook playbook-ec2.yml
```

### Kubernetes Namespace

All resources are deployed in the `devtracker` namespace.

### Key Features

| Feature | Details |
|---------|---------|
| Replicas | Backend: 2 · Frontend: 2 |
| Rolling Updates | Zero-downtime deployments |
| Health Checks | Liveness + readiness probes on all services |
| StatefulSet | PostgreSQL with 10Gi persistent volume (dynamic provisioning) |
| Redis | StatefulSet with 2Gi persistent volume |
| Ingress | Domain-based routing via NGINX Ingress Controller |

---

## Monitoring (Prometheus + Grafana)

### Prometheus

Scrapes metrics from:

- **DevTrackr Backend** — FastAPI request/response metrics (namespace: devtracker)
- **DevTrackr Frontend** — Nginx status (namespace: devtracker)
- **Node Exporter** — Host CPU, memory, disk
- **kube-state-metrics** — Pod, deployment, HPA states
- **cAdvisor** — Container resource usage

**Alert Rules:** BackendDown · HighErrorRate (>5%) · HighLatency (P95 >2s) · PodCrashLooping · HighMemory (>90%) · HighCPU (>80%) · PostgresDown · RedisDown

### Grafana Dashboard (20 Panels)

| Row | Panels |
|-----|--------|
| Health | Backend up/down · Frontend up/down · Pod count · Active alerts · Node count · Uptime % |
| Traffic | HTTP req/s by method · Error rate (4xx/5xx) |
| Latency | P50/P95/P99 response time · Requests by endpoint |
| Backend Resources | CPU · Memory · Pod restarts |
| Frontend Resources | CPU · Memory |
| Node Resources | Node CPU · Node memory · Node disk |
| Autoscaling | HPA desired vs current (backend + frontend) |

### Deploy Monitoring

Monitoring is automatically deployed by the Ansible playbook. Manual deployment:

```bash
kubectl apply -f infra/monitoring/namespace.yaml
kubectl apply -f infra/monitoring/prometheus/
kubectl apply -f infra/monitoring/grafana/
```

Access: Port-forward to access Grafana locally or configure ingress for domain access. Default login: `admin` / (set in `grafana-secret.yaml`)
