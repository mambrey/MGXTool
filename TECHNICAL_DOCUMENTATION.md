# Strategic Accounts CRM Dashboard - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [Data Models](#data-models)
7. [SharePoint Integration](#sharepoint-integration)
8. [Features](#features)
9. [Installation & Setup](#installation--setup)
10. [Configuration](#configuration)
11. [API Reference](#api-reference)
12. [Development Guidelines](#development-guidelines)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)

## Overview

The Strategic Accounts CRM Dashboard is a comprehensive customer relationship management platform built with React, TypeScript, and Tailwind CSS. It provides sophisticated account and contact management capabilities with integrated SharePoint document storage and real-time filtering functionality.

### Key Capabilities
- **Account Management**: Comprehensive account profiles with revenue tracking
- **Contact Management**: Detailed contact relationships with hierarchy visualization
- **Document Storage**: SharePoint-integrated document management
- **Alert System**: Proactive notifications for birthdays and follow-ups
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
```

### Component Architecture
```
App.tsx
├── CRMTool.tsx (Main Container)
│   ├── WelcomeScreen.tsx (Dashboard)
│   ├── AccountForm.tsx (Account Management)
│   ├── ContactForm.tsx (Contact Management)
│   ├── DocumentStorage.tsx (File Management)
│   ├── AlertSystem.tsx (Notifications)
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
│   │   ├── AlertSystem.tsx   # Alert management
│   │   ├── TaskManagement.tsx # Task tracking
│   │   ├── SharePointSync.tsx # SharePoint integration
│   │   └── ContactHierarchy.tsx # Org visualization
│   ├── lib/                  # Utility functions
│   │   ├── utils.ts          # Common utilities
│   │   └── storage.ts        # Local storage helpers
│   ├── types/                # TypeScript definitions
│   │   ├── crm.ts           # Core CRM types
│   │   └── crm-advanced.ts  # Extended types
│   ├── App.tsx              # Root component
│   └── main.tsx             # Application entry
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

### 4. ContactForm.tsx
**Purpose**: Contact management with relationship tracking
**Key Features**:
- Personal and professional information
- Relationship hierarchy (VP/Owner structure)
- Birthday and contact date alerts
- Social media integration
- Document attachments

### 5. DocumentStorage.tsx
**Purpose**: SharePoint-integrated document management
**Key Features**:
- File upload to SharePoint
- Document categorization
- Version control
- Access control (confidential marking)

### 6. SharePointSync.tsx
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

### Contact Model
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
  preferredContactMethod?: string;
  socialHandles?: string[];
  knownPreferences?: string;
  notes?: string;
  uploadedNotes?: UploadedNote[];
  createdAt?: string;
  lastModified?: string;
}
```

### RelationshipOwner Model
```typescript
interface RelationshipOwner {
  name: string;
  email: string;
  vicePresident?: string;
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

## Features

### 1. Advanced Filtering System
- **Owner-based filtering**: Filter by account owners, contact owners, and VPs
- **Real-time updates**: KPIs update dynamically based on selected filters
- **Cross-module consistency**: Filters apply across all relevant components

### 2. Alert System
- **Birthday Alerts**: 7-day advance notification for contact birthdays
- **Contact Due Dates**: Overdue and upcoming contact reminders
- **Visual Indicators**: Color-coded badges and status indicators

### 3. Contact Hierarchy
- **Organizational Structure**: Visual representation of reporting relationships
- **VP Oversight**: Vice President assignment and tracking
- **Relationship Mapping**: Complex relationship visualization

### 4. Task Management
- **Integrated Tasks**: Tasks linked to accounts and contacts
- **Due Date Tracking**: Priority-based task organization
- **Power Automate Integration**: Automated workflow triggers

### 5. Mobile Optimization
- **Responsive Design**: Optimized for all screen sizes
- **Touch-friendly Interface**: Mobile-specific interactions
- **Progressive Enhancement**: Core functionality on all devices

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Modern web browser
- SharePoint access (for document features)

### Installation Steps
```bash
# Clone the repository
git clone <repository-url>
cd shadcn-ui

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Run linting
pnpm run lint
```

### Environment Setup
1. **SharePoint Configuration**: Update SharePoint URLs in components
2. **Local Storage**: Browser-based data persistence (no external database required)
3. **Development Tools**: ESLint and TypeScript configured for optimal development

## Configuration

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

## API Reference

### Storage Functions
```typescript
// Save data to localStorage
saveToStorage<T>(key: string, data: T): void

// Load data from localStorage
loadFromStorage<T>(key: string, defaultValue: T): T
```

### Utility Functions
```typescript
// Date utilities
isDateUpcoming(dateString: string): boolean
isDateOverdue(dateString: string): boolean

// File utilities
formatFileSize(bytes: number): string
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

### Adding New Features
1. **Type Definitions**: Update type files first
2. **Component Creation**: Follow existing component patterns
3. **State Integration**: Integrate with existing state management
4. **Documentation**: Update technical documentation
5. **Testing**: Add appropriate test coverage

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
- **Performance Optimization**: Enable compression and caching
- **Security**: Implement proper HTTPS and CSP headers

## Troubleshooting

### Common Issues

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

### Debug Mode
Enable debug logging by adding to localStorage:
```javascript
localStorage.setItem('crm-debug', 'true');
```

### Support Resources
- **Component Library**: [shadcn/ui documentation](https://ui.shadcn.com/)
- **Tailwind CSS**: [Official documentation](https://tailwindcss.com/docs)
- **React**: [React documentation](https://react.dev/)
- **TypeScript**: [TypeScript handbook](https://www.typescriptlang.org/docs/)

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

---

**Last Updated**: November 2024
**Maintained By**: Development Team
**License**: MIT License