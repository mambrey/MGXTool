# Azure VM Deployment Package

This folder contains everything you need to deploy your Diageo AccountIQ to an Azure Virtual Machine without using GitHub.

## Quick Start

### 1. Build the Application (if not already done)

```bash
cd /workspace/shadcn-ui
pnpm run build
```

### 2. Deploy to Azure VM

```bash
cd azure-deployment
./deploy-to-azure.sh YOUR_VM_IP YOUR_USERNAME
```

Example:
```bash
./deploy-to-azure.sh 20.123.45.67 azureuser
```

### 3. Access Your Application

Open your browser:
```
http://YOUR_VM_IP
```

## Files in This Package

- **`setup-azure-vm.sh`** - Automated setup script that installs and configures:
  - Node.js 18.x
  - Nginx web server
  - PM2 process manager
  - Firewall rules
  - Application directory structure

- **`deploy-to-azure.sh`** - Deployment script that:
  - Transfers files to your VM
  - Runs the setup script
  - Deploys your application
  - Configures and starts the web server

- **`AZURE_VM_DEPLOYMENT.md`** - Complete deployment guide with:
  - Step-by-step Azure VM creation
  - Deployment instructions
  - Troubleshooting tips
  - Maintenance procedures
  - Security best practices

## Prerequisites

### On Your Local Machine:
- Built application (`dist` folder exists)
- SSH client installed
- SCP available (comes with SSH)

### Azure Account:
- Active Azure subscription
- Permission to create VMs

## Deployment Methods

### Option 1: Automated (Recommended)

Single command deployment:

```bash
./deploy-to-azure.sh YOUR_VM_IP YOUR_USERNAME
```

**Duration**: 5-10 minutes

### Option 2: Manual

For step-by-step control, see the detailed instructions in `AZURE_VM_DEPLOYMENT.md`.

## What Gets Deployed

Your Azure VM will have:

- **Web Server**: Nginx serving your CRM on port 80
- **Application**: Production-built React application
- **Security**: Firewall configured (SSH + HTTP)
- **Optimization**: Gzip compression, static asset caching
- **Reliability**: PM2 for process management

## After Deployment

1. **Access your CRM**: `http://YOUR_VM_IP`
2. **Configure Power Automate**: Update workflow URLs to use VM IP
3. **Optional**: Set up custom domain
4. **Optional**: Enable HTTPS with Let's Encrypt

## Updating Your Application

When you make changes:

```bash
# 1. Build locally
cd /workspace/shadcn-ui
pnpm run build

# 2. Deploy update
cd azure-deployment
./deploy-to-azure.sh YOUR_VM_IP YOUR_USERNAME
```

## Troubleshooting

### Cannot access application?

```bash
# SSH into VM
ssh YOUR_USERNAME@YOUR_VM_IP

# Check Nginx status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/error.log
```

### Deployment script fails?

```bash
# Verify dist folder exists
ls -la ../dist/

# Make scripts executable
chmod +x *.sh

# Run with verbose output
bash -x ./deploy-to-azure.sh YOUR_VM_IP YOUR_USERNAME
```

## Security Notes

- **SSH Keys**: Use SSH keys instead of passwords (more secure)
- **Firewall**: Only ports 22 (SSH) and 80 (HTTP) are open
- **Updates**: Keep your VM updated with `sudo apt-get update && sudo apt-get upgrade`
- **HTTPS**: Enable SSL/TLS for production use (see deployment guide)

## Cost Estimate

**Recommended VM**: Standard_B2s
- **Cost**: ~$30-40/month
- **Specs**: 2 vCPUs, 4 GB RAM
- **Suitable for**: Small teams (10-20 users)

**Cost Optimization**:
- Configure auto-shutdown for non-business hours
- Use Reserved Instances for long-term savings (up to 72% off)

## Support

For detailed instructions, troubleshooting, and maintenance procedures, see:

📖 **[AZURE_VM_DEPLOYMENT.md](./AZURE_VM_DEPLOYMENT.md)**

## Summary

This deployment package provides:

✅ **No GitHub Required** - Direct file transfer to VM
✅ **Automated Setup** - One-command deployment
✅ **Production Ready** - Nginx, security, optimization
✅ **Easy Updates** - Redeploy with same command
✅ **Comprehensive Guide** - Step-by-step instructions

Your Diageo AccountIQ will be running on Azure in minutes!