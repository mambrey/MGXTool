# Azure VM Deployment Guide for Strategic Accounts CRM

This guide provides step-by-step instructions for deploying your Strategic Accounts CRM to an Azure Virtual Machine without using GitHub.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create Azure VM](#create-azure-vm)
3. [Prepare Your Local Machine](#prepare-your-local-machine)
4. [Deploy to Azure VM](#deploy-to-azure-vm)
5. [Access Your Application](#access-your-application)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## Prerequisites

### On Your Local Machine:
- Built application (`dist` folder) - Run `pnpm run build` if not already done
- SSH client installed
- SCP (Secure Copy) available (comes with SSH on most systems)

### Azure Account:
- Active Azure subscription
- Permission to create Virtual Machines

---

## Create Azure VM

### Step 1: Create a New Virtual Machine

1. **Log in to Azure Portal**: https://portal.azure.com

2. **Create VM**:
   - Click **"Create a resource"** → **"Virtual Machine"**
   - Or search for "Virtual Machines" and click **"Create"**

3. **Basic Configuration**:
   ```
   Subscription: [Your subscription]
   Resource Group: Create new → "crm-resources"
   Virtual Machine Name: "crm-vm"
   Region: [Choose closest to your users]
   Image: Ubuntu Server 22.04 LTS
   Size: Standard_B2s (2 vCPUs, 4 GB RAM) - Minimum recommended
   ```

4. **Administrator Account**:
   ```
   Authentication type: SSH public key (recommended) or Password
   Username: azureuser (or your preferred username)
   
   For SSH Key:
   - Select "Generate new key pair"
   - Key pair name: "crm-vm-key"
   - Download the private key (.pem file) when prompted
   
   For Password:
   - Create a strong password and save it securely
   ```

5. **Inbound Port Rules**:
   - Select: **SSH (22)** and **HTTP (80)**
   - HTTPS (443) can be added later if needed

6. **Review + Create**:
   - Review your settings
   - Click **"Create"**
   - Wait for deployment to complete (2-3 minutes)

### Step 2: Get Your VM's IP Address

1. Go to your VM resource in Azure Portal
2. Find **"Public IP address"** in the Overview section
3. Copy this IP address (e.g., `20.123.45.67`)

### Step 3: Configure SSH Access (If Using SSH Key)

On your local machine:

```bash
# Move the downloaded key to SSH directory
mv ~/Downloads/crm-vm-key.pem ~/.ssh/

# Set correct permissions
chmod 400 ~/.ssh/crm-vm-key.pem

# Test SSH connection
ssh -i ~/.ssh/crm-vm-key.pem azureuser@YOUR_VM_IP
```

If using password authentication, simply use:
```bash
ssh azureuser@YOUR_VM_IP
```

---

## Prepare Your Local Machine

### Step 1: Build the Application

Navigate to your project directory and build:

```bash
cd /path/to/shadcn-ui
pnpm run build
```

This creates the `dist` folder with production-ready files.

### Step 2: Make Deployment Scripts Executable

```bash
cd azure-deployment
chmod +x setup-azure-vm.sh
chmod +x deploy-to-azure.sh
```

---

## Deploy to Azure VM

### Option 1: Automated Deployment (Recommended)

Use the deployment script for one-command deployment:

```bash
cd azure-deployment
./deploy-to-azure.sh YOUR_VM_IP azureuser
```

**If using SSH key:**
```bash
ssh-add ~/.ssh/crm-vm-key.pem
./deploy-to-azure.sh YOUR_VM_IP azureuser
```

The script will:
1. Transfer the setup script to your VM
2. Run the setup script (installs Node.js, Nginx, PM2)
3. Transfer your application files
4. Deploy and configure everything
5. Start the web server

**Expected duration**: 5-10 minutes

---

### Option 2: Manual Deployment

If you prefer manual control:

#### Step 1: Transfer Setup Script

```bash
scp setup-azure-vm.sh azureuser@YOUR_VM_IP:~/
```

#### Step 2: SSH into VM and Run Setup

```bash
ssh azureuser@YOUR_VM_IP
chmod +x setup-azure-vm.sh
./setup-azure-vm.sh
```

Wait for setup to complete.

#### Step 3: Transfer Application Files

On your local machine:

```bash
# Create deployment package
cd /path/to/shadcn-ui
tar -czf crm-deploy.tar.gz dist

# Transfer to VM
scp crm-deploy.tar.gz azureuser@YOUR_VM_IP:~/
```

#### Step 4: Deploy Application on VM

SSH back into your VM:

```bash
ssh azureuser@YOUR_VM_IP

# Extract application
tar -xzf crm-deploy.tar.gz

# Deploy to web directory
sudo mkdir -p /var/www/crm
sudo chown -R $USER:$USER /var/www/crm
sudo cp -r dist/* /var/www/crm/

# Set permissions
sudo chown -R www-data:www-data /var/www/crm
sudo chmod -R 755 /var/www/crm

# Restart Nginx
sudo systemctl restart nginx

# Clean up
rm -rf dist crm-deploy.tar.gz setup-azure-vm.sh
```

---

## Access Your Application

### Step 1: Open Your CRM

Open your web browser and navigate to:
```
http://YOUR_VM_IP
```

You should see your Strategic Accounts CRM application!

### Step 2: Verify Deployment

Check that all features are working:
- ✅ Login page loads
- ✅ Navigation works
- ✅ Contacts, Accounts, Tasks, Documents tabs function
- ✅ Alert system is accessible
- ✅ Market data displays correctly

---

## Post-Deployment Configuration

### 1. Configure Power Automate (If Applicable)

Update your Power Automate workflows to point to the new VM IP address:

```
Old: http://localhost:5173
New: http://YOUR_VM_IP
```

### 2. Set Up Custom Domain (Optional)

To use a custom domain like `crm.yourcompany.com`:

1. **In Azure Portal**:
   - Go to your VM → Networking
   - Note the Public IP address
   - Or create a DNS name label

2. **In Your Domain Registrar**:
   - Add an A record pointing to your VM's IP
   - Example: `crm.yourcompany.com` → `20.123.45.67`

3. **Update Nginx Configuration**:
   ```bash
   ssh azureuser@YOUR_VM_IP
   sudo nano /etc/nginx/sites-available/crm
   ```
   
   Change `server_name _;` to:
   ```nginx
   server_name crm.yourcompany.com;
   ```
   
   Save and restart:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### 3. Enable HTTPS (Recommended for Production)

Install Let's Encrypt SSL certificate:

```bash
ssh azureuser@YOUR_VM_IP

# Install Certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d crm.yourcompany.com

# Auto-renewal is configured automatically
```

### 4. Configure Firewall for HTTPS

In Azure Portal:
- Go to VM → Networking → Add inbound port rule
- Port: 443
- Protocol: TCP
- Name: HTTPS

---

## Troubleshooting

### Issue: Cannot Access Application

**Check 1: Nginx Status**
```bash
ssh azureuser@YOUR_VM_IP
sudo systemctl status nginx
```

If not running:
```bash
sudo systemctl start nginx
```

**Check 2: Firewall Rules**
```bash
sudo ufw status
```

Ensure ports 80 and 22 are allowed:
```bash
sudo ufw allow 80
sudo ufw allow 22
```

**Check 3: Azure Network Security Group**
- Go to Azure Portal → Your VM → Networking
- Verify inbound rules allow HTTP (80) and SSH (22)

### Issue: Application Files Not Loading

**Check file permissions:**
```bash
ssh azureuser@YOUR_VM_IP
ls -la /var/www/crm/
```

Should show `www-data` as owner. If not:
```bash
sudo chown -R www-data:www-data /var/www/crm
sudo chmod -R 755 /var/www/crm
```

### Issue: Nginx Configuration Errors

**Test configuration:**
```bash
sudo nginx -t
```

**View error logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Common fixes:**
```bash
# Restart Nginx
sudo systemctl restart nginx

# Reload configuration
sudo systemctl reload nginx
```

### Issue: SSH Connection Refused

**Check VM is running:**
- In Azure Portal, verify VM status is "Running"
- If stopped, click "Start"

**Verify SSH key permissions:**
```bash
chmod 400 ~/.ssh/crm-vm-key.pem
```

**Try with verbose output:**
```bash
ssh -v -i ~/.ssh/crm-vm-key.pem azureuser@YOUR_VM_IP
```

### Issue: Deployment Script Fails

**Check prerequisites:**
```bash
# Verify dist folder exists
ls -la dist/

# Verify scripts are executable
ls -la azure-deployment/*.sh
```

**Run with verbose output:**
```bash
bash -x ./deploy-to-azure.sh YOUR_VM_IP azureuser
```

---

## Maintenance

### Update Application

When you make changes to your CRM:

1. **Build locally:**
   ```bash
   cd /path/to/shadcn-ui
   pnpm run build
   ```

2. **Deploy update:**
   ```bash
   cd azure-deployment
   ./deploy-to-azure.sh YOUR_VM_IP azureuser
   ```

### Monitor Application

**Check Nginx logs:**
```bash
ssh azureuser@YOUR_VM_IP
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Check system resources:**
```bash
# CPU and memory usage
top

# Disk usage
df -h
```

### Backup Application

**Create backup:**
```bash
ssh azureuser@YOUR_VM_IP
sudo tar -czf ~/crm-backup-$(date +%Y%m%d).tar.gz /var/www/crm
```

**Download backup:**
```bash
scp azureuser@YOUR_VM_IP:~/crm-backup-*.tar.gz ~/backups/
```

### Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt-get update
   sudo apt-get upgrade -y
   ```

2. **Configure automatic security updates:**
   ```bash
   sudo apt-get install unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

3. **Monitor failed login attempts:**
   ```bash
   sudo grep "Failed password" /var/log/auth.log
   ```

4. **Change default SSH port (optional):**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Change Port 22 to Port 2222
   sudo systemctl restart sshd
   ```

---

## Cost Optimization

### Azure VM Pricing

**Standard_B2s** (recommended minimum):
- ~$30-40/month
- 2 vCPUs, 4 GB RAM
- Suitable for small teams (10-20 users)

**To reduce costs:**

1. **Auto-shutdown**: Configure in Azure Portal
   - VM → Auto-shutdown
   - Set schedule for non-business hours

2. **Reserved Instances**: Save up to 72%
   - Commit to 1 or 3 years
   - Purchase in Azure Portal

3. **Deallocate when not in use:**
   ```bash
   # Stop VM (still charged for storage)
   az vm stop --resource-group crm-resources --name crm-vm
   
   # Deallocate VM (not charged)
   az vm deallocate --resource-group crm-resources --name crm-vm
   
   # Start VM
   az vm start --resource-group crm-resources --name crm-vm
   ```

---

## Additional Resources

### Useful Commands

```bash
# SSH into VM
ssh azureuser@YOUR_VM_IP

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check disk usage
df -h

# Check memory usage
free -h

# View running processes
top
```

### Azure CLI Commands

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# List VMs
az vm list --output table

# Get VM IP
az vm show -d -g crm-resources -n crm-vm --query publicIps -o tsv

# Stop VM
az vm stop -g crm-resources -n crm-vm

# Start VM
az vm start -g crm-resources -n crm-vm
```

---

## Support

If you encounter issues not covered in this guide:

1. **Check Azure VM logs** in Azure Portal → VM → Boot diagnostics
2. **Review Nginx error logs**: `sudo tail -f /var/log/nginx/error.log`
3. **Verify network connectivity**: `ping YOUR_VM_IP`
4. **Check Azure Service Health** for any platform issues

---

## Summary

You've successfully deployed your Strategic Accounts CRM to Azure VM! 🎉

**Key Points:**
- ✅ Application runs on Ubuntu VM with Nginx
- ✅ Accessible at `http://YOUR_VM_IP`
- ✅ No GitHub dependency - all files transferred directly
- ✅ Automated deployment script for updates
- ✅ Production-ready configuration

**Next Steps:**
1. Configure custom domain (optional)
2. Enable HTTPS with Let's Encrypt
3. Set up regular backups
4. Configure Power Automate with new URL
5. Train your team on accessing the application

Your CRM is now live and ready for your team to use!