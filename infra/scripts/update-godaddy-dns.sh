#!/bin/bash

# Godaddy DNS Update Script for EC2
# This script automatically updates Godaddy CNAME record with EC2 hostname

# Configuration (User needs to set these)
GODADDY_API_KEY="${GODADDY_API_KEY:-}"
GODADDY_API_SECRET="${GODADDY_API_SECRET:-}"
DOMAIN_NAME="${DOMAIN_NAME:-buildwithkanha.shop}"
SUBDOMAIN="${SUBDOMAIN:-devtracker}"

# Get EC2 Public DNS Hostname
EC2_HOSTNAME=$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo "========================================="
echo "Godaddy DNS Update Script"
echo "========================================="
echo "EC2 Hostname: $EC2_HOSTNAME"
echo "EC2 IP: $EC2_IP"
echo "Domain: $SUBDOMAIN.$DOMAIN_NAME"
echo "========================================="

# Check if credentials are set
if [ -z "$GODADDY_API_KEY" ] || [ -z "$GODADDY_API_SECRET" ]; then
    echo "⚠️  WARNING: Godaddy API credentials not set!"
    echo ""
    echo "To set credentials, run:"
    echo "export GODADDY_API_KEY=your_api_key"
    echo "export GODADDY_API_SECRET=your_api_secret"
    echo ""
    echo "Or manually add this CNAME in Godaddy:"
    echo "Type: CNAME"
    echo "Name: $SUBDOMAIN"
    echo "Value: $EC2_HOSTNAME"
    echo "TTL: 600"
    echo ""
    echo "EC2 Hostname to copy: $EC2_HOSTNAME"
    exit 1
fi

# Godaddy API Endpoint
GODADDY_API_URL="https://api.godaddy.com/v1/domains/$DOMAIN_NAME/records/CNAME/$SUBDOMAIN"

echo "Updating Godaddy DNS..."
echo "API URL: $GODADDY_API_URL"

# Update DNS Record
RESPONSE=$(curl -s -X PUT "$GODADDY_API_URL" \
    -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
    -H "Content-Type: application/json" \
    -d "[{\"data\": \"$EC2_HOSTNAME\", \"ttl\": 600}]" \
    -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)

echo ""
echo "API Response:"
echo "$RESPONSE" | sed 's/HTTP_CODE:[0-9]*//'
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS! DNS record updated."
    echo ""
    echo "========================================="
    echo "Your application will be available at:"
    echo "http://$SUBDOMAIN.$DOMAIN_NAME"
    echo "========================================="
    echo ""
    echo "Note: DNS propagation may take 5-10 minutes"
else
    echo "❌ ERROR: Failed to update DNS (HTTP $HTTP_CODE)"
    echo ""
    echo "Manual DNS Configuration:"
    echo "=========================="
    echo "Login to Godaddy → DNS Management"
    echo "Add CNAME Record:"
    echo "  Type: CNAME"
    echo "  Name: $SUBDOMAIN"
    echo "  Value: $EC2_HOSTNAME"
    echo "  TTL: 600"
    echo "=========================="
fi

echo ""
echo "EC2 Hostname: $EC2_HOSTNAME"
echo "EC2 IP: $EC2_IP"
