#!/bin/bash
set -euo pipefail

LOG="/var/log/devtracker-bootstrap.log"
exec > >(tee -a "$LOG") 2>&1

echo "========================================="
echo "[$(date)] Starting DevTracker bootstrap"
echo "========================================="

# Non-interactive apt
export DEBIAN_FRONTEND=noninteractive

# Update & install prerequisites
apt-get update -y
apt-get install -y software-properties-common curl git

# Install Ansible
apt-add-repository --yes --update ppa:ansible/ansible
apt-get install -y ansible

# Clone or pull latest repo
if [ -d "/home/ubuntu/DevTracker-mega-project/.git" ]; then
  echo "[$(date)] Repo exists, pulling latest code..."
  git -C /home/ubuntu/DevTracker-mega-project pull
else
  echo "[$(date)] Cloning repo..."
  git clone https://github.com/Kanhaiya-Tiwari/DevTracker-mega-project.git /home/ubuntu/DevTracker-mega-project
fi

chown -R ubuntu:ubuntu /home/ubuntu/DevTracker-mega-project

# Run Ansible playbook
echo "[$(date)] Running Ansible playbook..."
ansible-playbook /home/ubuntu/DevTracker-mega-project/infra/ansible/playbook-ec2.yml \
  -e "ansible_python_interpreter=/usr/bin/python3" \
  2>&1 | tee -a "$LOG"

PLAYBOOK_EXIT=${PIPESTATUS[0]}

if [ $PLAYBOOK_EXIT -eq 0 ]; then
  echo "========================================="
  echo "[$(date)] DevTracker deployment SUCCESS!"
  echo "App URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
  echo "Full log: $LOG"
  echo "========================================="
else
  echo "========================================="
  echo "[$(date)] ERROR: Ansible playbook failed (exit code $PLAYBOOK_EXIT)"
  echo "Check log: $LOG"
  echo "========================================="
  exit $PLAYBOOK_EXIT
fi