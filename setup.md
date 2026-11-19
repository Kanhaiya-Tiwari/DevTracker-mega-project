# EC2 setup and operations

This project runs as a single Docker Compose stack. Kubernetes, Terraform, and
Ansible are not part of this deployment.

## 1. Connect to EC2

From the local machine, with the key saved as `~/Downloads/Kanha.pem`:

```bash
chmod 600 ~/Downloads/Kanha.pem
ssh -i ~/Downloads/Kanha.pem ubuntu@ec2-23-22-133-34.compute-1.amazonaws.com
```

Allow inbound TCP port 22 from your IP and port 80 for the public website in the
instance's AWS security group. For direct access to Grafana, Jenkins, and
Prometheus, allow TCP ports 3000, 8080, and 9090 only from your public IP
(for example, `157.49.44.6/32`). Do not allow these ports from `0.0.0.0/0`;
Prometheus has no login configured. Do not expose ports 3100, 5432, or 6379.

## 2. Install Docker Compose

On a new Ubuntu server:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker
sudo docker compose version
```

## 3. Deploy the project

On the local machine, from the project directory, create an archive without
repository history, local dependencies, or local environment files:

```bash
tar -czf /tmp/devtracker.tar.gz \
  --exclude=.git --exclude=node_modules --exclude=.venv \
  --exclude='*/.env' --exclude='*/.env.*' \
  -C .. DevTracker-mega-project
scp -i ~/Downloads/Kanha.pem /tmp/devtracker.tar.gz \
  ubuntu@ec2-23-22-133-34.compute-1.amazonaws.com:/tmp/
```

On EC2:

```bash
sudo mkdir -p /srv/devtracker
sudo tar -xzf /tmp/devtracker.tar.gz \
  --strip-components=1 -C /srv/devtracker
sudo chown -R ubuntu:ubuntu /srv/devtracker
cd /srv/devtracker
cp .env.example .env
chmod 600 .env
```

Set strong generated passwords and signing keys in `/srv/devtracker/.env`.
`DOCKER_GID` must match the Docker socket's group ID:

```bash
getent group docker
stat -c '%g' /var/run/docker.sock
```

Set `DOCKER_GID` to the number printed by `stat`. Then start the stack:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f
```

Use the deployment's existing `.env` when updating the project. Do not replace
it with `.env.example`; doing so would change credentials and lose access to
existing services/data.

For Docker Hub publishing, add a Jenkins username/password credential with ID
`docker-hub-credentials`. Use your Docker Hub username and an access token as
the password; do not use or commit your account password.

Configure the Jenkins shared library at **Manage Jenkins → System → Global
Pipeline Libraries**:

1. Add a library named `Shared` with default version `master`.
2. Select **Modern SCM → Git** and set the repository URL to
   `https://github.com/Kanhaiya-Tiwari/jenkins-shared-libraries.git`.
3. Leave credentials empty if the repository is public. If it is private,
   select a Jenkins credential with read access to that repository.
4. Save the Jenkins system configuration.

The DevTracker `Jenkinsfile` uses the library's `docker_build` and
`docker_push` steps. Keep these files in the library repository's `vars/`
directory. The library's current `run_tests.groovy` is only a placeholder;
the pipeline runs DevTracker backend tests itself.

## 4. Access services

The website is public at
`http://ec2-23-22-133-34.compute-1.amazonaws.com/`. After allowing the three
admin ports from your IP in the AWS security group, open Grafana at
`http://23.22.133.34:3000`, Prometheus at `http://23.22.133.34:9090`, and
Jenkins at `http://23.22.133.34:8080`. Use the credentials configured in the
server's `.env`. Do not make the ports public to all IPs. The Jenkins
`devtracker-deploy` job checks out the repository configured in Jenkins, runs
Trivy scans and backend tests, builds and pushes backend/frontend Docker Hub
images, deploys them, and checks the public health endpoint. It preserves
`.env`, uploaded files, Compose volumes, and application data.

For build emails, configure the SMTP server in Jenkins **Manage Jenkins →
System → Extended E-mail Notification**, then set
`SMTP_NOTIFICATIONS_ENABLED=true` in `/srv/devtracker/.env` and recreate the
Jenkins container. Build results are sent to `knhapndt@gmail.com`.

Read the dashboard credentials from the server with:

```bash
grep -E '^(GRAFANA_ADMIN_USER|GRAFANA_ADMIN_PASSWORD|JENKINS_ADMIN_ID|JENKINS_ADMIN_PASSWORD)=' \
  /srv/devtracker/.env
```

## 5. Updating and troubleshooting

```bash
cd /srv/devtracker
docker compose ps
docker compose logs -f backend
docker compose up -d --build backend frontend
```

Compose named volumes keep PostgreSQL, Redis, monitoring history, and Jenkins
data when containers are recreated. Back up important data before migrations.
`docker compose down -v` permanently deletes those volumes.
