#!/bin/bash

# Azure VM Setup Script for Strategic Accounts CRM
# This script automates the installation and configuration of the CRM on an Azure Ubuntu VM

set -e

echo "=========================================="
echo "Strategic Accounts CRM - Azure VM Setup"
echo "=========================================="
echo ""

# Update system packages
echo "Step 1: Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 18.x
echo ""
echo "Step 2: Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install pnpm globally
echo ""
echo "Step 3: Installing pnpm..."
sudo npm install -g pnpm

# Install Nginx
echo ""
echo "Step 4: Installing Nginx..."
sudo apt-get install -y nginx

# Install PM2 for process management
echo ""
echo "Step 5: Installing PM2..."
sudo npm install -g pm2

# Create application directory
echo ""
echo "Step 6: Setting up application directory..."
sudo mkdir -p /var/www/crm
sudo chown -R $USER:$USER /var/www/crm

# Configure Nginx
echo ""
echo "Step 7: Configuring Nginx..."
sudo tee /etc/nginx/sites-available/crm > /dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    
    server_name _;
    
    root /var/www/crm/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo ""
echo "Step 8: Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo ""
echo "Step 9: Starting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configure firewall
echo ""
echo "Step 10: Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
echo "y" | sudo ufw enable

# Set up PM2 to start on boot
echo ""
echo "Step 11: Configuring PM2 startup..."
pm2 startup systemd -u $USER --hp /home/$USER
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Copy your application files to /var/www/crm/"
echo "2. Your CRM will be accessible at: http://YOUR_VM_IP"
echo ""
echo "Useful commands:"
echo "  - Check Nginx status: sudo systemctl status nginx"
echo "  - View Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "  - Restart Nginx: sudo systemctl restart nginx"
echo ""