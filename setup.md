# 🚀 DevTracker Infrastructure & Setup Guide

This document explains the current infrastructure deployed on your EC2 instance (`100.48.45.91`) and how to manage the monitoring and deployment tools.

## 1. 🏗️ Current Stack Overview
The following components are installed and running:
*   **K3s Kubernetes**: The core orchestrator.
*   **NGINX Ingress Controller**: Handles traffic on Port 80.
*   **ArgoCD**: GitOps continuous delivery (Namespace: `argocd`).
*   **Prometheus**: Metrics collection (Namespace: `monitoring`).
*   **Grafana**: Data visualization dashboards (Namespace: `monitoring`).
*   **PostgreSQL & Redis**: Application database and cache.

---

## 2. 🔌 Required Ports (AWS Security Group)
Ensure your AWS EC2 Security Group has these rules:

| Port Range | Protocol | Purpose |
| :--- | :--- | :--- |
| `80` | TCP | Public Web Traffic (Frontend) |
| `443` | TCP | Secure Web Traffic (HTTPS) |
| `22` | TCP | SSH Access |
| `30000-32767` | TCP | Kubernetes NodePorts (For direct service access) |

---

## 3. 🚢 Managing the Application
Your app is deployed in the `devtracker` namespace.

*   **Check Status**: `kubectl get all -n devtracker`
*   **Frontend URL**: [http://100.48.45.91](http://100.48.45.91)
*   **Backend Health**: [http://100.48.45.91/health](http://100.48.45.91/health)

---

## 4. 🐙 ArgoCD Setup (Continuous Delivery)
ArgoCD allows you to visualize your Kubernetes cluster and sync code changes automatically.

### Step 1: Get Admin Password
Run this command on your EC2:
```bash
KUBECONFIG=/etc/rancher/k3s/k3s.yaml kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

### Step 2: Access ArgoCD UI
Use port-forwarding to access it safely from your local laptop:
```bash
# Run this on your LOCAL terminal:
ssh -i "Devtracker.pem" -L 8443:svc/argocd-server:443 ubuntu@100.48.45.91
```
Now open: [https://localhost:8443](https://localhost:8443) (User: `admin`)

---

## 5. 📊 Prometheus & Grafana Setup (Monitoring)
### Step 1: Access Grafana Dashboard
Grafana is the primary UI for seeing your server health, CPU/RAM usage, and app metrics.

1.  **Get Credentials**:
    *   **User**: `admin`
    *   **Password**: `admin123` (Set in playbook)

2.  **Access UI**:
```bash
# Run this on your LOCAL terminal:
ssh -i "Devtracker.pem" -L 3000:svc/monitoring-grafana:80 -n monitoring ubuntu@100.48.45.91
```
Now open: [http://localhost:3000](http://localhost:3000)

### Step 2: Adding Dashboards
1.  Login to Grafana.
2.  Go to **Dashboards** -> **Import**.
3.  Type `315` (Kubernetes Cluster Overview) or `1860` (Node Exporter Full).
4.  Select `Prometheus` as the data source.

---

## 6. 🛠️ Troubleshooting Commands
If something is wrong, check the bootstrap logs:
*   **Ansible/Startup Logs**: `sudo tail -f /var/log/devtracker-bootstrap.log`
*   **K3s Logs**: `sudo journalctl -u k3s -f`
*   **Pod Logs**: `kubectl logs -l component=backend -n devtracker`
