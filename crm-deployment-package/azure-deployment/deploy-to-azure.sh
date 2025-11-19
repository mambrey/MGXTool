#!/bin/bash

# Deployment Script for Strategic Accounts CRM to Azure VM
# This script transfers the built application to your Azure VM

set -e

echo "=========================================="
echo "Strategic Accounts CRM - Azure Deployment"
echo "=========================================="
echo ""

# Check if required parameters are provided
if [ $# -lt 2 ]; then
    echo "Usage: ./deploy-to-azure.sh <VM_IP> <VM_USERNAME>"
    echo "Example: ./deploy-to-azure.sh 20.123.45.67 azureuser"
    exit 1
fi

VM_IP=$1
VM_USERNAME=$2
APP_DIR="/var/www/crm"

echo "Deploying to: $VM_USERNAME@$VM_IP"
echo ""

# Check if dist folder exists
if [ ! -d "../dist" ]; then
    echo "Error: dist folder not found. Please run 'pnpm run build' first."
    exit 1
fi

# Create a temporary deployment package
echo "Step 1: Creating deployment package..."
cd ..
tar -czf azure-deployment/crm-deploy.tar.gz dist package.json

# Transfer the setup script to VM
echo ""
echo "Step 2: Transferring setup script to VM..."
scp azure-deployment/setup-azure-vm.sh $VM_USERNAME@$VM_IP:~/

# Make setup script executable and run it
echo ""
echo "Step 3: Running setup script on VM..."
ssh $VM_USERNAME@$VM_IP "chmod +x ~/setup-azure-vm.sh && ~/setup-azure-vm.sh"

# Transfer the application package
echo ""
echo "Step 4: Transferring application files to VM..."
scp azure-deployment/crm-deploy.tar.gz $VM_USERNAME@$VM_IP:~/

# Extract and deploy the application
echo ""
echo "Step 5: Deploying application on VM..."
ssh $VM_USERNAME@$VM_IP << 'ENDSSH'
    # Extract the application
    cd ~
    tar -xzf crm-deploy.tar.gz
    
    # Move to application directory
    sudo mkdir -p /var/www/crm
    sudo chown -R $USER:$USER /var/www/crm
    sudo cp -r dist/* /var/www/crm/
    
    # Set proper permissions
    sudo chown -R www-data:www-data /var/www/crm
    sudo chmod -R 755 /var/www/crm
    
    # Restart Nginx
    sudo systemctl restart nginx
    
    # Clean up
    rm -rf dist package.json crm-deploy.tar.gz setup-azure-vm.sh
    
    echo ""
    echo "Deployment successful!"
ENDSSH

# Clean up local deployment package
rm azure-deployment/crm-deploy.tar.gz

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Your CRM is now accessible at: http://$VM_IP"
echo ""
echo "To verify deployment:"
echo "  ssh $VM_USERNAME@$VM_IP"
echo "  sudo systemctl status nginx"
echo ""