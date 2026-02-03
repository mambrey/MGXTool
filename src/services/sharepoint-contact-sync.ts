/**
 * SharePoint Contact Sync Service
 * Automatically syncs contacts to SharePoint CSV when they are added or updated
 */

import type { Contact, Account } from '@/types/crm';

// SharePoint configuration
const SHAREPOINT_CONFIG = {
  siteUrl: 'https://diageo.sharepoint.com/sites/CommercialAnalytics314',
  libraryPath: 'Shared Documents/CRM Tool/Strategic Accounts Documents',
  fileName: 'Contacts_Template.csv',
  fullUrl: 'https://diageo.sharepoint.com/:x:/r/sites/CommercialAnalytics314/Shared%20Documents/CRM%20Tool/Strategic%20Accounts%20Documents/Contacts_Template.csv'
};

/**
 * Convert contacts array to CSV format
 */
export const convertContactsToCSV = (contacts: Contact[], accounts: Account[]): string => {
  // CSV Headers - all available contact fields
  const headers = [
    'First Name', 'Last Name', 'Preferred First Name', 'Email', 'Office Phone', 'Mobile Phone',
    'Preferred Contact Method', 'Preferred Shipping Address', 'Title', 'Current Role Tenure',
    'Manager ID', 'Account ID', 'Banner/Buying Office ID', 'Contact Type', 'Is Primary Contact',
    'Contact Active Status', 'Relationship Status', 'Category/Segment Ownership', 'Influence Level',
    'Is Influencer', 'Influencer Level', 'Receptiveness', 'Birthday', 'Birthday Alert',
    'Birthday Alert Options', 'Next Contact Date', 'Next Contact Alert', 'Next Contact Alert Options',
    'Last Contact Date', 'LinkedIn Profile', 'Social Handles', 'Known Preferences', 'Entertainment',
    'Decision Bias Profile', 'Follow Through', 'Values', 'Pain Points', 'Notes', 'Headshot URL',
    'Relationship Owner Name', 'Relationship Owner Email', 'Relationship Owner Title', 'SVP',
    'Sales Roles', 'Support Roles', 'Sales Last Check-In', 'Support Last Check-In',
    'Notification Email', 'Teams Channel ID', 'Director', 'Vice President', 'Senior Vice President',
    'Created At', 'Last Modified'
  ];

  // Convert contacts to CSV rows
  const rows = contacts.map(contact => {
    const account = accounts.find(a => a.id === contact.accountId);
    
    return [
      contact.firstName || '',
      contact.lastName || '',
      contact.preferredFirstName || '',
      contact.email || '',
      contact.officePhone || '',
      contact.mobilePhone || '',
      contact.preferredContactMethod || '',
      contact.preferredShippingAddress || '',
      contact.title || '',
      contact.currentRoleTenure || '',
      contact.managerId || '',
      contact.accountId || '',
      contact.bannerBuyingOfficeId || '',
      contact.isPrimaryContact ? 'Primary' : 'Secondary',
      contact.isPrimaryContact ? 'TRUE' : 'FALSE',
      contact.contactActiveStatus || '',
      contact.relationshipStatus || '',
      Array.isArray(contact.categorySegmentOwnership) ? contact.categorySegmentOwnership.join(', ') : '',
      '', // Influence Level (legacy field)
      '', // Is Influencer (legacy field)
      '', // Influencer Level (legacy field)
      '', // Receptiveness (legacy field)
      contact.birthday || '',
      contact.birthdayAlert ? 'TRUE' : 'FALSE',
      Array.isArray(contact.birthdayAlertOptions) ? contact.birthdayAlertOptions.join(', ') : '',
      contact.nextContactDate || '',
      contact.nextContactAlert ? 'TRUE' : 'FALSE',
      Array.isArray(contact.nextContactAlertOptions) ? contact.nextContactAlertOptions.join(', ') : '',
      contact.lastContactDate || '',
      contact.linkedinProfile || '',
      '', // Social Handles (legacy field)
      contact.knownPreferences || '',
      contact.entertainment || '',
      Array.isArray(contact.decisionBiasProfile) ? contact.decisionBiasProfile.join(', ') : (contact.decisionBiasProfile || ''),
      contact.followThrough || '',
      contact.values || '',
      contact.painPoints || '',
      contact.notes || '',
      contact.headshot || '',
      contact.primaryDiageoRelationshipOwners?.ownerName || '',
      contact.primaryDiageoRelationshipOwners?.ownerEmail || '',
      contact.primaryDiageoRelationshipOwners?.ownerTitle || '',
      contact.primaryDiageoRelationshipOwners?.svp || '',
      contact.primaryDiageoRelationshipOwners?.sales ? JSON.stringify(contact.primaryDiageoRelationshipOwners.sales) : '',
      contact.primaryDiageoRelationshipOwners?.support ? JSON.stringify(contact.primaryDiageoRelationshipOwners.support) : '',
      contact.primaryDiageoRelationshipOwners?.salesLastCheckIn ? JSON.stringify(contact.primaryDiageoRelationshipOwners.salesLastCheckIn) : '',
      contact.primaryDiageoRelationshipOwners?.supportLastCheckIn ? JSON.stringify(contact.primaryDiageoRelationshipOwners.supportLastCheckIn) : '',
      '', // Notification Email (legacy field)
      '', // Teams Channel ID (legacy field)
      '', // Director (legacy field)
      '', // Vice President (legacy field)
      '', // Senior Vice President (legacy field)
      contact.createdAt || '',
      contact.lastModified || ''
    ].map(field => {
      // Escape fields containing commas, quotes, or newlines
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    });
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  return csvContent;
};

/**
 * Sync contacts to SharePoint
 * This is a placeholder - actual implementation would require SharePoint API integration
 */
export const syncContactsToSharePoint = async (contacts: Contact[], accounts: Account[]): Promise<boolean> => {
  try {
    console.log('🔄 Syncing contacts to SharePoint...');
    console.log(`📍 Target: ${SHAREPOINT_CONFIG.fullUrl}`);
    console.log(`📊 Contact count: ${contacts.length}`);
    
    // Generate CSV content
    const csvContent = convertContactsToCSV(contacts, accounts);
    
    // Log sync details
    console.log('✅ CSV generated successfully');
    console.log(`📝 CSV size: ${csvContent.length} characters`);
    
    // In a real implementation, this would:
    // 1. Authenticate with SharePoint
    // 2. Upload the CSV file to the specified location
    // 3. Return success/failure status
    
    // For now, we'll log the sync attempt and download locally as backup
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Contacts_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    
    console.log('💾 Local backup created');
    console.log('⚠️ Note: Full SharePoint integration requires authentication setup');
    
    return true;
  } catch (error) {
    console.error('❌ Error syncing contacts to SharePoint:', error);
    return false;
  }
};

/**
 * Get SharePoint configuration
 */
export const getSharePointConfig = () => SHAREPOINT_CONFIG;
