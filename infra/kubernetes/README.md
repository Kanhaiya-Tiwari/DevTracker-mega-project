# DevTracker Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the DevTracker application.

## Files Overview

- `namespace.yml` - Kubernetes namespace for the application
- `configmap.yml` - Configuration data for the application
- `pv.yml` - Persistent Volumes for PostgreSQL and Redis storage
- `pvc.yml` - Persistent Volume Claims for database storage
- `statefulset.yml` - StatefulSets for PostgreSQL and Redis with persistent storage
- `app_services.yml` - Backend and frontend deployments and services
- `mydomain_ingress.yml` - Ingress configuration for external access
- `deployment.yml` - Horizontal Pod Autoscalers and deployment instructions

## Setup Instructions

### 1. Create Secrets

Copy the secrets template and update with your actual values:

```bash
# Create secrets file from template (you'll need to create this manually)
kubectl create secret generic devtracker-secrets \
  --from-literal=postgres-user=your_postgres_user \
  --from-literal=postgres-password=your_postgres_password \
  --from-literal=database-url=postgresql://user:password@postgres-service:5432/devtrackr \
  --from-literal=secret-key=your_jwt_secret_key \
  --namespace=devtracker
```

### 2. Deploy in Order

```bash
kubectl apply -f namespace.yml
kubectl apply -f configmap.yml
kubectl apply -f pv.yml
kubectl apply -f pvc.yml
kubectl apply -f statefulset.yml
kubectl apply -f app_services.yml
kubectl apply -f mydomain_ingress.yml
kubectl apply -f deployment.yml
```

### 3. Update Ingress Domain

Replace `devtracker.yourdomain.com` in `mydomain_ingress.yml` with your actual domain.

### 4. Docker Images

Make sure to build and push your Docker images to Docker Hub:

```bash
# Backend
docker build -t kanhaiyatiwari/devtracker-backend:latest ./backend
docker push kanhaiyatiwari/devtracker-backend:latest

# Frontend
docker build -t kanhaiyatiwari/devtracker-frontend:latest ./frontend
docker push kanhaiyatiwari/devtracker-frontend:latest
```

## Services

- **Frontend**: Available at `http://devtracker.yourdomain.com`
- **Backend API**: Available at `http://devtracker.yourdomain.com/api/v1`
- **PostgreSQL**: Internal service at `postgres-service:5432`
- **Redis**: Internal service at `redis-service:6379`

## Scaling

The application includes Horizontal Pod Autoscalers:
- Backend: 2-10 replicas based on CPU/memory usage
- Frontend: 2-5 replicas based on CPU/memory usage

## Monitoring

Check deployment status:

```bash
kubectl get pods -n devtracker
kubectl get services -n devtracker
kubectl get ingress -n devtracker
```
