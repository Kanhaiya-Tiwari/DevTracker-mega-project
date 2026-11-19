pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        COMPOSE_PROJECT_NAME = 'devtracker'
        COMPOSE_ENV_FILE = '/srv/devtracker/.env'
        DOCKERHUB_NAMESPACE = 'devtracker'
    }

    stages {
        stage('Clean checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('Validate Compose') {
            steps {
                sh '''
                    docker compose \
                      --project-directory "$WORKSPACE" \
                      --env-file "$COMPOSE_ENV_FILE" \
                      -f "$WORKSPACE/compose.yaml" \
                      config --quiet
                '''
            }
        }

        stage('Test backend') {
            steps {
                sh '''
                    docker run --rm \
                      --volume "$WORKSPACE/backend:/workspace" \
                      --workdir /workspace \
                      python:3.12-slim \
                      sh -ec 'pip install --quiet -r requirements.txt && pytest tests/ -q'
                '''
            }
        }

        stage('Build and push images') {
            steps {
                script {
                    env.IMAGE_TAG = sh(
                        script: 'git rev-parse --short=12 HEAD',
                        returnStdout: true
                    ).trim()
                }
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
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

                        docker compose \
                          --project-directory "$WORKSPACE" \
                          --env-file "$COMPOSE_ENV_FILE" \
                          -f "$WORKSPACE/compose.yaml" \
                          build backend frontend
                        for service in backend frontend; do
                          image="$DOCKERHUB_NAMESPACE/devtracker-$service"
                          docker tag "$image:$IMAGE_TAG" "$image:latest"
                          docker --config "$DOCKER_CONFIG" push "$image:$IMAGE_TAG"
                          docker --config "$DOCKER_CONFIG" push "$image:latest"
                        done
                    '''
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

        stage('Deploy') {
            steps {
                sh '''
                    docker compose \
                      --project-directory "$WORKSPACE" \
                      --env-file "$COMPOSE_ENV_FILE" \
                      -f "$WORKSPACE/compose.yaml" \
                      up -d --no-deps --no-build backend frontend
                '''
            }
        }

        stage('Verify health') {
            steps {
                sh '''
                    for attempt in $(seq 1 30); do
                      if curl --fail --silent http://127.0.0.1/health; then
                        exit 0
                      fi
                      sleep 2
                    done
                    echo "DevTracker health check failed after deployment" >&2
                    exit 1
                '''
            }
        }
    }
}
