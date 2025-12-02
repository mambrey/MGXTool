# Strategic Accounts CRM Dashboard - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [Data Models](#data-models)
7. [SharePoint Integration](#sharepoint-integration)
8. [Power Automate Integration](#power-automate-integration)
9. [Alert System](#alert-system)
10. [Features](#features)
11. [Installation & Setup](#installation--setup)
12. [Configuration](#configuration)
13. [API Reference](#api-reference)
14. [Development Guidelines](#development-guidelines)
15. [Deployment](#deployment)
16. [Troubleshooting](#troubleshooting)

## Overview

The Strategic Accounts CRM Dashboard is a comprehensive customer relationship management platform built with React, TypeScript, and Tailwind CSS. It provides sophisticated account and contact management capabilities with integrated SharePoint document storage, Power Automate workflow automation, and real-time filtering functionality.

### Key Capabilities
- **Account Management**: Comprehensive account profiles with revenue tracking
- **Contact Management**: Detailed contact relationships with hierarchy visualization
- **Document Storage**: SharePoint-integrated document management
- **Alert System**: Proactive notifications for birthdays, follow-ups, tasks, JBP, and events
- **Power Automate Integration**: Automated email notifications and workflow triggers
- **Task Management**: Integrated task tracking with Power Automate
- **Advanced Filtering**: Owner and VP-based filtering across all modules
- **Mobile Responsive**: Fully optimized for mobile devices

## Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Local Storage  │    │   SharePoint    │
│   React/TS      │◄──►│   Browser Cache  │◄──►│   Integration   │
│   Tailwind CSS  │    │   State Mgmt     │    │   Document Mgmt │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
┌─────────────────┐                            ┌─────────────────┐
│ Power Automate  │                            │  Email Service  │
│   Workflows     │◄──────────────────────────►│  Notifications  │
└─────────────────┘                            └─────────────────┘
```

### Component Architecture
```
App.tsx
├── CRMTool.tsx (Main Container)
│   ├── WelcomeScreen.tsx (Dashboard)
│   ├── AccountForm.tsx (Account Management)
│   ├── ContactForm.tsx (Contact Management)
│   ├── DocumentStorage.tsx (File Management)
│   ├── AlertSystem.tsx (Notifications + Power Automate)
│   ├── TaskManagement.tsx (Task Tracking)
│   ├── SharePointSync.tsx (Data Sync)
│   └── ContactHierarchy.tsx (Org Chart)
└── UI Components (shadcn/ui)
```

## Technology Stack

### Frontend Framework
- **React 18.3.1**: Modern React with hooks and functional components
- **TypeScript 5.6.2**: Type-safe development with strict mode
- **Vite 5.4.21**: Fast build tool and development server

### Styling & UI
- **Tailwind CSS 3.4.15**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library
- **Lucide React**: Modern icon library
- **Radix UI**: Accessible component primitives

### State Management
- **React Hooks**: useState, useEffect for local state
- **Local Storage**: Browser-based persistence
- **Context API**: Global state management (when needed)

### External Integrations
- **Power Automate**: Workflow automation and email notifications
- **SharePoint**: Document storage and data synchronization

### Development Tools
- **ESLint**: Code linting and quality enforcement
- **PostCSS**: CSS processing and optimization
- **TypeScript Compiler**: Type checking and compilation

## Project Structure

```
shadcn-ui/
├── public/                     # Static assets
│   ├── favicon.svg            # Application icon
│   └── robots.txt             # SEO configuration
├── src/                       # Source code
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── CRMTool.tsx       # Main CRM container
│   │   ├── WelcomeScreen.tsx # Dashboard home
│   │   ├── AccountForm.tsx   # Account management
│   │   ├── ContactForm.tsx   # Contact management
│   │   ├── DocumentStorage.tsx # File management
│   │   ├── AlertSystem.tsx   # Alert + Power Automate
│   │   ├── TaskManagement.tsx # Task tracking
│   │   ├── SharePointSync.tsx # SharePoint integration
│   │   └── ContactHierarchy.tsx # Org visualization
│   ├── lib/                  # Utility functions
│   │   ├── utils.ts          # Common utilities
│   │   ├── storage.ts        # Local storage helpers
│   │   └── dateUtils.ts      # Date parsing utilities
│   ├── services/             # External service integrations
│   │   └── power-automate.ts # Power Automate service
│   ├── types/                # TypeScript definitions
│   │   ├── crm.ts           # Core CRM types
│   │   └── crm-advanced.ts  # Extended types
│   ├── App.tsx              # Root component
│   └── main.tsx             # Application entry
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS config
├── vite.config.ts          # Vite build config
└── README.md               # Project documentation
```

## Core Components

### 1. CRMTool.tsx
**Purpose**: Main application container and state management
**Key Features**:
- Central state management for accounts and contacts
- Navigation routing between different views
- Data persistence to localStorage
- Mobile-responsive sidebar navigation

**Props**: 
```typescript
interface CRMToolProps {
  userName: string;
}
```

### 2. WelcomeScreen.tsx
**Purpose**: Dashboard home screen with KPI overview
**Key Features**:
- Owner/VP filtering system
- Real-time KPI calculations
- Upcoming birthdays and contact alerts
- Quick action buttons

**Props**:
```typescript
interface WelcomeScreenProps {
  userName: string;
  accounts?: Account[];
  contacts?: Contact[];
}
```

### 3. AccountForm.tsx
**Purpose**: Account creation and editing interface
**Key Features**:
- Comprehensive account fields
- Industry categorization
- Revenue tracking
- Account owner assignment
- JBP (Joint Business Plan) tracking
- Customer event management with alerts

### 4. ContactForm.tsx
**Purpose**: Contact management with relationship tracking
**Key Features**:
- Personal and professional information
- Relationship hierarchy (VP/Owner structure)
- Birthday and contact date alerts
- Contact event management with alerts
- Social media integration
- Document attachments

### 5. DocumentStorage.tsx
**Purpose**: SharePoint-integrated document management
**Key Features**:
- File upload to SharePoint
- Document categorization
- Version control
- Access control (confidential marking)

### 6. AlertSystem.tsx
**Purpose**: Comprehensive alert management with Power Automate integration
**Key Features**:
- Multiple alert types: birthday, follow-up, task-due, JBP, accountEvent, contactEvent
- Configurable lead days for each alert type
- Auto-send functionality with Power Automate
- Manual resend capability
- Alert snoozing and completion tracking
- Email resolution with multiple fallback strategies
- Relationship owner filtering

### 7. SharePointSync.tsx
**Purpose**: Real-time data synchronization with SharePoint
**Key Features**:
- Excel export generation
- Automated sync scheduling
- Progress tracking
- Error handling and retry logic

## Data Models

### Account Model
```typescript
interface Account {
  id: string;
  accountName: string;
  industry: string;
  annualRevenue?: number;
  numberOfEmployees?: number;
  accountStatus: 'Active' | 'Inactive' | 'Prospect' | 'Customer';
  accountOwner: string;
  vp?: string;
  website?: string;
  phone?: string;
  email?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  description?: string;
  isJBP?: boolean;
  nextJBPDate?: string;
  nextJBPAlert?: boolean;
  nextJBPAlertDays?: number;
  customerEvents?: CustomerEvent[];
  createdAt?: string;
  lastModified?: string;
}
```

### Contact Model
```typescript
interface Contact {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  title?: string;
  email: string;
  notificationEmail?: string;
  phone?: string;
  mobilePhone?: string;
  officePhone?: string;
  department?: string;
  reportsTo?: string;
  birthday?: string;
  birthdayAlert?: boolean;
  lastContactDate?: string;
  nextContactDate?: string;
  nextContactAlert?: boolean;
  relationshipStatus?: string;
  relationshipOwner?: RelationshipOwner;
  primaryDiageoRelationshipOwners?: PrimaryDiageoRelationshipOwners;
  influence?: 'High' | 'Medium' | 'Low';
  preferredContactMethod?: string;
  socialHandles?: string[];
  knownPreferences?: string;
  notes?: string;
  contactEvents?: ContactEvent[];
  uploadedNotes?: UploadedNote[];
  teamsChannelId?: string;
  createdAt?: string;
  lastModified?: string;
}
```

### RelationshipOwner Model
```typescript
interface RelationshipOwner {
  name: string;
  email?: string;
  vicePresident?: string;
  teamsChannelId?: string;
  teamsChatId?: string;
}
```

### PrimaryDiageoRelationshipOwners Model
```typescript
interface PrimaryDiageoRelationshipOwners {
  ownerName: string;
  ownerEmail?: string;
  svp?: string;
}
```

### CustomerEvent Model
```typescript
interface CustomerEvent {
  id?: string;
  title: string;
  date: string;
  description?: string;
  alertEnabled: boolean;
  alertDays?: number;
}
```

### ContactEvent Model
```typescript
interface ContactEvent {
  id?: string;
  title: string;
  date: string;
  description?: string;
  alertEnabled: boolean;
  alertDays?: number;
}
```

### Alert Model
```typescript
interface Alert {
  id: string;
  type: 'birthday' | 'follow-up' | 'task-due' | 'jbp' | 
        'accountEvent' | 'contactEvent' | 'contract-renewal' | 
        'meeting' | 'milestone';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  relatedId: string;
  relatedType: 'account' | 'contact' | 'task';
  relatedName: string;
  status: 'pending' | 'completed' | 'dismissed';
  createdAt: string;
  actionRequired: boolean;
  contactOwner?: string;
  vicePresident?: string;
  isCompleted?: boolean;
  completedAt?: string;
}
```

### Document Model
```typescript
interface Document {
  id: string;
  name: string;
  type: 'contract' | 'proposal' | 'presentation' | 'meeting-notes' | 'other';
  category: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  relatedId: string;
  relatedType: 'account' | 'contact';
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  version: number;
  description?: string;
  tags: string[];
  isConfidential: boolean;
  sharePointPath: string;
  sharePointId: string;
}
```

## SharePoint Integration

### Configuration
SharePoint integration is configured in two main components:

#### SharePointSync.tsx Configuration
```typescript
const sharePointSite = "https://yourcompany.sharepoint.com/sites/CRMDocuments";
const sharePointLibrary = "Strategic Accounts";
const syncFolder = "CRM_Data_Sync";
```

#### DocumentStorage.tsx Configuration
```typescript
const sharePointSite = "https://yourcompany.sharepoint.com/sites/CRMDocuments";
const sharePointLibrary = "Strategic Accounts";
```

### Folder Structure
```
SharePoint Site/
├── Strategic Accounts/
│   ├── Contracts/           # Legal contracts
│   ├── Proposals/           # Sales proposals
│   ├── Presentations/       # Meeting presentations
│   ├── Meeting_Notes/       # Meeting minutes
│   ├── Contact_Files/       # Contact documents
│   ├── General/            # Miscellaneous files
│   └── CRM_Data_Sync/      # Excel exports
│       ├── Strategic_Accounts_Export.xlsx
│       └── Strategic_Contacts_Export.xlsx
```

### Data Sync Process
1. **Manual Sync**: User-initiated sync via "Sync All Files" button
2. **Excel Generation**: Accounts and contacts exported to Excel format
3. **SharePoint Upload**: Files uploaded to designated sync folder
4. **Progress Tracking**: Real-time progress indication
5. **Error Handling**: Retry logic and error reporting

## Power Automate Integration

### Overview
The Power Automate integration enables automated email notifications for various alert types. The system sends structured data to Power Automate workflows, which then trigger email notifications to relationship owners.

### Configuration

#### Environment Variables (.env)
```bash
# Power Automate Webhook URLs
VITE_PA_BIRTHDAY_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
VITE_PA_NEXT_CONTACT_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
VITE_PA_TASK_DUE_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
VITE_PA_JBP_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
VITE_PA_CONTACT_EVENT_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
VITE_PA_ACCOUNT_EVENT_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
```

### Supported Alert Types

| Alert Type | Webhook Variable | Description |
|-----------|-----------------|-------------|
| Birthday | `VITE_PA_BIRTHDAY_WORKFLOW_URL` | Contact birthday reminders |
| Next Contact | `VITE_PA_NEXT_CONTACT_WORKFLOW_URL` | Follow-up contact reminders |
| Task Due | `VITE_PA_TASK_DUE_WORKFLOW_URL` | Task due date notifications |
| JBP | `VITE_PA_JBP_WORKFLOW_URL` | Joint Business Plan reminders |
| Contact Event | `VITE_PA_CONTACT_EVENT_WORKFLOW_URL` | Contact-specific event alerts |
| Account Event | `VITE_PA_ACCOUNT_EVENT_WORKFLOW_URL` | Account-specific event alerts |

### Power Automate Alert Payload

```typescript
interface PowerAutomateAlert {
  alertType: 'birthday' | 'next-contact' | 'task-due' | 'jbp' | 
             'accountEvent' | 'contactEvent';
  contactName: string;
  contactEmail?: string;
  accountName?: string;
  dueDate: string;
  daysUntil: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  relationshipOwner: string;
  relationshipOwnerEmail: string;
  relationshipOwnerTeamsChannel?: string;
  vicePresident?: string;
  description: string;
  additionalData?: {
    alertId: string;
    contactId?: string;
    accountId?: string;
    contactPhone?: string;
    contactTitle?: string;
    autoSent: boolean;
  };
}
```

### Service Implementation

The Power Automate service (`src/services/power-automate.ts`) provides:

```typescript
class PowerAutomateService {
  // Check if Power Automate is configured
  isEnabled(): boolean;
  
  // Send alert to Power Automate workflow
  async sendAlert(alert: PowerAutomateAlert): Promise<boolean>;
  
  // Get environment variable name for alert type
  private getEnvVarName(alertType: string): string;
}
```

### Error Handling

The service includes a custom error class for configuration issues:

```typescript
class PowerAutomateConfigError extends Error {
  constructor(message: string, public envVarName: string) {
    super(message);
    this.name = 'PowerAutomateConfigError';
  }
}
```

This provides clear error messages when webhook URLs are missing:
```
❌ Configuration Error:

Power Automate workflow URL not configured for alert type 'accountEvent'.

Please add VITE_PA_ACCOUNT_EVENT_WORKFLOW_URL to your .env file with your Power Automate webhook URL, then restart the development server.
```

## Alert System

### Overview
The Alert System provides comprehensive notification management with configurable lead times, automatic sending, and Power Automate integration.

### Alert Types and Configuration

| Alert Type | Default Lead Days | Configurable | Auto-Send Support |
|-----------|------------------|--------------|-------------------|
| Birthday | 30 days | Yes (7-90 days) | Yes |
| Next Contact | 7 days | Yes (1-30 days) | Yes |
| Task Due | 7 days | Yes (1-14 days) | Yes |
| JBP | 30 days | Yes (7-90 days) | Yes |
| Contact Event | 7 days | Yes (1-30 days) | Yes |
| Account Event | 7 days | Yes (1-30 days) | Yes |

### Email Resolution Logic

The Alert System uses sophisticated email resolution with multiple fallback strategies to ensure notifications reach the right person.

#### Contact-Related Alerts (Birthday, Follow-up, Contact Event)

**Priority Order:**
1. **Contact Notification Email Override** - Custom email set for this specific contact
2. **Primary Diageo Owner Email** - Email from Primary Diageo Relationship Owner
3. **Relationship Owner Directory Email** - Email from Relationship Owner Directory
4. **Contact's Relationship Owner Email** - Email stored with contact's relationship owner

**Code Implementation:**
```typescript
notificationEmail = (
  contact?.notificationEmail || 
  contact?.primaryDiageoRelationshipOwners?.ownerEmail ||
  ownerDetails?.email || 
  contact?.relationshipOwner?.email || 
  ''
).trim().replace(/[\r\n\t]/g, '');
```

#### Account-Related Alerts (JBP, Account Event, Task Due)

**Priority Order:**
1. **Relationship Owner Directory Email** - Email from Relationship Owner Directory
2. **Associated Contact Emails** - Emails from contacts linked to the account
   - Contact notification email override
   - Contact's Primary Diageo owner email
   - Contact's relationship owner email
3. **Account Email** - Email stored with the account

**Code Implementation:**
```typescript
// First try relationship owner directory
if (ownerDetails?.email) {
  notificationEmail = ownerDetails.email.trim().replace(/[\r\n\t]/g, '');
  emailSource = 'relationship owner directory';
} else {
  // Fall back to contacts associated with this account
  const allContacts = loadFromStorage('crm-contacts', []) as Contact[];
  const accountContacts = allContacts.filter(c => c.accountId === account?.id);
  
  // Try to find a contact with a valid email
  for (const accountContact of accountContacts) {
    const contactEmail = (
      accountContact.notificationEmail ||
      accountContact.primaryDiageoRelationshipOwners?.ownerEmail ||
      accountContact.relationshipOwner?.email ||
      ''
    ).trim().replace(/[\r\n\t]/g, '');
    
    if (contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      notificationEmail = contactEmail;
      emailSource = `contact ${accountContact.firstName} ${accountContact.lastName}`;
      break;
    }
  }
  
  // Final fallback to account email
  if (!notificationEmail && account?.email) {
    notificationEmail = account.email.trim().replace(/[\r\n\t]/g, '');
    emailSource = 'account email';
  }
}
```

### Email Validation

All email addresses are:
1. **Trimmed** - Remove leading/trailing whitespace
2. **Cleaned** - Remove newlines, tabs, and carriage returns
3. **Validated** - Check against regex pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Alert Settings

Users can configure alert behavior through the Settings panel:

```typescript
interface AlertSettings {
  birthdayLeadDays: number;      // 7, 14, 30, 60, 90 days
  nextContactLeadDays: number;   // 1, 3, 7, 14, 30 days
  taskLeadDays: number;          // 1, 3, 7, 14 days
  jbpLeadDays: number;           // 7, 14, 30, 60, 90 days
  eventLeadDays: number;         // 1, 3, 7, 14, 30 days
  reminderFrequency: 'daily' | 'every-3-days' | 'weekly' | 'once';
}
```

### Auto-Send Functionality

When enabled, the Alert System automatically sends alerts to Power Automate based on:
- Alert type is supported (birthday, follow-up, task-due, jbp, accountEvent, contactEvent)
- Alert status is pending
- Alert is not completed
- Alert has not been sent before (or reminder frequency allows resending)
- Alert is not snoozed

### Alert Lifecycle

1. **Generation**: Alerts are generated based on dates and enabled flags
2. **Display**: Shown in Alert System with priority badges
3. **Snoozing**: Can be snoozed for 1, 3, 7, or 14 days
4. **Sending**: Manual or automatic sending to Power Automate
5. **Completion**: Marked complete when action is taken
6. **Tracking**: Sent alerts are tracked to prevent duplicates

### Sent Alert Tracking

```typescript
interface SentAlertRecord {
  alertId: string;
  alertType: string;
  contactId: string;
  sentAt: string;
  dueDate: string;
}
```

Records are stored in localStorage and automatically cleaned up after 30 days.

### Relationship Owner Directory

The system maintains a directory of relationship owners with contact information:

```typescript
interface RelationshipOwner {
  name: string;
  email?: string;
  vicePresident?: string;
  teamsChannelId?: string;
  teamsChatId?: string;
}
```

This directory is used for email resolution and can be managed through the Relationship Owner Directory interface.

### Data Cleaning Utility

The Alert System includes a "Clean Email Data" utility that:
- Removes whitespace, newlines, tabs from all email addresses
- Cleans emails in Relationship Owner Directory
- Cleans emails in all contacts
- Reports the number of cleaned emails
- Reloads the page to apply changes

## Features

### 1. Advanced Filtering System
- **Owner-based filtering**: Filter by account owners, contact owners, and VPs
- **Real-time updates**: KPIs update dynamically based on selected filters
- **Cross-module consistency**: Filters apply across all relevant components

### 2. Alert System
- **Multiple Alert Types**: Birthday, next contact, task due, JBP, account events, contact events
- **Configurable Lead Times**: Customize advance notification periods for each alert type
- **Auto-Send**: Automatic Power Automate integration for hands-free notifications
- **Manual Resend**: Ability to resend alerts even if previously sent
- **Snooze Functionality**: Temporarily dismiss alerts for 1, 3, 7, or 14 days
- **Completion Tracking**: Mark alerts as complete and track completion dates
- **Visual Indicators**: Color-coded badges and status indicators

### 3. Contact Hierarchy
- **Organizational Structure**: Visual representation of reporting relationships
- **VP Oversight**: Vice President assignment and tracking
- **Relationship Mapping**: Complex relationship visualization

### 4. Task Management
- **Integrated Tasks**: Tasks linked to accounts and contacts
- **Due Date Tracking**: Priority-based task organization
- **Power Automate Integration**: Automated workflow triggers for task alerts

### 5. Event Management
- **Account Events**: Customer events with configurable alerts
- **Contact Events**: Personal events with configurable alerts
- **Flexible Alert Days**: Set custom lead times per event

### 6. Mobile Optimization
- **Responsive Design**: Optimized for all screen sizes
- **Touch-friendly Interface**: Mobile-specific interactions
- **Progressive Enhancement**: Core functionality on all devices

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Modern web browser
- SharePoint access (for document features)
- Power Automate access (for workflow automation)

### Installation Steps
```bash
# Clone the repository
git clone <repository-url>
cd shadcn-ui

# Install dependencies
pnpm install

# Create .env file
cp .env.example .env

# Configure Power Automate webhook URLs in .env
# (See Configuration section below)

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Run linting
pnpm run lint
```

### Environment Setup
1. **SharePoint Configuration**: Update SharePoint URLs in components
2. **Power Automate Configuration**: Add webhook URLs to .env file
3. **Local Storage**: Browser-based data persistence (no external database required)
4. **Development Tools**: ESLint and TypeScript configured for optimal development

## Configuration

### Power Automate Setup

#### 1. Create Power Automate Workflows

For each alert type, create a workflow in Power Automate:

1. Go to [Power Automate](https://make.powerautomate.com)
2. Create a new **Instant cloud flow**
3. Choose trigger: **When an HTTP request is received**
4. Add actions to send email notifications
5. Save and copy the HTTP POST URL

#### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Power Automate Webhook URLs
VITE_PA_BIRTHDAY_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
VITE_PA_NEXT_CONTACT_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
VITE_PA_TASK_DUE_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
VITE_PA_JBP_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
VITE_PA_CONTACT_EVENT_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
VITE_PA_ACCOUNT_EVENT_WORKFLOW_URL=https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
```

#### 3. Restart Development Server

After adding webhook URLs, restart the development server:
```bash
pnpm run dev
```

### SharePoint Setup
1. **Identify SharePoint Site**: Locate your SharePoint site URL
2. **Document Library**: Ensure proper document library exists
3. **Permissions**: Verify read/write access for users
4. **Update Configuration**: Modify SharePoint URLs in components

#### Required Changes:
```typescript
// In SharePointSync.tsx and DocumentStorage.tsx
const sharePointSite = "https://[your-tenant].sharepoint.com/sites/[site-name]";
const sharePointLibrary = "[your-document-library]";
```

### Customization Options
- **Branding**: Update colors and logos in Tailwind config
- **Fields**: Modify account/contact fields in type definitions
- **Workflows**: Customize alert and task logic
- **Integration**: Add additional external system connections
- **Alert Lead Times**: Adjust default lead days in AlertSystem.tsx

## API Reference

### Storage Functions
```typescript
// Save data to localStorage
saveToStorage<T>(key: string, data: T): void

// Load data from localStorage
loadFromStorage<T>(key: string, defaultValue: T): T

// Save sent alert record
saveSentAlert(record: SentAlertRecord): void

// Check if alert was sent
wasAlertSent(alertId: string): boolean

// Clear old sent alert records
clearOldSentAlerts(daysOld: number): void
```

### Power Automate Service
```typescript
class PowerAutomateService {
  // Check if Power Automate is enabled
  isEnabled(): boolean
  
  // Send alert to Power Automate
  async sendAlert(alert: PowerAutomateAlert): Promise<boolean>
  
  // Get environment variable name for alert type
  private getEnvVarName(alertType: string): string
}

// Usage
const powerAutomateService = new PowerAutomateService();

if (powerAutomateService.isEnabled()) {
  const success = await powerAutomateService.sendAlert({
    alertType: 'birthday',
    contactName: 'John Doe',
    relationshipOwnerEmail: 'owner@company.com',
    // ... other fields
  });
}
```

### Date Utilities
```typescript
// Parse birthday for comparison (handles timezone issues)
parseBirthdayForComparison(birthday: string): { month: number; day: number } | null

// Check if date is upcoming
isDateUpcoming(dateString: string): boolean

// Check if date is overdue
isDateOverdue(dateString: string): boolean
```

### File Utilities
```typescript
// Format file size
formatFileSize(bytes: number): string

// Get file icon
getFileIcon(mimeType: string): string
```

### Component Props
Refer to individual component TypeScript interfaces for detailed prop specifications.

## Development Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled, all components typed
- **ESLint**: Enforced code quality and consistency
- **Component Structure**: Functional components with hooks
- **Naming Conventions**: PascalCase for components, camelCase for functions

### Best Practices
1. **State Management**: Use local state for component-specific data
2. **Performance**: Implement proper memoization for expensive operations
3. **Accessibility**: Follow WCAG guidelines for UI components
4. **Error Handling**: Implement comprehensive error boundaries
5. **Testing**: Write unit tests for critical business logic
6. **Email Validation**: Always validate and clean email addresses
7. **Logging**: Use console.log for debugging alert and email resolution

### Adding New Features
1. **Type Definitions**: Update type files first
2. **Component Creation**: Follow existing component patterns
3. **State Integration**: Integrate with existing state management
4. **Documentation**: Update technical documentation
5. **Testing**: Add appropriate test coverage

### Adding New Alert Types

To add a new alert type:

1. **Update Alert Type Definition** (`src/types/crm-advanced.ts`):
```typescript
type AlertType = 'birthday' | 'follow-up' | 'task-due' | 'jbp' | 
                 'accountEvent' | 'contactEvent' | 'your-new-type';
```

2. **Add Environment Variable** (`.env`):
```bash
VITE_PA_YOUR_NEW_TYPE_WORKFLOW_URL=https://...
```

3. **Update Power Automate Service** (`src/services/power-automate.ts`):
```typescript
private getEnvVarName(alertType: string): string {
  const envVarMap: Record<string, string> = {
    // ... existing mappings
    'your-new-type': 'VITE_PA_YOUR_NEW_TYPE_WORKFLOW_URL',
  };
  return envVarMap[alertType] || '';
}
```

4. **Update Alert System** (`src/components/AlertSystem.tsx`):
   - Add alert generation logic
   - Add to supported alert types check
   - Add icon mapping
   - Update auto-send logic

## Deployment

### Production Build
```bash
# Create production build
pnpm run build

# Serve locally for testing
pnpm run preview
```

### Deployment Options
1. **Static Hosting**: Netlify, Vercel, GitHub Pages
2. **CDN Deployment**: AWS CloudFront, Azure CDN
3. **Corporate Hosting**: Internal web servers
4. **SharePoint Integration**: SharePoint App deployment

### Environment Configuration
- **Production URLs**: Update SharePoint URLs for production
- **Power Automate URLs**: Ensure production webhook URLs are configured
- **Performance Optimization**: Enable compression and caching
- **Security**: Implement proper HTTPS and CSP headers

### Pre-Deployment Checklist
- [ ] All Power Automate webhook URLs configured
- [ ] SharePoint URLs updated for production
- [ ] Email addresses validated in Relationship Owner Directory
- [ ] Test all alert types with real data
- [ ] Verify email resolution for both contact and account alerts
- [ ] Test auto-send functionality
- [ ] Confirm mobile responsiveness
- [ ] Run production build and test
- [ ] Review browser console for errors

## Troubleshooting

### Common Issues

#### Power Automate Connection Issues

**Problem**: Alerts not sending to Power Automate
**Solution**: 
1. Check that webhook URLs are configured in `.env`
2. Verify URLs are correct (copy from Power Automate)
3. Ensure development server was restarted after adding URLs
4. Check browser console for specific error messages
5. Test webhook URLs directly with a tool like Postman

**Problem**: "Configuration Error" when sending alerts
**Solution**:
1. Check the error message for the specific missing environment variable
2. Add the required variable to `.env` file
3. Restart the development server
4. Example error: `VITE_PA_ACCOUNT_EVENT_WORKFLOW_URL` not configured

#### Email Resolution Issues

**Problem**: "No notification email configured" error
**Solution**:
1. For contact alerts: Add email to Primary Diageo Relationship Owner or Relationship Owner Directory
2. For account alerts: Ensure at least one contact is associated with the account and has a valid email
3. Use the "Clean Email Data" button in Settings to fix corrupted emails
4. Check browser console for detailed email resolution logging

**Problem**: Email format validation errors
**Solution**:
1. Click "Clean Email Data" button in Alert System Settings
2. Manually review and fix email addresses in:
   - Relationship Owner Directory
   - Contact forms (notification email, Primary Diageo owner email)
   - Account forms
3. Ensure no newlines, tabs, or extra whitespace in email fields

**Problem**: Account event alerts not finding email
**Solution**:
1. Verify the account has associated contacts (check `accountId` field)
2. Ensure at least one contact has a valid email address
3. Add the relationship owner to the Relationship Owner Directory with email
4. Check console logs for "FALLBACK TO ACCOUNT CONTACTS" messages

#### SharePoint Connection Issues
**Problem**: Documents not syncing to SharePoint
**Solution**: 
1. Verify SharePoint URLs are correct
2. Check user permissions
3. Ensure SharePoint site and library exist
4. Review browser console for CORS errors

#### Data Persistence Issues
**Problem**: Data not saving between sessions
**Solution**:
1. Check browser localStorage availability
2. Verify data size limits
3. Clear browser cache and retry
4. Check for JavaScript errors in console

#### Performance Issues
**Problem**: Slow rendering with large datasets
**Solution**:
1. Implement data pagination
2. Add virtual scrolling for large lists
3. Optimize re-renders with React.memo
4. Consider data indexing strategies

#### Mobile Responsiveness
**Problem**: Layout issues on mobile devices
**Solution**:
1. Test on actual devices
2. Review Tailwind responsive classes
3. Check viewport meta tag
4. Validate touch interactions

#### Alert System Issues

**Problem**: Alerts not appearing
**Solution**:
1. Check that alert flags are enabled (birthdayAlert, nextContactAlert, etc.)
2. Verify dates are within the configured lead time window
3. Check that alerts are not snoozed
4. Review browser console for alert generation logs

**Problem**: Duplicate alerts being sent
**Solution**:
1. Check sent alert tracking in localStorage (`crm-sent-alerts`)
2. Verify reminder frequency setting
3. Review auto-send configuration
4. Clear old sent alert records if needed

**Problem**: Wrong email being used for notifications
**Solution**:
1. Review email resolution priority order (see Alert System section)
2. Check browser console for "EMAIL RESOLUTION" debug logs
3. Verify email addresses in all possible sources
4. Use "Clean Email Data" to fix corrupted addresses

### Debug Mode
Enable debug logging by adding to localStorage:
```javascript
localStorage.setItem('crm-debug', 'true');
```

Enable detailed alert logging:
```javascript
// Alert System automatically logs detailed information
// Check browser console for:
// - "=== ALERT SYSTEM DEBUG ==="
// - "=== EMAIL RESOLUTION ==="
// - "=== SEND TO POWER AUTOMATE - DETAILED DEBUG ==="
```

### Support Resources
- **Component Library**: [shadcn/ui documentation](https://ui.shadcn.com/)
- **Tailwind CSS**: [Official documentation](https://tailwindcss.com/docs)
- **React**: [React documentation](https://react.dev/)
- **TypeScript**: [TypeScript handbook](https://www.typescriptlang.org/docs/)
- **Power Automate**: [Microsoft Power Automate documentation](https://learn.microsoft.com/en-us/power-automate/)

---

## Version History

### v1.0.0 - Initial Release
- Core CRM functionality
- Account and contact management
- Basic SharePoint integration
- Mobile responsive design

### v1.1.0 - Enhanced Filtering
- Owner/VP filtering system
- Advanced KPI calculations
- Improved user experience
- Performance optimizations

### v1.2.0 - Power Automate Integration
- Power Automate workflow integration
- Multiple alert types support
- Auto-send functionality
- Email resolution system

### v1.3.0 - Enhanced Alert System
- Account event alerts
- Contact event alerts
- Configurable lead times
- Snooze functionality
- Completion tracking
- Enhanced email resolution with fallback logic
- Account contact email fallback for account alerts

---

**Last Updated**: December 2024
**Maintained By**: Development Team
**License**: MIT License