# Strategic Accounts CRM - Azure VM Deployment Package

**Quick Start Guide for Deploying to Azure Virtual Machine**

This package contains everything you need to deploy your Strategic Accounts CRM to an Azure VM without using GitHub. All files transfer directly from your local machine to the Azure VM.

---

## 📦 Package Contents

```
crm-deployment-package/
├── dist/                          # Production-built application (ready to deploy)
├── azure-deployment/              # Deployment scripts and guides
│   ├── setup-azure-vm.sh         # VM setup automation script
│   ├── deploy-to-azure.sh        # Deployment automation script
│   ├── AZURE_VM_DEPLOYMENT.md    # Complete deployment guide
│   └── README.md                 # Azure deployment overview
├── package.json                   # Project dependencies
├── .env.example                   # Environment configuration template
└── QUICK_START.md                # This file
```

---

## 🚀 Quick Deployment (3 Steps)

### Step 1: Create Azure VM (5 minutes)

1. Go to **Azure Portal**: https://portal.azure.com
2. Click **"Create a resource"** → **"Virtual Machine"**
3. Configure:
   - **Image**: Ubuntu Server 22.04 LTS
   - **Size**: Standard_B2s (2 vCPUs, 4 GB RAM)
   - **Authentication**: SSH public key or Password
   - **Inbound ports**: Allow SSH (22) and HTTP (80)
4. Click **"Review + Create"** → **"Create"**
5. **Save your VM's Public IP address** (e.g., 20.123.45.67)

### Step 2: Upload Package to Your Computer

1. Extract this package to your local machine
2. Open Terminal/Command Prompt
3. Navigate to the package folder:
   ```bash
   cd /path/to/crm-deployment-package
   ```

### Step 3: Deploy to Azure VM (One Command!)

```bash
cd azure-deployment
chmod +x *.sh
./deploy-to-azure.sh YOUR_VM_IP YOUR_USERNAME
```

**Example:**
```bash
./deploy-to-azure.sh 20.123.45.67 azureuser
```

**That's it!** Your CRM will be live at `http://YOUR_VM_IP` in 5-10 minutes.

---

## 🔄 Updating Your Application (YES, You Can!)

**Answer to your question: "Can I upload new versions?"**

**YES!** Updating is super easy. When you make changes:

### Method 1: Using the Deployment Script (Recommended)

1. Get the new version of your CRM (new deployment package)
2. Extract it on your local machine
3. Run the same deployment command:
   ```bash
   cd azure-deployment
   ./deploy-to-azure.sh YOUR_VM_IP YOUR_USERNAME
   ```

The script will:
- Transfer the new files
- Replace the old version
- Restart the web server
- Your updated CRM is live!

### Method 2: Manual Update (If You Prefer)

```bash
# 1. SSH into your VM
ssh YOUR_USERNAME@YOUR_VM_IP

# 2. Backup current version (optional but recommended)
sudo tar -czf ~/crm-backup-$(date +%Y%m%d).tar.gz /var/www/crm

# 3. On your local machine, transfer new dist folder
scp -r dist/* YOUR_USERNAME@YOUR_VM_IP:~/new-dist/

# 4. Back on VM, update the application
ssh YOUR_USERNAME@YOUR_VM_IP
sudo rm -rf /var/www/crm/*
sudo cp -r ~/new-dist/* /var/www/crm/
sudo chown -R www-data:www-data /var/www/crm
sudo systemctl restart nginx

# Done! New version is live
```

### Method 3: Automated Update Script

Create a simple update script on your local machine:

```bash
#!/bin/bash
# save as update-crm.sh

VM_IP="YOUR_VM_IP"
VM_USER="YOUR_USERNAME"

echo "Updating CRM on Azure VM..."

# Transfer new files
scp -r dist/* $VM_USER@$VM_IP:~/new-dist/

# Deploy on VM
ssh $VM_USER@$VM_IP << 'EOF'
    sudo rm -rf /var/www/crm/*
    sudo cp -r ~/new-dist/* /var/www/crm/
    sudo chown -R www-data:www-data /var/www/crm
    sudo systemctl restart nginx
    rm -rf ~/new-dist
EOF

echo "Update complete! Visit http://$VM_IP"
```

Make it executable and run:
```bash
chmod +x update-crm.sh
./update-crm.sh
```

---

## 📋 Detailed Deployment Instructions

For complete step-by-step instructions, see:

📖 **`azure-deployment/AZURE_VM_DEPLOYMENT.md`**

This guide includes:
- Detailed Azure VM creation with screenshots references
- SSH key setup
- Manual deployment steps
- Custom domain configuration
- HTTPS/SSL setup
- Troubleshooting
- Security best practices

---

## 🔧 What Happens During Deployment

The deployment script automatically:

1. **Transfers setup script** to your VM
2. **Installs required software**:
   - Node.js 18.x
   - Nginx web server
   - PM2 process manager
3. **Configures Nginx** to serve your CRM
4. **Sets up firewall** (ports 22, 80)
5. **Transfers your application** files
6. **Deploys to web directory** (`/var/www/crm`)
7. **Starts the web server**

**Duration**: 5-10 minutes total

---

## 🌐 Accessing Your CRM

After deployment, open your browser:

```
http://YOUR_VM_IP
```

**Example**: `http://20.123.45.67`

