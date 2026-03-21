# DevTrackr

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis_7-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" />
  <img src="https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS_EKS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" />
  <img src="https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" />
  <img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white" />
</p>

**Intelligent Skill Execution System** — Track skills, log practice sessions, earn XP, maintain streaks, get AI coaching, and visualize your learning journey.

DevTrackr is a full-stack application with an AI-powered coaching engine, gamification system, and a complete DevSecOps pipeline deploying to AWS EKS with Prometheus + Grafana monitoring.

---

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
| Orchestration | Kubernetes (EKS) · HPA autoscaling |
| Infrastructure | Terraform — AWS VPC, EKS, ECR, NAT, IAM |
| CI/CD | GitHub Actions — DevSecOps pipeline |
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
│   │   ├── namespace.yaml
│   │   ├── backend-deployment.yaml    # Deploy + Svc + HPA
│   │   ├── frontend-deployment.yaml   # Deploy + Svc + HPA
│   │   ├── postgres-statefulset.yaml  # StatefulSet + PVC
│   │   ├── redis-deployment.yaml      # Deploy + Service
│   │   └── ingress.yaml              # Nginx ingress
│   ├── terraform/
│   │   ├── main.tf                # AWS VPC, EKS, ECR, IAM, NAT
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── monitoring/
│       ├── namespace.yaml
│       ├── prometheus/
│       │   ├── config.yaml          # Scrape configs + 8 alerts
│       │   ├── deployment.yaml      # Prometheus + RBAC
│       │   └── exporters.yaml       # kube-state-metrics + node-exporter
│       └── grafana/
│           ├── deployment.yaml
│           ├── secret.yaml
│           └── dashboards-configmap.yaml  # 20-panel dashboard
└── .github/workflows/
    ├── pipeline.yml               # Orchestrator (push + dispatch)
    ├── lint-test.yml              # Lint & test (workflow_call)
    ├── security-scan.yml          # Security scans (workflow_call)
    ├── docker-build.yml           # Build → ECR (workflow_call)
    ├── terraform-deploy.yml       # AWS infra (workflow_call)
    └── k8s-deploy.yml             # EKS deploy (workflow_call)
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

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

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

## CI/CD Pipeline (DevSecOps)

Uses modular **reusable workflows** — each triggers via `workflow_call`, orchestrated by one master pipeline.

### Pipeline Flow

```
push to main / workflow_dispatch
         │
         ▼
┌─────────────────────────────────────┐
│  Stage 1 (parallel)                 │
│  ┌──────────────┐  ┌─────────────┐  │
│  │ 🧪 Lint &    │  │ 🔒 Security │  │
│  │    Test       │  │    Scan     │  │
│  │  Ruff, Bandit │  │  Trivy,    │  │
│  │  pytest,      │  │  Gitleaks, │  │
│  │  npm build    │  │  Snyk,     │  │
│  │               │  │  Scout     │  │
│  └──────────────┘  └─────────────┘  │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Stage 2 (parallel)                 │
│  ┌──────────────┐  ┌─────────────┐  │
│  │ 🏗️ Terraform │  │ 🐳 Docker   │  │
│  │  AWS VPC,    │  │  Build &    │  │
│  │  EKS, ECR,   │  │  Push ECR   │  │
│  │  IAM, NAT    │  │  + Trivy    │  │
│  │  + tfsec     │  │  scan       │  │
│  └──────────────┘  └─────────────┘  │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Stage 3                            │
│  ┌─────────────────────────────┐    │
│  │ ☸️  K8s Deploy to EKS        │    │
│  │  namespace, secrets, DB,    │    │
│  │  redis, backend, frontend,  │    │
│  │  ingress, monitoring stack  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Stage 4                            │
│  ┌─────────────────────────────┐    │
│  │ 📢 Notify (Summary Table)   │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Workflow Files

| File | Trigger | Purpose |
|------|---------|---------|
| `pipeline.yml` | `push` (main/develop) + `workflow_dispatch` | Orchestrates everything |
| `lint-test.yml` | `workflow_call` | Ruff · Bandit · Safety · pytest · npm build |
| `security-scan.yml` | `workflow_call` | Trivy FS/IaC · Gitleaks · Snyk · Docker Scout |
| `docker-build.yml` | `workflow_call` | Buildx multi-stage → ECR + image vulnerability scan |
| `terraform-deploy.yml` | `workflow_call` | Terraform plan/apply + tfsec security scan |
| `k8s-deploy.yml` | `workflow_call` | Full EKS deployment + monitoring stack |

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `POSTGRES_PASSWORD` | Production DB password |
| `JWT_SECRET` | Production JWT secret |
| `OPENROUTER_API_KEY` | AI API key |
| `SNYK_TOKEN` | *(optional)* Dependency scanning |
| `GITLEAKS_LICENSE` | *(optional)* Secret detection |

### GitHub Variables

| Variable | Default |
|----------|---------|
| `AWS_REGION` | `ap-south-1` |

---

## AWS Infrastructure (Terraform)

Provisions a production-grade AWS environment:

| Resource | Details |
|----------|---------|
| VPC | Public + private subnets across 2 AZs |
| NAT Gateway | Outbound internet for private subnets |
| EKS Cluster | Managed Kubernetes v1.31 |
| Node Group | t3.medium, autoscaling 1–5 nodes |
| ECR | Private repos: devtrackr-backend, devtrackr-frontend |
| IAM | Least-privilege roles for cluster + nodes |
| S3 Backend | Remote state with DynamoDB locking |

### First-Time Setup

```bash
aws s3 mb s3://devtrackr-tf-state --region ap-south-1

