# Strategic Accounts CRM - API Documentation

## Overview
This document provides comprehensive API documentation for the Strategic Accounts CRM Dashboard, including component interfaces, data models, and integration patterns.

## Table of Contents
1. [Component APIs](#component-apis)
2. [Data Models](#data-models)
3. [Storage APIs](#storage-apis)
4. [Utility Functions](#utility-functions)
5. [SharePoint Integration](#sharepoint-integration)
6. [Event Handlers](#event-handlers)
7. [Type Definitions](#type-definitions)

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
  website?: string;
  phone?: string;
  email?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  description?: string;
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
  influence?: InfluenceLevel;
  preferredContactMethod?: ContactMethod;
  socialHandles?: string[];
  knownPreferences?: string;
  notes?: string;
  uploadedNotes?: UploadedNote[];
}
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
  website?: string;
  phone?: string;
  email?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  description?: string;
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
  influence?: 'High' | 'Medium' | 'Low';
  preferredContactMethod?: 'email' | 'mobile phone' | 'office phone';
  socialHandles?: string[];
  knownPreferences?: string;
  notes?: string;
  uploadedNotes?: UploadedNote[];
  createdAt?: string;
  lastModified?: string;
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
  email: string;
  vicePresident?: string;
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

### Storage Keys
```typescript
const STORAGE_KEYS = {
  ACCOUNTS: 'crm-accounts',
  CONTACTS: 'crm-contacts',
  DOCUMENTS: 'crm-documents',
  TASKS: 'crm-tasks',
  SETTINGS: 'crm-settings'
} as const;
```

## Utility Functions

### Date Utilities

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

#### getFileIcon
```typescript
function getFileIcon(mimeType: string): string
```
**Description**: Returns emoji icon based on file MIME type
**Parameters**:
- `mimeType`: File MIME type
**Returns**: Emoji string representing file type

### Filtering Utilities

#### filterAccountsByOwner
```typescript
function filterAccountsByOwner(accounts: Account[], owner: string): Account[]
```

#### filterContactsByOwnerOrVP
```typescript
function filterContactsByOwnerOrVP(
  contacts: Contact[], 
  accounts: Account[], 
  filter: string
): Contact[]
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

#### Sync Status
```typescript
type SyncStatus = 'synced' | 'pending' | 'error';
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
  dateRange?: {
    start: string;
    end: string;
  };
}
```

## Error Handling

### Error Types
```typescript
interface CRMError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

type ErrorHandler = (error: CRMError) => void;
```

### Common Error Codes
```typescript
const ERROR_CODES = {
  STORAGE_FULL: 'STORAGE_FULL',
  NETWORK_ERROR: 'NETWORK_ERROR', 
  SHAREPOINT_ACCESS: 'SHAREPOINT_ACCESS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED'
} as const;
```

## Performance Considerations

### Optimization Patterns
```typescript
// Memoized components
const MemoizedAccountCard = React.memo(AccountCard);
const MemoizedContactCard = React.memo(ContactCard);

// Debounced search
const debouncedSearch = useMemo(
  () => debounce((term: string) => setSearchTerm(term), 300),
  []
);

// Virtual scrolling for large lists
interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => JSX.Element;
}
```

---

**API Version**: 1.1.0  
**Last Updated**: November 2024  
**Compatibility**: React 18+, TypeScript 5+