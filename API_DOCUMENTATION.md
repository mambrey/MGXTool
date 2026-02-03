# Diageo AccountIQ - API Documentation

## Overview
This document provides comprehensive API documentation for the Diageo AccountIQ Dashboard, including component interfaces, data models, integration patterns, and Power Automate workflow APIs.

## Table of Contents
1. [Component APIs](#component-apis)
2. [Data Models](#data-models)
3. [Storage APIs](#storage-apis)
4. [Power Automate APIs](#power-automate-apis)
5. [Utility Functions](#utility-functions)
6. [SharePoint Integration](#sharepoint-integration)
7. [Event Handlers](#event-handlers)
8. [Type Definitions](#type-definitions)
9. [Error Handling](#error-handling)

## Component APIs

### CRMTool Component

#### Props Interface
```typescript
interface CRMToolProps {
  userName: string;
}
```

#### State Management
```typescript
interface CRMToolState {
  currentView: View;
  accounts: Account[];
  contacts: Contact[];
  selectedAccount: Account | null;
  selectedContact: Contact | null;
  editingAccount: Account | null;
  editingContact: Contact | null;
  isMobileMenuOpen: boolean;
  accountSearchTerm: string;
  contactSearchTerm: string;
  showAccountForm: boolean;
  showContactForm: boolean;
}
```

#### Methods
```typescript
// Account Management
handleAccountSave(account: Account): void
handleAccountEdit(account: Account): void
handleAccountDelete(accountId: string): void
handleViewAccount(account: Account): void

// Contact Management
handleContactSave(contact: Contact): void
handleContactEdit(contact: Contact): void
handleContactDelete(contactId: string): void
handleViewContact(contact: Contact): void

// Navigation
handleBackToList(): void
handleAddAccount(): void
handleAddContact(): void
```

### WelcomeScreen Component

#### Props Interface
```typescript
interface WelcomeScreenProps {
  userName: string;
  accounts?: Account[];
  contacts?: Contact[];
}
```

#### State
```typescript
interface WelcomeScreenState {
  ownerFilter: string;
}
```

#### Computed Properties
```typescript
// Filter Logic
const filteredAccounts: Account[]
const filteredContacts: Contact[]
const uniqueOwners: string[]
const uniqueVPs: string[]

// KPI Calculations
const upcomingBirthdays: number
const overdueContacts: number
const upcomingContacts: number
```

### AccountForm Component

#### Props Interface
```typescript
interface AccountFormProps {
  account?: Account | null;
  onSave: (account: Account) => void;
  onCancel: () => void;
}
```

#### Form Fields
```typescript
interface AccountFormData {
  accountName: string;
  industry: string;
  annualRevenue?: number;
  numberOfEmployees?: number;
  accountStatus: AccountStatus;
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
}
```

### ContactForm Component

#### Props Interface
```typescript
interface ContactFormProps {
  contact?: Contact | null;
  accounts: Account[];
  onSave: (contact: Contact) => void;
  onCancel: () => void;
}
```

#### Form Fields
```typescript
interface ContactFormData {
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
  influence?: InfluenceLevel;
  preferredContactMethod?: ContactMethod;
  socialHandles?: string[];
  knownPreferences?: string;
  notes?: string;
  contactEvents?: ContactEvent[];
  uploadedNotes?: UploadedNote[];
  teamsChannelId?: string;
}
```

### AlertSystem Component

#### Props Interface
```typescript
interface AlertSystemProps {
  accounts: Account[];
  contacts: Contact[];
  onBack: () => void;
}
```

#### State
```typescript
interface AlertSystemState {
  alerts: Alert[];
  filter: 'all' | 'pending' | 'high' | 'overdue' | 'completed';
  relationshipOwnerFilter: string;
  searchTerm: string;
  sendingAlerts: Set<string>;
  sentAlerts: Set<string>;
  powerAutomateEnabled: boolean;
  autoSendEnabled: boolean;
  showSettings: boolean;
  snoozedAlerts: SnoozedAlert[];
  alertSettings: AlertSettings;
}
```

#### Alert Settings Interface
```typescript
interface AlertSettings {
  birthdayLeadDays: number;      // 7, 14, 30, 60, 90
  nextContactLeadDays: number;   // 1, 3, 7, 14, 30
  taskLeadDays: number;          // 1, 3, 7, 14
  jbpLeadDays: number;           // 7, 14, 30, 60, 90
  eventLeadDays: number;         // 1, 3, 7, 14, 30
  reminderFrequency: 'daily' | 'every-3-days' | 'weekly' | 'once';
}
```

#### Methods
```typescript
// Alert Management
sendAlertToPowerAutomate(alert: Alert, isAutoSend: boolean): Promise<boolean>
handleToggleCompletion(alertId: string): void
handleDismissAlert(alertId: string): void
handleSnoozeAlert(alertId: string, days: number): void

// Settings
handleAutoSendToggle(enabled: boolean): void
handleSettingsChange(key: keyof AlertSettings, value: number | string): void
handleCleanEmailData(): void

// Utilities
isAlertSnoozed(alertId: string): boolean
shouldSendReminder(alert: Alert): boolean
canSendToPowerAutomate(alert: Alert): boolean
```

### DocumentStorage Component

#### Props Interface
```typescript
interface DocumentStorageProps {
  accounts: Account[];
  contacts: Contact[];
  onBack: () => void;
}
```

#### State
```typescript
interface DocumentStorageState {
  documents: Document[];
  searchTerm: string;
  typeFilter: string;
  accountFilter: string;
  contactFilter: string;
  isUploadOpen: boolean;
  selectedDocument: Document | null;
  uploadRelatedType: 'account' | 'contact';
  uploadRelatedId: string;
}
```

#### Methods
```typescript
handleFileUpload(e: React.ChangeEvent<HTMLInputElement>): void
handleDownload(document: Document): void
openInSharePoint(document: Document): void
handleDelete(documentId: string): void
getFileIcon(mimeType: string): string
formatFileSize(bytes: number): string
getTypeColor(type: Document['type']): string
getRelatedName(doc: Document): string
getSharePointFolder(type: Document['type']): string
```

### SharePointSync Component

#### Props Interface
```typescript
interface SharePointSyncProps {
  accounts: Account[];
  contacts: Contact[];
}
```

#### State
```typescript
interface SharePointSyncState {
  syncFiles: SharePointFile[];
  isRefreshing: boolean;
  syncProgress: number;
}
```

#### Methods
```typescript
generateAccountsExcel(): ExcelData
generateContactsExcel(): ExcelData
syncToSharePoint(fileType: 'accounts' | 'contacts'): Promise<void>
syncAllFiles(): Promise<void>
openInSharePoint(file: SharePointFile): void
openSharePointFolder(): void
getSyncStatusIcon(status: SyncStatus): JSX.Element
getSyncStatusColor(status: SyncStatus): string
```

## Data Models

### Core Types

#### Account
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

#### Contact
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
  preferredContactMethod?: 'email' | 'mobile phone' | 'office phone';
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

#### Alert
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

#### Document
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

### Supporting Types

#### Address
```typescript
interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}
```

#### RelationshipOwner
```typescript
interface RelationshipOwner {
  name: string;
  email?: string;
  vicePresident?: string;
  teamsChannelId?: string;
  teamsChatId?: string;
}
```

#### PrimaryDiageoRelationshipOwners
```typescript
interface PrimaryDiageoRelationshipOwners {
  ownerName: string;
  ownerEmail?: string;
  svp?: string;
}
```

#### CustomerEvent
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

#### ContactEvent
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

#### UploadedNote
```typescript
interface UploadedNote {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  content?: string;
}
```

#### SnoozedAlert
```typescript
interface SnoozedAlert {
  alertId: string;
  snoozeUntil: string;
}
```

#### SentAlertRecord
```typescript
interface SentAlertRecord {
  alertId: string;
  alertType: string;
  contactId: string;
  sentAt: string;
  dueDate: string;
}
```

#### SharePointFile
```typescript
interface SharePointFile {
  id: string;
  name: string;
  path: string;
  lastModified: string;
  size: number;
  type: 'accounts' | 'contacts';
  recordCount: number;
  syncStatus: 'synced' | 'pending' | 'error';
  lastSyncTime: string;
  sharePointUrl: string;
}
```

## Storage APIs

### Local Storage Functions

#### saveToStorage
```typescript
function saveToStorage<T>(key: string, data: T): void
```
**Description**: Saves data to browser localStorage with JSON serialization
**Parameters**:
- `key`: Storage key identifier
- `data`: Data to store (any serializable type)

#### loadFromStorage
```typescript
function loadFromStorage<T>(key: string, defaultValue: T): T
```
**Description**: Loads data from localStorage with fallback to default value
**Parameters**:
- `key`: Storage key identifier  
- `defaultValue`: Fallback value if key doesn't exist
**Returns**: Stored data or default value

#### saveSentAlert
```typescript
function saveSentAlert(record: SentAlertRecord): void
```
**Description**: Saves a sent alert record to track which alerts have been sent
**Parameters**:
- `record`: SentAlertRecord object containing alert details

#### wasAlertSent
```typescript
function wasAlertSent(alertId: string): boolean
```
**Description**: Checks if an alert has been sent before
**Parameters**:
- `alertId`: Unique alert identifier
**Returns**: Boolean indicating if alert was previously sent

#### clearOldSentAlerts
```typescript
function clearOldSentAlerts(daysOld: number): void
```
**Description**: Removes sent alert records older than specified days
**Parameters**:
- `daysOld`: Number of days to retain records (typically 30)

### Storage Keys
```typescript
const STORAGE_KEYS = {
  ACCOUNTS: 'crm-accounts',
  CONTACTS: 'crm-contacts',
  DOCUMENTS: 'crm-documents',
  TASKS: 'crm-tasks',
  ALERTS: 'crm-alerts',
  SENT_ALERTS: 'crm-sent-alerts',
  SNOOZED_ALERTS: 'crm-snoozed-alerts',
  ALERT_SETTINGS: 'crm-alert-settings',
  PA_AUTO_SEND: 'crm-pa-auto-send',
  RELATIONSHIP_OWNERS: 'crm-relationship-owners',
  SETTINGS: 'crm-settings'
} as const;
```

## Power Automate APIs

### PowerAutomateService Class

#### Constructor
```typescript
class PowerAutomateService {
  constructor()
}
```

#### Methods

##### isEnabled
```typescript
isEnabled(): boolean
```
**Description**: Checks if Power Automate integration is configured
**Returns**: Boolean indicating if at least one webhook URL is configured

**Example**:
```typescript
const service = new PowerAutomateService();
if (service.isEnabled()) {
  console.log('Power Automate is configured');
}
```

##### sendAlert
```typescript
async sendAlert(alert: PowerAutomateAlert): Promise<boolean>
```
**Description**: Sends alert data to Power Automate workflow
**Parameters**:
- `alert`: PowerAutomateAlert object with alert details
**Returns**: Promise resolving to boolean (true if successful)
**Throws**: PowerAutomateConfigError if webhook URL not configured

**Example**:
```typescript
const success = await service.sendAlert({
  alertType: 'birthday',
  contactName: 'John Doe',
  relationshipOwnerEmail: 'owner@company.com',
  dueDate: '2024-12-15',
  daysUntil: 7,
  priority: 'medium',
  relationshipOwner: 'Jane Smith',
  description: 'Birthday reminder for John Doe',
  // ... other fields
});
```

##### getEnvVarName (private)
```typescript
private getEnvVarName(alertType: string): string
```
**Description**: Maps alert type to environment variable name
**Parameters**:
- `alertType`: Alert type string
**Returns**: Environment variable name or empty string

### PowerAutomateAlert Interface

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

### PowerAutomateConfigError Class

```typescript
class PowerAutomateConfigError extends Error {
  constructor(message: string, public envVarName: string)
}
```

**Properties**:
- `message`: Error message describing the issue
- `envVarName`: Name of the missing environment variable

**Example**:
```typescript
try {
  await service.sendAlert(alert);
} catch (error) {
  if (error instanceof PowerAutomateConfigError) {
    console.error(`Missing: ${error.envVarName}`);
    console.error(error.message);
  }
}
```

### Environment Variables

#### Required Variables
```typescript
// Birthday alerts
VITE_PA_BIRTHDAY_WORKFLOW_URL: string

// Next contact alerts
VITE_PA_NEXT_CONTACT_WORKFLOW_URL: string

// Task due alerts
VITE_PA_TASK_DUE_WORKFLOW_URL: string

// JBP alerts
VITE_PA_JBP_WORKFLOW_URL: string

// Contact event alerts
VITE_PA_CONTACT_EVENT_WORKFLOW_URL: string

// Account event alerts
VITE_PA_ACCOUNT_EVENT_WORKFLOW_URL: string
```

#### Variable Mapping
```typescript
const ENV_VAR_MAP: Record<string, string> = {
  'birthday': 'VITE_PA_BIRTHDAY_WORKFLOW_URL',
  'next-contact': 'VITE_PA_NEXT_CONTACT_WORKFLOW_URL',
  'task-due': 'VITE_PA_TASK_DUE_WORKFLOW_URL',
  'jbp': 'VITE_PA_JBP_WORKFLOW_URL',
  'accountEvent': 'VITE_PA_ACCOUNT_EVENT_WORKFLOW_URL',
  'contactEvent': 'VITE_PA_CONTACT_EVENT_WORKFLOW_URL'
};
```

### Email Resolution Logic

#### Contact-Related Alerts
```typescript
// Priority order for birthday, follow-up, contactEvent alerts
const notificationEmail = (
  contact?.notificationEmail ||                          // 1. Contact override
  contact?.primaryDiageoRelationshipOwners?.ownerEmail || // 2. Primary Diageo owner
  ownerDetails?.email ||                                  // 3. Relationship owner directory
  contact?.relationshipOwner?.email ||                    // 4. Contact's relationship owner
  ''
).trim().replace(/[\r\n\t]/g, '');
```

#### Account-Related Alerts
```typescript
// Priority order for jbp, accountEvent, task-due alerts
let notificationEmail = '';

// 1. Try relationship owner directory
if (ownerDetails?.email) {
  notificationEmail = ownerDetails.email;
} else {
  // 2. Fall back to contacts associated with account
  const accountContacts = allContacts.filter(c => c.accountId === account?.id);
  
  for (const accountContact of accountContacts) {
    const contactEmail = (
      accountContact.notificationEmail ||
      accountContact.primaryDiageoRelationshipOwners?.ownerEmail ||
      accountContact.relationshipOwner?.email ||
      ''
    ).trim().replace(/[\r\n\t]/g, '');
    
    if (contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      notificationEmail = contactEmail;
      break;
    }
  }
  
  // 3. Final fallback to account email
  if (!notificationEmail && account?.email) {
    notificationEmail = account.email;
  }
}
```

### Webhook Payload Structure

#### HTTP Request Format
```typescript
// POST request to Power Automate webhook
{
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(powerAutomateAlert)
}
```

#### Response Handling
```typescript
// Success: HTTP 200-299
// Returns: true

// Error: HTTP 400+
// Returns: false
// Logs: Error details to console
```

## Utility Functions

### Date Utilities

#### parseBirthdayForComparison
```typescript
function parseBirthdayForComparison(birthday: string): { month: number; day: number } | null
```
**Description**: Parses birthday string and extracts month/day, handling timezone issues
**Parameters**:
- `birthday`: ISO date string or date string
**Returns**: Object with month (1-12) and day (1-31), or null if invalid

**Example**:
```typescript
const parsed = parseBirthdayForComparison('1990-05-15');
// Returns: { month: 5, day: 15 }
```

#### isDateUpcoming
```typescript
function isDateUpcoming(dateString: string): boolean
```
**Description**: Checks if date is within the next 7 days
**Parameters**:
- `dateString`: ISO date string
**Returns**: Boolean indicating if date is upcoming

#### isDateOverdue
```typescript
function isDateOverdue(dateString: string): boolean
```
**Description**: Checks if date is in the past
**Parameters**:
- `dateString`: ISO date string
**Returns**: Boolean indicating if date is overdue

### File Utilities

#### formatFileSize
```typescript
function formatFileSize(bytes: number): string
```
**Description**: Converts bytes to human-readable format
**Parameters**:
- `bytes`: File size in bytes
**Returns**: Formatted string (e.g., "1.5 MB")

**Example**:
```typescript
formatFileSize(1536000) // Returns: "1.5 MB"
formatFileSize(2048)    // Returns: "2.0 KB"
```

#### getFileIcon
```typescript
function getFileIcon(mimeType: string): string
```
**Description**: Returns emoji icon based on file MIME type
**Parameters**:
- `mimeType`: File MIME type
**Returns**: Emoji string representing file type

**Example**:
```typescript
getFileIcon('application/pdf')  // Returns: "📄"
getFileIcon('image/png')        // Returns: "🖼️"
```

### Filtering Utilities

#### filterAccountsByOwner
```typescript
function filterAccountsByOwner(accounts: Account[], owner: string): Account[]
```
**Description**: Filters accounts by account owner or VP
**Parameters**:
- `accounts`: Array of accounts
- `owner`: Owner name or VP name to filter by
**Returns**: Filtered account array

#### filterContactsByOwnerOrVP
```typescript
function filterContactsByOwnerOrVP(
  contacts: Contact[], 
  accounts: Account[], 
  filter: string
): Contact[]
```
**Description**: Filters contacts by relationship owner or VP
**Parameters**:
- `contacts`: Array of contacts
- `accounts`: Array of accounts (for VP lookup)
- `filter`: Owner/VP name to filter by
**Returns**: Filtered contact array

### Email Utilities

#### validateEmail
```typescript
function validateEmail(email: string): boolean
```
**Description**: Validates email format using regex
**Parameters**:
- `email`: Email address to validate
**Returns**: Boolean indicating if email is valid

**Pattern**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

#### cleanEmail
```typescript
function cleanEmail(email: string): string
```
**Description**: Removes whitespace, newlines, tabs from email
**Parameters**:
- `email`: Email address to clean
**Returns**: Cleaned email string

**Example**:
```typescript
cleanEmail('  user@example.com\n  ') // Returns: "user@example.com"
```

## SharePoint Integration

### Configuration Interface
```typescript
interface SharePointConfig {
  sharePointSite: string;
  sharePointLibrary: string;
  syncFolder?: string;
}
```

### Sync Operations

#### Excel Export
```typescript
interface ExcelData {
  headers: string[];
  data: any[][];
  recordCount: number;
}

function generateAccountsExcel(accounts: Account[]): ExcelData
function generateContactsExcel(contacts: Contact[], accounts: Account[]): ExcelData
```

#### File Operations
```typescript
function uploadToSharePoint(file: File, folder: string): Promise<SharePointFile>
function downloadFromSharePoint(fileId: string): Promise<Blob>
function deleteFromSharePoint(fileId: string): Promise<void>
```

### Folder Structure
```typescript
const SHAREPOINT_FOLDERS = {
  CONTRACTS: 'Contracts',
  PROPOSALS: 'Proposals', 
  PRESENTATIONS: 'Presentations',
  MEETING_NOTES: 'Meeting_Notes',
  CONTACT_FILES: 'Contact_Files',
  GENERAL: 'General',
  SYNC: 'CRM_Data_Sync'
} as const;
```

## Event Handlers

### Form Events
```typescript
// Account Form Events
type AccountSaveHandler = (account: Account) => void;
type AccountCancelHandler = () => void;

// Contact Form Events  
type ContactSaveHandler = (contact: Contact) => void;
type ContactCancelHandler = () => void;

// Document Events
type DocumentUploadHandler = (files: FileList) => void;
type DocumentDeleteHandler = (documentId: string) => void;

// Alert Events
type AlertSendHandler = (alert: Alert) => Promise<boolean>;
type AlertCompleteHandler = (alertId: string) => void;
type AlertSnoozeHandler = (alertId: string, days: number) => void;
```

### Navigation Events
```typescript
type ViewChangeHandler = (view: View) => void;
type BackNavigationHandler = () => void;
```

### Filter Events
```typescript
type FilterChangeHandler = (filterValue: string) => void;
type SearchHandler = (searchTerm: string) => void;
```

## Type Definitions

### Enums and Unions

#### View Types
```typescript
type View = 
  | 'welcome' 
  | 'accounts' 
  | 'contacts' 
  | 'data-view' 
  | 'document-storage' 
  | 'contact-hierarchy' 
  | 'task-management' 
  | 'alert-system' 
  | 'sharepoint-sync';
```

#### Account Status
```typescript
type AccountStatus = 'Active' | 'Inactive' | 'Prospect' | 'Customer';
```

#### Influence Level
```typescript
type InfluenceLevel = 'High' | 'Medium' | 'Low';
```

#### Contact Method
```typescript
type ContactMethod = 'email' | 'mobile phone' | 'office phone';
```

#### Document Type
```typescript
type DocumentType = 
  | 'contract' 
  | 'proposal' 
  | 'presentation' 
  | 'meeting-notes' 
  | 'other';
```

#### Alert Type
```typescript
type AlertType = 
  | 'birthday'
  | 'follow-up'
  | 'task-due'
  | 'jbp'
  | 'accountEvent'
  | 'contactEvent'
  | 'contract-renewal'
  | 'meeting'
  | 'milestone';
```

#### Alert Priority
```typescript
type AlertPriority = 'low' | 'medium' | 'high' | 'critical';
```

#### Alert Status
```typescript
type AlertStatus = 'pending' | 'completed' | 'dismissed';
```

#### Sync Status
```typescript
type SyncStatus = 'synced' | 'pending' | 'error';
```

#### Reminder Frequency
```typescript
type ReminderFrequency = 'daily' | 'every-3-days' | 'weekly' | 'once';
```

### Generic Types

#### API Response
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```

#### Pagination
```typescript
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

#### Filter Options
```typescript
interface FilterOptions {
  searchTerm?: string;
  owner?: string;
  vicePresident?: string;
  accountStatus?: AccountStatus;
  contactInfluence?: InfluenceLevel;
  documentType?: DocumentType;
  alertType?: AlertType;
  alertPriority?: AlertPriority;
  dateRange?: {
    start: string;
    end: string;
  };
}
```

## Error Handling

### Error Types

#### CRMError
```typescript
interface CRMError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

type ErrorHandler = (error: CRMError) => void;
```

#### PowerAutomateConfigError
```typescript
class PowerAutomateConfigError extends Error {
  constructor(message: string, public envVarName: string) {
    super(message);
    this.name = 'PowerAutomateConfigError';
  }
}
```

**Usage**:
```typescript
try {
  await powerAutomateService.sendAlert(alert);
} catch (error) {
  if (error instanceof PowerAutomateConfigError) {
    console.error(`Configuration missing: ${error.envVarName}`);
    alert(`Please configure ${error.envVarName} in your .env file`);
  }
}
```

### Common Error Codes
```typescript
const ERROR_CODES = {
  STORAGE_FULL: 'STORAGE_FULL',
  NETWORK_ERROR: 'NETWORK_ERROR', 
  SHAREPOINT_ACCESS: 'SHAREPOINT_ACCESS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PA_CONFIG_ERROR: 'PA_CONFIG_ERROR',
  PA_SEND_ERROR: 'PA_SEND_ERROR',
  EMAIL_VALIDATION_ERROR: 'EMAIL_VALIDATION_ERROR'
} as const;
```

### Error Handling Patterns

#### Alert System Errors
```typescript
// Email validation error
if (!notificationEmail) {
  throw new Error('No notification email configured');
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)) {
  throw new Error(`Invalid email format: "${notificationEmail}"`);
}

// Power Automate configuration error
if (!webhookUrl) {
  throw new PowerAutomateConfigError(
    `Power Automate workflow URL not configured for alert type '${alertType}'`,
    envVarName
  );
}

// Network error
try {
  const response = await fetch(webhookUrl, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
} catch (error) {
  console.error('Failed to send alert:', error);
  return false;
}
```

## Performance Considerations

### Optimization Patterns
```typescript
// Memoized components
const MemoizedAccountCard = React.memo(AccountCard);
const MemoizedContactCard = React.memo(ContactCard);
const MemoizedAlertCard = React.memo(AlertCard);

// Debounced search
const debouncedSearch = useMemo(
  () => debounce((term: string) => setSearchTerm(term), 300),
  []
);

// Memoized filtered data
const filteredAlerts = useMemo(
  () => alerts.filter(alert => /* filter logic */),
  [alerts, filter, searchTerm]
);

// Virtual scrolling for large lists
interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => JSX.Element;
}
```

### Caching Strategies
```typescript
// Cache sent alerts to prevent duplicate sends
const sentAlertsCache = new Set<string>();

// Cache relationship owner lookups
const ownerCache = new Map<string, RelationshipOwner>();

// Cache email resolution results
const emailCache = new Map<string, string>();
```

---

## API Usage Examples

### Complete Alert Workflow

```typescript
// 1. Initialize Power Automate service
const powerAutomateService = new PowerAutomateService();

// 2. Check if configured
if (!powerAutomateService.isEnabled()) {
  console.warn('Power Automate not configured');
  return;
}

// 3. Generate alert
const alert: Alert = {
  id: 'birthday-contact123',
  type: 'birthday',
  title: 'Birthday Reminder',
  description: 'John Doe\'s birthday is in 7 days',
  priority: 'medium',
  dueDate: '2024-12-15',
  relatedId: 'contact123',
  relatedType: 'contact',
  relatedName: 'John Doe',
  status: 'pending',
  createdAt: new Date().toISOString(),
  actionRequired: true,
  contactOwner: 'Jane Smith'
};

// 4. Resolve email
const contact = contacts.find(c => c.id === alert.relatedId);
const ownerDetails = relationshipOwners.find(ro => ro.name === alert.contactOwner);

const notificationEmail = (
  contact?.notificationEmail ||
  contact?.primaryDiageoRelationshipOwners?.ownerEmail ||
  ownerDetails?.email ||
  contact?.relationshipOwner?.email ||
  ''
).trim().replace(/[\r\n\t]/g, '');

// 5. Validate email
if (!notificationEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)) {
  console.error('Invalid or missing email');
  return;
}

// 6. Create Power Automate payload
const powerAutomateAlert: PowerAutomateAlert = {
  alertType: 'birthday',
  contactName: alert.relatedName,
  contactEmail: contact?.email,
  accountName: account?.accountName,
  dueDate: alert.dueDate,
  daysUntil: 7,
  priority: alert.priority,
  relationshipOwner: alert.contactOwner || 'Unassigned',
  relationshipOwnerEmail: notificationEmail,
  vicePresident: alert.vicePresident,
  description: alert.description,
  additionalData: {
    alertId: alert.id,
    contactId: contact?.id,
    accountId: account?.id,
    autoSent: false
  }
};

// 7. Send to Power Automate
try {
  const success = await powerAutomateService.sendAlert(powerAutomateAlert);
  
  if (success) {
    // 8. Track sent alert
    saveSentAlert({
      alertId: alert.id,
      alertType: 'birthday',
      contactId: alert.relatedId,
      sentAt: new Date().toISOString(),
      dueDate: alert.dueDate
    });
    
    console.log('Alert sent successfully');
  }
} catch (error) {
  if (error instanceof PowerAutomateConfigError) {
    console.error(`Missing configuration: ${error.envVarName}`);
  } else {
    console.error('Failed to send alert:', error);
  }
}
```

---

**API Version**: 1.3.0  
**Last Updated**: December 2024  
**Compatibility**: React 18+, TypeScript 5+