You should see your Strategic Accounts CRM login page!

---

## 🔒 Security Notes

### What's Configured:
- ✅ Firewall enabled (only SSH and HTTP)
- ✅ Nginx security headers
- ✅ File permissions set correctly
- ✅ SSH key authentication (if you chose it)

### Recommended Next Steps:
1. **Enable HTTPS** (see deployment guide)
2. **Configure custom domain** (optional)
3. **Set up automatic backups**
4. **Keep VM updated**: `sudo apt-get update && sudo apt-get upgrade`

---

## 💡 Common Questions

### Q: Can I update the application after deployment?
**A: YES!** Just run the deployment script again with the new version. See "Updating Your Application" section above.

### Q: Do I need GitHub?
**A: NO!** Everything transfers directly from your local machine to the Azure VM via SCP.

### Q: What if I make a mistake?
**A: No problem!** You can redeploy anytime. The script will replace the old version with the new one.

### Q: Can I use a custom domain?
**A: YES!** See the `AZURE_VM_DEPLOYMENT.md` guide for instructions on setting up a custom domain like `crm.yourcompany.com`.

### Q: Is HTTPS/SSL included?
**A: Not by default**, but the deployment guide includes instructions for setting up free SSL certificates with Let's Encrypt.

### Q: How much does it cost?
**A: ~$30-40/month** for the recommended Standard_B2s VM. You can reduce costs with auto-shutdown during non-business hours.

### Q: Can multiple people use it?
**A: YES!** The recommended VM size supports 10-20 concurrent users comfortably.

---

## 🛠️ Troubleshooting

### Cannot access the application?

**Check 1: VM is running**
- Go to Azure Portal
- Verify VM status is "Running"

**Check 2: Nginx is running**
```bash
ssh YOUR_USERNAME@YOUR_VM_IP
sudo systemctl status nginx
```

If not running:
```bash
sudo systemctl start nginx
```

**Check 3: Firewall allows HTTP**
```bash
sudo ufw status
```

Should show port 80 is allowed.

### Deployment script fails?

**Check 1: Verify package contents**
```bash
ls -la dist/
ls -la azure-deployment/
```

**Check 2: Make scripts executable**
```bash
cd azure-deployment
chmod +x *.sh
```

**Check 3: Test SSH connection**
```bash
ssh YOUR_USERNAME@YOUR_VM_IP
```

If this fails, check your VM's network security group in Azure Portal.

---

## 📞 Support Resources

### Documentation Files:
- **QUICK_START.md** (this file) - Quick deployment guide
- **azure-deployment/README.md** - Azure deployment overview
- **azure-deployment/AZURE_VM_DEPLOYMENT.md** - Complete detailed guide

### Useful Commands:

```bash
# SSH into VM
ssh YOUR_USERNAME@YOUR_VM_IP

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory usage
free -h
```

---

## 🎯 Next Steps After Deployment

1. **✅ Verify deployment** - Access `http://YOUR_VM_IP` and test all features
2. **🔐 Configure Power Automate** - Update workflow URLs to use VM IP
3. **🌐 Set up custom domain** (optional) - See deployment guide
4. **🔒 Enable HTTPS** (recommended) - See deployment guide
5. **📧 Configure email notifications** - Update alert system settings
6. **👥 Train your team** - Share the VM IP with team members

---

## 📊 System Requirements

### Azure VM (Recommended):
- **Image**: Ubuntu Server 22.04 LTS
- **Size**: Standard_B2s minimum
  - 2 vCPUs
  - 4 GB RAM
  - ~$30-40/month
- **Storage**: 30 GB (default is sufficient)
- **Network**: Standard networking

### Local Machine:
- SSH client (built into Mac/Linux, use PuTTY on Windows)
- SCP available (comes with SSH)
- Terminal/Command Prompt access

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Can access CRM at `http://YOUR_VM_IP`
- [ ] Login page loads correctly
- [ ] Can navigate between tabs (Contacts, Accounts, Tasks, Documents)
- [ ] Alert system is accessible
- [ ] Market data displays correctly
- [ ] All features work as expected

If all items are checked, **congratulations!** Your CRM is successfully deployed! 🚀

---

## 📝 Version Control

To keep track of your deployments:

1. **Create a deployment log** on your local machine:
   ```bash
   echo "$(date): Deployed version X.X to Azure VM" >> deployment-log.txt
   ```

2. **Backup before updates**:
   ```bash
   ssh YOUR_USERNAME@YOUR_VM_IP
   sudo tar -czf ~/crm-backup-$(date +%Y%m%d).tar.gz /var/www/crm
   ```

3. **Download backups** to your local machine:
   ```bash
   scp YOUR_USERNAME@YOUR_VM_IP:~/crm-backup-*.tar.gz ~/backups/
   ```

---

## 🚀 You're Ready!

This package contains everything needed to deploy your Strategic Accounts CRM to Azure VM.

**Simple deployment**: Run one command and you're live in 10 minutes.

**Easy updates**: Run the same command to deploy new versions anytime.

**No GitHub needed**: Everything stays internal to your infrastructure.

**Questions?** Check the detailed guide in `azure-deployment/AZURE_VM_DEPLOYMENT.md`

---

**Happy Deploying! 🎊**

Your Strategic Accounts CRM will be running on Azure in minutes!