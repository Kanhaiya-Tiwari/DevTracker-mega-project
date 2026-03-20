# DevTrackr

DevTrackr is an intelligent skill execution system with a React frontend, a FastAPI backend, AI-assisted insight generation, progress tracking, and deployment scaffolding for Docker, Kubernetes, and Terraform.

## Stack

- Frontend: React + Vite
- Backend: FastAPI + SQLAlchemy async + PostgreSQL
- Cache / queue-ready layer: Redis
- Local AI runtime support: Ollama
- Infra: Docker Compose, Kubernetes, Terraform (GKE scaffold)
- CI/CD: GitHub Actions

## Project Structure

```text
devtrackr/
├── backend/
│   ├── app/
│   ├── alembic/
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── infra/
│   ├── docker-compose.yml
│   ├── kubernetes/
│   └── terraform/
└── .github/workflows/ci-cd.yml
```

## Local Development

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker Desktop
- PostgreSQL and Redis locally, or Docker Compose

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`.

Health check:

```bash
curl http://localhost:8000/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Environment Variables

Backend expects these environment variables:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`

Optional / infra-specific:

- `OLLAMA_URL`
- `POSTGRES_PASSWORD`

Example local values:

```env
DATABASE_URL=postgresql+asyncpg://devtrackr:devtrackr@localhost:5432/devtrackr
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=devtrackr_secret
OLLAMA_URL=http://localhost:11434
POSTGRES_PASSWORD=devtrackr
```

## Docker Compose

Run the full local stack:

```bash
cd infra
POSTGRES_PASSWORD=devtrackr JWT_SECRET=devtrackr_secret docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Ollama: `http://localhost:11434`

## Tests

Run backend tests:

```bash
cd backend
pytest tests/ -v --cov=app --cov-report=xml
```

Build frontend:

```bash
cd frontend
npm run build
```

## Kubernetes

Kubernetes manifests are in [infra/kubernetes/namespace.yaml](infra/kubernetes/namespace.yaml), [infra/kubernetes/backend-deployment.yaml](infra/kubernetes/backend-deployment.yaml), [infra/kubernetes/frontend-deployment.yaml](infra/kubernetes/frontend-deployment.yaml), [infra/kubernetes/postgres-statefulset.yaml](infra/kubernetes/postgres-statefulset.yaml), [infra/kubernetes/redis-deployment.yaml](infra/kubernetes/redis-deployment.yaml), and [infra/kubernetes/ingress.yaml](infra/kubernetes/ingress.yaml).

Before applying them, create the namespace and required secret:

```bash
kubectl apply -f infra/kubernetes/namespace.yaml

kubectl create secret generic devtrackr-secrets \
	-n devtrackr \
	--from-literal=postgres-user=devtrackr \
	--from-literal=postgres-password=devtrackr \
	--from-literal=JWT_SECRET=replace_me
```

Apply manifests:

```bash
kubectl apply -f infra/kubernetes/backend-deployment.yaml
kubectl apply -f infra/kubernetes/frontend-deployment.yaml
kubectl apply -f infra/kubernetes/postgres-statefulset.yaml
kubectl apply -f infra/kubernetes/redis-deployment.yaml
kubectl apply -f infra/kubernetes/ingress.yaml
```

## Terraform

Terraform files scaffold a GKE-based deployment on GCP.

Initialize and plan:

```bash
cd infra/terraform
terraform init
terraform plan -var="project_id=YOUR_GCP_PROJECT_ID"
```

Apply:

```bash
terraform apply -var="project_id=YOUR_GCP_PROJECT_ID"
```

Important variables are defined in [infra/terraform/variables.tf](infra/terraform/variables.tf).

## CI/CD

The workflow in [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) does three things:

- Runs backend tests on push and pull requests
- Builds and pushes backend/frontend Docker images on `main`
- Updates GKE deployments using `kubectl set image`

Required GitHub secrets:

- `GCP_PROJECT_ID`
- `GCP_SA_KEY`

## Notes

- The frontend currently stores demo user data in `localStorage`.
- The backend contains the real API structure and async database layer.
- Kubernetes image references still use `gcr.io/YOUR_PROJECT/...` placeholders and should be replaced with your real GCP project.
- The frontend AI calls in the SPA are demo-oriented; production use should move secret-bearing AI requests behind the backend.
