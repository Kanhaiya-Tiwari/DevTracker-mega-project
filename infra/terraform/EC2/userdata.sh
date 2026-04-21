#!/bin/bash

# Godaddy API credentials from Terraform
export GODADDY_API_KEY="${godaddy_api_key}"
export GODADDY_API_SECRET="${godaddy_api_secret}"

# Update system
apt update -y
apt install -y software-properties-common curl git

# Install k3s (lightweight Kubernetes)
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="server --tls-san $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)" sh -

# Setup kubectl for ubuntu user
mkdir -p /home/ubuntu/.kube
cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config
chown -R ubuntu:ubuntu /home/ubuntu/.kube
chmod 600 /home/ubuntu/.kube/config

# Add kubectl to PATH for all users
echo 'export PATH=$PATH:/usr/local/bin' >> /etc/profile
echo 'export KUBECONFIG=/home/ubuntu/.kube/config' >> /home/ubuntu/.bashrc

# Install Ansible
apt-add-repository --yes --update ppa:ansible/ansible
apt install -y ansible

# Clone repo (needed for Ansible playbook)
cd /home/ubuntu
git clone https://github.com/Kanhaiya-Tiwari/DevTracker-mega-project.git
chown -R ubuntu:ubuntu /home/ubuntu/DevTracker-mega-project

# Run Ansible playbook
cd /home/ubuntu/DevTracker-mega-project/infra/ansible
ansible-playbook playbook-ec2.yml

# Update Godaddy DNS (if API credentials are set)
echo "========================================="
echo "Updating Godaddy DNS..."
echo "========================================="

# Get EC2 hostname for manual reference
EC2_HOSTNAME=$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo "EC2 Hostname: $EC2_HOSTNAME"
echo "EC2 IP: $EC2_IP"
echo ""

# Try to update DNS automatically if credentials exist
if [ -n "$GODADDY_API_KEY" ] && [ -n "$GODADDY_API_SECRET" ]; then
    echo "Godaddy API credentials found. Updating DNS..."
    cd /home/ubuntu/DevTracker-mega-project/infra/scripts
    chmod +x update-godaddy-dns.sh
    ./update-godaddy-dns.sh
else
    echo "⚠️  Godaddy API credentials not set."
    echo ""
    echo "MANUAL DNS CONFIGURATION REQUIRED:"
    echo "===================================="
    echo "Login to Godaddy → DNS Management"
    echo "Add CNAME Record:"
    echo "  Type: CNAME"
    echo "  Name: devtracker"
    echo "  Value: $EC2_HOSTNAME"
    echo "  TTL: 600"
    echo "===================================="
    echo ""
    echo "OR set API credentials and run:"
    echo "export GODADDY_API_KEY=your_key"
    echo "export GODADDY_API_SECRET=your_secret"
    echo "cd /home/ubuntu/DevTracker-mega-project/infra/scripts"
    echo "./update-godaddy-dns.sh"
fi

echo "========================================="
echo "DevTracker deployment initiated!"
echo ""
echo "Access your application at:"
echo "http://devtracker.buildwithkanha.shop"
echo ""
echo "Or directly via EC2:"
echo "http://$EC2_IP"
echo ""
echo "Check status with: kubectl get all -n devtracker"
echo "========================================="