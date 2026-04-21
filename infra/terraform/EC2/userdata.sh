#!/bin/bash

# Update system
apt update -y
apt install -y software-properties-common curl git

# Install Ansible
apt-add-repository --yes --update ppa:ansible/ansible
apt install -y ansible

# Clone repo (needed for Ansible playbook)
cd /home/ubuntu
git clone https://github.com/Kanhaiya-Tiwari/DevTracker-mega-project.git
chown -R ubuntu:ubuntu /home/ubuntu/DevTracker-mega-project

# Run Ansible playbook (handles k3s installation and full deployment)
cd /home/ubuntu/DevTracker-mega-project/infra/ansible
ansible-playbook playbook-ec2.yml

echo "========================================="
echo "DevTracker deployment complete!"
echo "Check status with: kubectl get all -n devtracker"
echo "========================================="