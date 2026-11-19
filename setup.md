# EC2 setup and operations

This guide deploys the complete DevTracker stack on a new Ubuntu EC2 instance.
The same Docker Compose project starts the website, API, database, Redis,
Grafana, Prometheus, Loki, and Jenkins.

## 1. Create and secure the EC2 instance

Use an Ubuntu Server LTS AMI and a security group with these inbound rules:

| Port | Source | Purpose |
|---|---|---|
| 22 | Your public IP `/32` | SSH |
| 80 | `0.0.0.0/0` | Website |
| 3000 | Your public IP `/32` | Grafana |
| 8080 | Your public IP `/32` | Jenkins |
| 9090 | Your public IP `/32` | Prometheus (no login configured) |

Do not expose database port 5432, Redis port 6379, or Loki port 3100. Restrict
SSH and the monitoring/admin ports to your IP.

For automatic GitHub webhook builds, GitHub must also be able to reach
`/github-webhook/` on Jenkins port 8080. The simple `:8080` setup below uses
HTTP and serves both Jenkins UI and the webhook on that port. Do not open the
Jenkins UI to the whole internet just to make webhooks work; use an HTTPS
reverse proxy with path/source restrictions, or maintain an inbound rule for
GitHub's current webhook IP ranges from `https://api.github.com/meta` (`hooks`
field). The webhook is not reachable while port 8080 is restricted only to
your own IP.

From your computer, connect with the instance's key and public DNS name:

```bash
chmod 600 ~/Downloads/Kanha.pem
ssh -i ~/Downloads/Kanha.pem ubuntu@EC2_PUBLIC_DNS
```

Replace `EC2_PUBLIC_DNS` with the public DNS shown in the EC2 console.

## 2. Install Docker on EC2

Run on the Ubuntu instance:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
```

Log out and reconnect so the `ubuntu` group change takes effect, then verify:

```bash
docker --version
docker compose version
stat -c '%g' /var/run/docker.sock
```

## 3. Get the project and create server secrets

The Jenkins configuration currently follows the `master` branch. Clone it
into the directory used by Compose and by the Jenkins deployment pipeline:

```bash
sudo mkdir -p /srv/devtracker
sudo chown ubuntu:ubuntu /srv/devtracker
git clone --branch master --single-branch \
  https://github.com/Kanhaiya-Tiwari/DevTracker-mega-project.git \
  /srv/devtracker
cd /srv/devtracker
cp .env.example .env
chmod 600 .env
```

Create separate strong values for each password/secret:

```bash
openssl rand -hex 32
```

Run that command for `POSTGRES_PASSWORD`, `JWT_SECRET`,
`GRAFANA_ADMIN_PASSWORD`, and `JENKINS_ADMIN_PASSWORD`. Edit `.env` and replace
the example values; set `DOCKER_GID` to the number printed by `stat -c '%g'
/var/run/docker.sock`:

```bash
nano .env
```

Leave `OPENROUTER_API_KEY` blank if AI coaching is not needed. Keep `.env`
private and never commit or replace it with `.env.example` after deployment.

## 4. Start the entire stack

From `/srv/devtracker`:

```bash
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 backend postgres frontend
```

On first startup, PostgreSQL creates the configured database and database
account. The backend creates its application tables when it connects to the
database. Compose named volumes retain database and service data across normal
restarts.

Open the website at `http://EC2_PUBLIC_DNS/`. Replace the host with the EC2
public DNS or public IP. Register the first application account through the
website; there is no default application user. The password is stored as a
hash.

## 5. Service URLs and login accounts

| Service | URL | Login |
|---|---|---|
| DevTracker | `http://EC2_PUBLIC_DNS/` | Register an application account in the website |
| Grafana | `http://EC2_PUBLIC_DNS:3000` | `GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD` in `.env` |
| Jenkins | `http://EC2_PUBLIC_DNS:8080` | `JENKINS_ADMIN_ID` / `JENKINS_ADMIN_PASSWORD` in `.env` |
| Prometheus | `http://EC2_PUBLIC_DNS:9090` | No login; restrict access in the security group |
| Loki | Internal Compose service | Query through Grafana's provisioned Loki data source |
| PostgreSQL | Internal Compose service | `POSTGRES_USER` / `POSTGRES_PASSWORD` in `.env` |

The PostgreSQL database user is not the same as a DevTracker website account.
To inspect application tables and users on EC2:

```bash
cd /srv/devtracker
docker compose exec postgres sh -lc \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

At the `psql` prompt, list tables and registered users:

```sql
\dt
SELECT email, name, created_at FROM users;
```

Never select or share `hashed_pw`. Exit `psql` with `\q`.

## 6. Configure Jenkins credentials and the shared library

Sign in to Jenkins and add the Docker Hub access token:

1. Open **Manage Jenkins → Credentials → System → Global credentials**.
2. Add **Username with password**. Username is your Docker Hub username;
   password is a Docker Hub access token, not your account password.
3. Set the credential ID exactly to `docker-hub-credentials`.

Configure the pipeline's shared library:

1. Open **Manage Jenkins → System → Global Pipeline Libraries**.
2. Add a library named `Shared`, default version `master`.
3. Select **Modern SCM → Git** and set the repository URL to
   `https://github.com/Kanhaiya-Tiwari/jenkins-shared-libraries.git`.
4. Leave credentials empty if the repository is public; otherwise choose a
   read-access credential, then save.

The library must provide `vars/docker_build.groovy` and
`vars/docker_push.groovy`.

## 7. Make Jenkins build automatically on push

The Jenkins configuration creates `devtrackernew`, checks out `master`, and
uses the GitHub push trigger plus a two-minute SCM polling fallback. The
webhook starts builds immediately; polling catches pushes if the webhook is
missing or temporarily unavailable. The GitHub plugin must be installed. If
you have already deployed Jenkins before this change, update the plugin list
and Jenkins configuration on EC2, then rebuild/recreate the Jenkins container:

```bash
cd /srv/devtracker
git fetch origin master
git show FETCH_HEAD:infra/jenkins/jenkins.yaml | \
  sudo tee infra/jenkins/jenkins.yaml >/dev/null
git show FETCH_HEAD:infra/jenkins/plugins.txt | \
  sudo tee infra/jenkins/plugins.txt >/dev/null
docker compose up -d --build --force-recreate jenkins
```

This recreates only the Jenkins container; its named `jenkins_data` volume
preserves job history and Jenkins configuration. Do not remove volumes. After
restarting, check **Manage Jenkins → Plugins → Installed** and confirm the
GitHub plugin is installed; install it from **Available plugins** and restart
Jenkins if it is missing.

Then open Jenkins and confirm the `devtrackernew` job is configured as follows:

1. Open the `devtrackernew` job and select **Configure**.
2. Under **Pipeline → Definition**, choose **Pipeline script from SCM**.
3. Choose **Git**, set repository URL to
   `https://github.com/Kanhaiya-Tiwari/DevTracker-mega-project.git`, and set
   branch specifier to `*/master`.
4. Set script path to `Jenkinsfile`.
5. Under **Build Triggers**, enable both **GitHub hook trigger for GITScm
   polling** and **Poll SCM**. Set the polling schedule to `H/2 * * * *` and
   save.
6. In the GitHub repository, open **Settings → Webhooks → Add webhook**:
   - Payload URL:
     `http://EC2_PUBLIC_DNS:8080/github-webhook/`
   - Content type: `application/json`
   - Choose **Just the push event**
   - Save the webhook.
7. Run **Build Now** once. This confirms Jenkins can build and registers the
   pipeline configuration. Afterward, pushing a commit to `master` should
   start a build from GitHub's webhook; SCM polling is the fallback if the
   webhook does not arrive.

Replace `EC2_PUBLIC_DNS` with the instance's actual public DNS name. In
GitHub **Settings → Webhooks → Recent Deliveries**, select a push delivery:
expect a successful HTTP response from Jenkins. A failed delivery usually
means the URL, EC2 security-group/network access, or Jenkins plugin is wrong.
If GitHub gets a successful response but there is no build, check that the
job's GitHub trigger is enabled and its SCM URL and branch are exactly the
repository and `*/master`.

Only one active job should deploy this Compose project. Disable any other
DevTracker deployment job (for example `devtracker-deploy`) to avoid duplicate
deployments.

## 8. Normal operations

```bash
cd /srv/devtracker
docker compose ps
docker compose logs -f
docker compose logs -f backend
docker compose up -d
docker compose down
```

`docker compose down` stops and removes containers but preserves named volumes.
Do not run `docker compose down -v` unless you intend to delete PostgreSQL,
Redis, Grafana, Prometheus, Loki, and Jenkins data.
