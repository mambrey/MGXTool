# GitHub Pages Deployment Guide

This guide explains how to deploy the Strategic Accounts CRM Dashboard to GitHub Pages.

## Prerequisites

- Repository: https://github.com/mambrey/MGXTool
- GitHub account with access to the repository
- Repository must be public (or GitHub Pro for private repos)

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository: https://github.com/mambrey/MGXTool
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select:
   - Source: **GitHub Actions**
5. Save the settings

### 2. Push Your Code

The GitHub Actions workflow is already configured in `.github/workflows/deploy.yml`. Simply push your code to the `main` branch:

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

### 3. Monitor Deployment

1. Go to the **Actions** tab in your repository
2. You should see a workflow run called "Deploy to GitHub Pages"
3. Wait for the workflow to complete (usually takes 2-3 minutes)
4. Once completed, your site will be live!

## Accessing Your Deployed Site

Your CRM Dashboard will be available at:

**https://mambrey.github.io/MGXTool**

## How It Works

### Automatic Deployments

- Every time you push to the `main` branch, GitHub Actions automatically:
  1. Checks out your code
  2. Installs dependencies using pnpm
  3. Builds the project using Vite
  4. Deploys the built files to GitHub Pages

### Configuration Details

- **Base Path**: The site is configured with base path `/MGXTool/` in `vite.config.ts`
- **Build Output**: The `dist` folder is deployed to GitHub Pages
- **Jekyll**: Disabled via `.nojekyll` file to prevent GitHub from processing files

## Environment Variables

⚠️ **Important**: GitHub Pages is a static hosting service. For security reasons:

1. **DO NOT** commit sensitive API keys to the repository
2. API keys in `.env` files are NOT available in the deployed site
3. For production deployment with sensitive data, consider:
   - Using backend services to proxy API calls
   - Deploying to platforms that support environment variables (Vercel, Netlify, Azure)
   - Implementing server-side API routes

### Current API Dependencies

The CRM Dashboard uses:
- **Alpha Vantage API**: For market data
- **Google Maps API**: For location features
- **SharePoint/Power Automate**: For document management

For GitHub Pages deployment, you may need to:
- Implement a backend proxy for API calls
- Use client-side API keys (with domain restrictions)
- Mock data for demonstration purposes

## Troubleshooting

### Site Not Loading

1. Check if the workflow completed successfully in the Actions tab
2. Verify GitHub Pages is enabled in Settings
3. Clear your browser cache and try again
4. Check the browser console for errors

### 404 Errors on Routes

- Ensure all internal links use the base path `/MGXTool/`
- React Router may need additional configuration for GitHub Pages

### Build Failures

1. Check the Actions tab for error messages
2. Ensure all dependencies are listed in `package.json`
3. Test the build locally: `pnpm run build`

## Local Testing

To test the production build locally with the correct base path:

```bash
pnpm run build
pnpm run preview
```

Then navigate to: http://localhost:4173/MGXTool/

## Updating the Deployment

To update your deployed site:

1. Make changes to your code
2. Commit and push to the `main` branch:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. GitHub Actions will automatically rebuild and redeploy

## Alternative Deployment Options

If GitHub Pages doesn't meet your needs (e.g., you need environment variables, server-side rendering, or backend APIs), consider:

- **Vercel**: Excellent for React apps, supports environment variables
- **Netlify**: Similar to Vercel with great CI/CD
- **Azure Static Web Apps**: Integrates well with your existing Azure setup
- **AWS Amplify**: Full-stack deployment with backend support

## Support

For issues specific to:
- **GitHub Pages**: Check [GitHub Pages documentation](https://docs.github.com/en/pages)
- **GitHub Actions**: Check [GitHub Actions documentation](https://docs.github.com/en/actions)
- **This Project**: Refer to the main README.md and technical documentation

## Security Notes

- GitHub Pages sites are always public, even for private repositories
- Never commit sensitive credentials or API keys
- Use environment-specific configurations for different deployment targets
- Consider implementing authentication if the CRM contains sensitive data