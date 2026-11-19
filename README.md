# DevTrackr

DevTrackr is a React and FastAPI application for tracking learning goals, practice sessions, and progress.

For a complete fresh-EC2 deployment, credentials, login, and Jenkins auto-build
guide, see [setup.md](setup.md).

## Stack

- React 18, Vite, Tailwind CSS
- FastAPI, SQLAlchemy, PostgreSQL, Redis
- Docker Compose for the app, database, cache, monitoring, and CI/CD
- Prometheus, Grafana, Loki, Promtail, Node Exporter, and cAdvisor
- Jenkins pipeline for tests, image builds, and deployment

## Run locally

Requirements: Docker Engine/Desktop with the Docker Compose v2 plugin.

```bash
cp .env.example .env
```

Set strong random values for `POSTGRES_PASSWORD`, `JWT_SECRET`,
`GRAFANA_ADMIN_PASSWORD`, and `JENKINS_ADMIN_PASSWORD` in `.env`, then run:

```bash
docker compose up -d --build
docker compose ps
```

Open the app at [http://localhost](http://localhost), the backend API docs at
[http://localhost/docs](http://localhost/docs), and the health check at
[http://localhost/health](http://localhost/health). The EC2 deployment is at
[http://ec2-23-22-133-34.compute-1.amazonaws.com](http://ec2-23-22-133-34.compute-1.amazonaws.com).

The optional AI coaching integration needs an `OPENROUTER_API_KEY`. Leave it
blank to run the rest of the application without that integration.

## Monitoring and automation

On EC2, Compose publishes Grafana, Prometheus, and Jenkins on ports 3000, 9090,
and 8080. Allow these ports in the instance's AWS security group only from your
public IP (`your.ip.address/32`); do not allow `0.0.0.0/0`. Prometheus has no
login configured.

| Service | URL | Credentials |
|---|---|---|
| Grafana | [http://23.22.133.34:3000](http://23.22.133.34:3000) | `GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD` from `.env` |
| Prometheus | [http://23.22.133.34:9090](http://23.22.133.34:9090) | No login; restrict access by source IP |
| Jenkins | [http://23.22.133.34:8080](http://23.22.133.34:8080) | `JENKINS_ADMIN_ID` / `JENKINS_ADMIN_PASSWORD` from `.env` |
| Loki | Internal Compose service | Use the provisioned Loki data source in Grafana |

Read the dashboard credentials from the server with:

```bash
ssh -i ~/Downloads/Kanha.pem ubuntu@ec2-23-22-133-34.compute-1.amazonaws.com \
  "grep -E '^(GRAFANA_ADMIN_USER|GRAFANA_ADMIN_PASSWORD|JENKINS_ADMIN_ID|JENKINS_ADMIN_PASSWORD)=' /srv/devtracker/.env"
```

Grafana provisions Prometheus and Loki data sources and a DevTracker dashboard
with backend request rate, EC2 CPU/memory/root-disk utilization, scrape-target
health, and Docker logs filterable by `service_name`. Prometheus scrapes the
backend, EC2 host, and cAdvisor; Promtail forwards Docker container logs to
Loki.

Jenkins checks out the DevTracker repository configured in the Jenkins job,
runs Trivy dependency/secret scans and backend tests, builds and scans the
backend and frontend images, and pushes
`kanhaiyatiwari/devtracker-backend` and
`kanhaiyatiwari/devtracker-frontend` with commit and `latest` tags. It then
updates the deployment files without replacing `.env` or uploads, deploys
both images, and checks `/health`. Configure the Docker Hub username/access
token in Jenkins using credential ID `docker-hub-credentials`. Configure SMTP
in Jenkins **Manage Jenkins → System → Extended E-mail Notification** and set
`SMTP_NOTIFICATIONS_ENABLED=true` in `/srv/devtracker/.env` to receive
success/failure email at `knhapndt@gmail.com`.

The pipeline uses the `docker_build` and `docker_push` steps from the
`Shared` Jenkins Global Pipeline Library. Configure it under **Manage Jenkins
→ System → Global Pipeline Libraries**:

- Name: `Shared`
- Default version: `master`
- Retrieval method: Modern SCM → Git
- Project repository:
  `https://github.com/Kanhaiya-Tiwari/jenkins-shared-libraries.git`
- Credentials: none for a public repository; for a private repository, select
  a Jenkins credential that can read it.

The library repository must keep its reusable steps under `vars/`, including
`docker_build.groovy` and `docker_push.groovy`. The `run_tests.groovy` in that
repository is currently only a placeholder; this pipeline runs the project's
backend tests directly.

## Operations

```bash
docker compose ps
docker compose logs -f
docker compose logs -f backend
docker compose up -d --build backend frontend
docker compose down
```

`docker compose down` preserves named volumes. To delete all application,
monitoring, and Jenkins data as well, run `docker compose down -v`.

## Project layout

```text
backend/                         FastAPI app and tests
frontend/                        React app and production NGINX config
infra/monitoring/                Prometheus, Loki, Promtail, Grafana config
infra/jenkins/                   Jenkins image and secured configuration
compose.yaml                     Full local and EC2 Compose stack
Jenkinsfile                      CI/CD pipeline
setup.md                         EC2 setup and operations guide
```
