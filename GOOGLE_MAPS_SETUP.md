# Google Maps API Setup Guide

This guide will help you set up Google Maps API for address autocomplete functionality in the CRM system.

## Features Enabled by Google Maps API

1. **Address Autocomplete**: When users type an address in Account or Contact forms, they get real-time suggestions
2. **Location Display**: Interactive maps showing account headquarters locations
3. **Address Validation**: Automatic formatting and validation of addresses

## Step-by-Step Setup Instructions

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click "Select a project" → "New Project"
4. Enter a project name (e.g., "CRM System")
5. Click "Create"

### 2. Enable Required APIs

You need to enable three APIs for full functionality:

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for and enable each of these APIs:
   - **Maps JavaScript API** (for displaying maps)
   - **Places API** (for address autocomplete)
   - **Geocoding API** (for converting addresses to coordinates)

To enable each API:
- Click on the API name
- Click the "Enable" button
- Wait for the API to be enabled

### 3. Create an API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API key**
3. A dialog will appear with your new API key
4. Click "COPY" to copy the key
5. **Important**: Click "RESTRICT KEY" to secure your API key

### 4. Restrict Your API Key (Recommended)

For security, you should restrict your API key:

#### Application Restrictions:
1. Select **HTTP referrers (websites)**
2. Add your website URLs:
   - For development: `http://localhost:*/*`
   - For production: `https://yourdomain.com/*`
   - You can add multiple referrers

#### API Restrictions:
1. Select **Restrict key**
2. Choose these APIs from the dropdown:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. Click "Save"

### 5. Configure the CRM System

1. Open the `.env` file in the project root
2. Find the line: `VITE_GOOGLE_MAPS_API_KEY=`
3. Paste your API key after the equals sign:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyAbc123YourActualAPIKeyHere
   ```
4. Save the file
5. **Restart the development server** for changes to take effect:
   ```bash
   # Stop the server (Ctrl+C)
   # Start it again
   pnpm run dev
   ```

## Verifying the Setup

### Test Address Autocomplete:

1. Go to **Accounts** → **Add Account**
2. Click on the "Parent Company Address" field
3. Start typing an address (e.g., "1600 Pennsylvania")
4. You should see autocomplete suggestions appear

If you see:
- ✅ **Autocomplete suggestions**: API is working correctly
- ⚠️ **"(Google Autocomplete enabled)"** label: API key is configured
- ⚠️ **"(Set VITE_GOOGLE_MAPS_API_KEY for autocomplete)"**: API key is not configured
- ❌ **Error message**: Check your API key and restrictions

### Test Map Display:

1. Create or edit an account with an address
2. View the account details
3. Scroll to the "Headquarters" section
4. You should see an interactive Google Map with a marker

## Troubleshooting

### Problem: Autocomplete not working

**Possible causes:**
1. API key not configured in `.env` file
2. Development server not restarted after adding API key
3. Places API not enabled in Google Cloud Console
4. API key restrictions too strict

**Solutions:**
1. Verify the API key is in `.env` file
2. Restart the development server
3. Check that Places API is enabled
4. Temporarily remove API restrictions to test

### Problem: Map not displaying

**Possible causes:**
1. Maps JavaScript API not enabled
2. Geocoding API not enabled
3. Invalid address format
4. API key restrictions

**Solutions:**
1. Enable Maps JavaScript API in Google Cloud Console
2. Enable Geocoding API
3. Try a different, well-known address
4. Check API restrictions

### Problem: "RefererNotAllowedMapError"

**Cause:** Your website URL is not in the API key's allowed referrers

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Click on your API key
3. Under "Application restrictions", add your website URL
4. For development, add: `http://localhost:*/*`
5. Click "Save"

### Problem: "ApiNotActivatedMapError"

**Cause:** Required APIs are not enabled

**Solution:**
1. Go to Google Cloud Console → APIs & Services → Library
2. Enable all three required APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API

## Cost Information

Google Maps Platform offers a **$200 monthly free credit** which covers:
- ~28,000 map loads per month
- ~100,000 autocomplete requests per month
- ~40,000 geocoding requests per month

For most small to medium CRM deployments, this free tier is sufficient.

**To monitor usage:**
1. Go to Google Cloud Console
2. Navigate to **Billing** → **Reports**
3. Filter by "Maps" services

## Security Best Practices

1. ✅ **Always restrict your API key** to specific websites
2. ✅ **Limit API access** to only the three required APIs
3. ✅ **Never commit** your API key to version control
4. ✅ **Rotate keys regularly** if they become exposed
5. ✅ **Monitor usage** to detect unauthorized use

## Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)

## Support

If you encounter issues not covered in this guide:
1. Check the browser console for error messages
2. Verify all APIs are enabled in Google Cloud Console
3. Ensure your API key has the correct restrictions
4. Test with a fresh API key to rule out configuration issues