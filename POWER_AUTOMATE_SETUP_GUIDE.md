# Power Automate Integration Setup Guide

This guide will walk you through setting up Power Automate workflows to receive birthday and next contact date alerts from the Diageo AccountIQ Dashboard.

## Overview

The CRM Dashboard can automatically send alerts to Power Automate workflows when:
- A contact's birthday is approaching (configurable: 1-30 days in advance)
- A contact's next contact date is approaching (configurable: 1-7 days in advance)

These alerts can trigger various actions in Power Automate, such as:
- Sending email notifications to relationship owners
- Creating tasks in Microsoft Planner or To Do
- Posting messages to Microsoft Teams channels
- Updating records in other systems
- Creating calendar events

## Prerequisites

- Access to Power Automate (https://make.powerautomate.com)
- Microsoft 365 account with appropriate permissions
- Access to the CRM Dashboard codebase

## Part 1: Create Power Automate Workflows

### Step 1: Create Birthday Alert Workflow

1. **Navigate to Power Automate**
   - Go to https://make.powerautomate.com
   - Sign in with your Microsoft 365 account

2. **Create New Flow**
   - Click "Create" in the left sidebar
   - Select "Automated cloud flow"
   - Name it: "CRM Birthday Alert Handler"
   - Search for and select trigger: "When a HTTP request is received"
   - Click "Create"

3. **Configure HTTP Request Trigger**
   - In the trigger, click "Generate from sample"
   - Paste this JSON schema:
   ```json
   {
     "alertType": "birthday",
     "contactName": "John Doe",
     "contactEmail": "john.doe@example.com",
     "accountName": "Walmart",
     "birthdayDate": "2024-12-25T00:00:00Z",
     "daysUntilBirthday": 7,
     "priority": "medium",
     "relationshipOwner": "Sarah Johnson",
     "vicePresident": "Mike Chen",
     "description": "John Doe's birthday is in 7 days at Walmart",
     "timestamp": "2024-11-05T10:30:00Z"
   }
   ```
   - Click "Done"

4. **Add Actions to Your Workflow**

   **Example Action 1: Send Email to Relationship Owner**
   - Click "+ New step"
   - Search for "Send an email (V2)"
   - Configure:
     - **To**: Use dynamic content to select `relationshipOwner` email (you may need to map this)
     - **Subject**: `Birthday Reminder: @{triggerBody()?['contactName']}`
     - **Body**:
       ```
       Hi @{triggerBody()?['relationshipOwner']},

       This is a reminder that @{triggerBody()?['contactName']}'s birthday is coming up in @{triggerBody()?['daysUntilBirthday']} days.

       Account: @{triggerBody()?['accountName']}
       Birthday Date: @{triggerBody()?['birthdayDate']}
       Priority: @{triggerBody()?['priority']}

       Please consider reaching out to wish them a happy birthday!

       Best regards,
       CRM Alert System
       ```

   **Example Action 2: Post to Teams Channel**
   - Click "+ New step"
   - Search for "Post message in a chat or channel"
   - Configure:
     - **Post as**: Flow bot
     - **Post in**: Channel
     - **Team**: Select your team
     - **Channel**: Select your channel
     - **Message**:
       ```
       🎂 **Birthday Alert**
       
       **Contact**: @{triggerBody()?['contactName']}
       **Account**: @{triggerBody()?['accountName']}
       **Days Until Birthday**: @{triggerBody()?['daysUntilBirthday']}
       **Relationship Owner**: @{triggerBody()?['relationshipOwner']}
       **Priority**: @{triggerBody()?['priority']}
       ```

   **Example Action 3: Create Task in Planner**
   - Click "+ New step"
   - Search for "Create a task"
   - Configure:
     - **Group Id**: Select your group
     - **Plan Id**: Select your plan
     - **Title**: `Birthday: @{triggerBody()?['contactName']}`
     - **Due Date**: `@{triggerBody()?['birthdayDate']}`
     - **Description**: `@{triggerBody()?['description']}`
     - **Assigned User Ids**: Map to relationship owner

5. **Save and Get Workflow URL**
   - Click "Save" at the top
   - Go back to the HTTP trigger
   - Copy the "HTTP POST URL" - you'll need this later
   - It will look like: `https://prod-XX.region.logic.azure.com:443/workflows/xxxxx/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxx`

### Step 2: Create Next Contact Date Alert Workflow

1. **Create Another New Flow**
   - Click "Create" → "Automated cloud flow"
   - Name it: "CRM Next Contact Alert Handler"
   - Select trigger: "When a HTTP request is received"
   - Click "Create"

2. **Configure HTTP Request Trigger**
   - Click "Generate from sample"
   - Paste this JSON schema:
   ```json
   {
     "alertType": "next-contact",
     "contactName": "Jane Smith",
     "contactEmail": "jane.smith@example.com",
     "accountName": "Target",
     "nextContactDate": "2024-11-10T00:00:00Z",
     "daysUntilContact": 3,
     "priority": "high",
     "relationshipOwner": "Michael Chen",
     "vicePresident": "Emily Rodriguez",
     "description": "Follow up with Jane Smith at Target",
     "timestamp": "2024-11-05T10:30:00Z"
   }
   ```
   - Click "Done"

3. **Add Actions to Your Workflow**

   **Example Action 1: Send Email Reminder**
   - Add "Send an email (V2)" action
   - Configure:
     - **To**: Relationship owner email
     - **Subject**: `Follow-up Reminder: @{triggerBody()?['contactName']}`
     - **Body**:
       ```
       Hi @{triggerBody()?['relationshipOwner']},

       This is a reminder to follow up with @{triggerBody()?['contactName']} at @{triggerBody()?['accountName']}.

       Next Contact Date: @{triggerBody()?['nextContactDate']}
       Days Until Contact: @{triggerBody()?['daysUntilContact']}
       Priority: @{triggerBody()?['priority']}

       Please ensure you reach out before the scheduled date.

       Best regards,
       CRM Alert System
       ```

   **Example Action 2: Create Calendar Event**
   - Add "Create event (V4)" action
   - Configure:
     - **Calendar id**: Calendar
     - **Subject**: `Follow up: @{triggerBody()?['contactName']}`
     - **Start time**: `@{triggerBody()?['nextContactDate']}`
     - **End time**: Add 1 hour to start time
     - **Description**: `@{triggerBody()?['description']}`
     - **Required attendees**: Relationship owner email

   **Example Action 3: Post to Teams**
   - Add "Post message in a chat or channel" action
   - Configure similar to birthday workflow

4. **Save and Get Workflow URL**
   - Click "Save"
   - Copy the "HTTP POST URL" from the trigger
   - Store this URL securely

## Part 2: Configure CRM Dashboard

### Step 1: Update Environment Variables

1. **Create/Update `.env.local` file**
   
   In your project root (`/workspace/shadcn-ui/.env.local`), add:

   ```env
   # Power Automate Workflow URLs
   VITE_PA_BIRTHDAY_WORKFLOW_URL=https://prod-XX.region.logic.azure.com:443/workflows/xxxxx/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxx
   VITE_PA_NEXT_CONTACT_WORKFLOW_URL=https://prod-XX.region.logic.azure.com:443/workflows/xxxxx/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxx
   ```

   Replace the URLs with your actual Power Automate workflow URLs from Step 1.

2. **Update `.env.example` file**
   
   Add these lines to `/workspace/shadcn-ui/.env.example`:

   ```env
   # Power Automate Configuration
   VITE_PA_BIRTHDAY_WORKFLOW_URL=your-birthday-workflow-url-here
   VITE_PA_NEXT_CONTACT_WORKFLOW_URL=your-next-contact-workflow-url-here
   ```

### Step 2: Restart Development Server

```bash
cd /workspace/shadcn-ui
pnpm run dev
```

## Part 3: Test the Integration

### Test from CRM Dashboard

1. **Navigate to Alert System**
   - Open your CRM Dashboard
   - Go to the Alert System page

2. **Look for Power Automate Status**
   - You should see a status indicator showing Power Automate is connected
   - Alerts eligible for Power Automate will have a "Send to Power Automate" button

3. **Test Birthday Alert**
   - Create or edit a contact with a birthday within 30 days
   - Enable "Birthday Alert" toggle
   - Go to Alert System
   - Click "Send to Power Automate" on the birthday alert
   - Check your email/Teams/Planner for the notification

4. **Test Next Contact Alert**
   - Create or edit a contact with next contact date within 7 days
   - Enable "Next Contact Alert" toggle
   - Go to Alert System
   - Click "Send to Power Automate" on the follow-up alert
   - Verify the notification was received

### Test from Power Automate

1. **Test Birthday Workflow**
   - Go to your "CRM Birthday Alert Handler" flow
   - Click "Test" → "Manually"
   - Click "Test" again
   - Use the test payload provided in the setup
   - Verify actions execute successfully

2. **Test Next Contact Workflow**
   - Go to your "CRM Next Contact Alert Handler" flow
   - Follow same testing steps
   - Verify all actions complete

## Advanced Configuration

### Automatic Alert Sending

To automatically send alerts to Power Automate when they're generated:

1. The CRM Dashboard can be configured to automatically send alerts
2. Edit `/workspace/shadcn-ui/src/components/AlertSystem.tsx`
3. Look for the `useEffect` that generates alerts
4. Add automatic sending logic after alert generation

### Custom Alert Thresholds

Modify alert generation logic in `AlertSystem.tsx`:

```typescript
// Birthday alerts - change from 30 days to your preference
if (daysUntilBirthday <= 30) { // Change this number

// Next contact alerts - change from 7 days to your preference
if (daysUntilContact <= 7 || daysUntilContact < 0) { // Change this number
```

### Adding More Workflow Types

To add additional alert types (e.g., contract renewals):

1. Create new Power Automate workflow
2. Add workflow URL to `.env.local`
3. Update `power-automate.ts` service with new method
4. Update `AlertSystem.tsx` to trigger new alert type

## Troubleshooting

### Issue: Workflow URL not working
**Solution**: 
- Verify the URL is complete and includes the signature parameter
- Check that the workflow is turned ON in Power Automate
- Ensure there are no typos in the `.env.local` file

### Issue: Alerts not sending
**Solution**:
- Check browser console for error messages
- Verify Power Automate integration is enabled (check status indicator)
- Test the workflow manually in Power Automate first

### Issue: Email not received
**Solution**:
- Check spam/junk folders
- Verify email addresses are correct in Power Automate
- Check Power Automate run history for errors

### Issue: CORS errors
**Solution**:
- Power Automate HTTP triggers should allow CORS by default
- If issues persist, check Power Automate connector settings

## Security Best Practices

1. **Protect Workflow URLs**
   - Never commit `.env.local` to version control
   - Workflow URLs contain security tokens - treat them as secrets
   - Rotate workflow URLs periodically by regenerating them

2. **Validate Input**
   - Power Automate workflows should validate incoming data
   - Add conditions to check for required fields
   - Implement error handling in workflows

3. **Monitor Usage**
   - Check Power Automate run history regularly
   - Set up alerts for workflow failures
   - Monitor for unusual activity

4. **Access Control**
   - Limit who can edit Power Automate workflows
   - Use Azure AD groups for team access
   - Implement approval processes for sensitive actions

## Production Deployment

When deploying to production:

1. **Use Environment Variables**
   - Configure workflow URLs in your hosting platform's environment variables
   - Don't hardcode URLs in the application

2. **Set Up Monitoring**
   - Enable Application Insights for Power Automate
   - Set up alerts for workflow failures
   - Monitor API call volumes

3. **Implement Rate Limiting**
   - Power Automate has usage limits
   - Implement batching for multiple alerts
   - Consider queueing mechanisms for high volumes

4. **Documentation**
   - Document all workflows and their purposes
   - Keep this guide updated with any changes
   - Train team members on the system

## Support

If you encounter issues:
1. Check Power Automate run history for error details
2. Review browser console for client-side errors
3. Verify environment variables are set correctly
4. Test workflows manually before troubleshooting integration

---

**Created**: 2024-11-05  
**Last Updated**: 2024-11-05  
**Version**: 1.0