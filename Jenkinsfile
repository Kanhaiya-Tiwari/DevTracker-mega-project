@Library('Shared') _

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
        timeout(time: 45, unit: 'MINUTES')
    }

    environment {
        COMPOSE_PROJECT_NAME = 'devtracker'
        COMPOSE_FILE = '/srv/devtracker/compose.yaml'
        COMPOSE_ENV_FILE = '/srv/devtracker/.env'
        DEPLOY_DIRECTORY = '/srv/devtracker'
        DOCKER_IMAGE_NAME = 'kanhaiyatiwari/devtracker-backend'
        DOCKER_FRONTEND_IMAGE_NAME = 'kanhaiyatiwari/devtracker-frontend'
        DOCKER_HUB_CREDENTIALS = 'docker-hub-credentials'
    }

    stages {
        stage('Clean workspace and checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('Dependency and secret scan') {
            steps {
                sh '''
                    set -eu
                    trivy fs \
                      --scanners vuln,misconfig,secret \
                      --severity HIGH,CRITICAL \
                      --exit-code 1 \
                      .
                '''
            }
        }

        stage('Backend tests') {
            steps {
                sh '''
                    set -eu
                    tar -C "$WORKSPACE/backend" -cf - requirements.txt app tests | \
                      docker run --rm -i \
                        --workdir /workspace \
                        python:3.12-slim \
                        sh -ec 'tar -xf - -C /workspace && pip install --quiet -r requirements.txt && pytest tests/ -q'
                '''
            }
        }

        stage('Build and scan images') {
            steps {
                script {
                    sh '''
                        set -eu
                        docker pull python:3.12-alpine
                        docker pull node:20-alpine
                        docker pull nginxinc/nginx-unprivileged:1.29-alpine
                    '''
                    env.DOCKER_IMAGE_TAG = sh(
                        script: 'git rev-parse --short=12 HEAD',
                        returnStdout: true
                    ).trim()
                    docker_build(
                        imageName: env.DOCKER_IMAGE_NAME,
                        imageTag: env.DOCKER_IMAGE_TAG,
                        dockerfile: 'backend/Dockerfile',
                        context: 'backend'
                    )
                    docker_build(
                        imageName: env.DOCKER_FRONTEND_IMAGE_NAME,
                        imageTag: env.DOCKER_IMAGE_TAG,
                        dockerfile: 'frontend/Dockerfile.prod',
                        context: 'frontend'
                    )
                }
                sh '''
                    set -eu
                    trivy image --severity HIGH,CRITICAL --exit-code 1 \
                      "$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG"
                    trivy image --severity HIGH,CRITICAL --exit-code 1 \
                      "$DOCKER_FRONTEND_IMAGE_NAME:$DOCKER_IMAGE_TAG"
                '''
            }
        }

        stage('Push images to Docker Hub') {
            steps {
                script {
                    [
                        env.DOCKER_IMAGE_NAME,
                        env.DOCKER_FRONTEND_IMAGE_NAME
                    ].each { imageName ->
                        try {
                            docker_push(
                                imageName: imageName,
                                imageTag: env.DOCKER_IMAGE_TAG,
                                credentials: env.DOCKER_HUB_CREDENTIALS
                            )
                        } finally {
                            sh 'docker logout >/dev/null 2>&1 || true'
                        }
                    }
                }
            }
        }

        stage('Update deployment files') {
            steps {
                sh '''
                    set -eu
                    rsync -a --delete \
                      --exclude='/.env' \
                      --exclude='/.env.*' \
                      --exclude='**/.env' \
                      --exclude='**/.env.*' \
                      --exclude='**/.pytest_cache/' \
                      --exclude='**/__pycache__/' \
                      --exclude='*.py[cod]' \
                      --exclude='/.git/' \
                      --exclude='/uploads/' \
                      "$WORKSPACE/" "$DEPLOY_DIRECTORY/"
                '''
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_HUB_CREDENTIALS}",
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    sh '''
                        set -eu
                        export DOCKER_CONFIG="$(mktemp -d)"
                        trap 'rm -f "$DOCKER_CONFIG/config.json"; rmdir "$DOCKER_CONFIG"' EXIT

                        printf '%s' "$DOCKERHUB_TOKEN" | \
                          docker --config "$DOCKER_CONFIG" login \
                            --username "$DOCKERHUB_USER" --password-stdin

                        export DOCKERHUB_NAMESPACE=kanhaiyatiwari
                        export IMAGE_TAG=latest
                        docker --config "$DOCKER_CONFIG" compose \
                          --project-directory "$DEPLOY_DIRECTORY" \
                          --env-file "$COMPOSE_ENV_FILE" \
                          -f "$COMPOSE_FILE" pull backend frontend
                        docker --config "$DOCKER_CONFIG" compose \
                          --project-directory "$DEPLOY_DIRECTORY" \
                          --env-file "$COMPOSE_ENV_FILE" \
                          -f "$COMPOSE_FILE" up -d --no-deps --no-build backend frontend
                    '''
                }
            }
        }

        stage('Verify deployment') {
            steps {
                sh '''
                    set -eu
                    for attempt in $(seq 1 30); do
                      if curl --fail --silent --show-error --max-time 5 \
                        --output /dev/null --write-out 'HTTP %{http_code}\\n' \
                        http://frontend:8080/health; then
                        echo
                        exit 0
                      fi
                      sleep 2
                    done
                    echo "DevTracker health check failed; collecting deployment diagnostics" >&2
                    docker compose \
                      --project-directory "$DEPLOY_DIRECTORY" \
                      --env-file "$COMPOSE_ENV_FILE" \
                      -f "$COMPOSE_FILE" ps -a || true
                    docker compose \
                      --project-directory "$DEPLOY_DIRECTORY" \
                      --env-file "$COMPOSE_ENV_FILE" \
                      -f "$COMPOSE_FILE" logs --no-color --tail=150 backend postgres frontend || true
                    echo "DevTracker health check failed after deployment" >&2
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            script {
                if (env.SMTP_NOTIFICATIONS_ENABLED == 'true') {
                    emailext(
                        to: 'knhapndt@gmail.com',
                        subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: "DevTracker deploy succeeded.\n${env.BUILD_URL}"
                    )
                }
            }
        }
        failure {
            script {
                if (env.SMTP_NOTIFICATIONS_ENABLED == 'true') {
                    emailext(
                        to: 'knhapndt@gmail.com',
                        subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: "DevTracker deploy failed. Check the Jenkins build log:\n${env.BUILD_URL}"
                    )
                }
            }
        }
    }
}
