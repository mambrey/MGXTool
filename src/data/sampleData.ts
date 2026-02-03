import type { Account, Contact } from '@/types/crm';

export const sampleAccounts: Account[] = [
  {
    id: 'cvs-account-1',
    accountName: 'CVS Health Corporation',
    industry: 'Healthcare & Pharmacy',
    accountOwner: 'John Smith',
    accountStatus: 'Active',
    channel: 'Direct Sales',
    revenue: 15000000,
    vp: 'Sarah Johnson',
    primaryContactId: 'emily-jones-contact',
    createdAt: '2024-01-15T10:00:00Z',
    lastModified: '2024-11-01T15:30:00Z'
  },
  {
    id: 'strategic-account-2',
    accountName: 'Walmart Inc.',
    industry: 'Retail',
    accountOwner: 'Alice Thompson',
    accountStatus: 'Active',
    channel: 'Channel Partner',
    revenue: 25000000,
    vp: 'JZ',
    primaryContactId: 'walmart-primary-contact',
    createdAt: '2024-02-01T10:00:00Z',
    lastModified: '2024-11-01T15:30:00Z'
  },
  {
    id: 'strategic-account-3',
    accountName: 'Target Corporation',
    industry: 'Retail',
    accountOwner: 'Bob Wilson',
    accountStatus: 'Active',
    channel: 'Direct Sales',
    revenue: 18000000,
    vp: 'JZ',
    primaryContactId: 'target-primary-contact',
    createdAt: '2024-02-15T10:00:00Z',
    lastModified: '2024-11-01T15:30:00Z'
  }
];

export const sampleContacts: Contact[] = [
  {
    id: 'emily-jones-contact',
    firstName: 'Emily',
    lastName: 'Jones',
    email: 'emily.jones@cvs.com',
    title: 'VP of Strategic Partnerships',
    accountId: 'cvs-account-1',
    contactType: 'Primary',
    influence: 'Decision Maker',
    officePhone: '(401) 765-1500',
    mobilePhone: '(401) 555-0123',
    preferredContactMethod: 'email',
    birthday: '1985-11-15', // Birthday coming up
    birthdayAlert: true,
    relationshipStatus: 'Strategic Partner',
    nextContactDate: '2024-11-10',
    nextContactAlert: true,
    lastContactDate: '2024-10-15',
    socialHandles: ['@emilyjones_cvs', 'linkedin.com/in/emilyjones'],
    knownPreferences: 'Prefers morning meetings, interested in digital health initiatives',
    notes: 'Key decision maker for strategic partnerships. Very responsive to email.',
    relationshipOwner: {
      name: 'Mora Ambrey',
      email: 'mora.ambrey@company.com',
      vicePresident: 'Sarah Johnson'
    },
    uploadedNotes: [],
    createdAt: '2024-01-15T10:00:00Z',
    lastModified: '2024-11-01T15:30:00Z'
  },
  {
    id: 'contact-2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@cvs.com',
    title: 'Director of Operations',
    accountId: 'cvs-account-1',
    contactType: 'Secondary',
    influence: 'Influencer',
    officePhone: '(401) 765-1501',
    mobilePhone: '(401) 555-0124',
    preferredContactMethod: 'mobile phone',
    birthday: '1980-12-25',
    birthdayAlert: true,
    relationshipStatus: 'Business Contact',
    relationshipOwner: {
      name: 'Mora Ambrey',
      email: 'mora.ambrey@company.com',
      vicePresident: 'Sarah Johnson'
    },
    uploadedNotes: [],
    createdAt: '2024-02-01T10:00:00Z',
    lastModified: '2024-11-01T15:30:00Z'
  },
  {
    id: 'walmart-primary-contact',
    firstName: 'Jennifer',
    lastName: 'Davis',
    email: 'jennifer.davis@walmart.com',
    title: 'Chief Procurement Officer',
    accountId: 'strategic-account-2',
    contactType: 'Primary',
    influence: 'Decision Maker',
    officePhone: '(479) 273-4000',
    mobilePhone: '(479) 555-0200',
    preferredContactMethod: 'email',
    birthday: '1978-03-22',
    birthdayAlert: true,
    relationshipStatus: 'Strategic Partner',
    nextContactDate: '2024-11-12',
    nextContactAlert: true,
    lastContactDate: '2024-10-20',
    socialHandles: ['@jdavis_walmart'],
    knownPreferences: 'Prefers detailed proposals, focuses on cost efficiency',
    notes: 'Key decision maker for procurement strategies. Highly analytical.',
    relationshipOwner: {
      name: 'Alice Thompson',
      email: 'alice.thompson@company.com',
      vicePresident: 'JZ'
    },
    uploadedNotes: [],
    createdAt: '2024-02-01T10:00:00Z',
    lastModified: '2024-11-01T15:30:00Z'
  },
  {
    id: 'target-primary-contact',
    firstName: 'Robert',
    lastName: 'Martinez',
    email: 'robert.martinez@target.com',
    title: 'VP of Merchandising',
    accountId: 'strategic-account-3',
    contactType: 'Primary',
    influence: 'Decision Maker',
    officePhone: '(612) 304-6073',
    mobilePhone: '(612) 555-0300',
    preferredContactMethod: 'mobile phone',
    birthday: '1982-07-14',
    birthdayAlert: true,
    relationshipStatus: 'Strategic Partner',
    nextContactDate: '2024-11-08',
    nextContactAlert: true,
    lastContactDate: '2024-10-25',
    socialHandles: ['@rmartinez_target', 'linkedin.com/in/robertmartinez'],
    knownPreferences: 'Prefers phone calls, interested in innovative products',
    notes: 'Drives merchandising strategy. Open to new partnerships.',
    relationshipOwner: {
      name: 'Bob Wilson',
      email: 'bob.wilson@company.com',
      vicePresident: 'JZ'
    },
    uploadedNotes: [],
    createdAt: '2024-02-15T10:00:00Z',
    lastModified: '2024-11-01T15:30:00Z'
  }
];