aws dynamodb create-table \
  --table-name devtrackr-tf-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

### Manual Apply

```bash
cd infra/terraform
terraform init
terraform plan -var="aws_region=ap-south-1"
terraform apply -var="aws_region=ap-south-1"
```

---

## Kubernetes

### Deploy

```bash
kubectl apply -f infra/kubernetes/namespace.yaml

kubectl -n devtrackr create secret generic devtrackr-secrets \
  --from-literal=postgres-user=devtrackr \
  --from-literal=postgres-password=YOUR_PASSWORD \
  --from-literal=JWT_SECRET=YOUR_SECRET \
  --from-literal=DATABASE_URL="postgresql+asyncpg://devtrackr:YOUR_PASSWORD@postgres:5432/devtrackr" \
  --from-literal=REDIS_URL="redis://redis:6379/0" \
  --from-literal=OPENROUTER_API_KEY=YOUR_KEY \
  --from-literal=OPENROUTER_MODEL="nvidia/nemotron-nano-9b-v2:free"

kubectl apply -f infra/kubernetes/
```

### Key Features

| Feature | Details |
|---------|---------|
| HPA | Backend 2–10 pods @ 60% CPU · Frontend 2–6 pods @ 65% CPU |
| Rolling Updates | Zero-downtime: maxSurge 1, maxUnavailable 0 |
| Health Checks | Liveness + readiness probes on all services |
| StatefulSet | PostgreSQL with 10Gi persistent volume |
| Ingress | `devtrackr.io` → frontend · `api.devtrackr.io` → backend |

---

## Monitoring (Prometheus + Grafana)

### Prometheus

Scrapes metrics from:

- **DevTrackr Backend** — FastAPI request/response metrics
- **DevTrackr Frontend** — Nginx status
- **Node Exporter** — Host CPU, memory, disk
- **kube-state-metrics** — Pod, deployment, HPA states
- **cAdvisor** — Container resource usage

**8 Alert Rules:** BackendDown · HighErrorRate (>5%) · HighLatency (P95 >2s) · PodCrashLooping · HighMemory (>90%) · HighCPU (>80%) · PostgresDown · RedisDown

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

```bash
kubectl apply -f infra/monitoring/namespace.yaml
kubectl apply -f infra/monitoring/prometheus/
kubectl apply -f infra/monitoring/grafana/
```

Access: `http://grafana.devtrackr.io` · Default login: `admin` / (set in `grafana-secret.yaml`)

---

## License

MIT
