import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, AlertTriangle, CheckCircle, X, Filter, Search, User, Send, Zap, RefreshCw, Settings, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { Alert as AlertType, Task } from '@/types/crm-advanced';
import type { Account, Contact, RelationshipOwner } from '@/types/crm';
import { loadFromStorage, saveToStorage, saveSentAlert, wasAlertSent, clearOldSentAlerts } from '@/lib/storage';
import { powerAutomateService, type PowerAutomateAlert, PowerAutomateConfigError } from '@/services/power-automate';
import { parseBirthdayForComparison } from '@/lib/dateUtils';

interface AlertSystemProps {
  accounts: Account[];
  contacts: Contact[];
  onBack: () => void;
}

type AlertOption = 'same_day' | 'day_before' | 'week_before';

interface AlertSettings {
  birthdayAlertOptions: AlertOption[];
  nextContactAlertOptions: AlertOption[];
  taskAlertOptions: AlertOption[];
  jbpAlertOptions: AlertOption[];
  eventAlertOptions: AlertOption[];
  reminderFrequency: 'daily' | 'every-3-days' | 'weekly' | 'once';
}

interface SnoozedAlert {
  alertId: string;
  snoozeUntil: string;
}

interface SentAlertRecord {
  alertId: string;
  alertType: string;
  contactId: string;
  sentAt: string;
  dueDate: string;
}

export default function AlertSystem({ accounts, contacts, onBack }: AlertSystemProps) {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'high' | 'overdue' | 'completed'>('all');
  const [relationshipOwnerFilter, setRelationshipOwnerFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingAlerts, setSendingAlerts] = useState<Set<string>>(new Set());
  const [sentAlerts, setSentAlerts] = useState<Set<string>>(new Set());
  const [powerAutomateEnabled, setPowerAutomateEnabled] = useState(false);
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [snoozedAlerts, setSnoozedAlerts] = useState<SnoozedAlert[]>([]);
  
  // Alert scheduling settings with checkbox options
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    birthdayAlertOptions: ['week_before'],
    nextContactAlertOptions: ['week_before'],
    taskAlertOptions: ['week_before'],
    jbpAlertOptions: ['week_before'],
    eventAlertOptions: ['week_before'],
    reminderFrequency: 'once'
  });

  // Helper function to convert alert options to days
  const getMaxDaysFromOptions = (options: AlertOption[]): number => {
    if (options.length === 0) return 0;
    if (options.includes('week_before')) return 7;
    if (options.includes('day_before')) return 1;
    if (options.includes('same_day')) return 0;
    return 7; // default
  };

  // Helper function to check if alert should be shown based on options
  const shouldShowAlert = (daysUntil: number, options: AlertOption[]): boolean => {
    if (options.length === 0) return false;
    if (options.includes('same_day') && daysUntil === 0) return true;
    if (options.includes('day_before') && daysUntil === 1) return true;
    if (options.includes('week_before') && daysUntil === 7) return true;
    return false;
  };

  // Load settings and snoozed alerts on mount
  useEffect(() => {
    setPowerAutomateEnabled(powerAutomateService.isEnabled());
    const savedAutoSend = loadFromStorage('crm-pa-auto-send', false);
    setAutoSendEnabled(savedAutoSend);
    
    const savedSettings = loadFromStorage<AlertSettings>('crm-alert-settings', {
      birthdayAlertOptions: ['week_before'],
      nextContactAlertOptions: ['week_before'],
      taskAlertOptions: ['week_before'],
      jbpAlertOptions: ['week_before'],
      eventAlertOptions: ['week_before'],
      reminderFrequency: 'once'
    });
    setAlertSettings(savedSettings);
    
    const savedSnoozed = loadFromStorage<SnoozedAlert[]>('crm-snoozed-alerts', []);
    setSnoozedAlerts(savedSnoozed);
    
    // Load previously sent alerts
    const sentAlertIds = new Set<string>();
    alerts.forEach(alert => {
      if (wasAlertSent(alert.id)) {
        sentAlertIds.add(alert.id);
      }
    });
    setSentAlerts(sentAlertIds);
    
    // Clean up old sent alert records (older than 30 days)
    clearOldSentAlerts(30);
  }, []);

  // Auto-send alerts when enabled
  useEffect(() => {
    if (!autoSendEnabled || !powerAutomateEnabled) return;

    const autoSendAlerts = async () => {
      for (const alert of alerts) {
        // Auto-send birthday, next contact, task, JBP, and event alerts that haven't been sent yet
        if ((alert.type === 'birthday' || alert.type === 'follow-up' || alert.type === 'task-due' || 
             alert.type === 'jbp' || alert.type === 'accountEvent' || alert.type === 'contactEvent') && alert.status === 'pending' && !sentAlerts.has(alert.id) && !wasAlertSent(alert.id) && !isAlertSnoozed(alert.id) && !alert.isCompleted) {
          
          // Check if we should send based on reminder frequency
          if (shouldSendReminder(alert)) {
            console.log(`Auto-sending alert to Power Automate: ${alert.id}`);
            await sendAlertToPowerAutomate(alert, true);
            
            // Add delay between sends to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    };

    autoSendAlerts();
  }, [alerts, autoSendEnabled, powerAutomateEnabled]);

  const handleAutoSendToggle = (enabled: boolean) => {
    setAutoSendEnabled(enabled);
    saveToStorage('crm-pa-auto-send', enabled);
  };

  const handleToggleAlertOption = (
    alertType: 'birthdayAlertOptions' | 'nextContactAlertOptions' | 'taskAlertOptions' | 'jbpAlertOptions' | 'eventAlertOptions',
    option: AlertOption
  ) => {
    const currentOptions = alertSettings[alertType];
    const newOptions = currentOptions.includes(option)
      ? currentOptions.filter(o => o !== option)
      : [...currentOptions, option];
    
    const newSettings = { ...alertSettings, [alertType]: newOptions };
    setAlertSettings(newSettings);
    saveToStorage('crm-alert-settings', newSettings);
  };

  const getAlertOptionLabel = (option: AlertOption): string => {
    switch (option) {
      case 'same_day': return 'Same Day';
      case 'day_before': return 'Day Before';
      case 'week_before': return 'Week Before';
    }
  };

  const isAlertSnoozed = (alertId: string): boolean => {
    const snoozed = snoozedAlerts.find(s => s.alertId === alertId);
    if (!snoozed) return false;
    
    const snoozeUntil = new Date(snoozed.snoozeUntil);
    const now = new Date();
    
    if (now >= snoozeUntil) {
      // Snooze period has expired, remove it
      const updated = snoozedAlerts.filter(s => s.alertId !== alertId);
      setSnoozedAlerts(updated);
      saveToStorage('crm-snoozed-alerts', updated);
      return false;
    }
    
    return true;
  };

  const handleSnoozeAlert = (alertId: string, days: number) => {
    const snoozeUntil = new Date();
    snoozeUntil.setDate(snoozeUntil.getDate() + days);
    
    const updated = [...snoozedAlerts.filter(s => s.alertId !== alertId), {
      alertId,
      snoozeUntil: snoozeUntil.toISOString()
    }];
    
    setSnoozedAlerts(updated);
    saveToStorage('crm-snoozed-alerts', updated);
    
    window.alert(`✅ Alert snoozed for ${days} day${days !== 1 ? 's' : ''}. You'll be reminded again on ${snoozeUntil.toLocaleDateString()}.`);
  };

  const shouldSendReminder = (alert: AlertType): boolean => {
    if (alertSettings.reminderFrequency === 'once') {
      return !wasAlertSent(alert.id);
    }
    
    // Check last sent date
    const sentAlertRecord = loadFromStorage<SentAlertRecord[]>('crm-sent-alerts', []).find((s: SentAlertRecord) => s.alertId === alert.id);
    if (!sentAlertRecord) return true;
    
    const lastSent = new Date(sentAlertRecord.sentAt);
    const now = new Date();
    const daysSinceLastSent = Math.floor((now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (alertSettings.reminderFrequency) {
      case 'daily':
        return daysSinceLastSent >= 1;
      case 'every-3-days':
        return daysSinceLastSent >= 3;
      case 'weekly':
        return daysSinceLastSent >= 7;
      default:
        return false;
    }
  };

  const handleCleanEmailData = () => {
    console.log('=== CLEANING EMAIL DATA ===');
    
    // Clean relationship owners
    const relationshipOwners = loadFromStorage<RelationshipOwner[]>('crm-relationship-owners', []);
    let cleanedCount = 0;
    
    if (relationshipOwners && relationshipOwners.length > 0) {
      const cleanedOwners = relationshipOwners.map(owner => {
        const originalEmail = owner.email;
        const cleanedEmail = owner.email?.trim().replace(/[\r\n\t]/g, '') || '';
        
        if (originalEmail !== cleanedEmail) {
          console.log(`Cleaning email for ${owner.name}: "${originalEmail}" → "${cleanedEmail}"`);
          cleanedCount++;
        }
        
        return {
          ...owner,
          email: cleanedEmail,
          teamsChannelId: owner.teamsChannelId?.trim() || undefined,
          teamsChatId: owner.teamsChatId?.trim() || undefined
        };
      });
      
      saveToStorage('crm-relationship-owners', cleanedOwners);
    }
    
    // Clean contacts
    const savedContacts = loadFromStorage<Contact[]>('crm-contacts', []);
    if (savedContacts && savedContacts.length > 0) {
      const cleanedContacts = savedContacts.map(contact => {
        const originalEmail = contact.email;
        const cleanedEmail = contact.email?.trim().replace(/[\r\n\t]/g, '') || '';
        
        if (originalEmail !== cleanedEmail) {
          console.log(`Cleaning email for contact ${contact.firstName} ${contact.lastName}: "${originalEmail}" → "${cleanedEmail}"`);
          cleanedCount++;
        }
        
        return {
          ...contact,
          email: cleanedEmail,
          notificationEmail: contact.notificationEmail?.trim().replace(/[\r\n\t]/g, '') || undefined,
          relationshipOwner: contact.relationshipOwner ? {
            ...contact.relationshipOwner,
            email: contact.relationshipOwner.email?.trim().replace(/[\r\n\t]/g, '') || undefined
          } : undefined,
          primaryDiageoRelationshipOwners: contact.primaryDiageoRelationshipOwners ? {
            ...contact.primaryDiageoRelationshipOwners,
            ownerEmail: contact.primaryDiageoRelationshipOwners.ownerEmail?.trim().replace(/[\r\n\t]/g, '') || undefined
          } : undefined
        };
      });
      
      saveToStorage('crm-contacts', cleanedContacts);
    }
    
    console.log(`=== CLEANING COMPLETE: ${cleanedCount} emails cleaned ===`);
    
    if (cleanedCount > 0) {
      window.alert(`✅ Email cleaning complete!\n\n${cleanedCount} email address${cleanedCount !== 1 ? 'es were' : ' was'} cleaned.\n\nThe page will now reload to apply the changes.`);
      window.location.reload();
    } else {
      window.alert('✅ All email addresses are already clean!\n\nNo corrupted emails were found.');
    }
  };

  // Handle alert completion toggle
  const handleToggleCompletion = (alertId: string) => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id === alertId) {
        const newCompletionState = !alert.isCompleted;
        
        // Show confirmation for uncompleting
        if (alert.isCompleted && !window.confirm('Are you sure you want to mark this alert as incomplete? This will move it back to your active alerts.')) {
          return alert;
        }
        
        return {
          ...alert,
          isCompleted: newCompletionState,
          completedAt: newCompletionState ? new Date().toISOString() : undefined,
          status: newCompletionState ? 'completed' : 'pending'
        };
      }
      return alert;
    }));
    
    // Save to localStorage
    const updatedAlerts = alerts.map(alert => {
      if (alert.id === alertId) {
        const newCompletionState = !alert.isCompleted;
        return {
          ...alert,
          isCompleted: newCompletionState,
          completedAt: newCompletionState ? new Date().toISOString() : undefined,
          status: newCompletionState ? 'completed' : 'pending'
        };
      }
      return alert;
    });
    
    saveToStorage('crm-alerts', updatedAlerts);
  };

  // Handle alert dismissal
  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'dismissed' }
        : alert
    ));
  };

  // Generate alerts from real contacts and tasks data
  useEffect(() => {
    const generateAlerts = (): AlertType[] => {
      const generatedAlerts: AlertType[] = [];
      
      console.log('=== ALERT SYSTEM DEBUG ===');
      console.log('Processing real contacts for alerts:', contacts?.length || 0);
      console.log('Processing accounts:', accounts?.length || 0);
      console.log('Alert Settings:', alertSettings);

      // Load saved alert completion states
      const savedAlerts = loadFromStorage<AlertType[]>('crm-alerts', []);

      // Process real contacts for birthday alerts - add null check
      if (contacts && Array.isArray(contacts)) {
        console.log('\n=== PROCESSING CONTACTS ===');
        contacts.forEach((contact, contactIndex) => {
          const account = accounts?.find(a => a.id === contact.accountId);
          
          console.log(`\n[Contact ${contactIndex + 1}] ${contact.firstName} ${contact.lastName}`);
          
          // Determine the relationship owner - prioritize PRIMARY Diageo relationship owner
          const relationshipOwnerName = contact.primaryDiageoRelationshipOwners?.ownerName || 
                                       contact.relationshipOwner?.name || 
                                       account?.accountOwner || 
                                       'Unassigned';
          
          const vicePresidentName = contact.primaryDiageoRelationshipOwners?.svp ||
                                   contact.relationshipOwner?.vicePresident || 
                                   account?.vp || 
                                   'Unassigned';
          
          console.log(`  - Primary Diageo Owner: ${contact.primaryDiageoRelationshipOwners?.ownerName || 'Not set'}`);
          console.log(`  - Final Owner for Alert: ${relationshipOwnerName}`);
          
          // Birthday alerts - only if birthdayAlert is enabled
          if (contact.birthday && contact.birthdayAlert) {
            // Parse birthday without timezone issues
            const parsed = parseBirthdayForComparison(contact.birthday);
            if (!parsed) return;
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const thisYear = today.getFullYear();
            
            // Create this year's birthday at midnight using parsed month and day
            let nextBirthday = new Date(thisYear, parsed.month - 1, parsed.day);
            nextBirthday.setHours(0, 0, 0, 0);
            
            // If this year's birthday has already passed, use next year's
            if (nextBirthday < today) {
              nextBirthday = new Date(thisYear + 1, parsed.month - 1, parsed.day);
              nextBirthday.setHours(0, 0, 0, 0);
            }
            
            // Calculate days until birthday
            const daysUntilBirthday = Math.round((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            console.log(`  Birthday Check:`);
            console.log(`    - Days until: ${daysUntilBirthday}`);
            console.log(`    - Alert options: ${alertSettings.birthdayAlertOptions.join(', ')}`);
            
            // Show alerts based on user's checkbox selections
            const maxDays = getMaxDaysFromOptions(alertSettings.birthdayAlertOptions);
            if (daysUntilBirthday >= 0 && daysUntilBirthday <= maxDays) {
              console.log(`    ✓ Creating birthday alert (${daysUntilBirthday} days)`);
              
              const alertId = `birthday-${contact.id}`;
              
              // Skip if snoozed
              if (isAlertSnoozed(alertId)) {
                console.log(`    ⏰ Alert is snoozed, skipping`);
                return;
              }
              
              // Check if this alert was previously completed
              const savedAlert = savedAlerts.find(a => a.id === alertId);
              
              generatedAlerts.push({
                id: alertId,
                type: 'birthday',
                title: 'Birthday Reminder',
                description: `${contact.firstName} ${contact.lastName}'s birthday is ${daysUntilBirthday === 0 ? 'today' : daysUntilBirthday === 1 ? 'tomorrow' : `in ${daysUntilBirthday} days`}${account ? ` at ${account.accountName}` : ''}`,
                priority: daysUntilBirthday <= 1 ? 'high' : daysUntilBirthday <= 7 ? 'medium' : 'low',
                dueDate: nextBirthday.toISOString(),
                relatedId: contact.id,
                relatedType: 'contact',
                relatedName: `${contact.firstName} ${contact.lastName}`,
                status: savedAlert?.isCompleted ? 'completed' : 'pending',
                createdAt: new Date().toISOString(),
                actionRequired: true,
                contactOwner: relationshipOwnerName,
                vicePresident: vicePresidentName,
                isCompleted: savedAlert?.isCompleted || false,
                completedAt: savedAlert?.completedAt
              });
            } else {
              console.log(`    ✗ Birthday alert not created (${daysUntilBirthday} days - outside 0-${maxDays} day window)`);
            }
          }

          // Next contact alerts - only if nextContactAlert is enabled
          if (contact.nextContactDate && contact.nextContactAlert) {
            const nextContactDate = new Date(contact.nextContactDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            nextContactDate.setHours(0, 0, 0, 0);
            
            const daysUntilContact = Math.round((nextContactDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            console.log(`  Next Contact Alert: in ${daysUntilContact} days`);
            console.log(`    - Alert options: ${alertSettings.nextContactAlertOptions.join(', ')}`);
            
            const maxDays = getMaxDaysFromOptions(alertSettings.nextContactAlertOptions);
            if (daysUntilContact <= maxDays || daysUntilContact < 0) {
              const alertId = `contact-${contact.id}`;
              
              // Skip if snoozed
              if (isAlertSnoozed(alertId)) {
                console.log(`    ⏰ Alert is snoozed, skipping`);
                return;
              }
              
              // Check if this alert was previously completed
              const savedAlert = savedAlerts.find(a => a.id === alertId);
              
              generatedAlerts.push({
                id: alertId,
                type: 'follow-up',
                title: daysUntilContact < 0 ? 'Follow-up Overdue' : 'Follow-up Due',
                description: `Follow up with ${contact.firstName} ${contact.lastName}${account ? ` at ${account.accountName}` : ''}`,
                priority: daysUntilContact < 0 ? 'critical' : daysUntilContact <= 1 ? 'high' : 'medium',
                dueDate: contact.nextContactDate,
                relatedId: contact.id,
                relatedType: 'contact',
                relatedName: `${contact.firstName} ${contact.lastName}`,
                status: savedAlert?.isCompleted ? 'completed' : 'pending',
                createdAt: new Date().toISOString(),
                actionRequired: true,
                contactOwner: relationshipOwnerName,
                vicePresident: vicePresidentName,
                isCompleted: savedAlert?.isCompleted || false,
                completedAt: savedAlert?.completedAt
              });
            }
          }

          // Contact Event alerts - process contactEvents array
          console.log(`  Contact Events Check:`);
          console.log(`    - Has contactEvents: ${!!contact.contactEvents}`);
          console.log(`    - Is array: ${Array.isArray(contact.contactEvents)}`);
          console.log(`    - Length: ${contact.contactEvents?.length || 0}`);
          
          if (contact.contactEvents && Array.isArray(contact.contactEvents)) {
            console.log(`    - Processing ${contact.contactEvents.length} events...`);
            
            contact.contactEvents.forEach((event, index) => {
              console.log(`\n    [Event ${index + 1}] ${event.title || 'Untitled'}`);
              console.log(`      - Has date: ${!!event.date}`);
              console.log(`      - Date value: ${event.date}`);
              console.log(`      - alertEnabled: ${event.alertEnabled}`);
              
              if (event.date && event.alertEnabled) {
                const eventDate = new Date(event.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                eventDate.setHours(0, 0, 0, 0);
                
                const daysUntilEvent = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const maxDays = getMaxDaysFromOptions(alertSettings.eventAlertOptions);
                
                console.log(`      - Days until event: ${daysUntilEvent}`);
                console.log(`      - Alert options: ${alertSettings.eventAlertOptions.join(', ')}`);
                console.log(`      - Should create alert: ${daysUntilEvent >= 0 && daysUntilEvent <= maxDays}`);
                
                if (daysUntilEvent >= 0 && daysUntilEvent <= maxDays) {
                  const alertId = `contactEvent-${contact.id}-${event.id || index}`;
                  
                  if (isAlertSnoozed(alertId)) {
                    console.log(`      ⏰ Alert is snoozed, skipping`);
                    return;
                  }
                  
                  const savedAlert = savedAlerts.find(a => a.id === alertId);
                  
                  generatedAlerts.push({
                    id: alertId,
                    type: 'contactEvent',
                    title: 'Contact Event Reminder',
                    description: `${event.title || 'Event'} for ${contact.firstName} ${contact.lastName}${account ? ` at ${account.accountName}` : ''} is ${daysUntilEvent === 0 ? 'today' : daysUntilEvent === 1 ? 'tomorrow' : `in ${daysUntilEvent} days`}`,
                    priority: daysUntilEvent <= 1 ? 'high' : daysUntilEvent <= 3 ? 'medium' : 'low',
                    dueDate: event.date,
                    relatedId: contact.id,
                    relatedType: 'contact',
                    relatedName: `${contact.firstName} ${contact.lastName}`,
                    status: savedAlert?.isCompleted ? 'completed' : 'pending',
                    createdAt: new Date().toISOString(),
                    actionRequired: true,
                    contactOwner: relationshipOwnerName,
                    vicePresident: vicePresidentName,
                    isCompleted: savedAlert?.isCompleted || false,
                    completedAt: savedAlert?.completedAt
                  });
                  
                  console.log(`      ✓ Created contact event alert with ID: ${alertId}`);
                } else {
                  console.log(`      ✗ Event alert not created (${daysUntilEvent} days - outside 0-${maxDays} day window)`);
                }
              } else {
                if (!event.date) console.log(`      ✗ No date set for event`);
                if (!event.alertEnabled) console.log(`      ✗ Alert not enabled for event`);
              }
            });
          } else {
            console.log(`    ✗ No contact events array found`);
          }
        });
      }

      // Process accounts for JBP and Account Event alerts
      if (accounts && Array.isArray(accounts)) {
        accounts.forEach(account => {
          const relationshipOwnerName = account.accountOwner || 'Unassigned';
          const vicePresidentName = account.vp || 'Unassigned';

          // JBP alerts - only if nextJBPAlert is enabled and isJBP is true
          if (account.isJBP && account.nextJBPDate && account.nextJBPAlert) {
            const jbpDate = new Date(account.nextJBPDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            jbpDate.setHours(0, 0, 0, 0);
            
            const daysUntilJBP = Math.round((jbpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const maxDays = getMaxDaysFromOptions(alertSettings.jbpAlertOptions);
            
            console.log(`JBP Check: ${account.accountName}`);
            console.log(`  - Days until: ${daysUntilJBP}`);
            console.log(`  - Alert options: ${alertSettings.jbpAlertOptions.join(', ')}`);
            
            if (daysUntilJBP >= 0 && daysUntilJBP <= maxDays) {
              const alertId = `jbp-${account.id}`;
              
              if (isAlertSnoozed(alertId)) {
                console.log(`  ⏰ Alert is snoozed, skipping`);
                return;
              }
              
              const savedAlert = savedAlerts.find(a => a.id === alertId);
              
              generatedAlerts.push({
                id: alertId,
                type: 'jbp',
                title: 'JBP Due',
                description: `Joint Business Plan for ${account.accountName} is ${daysUntilJBP === 0 ? 'due today' : daysUntilJBP === 1 ? 'due tomorrow' : `due in ${daysUntilJBP} days`}`,
                priority: daysUntilJBP <= 7 ? 'high' : daysUntilJBP <= 14 ? 'medium' : 'low',
                dueDate: account.nextJBPDate,
                relatedId: account.id,
                relatedType: 'account',
                relatedName: account.accountName,
                status: savedAlert?.isCompleted ? 'completed' : 'pending',
                createdAt: new Date().toISOString(),
                actionRequired: true,
                contactOwner: relationshipOwnerName,
                vicePresident: vicePresidentName,
                isCompleted: savedAlert?.isCompleted || false,
                completedAt: savedAlert?.completedAt
              });
              
              console.log(`  ✓ Created JBP alert`);
            }
          }

          // Account Event alerts - process customerEvents array
          if (account.customerEvents && Array.isArray(account.customerEvents)) {
            account.customerEvents.forEach((event, index) => {
              if (event.date && event.alertEnabled) {
                const eventDate = new Date(event.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                eventDate.setHours(0, 0, 0, 0);
                
                const daysUntilEvent = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const maxDays = getMaxDaysFromOptions(alertSettings.eventAlertOptions);
                
                console.log(`Account Event Check: ${event.title || 'Untitled Event'} for ${account.accountName}`);
                console.log(`  - Days until: ${daysUntilEvent}`);
                console.log(`  - Alert options: ${alertSettings.eventAlertOptions.join(', ')}`);
                
                if (daysUntilEvent >= 0 && daysUntilEvent <= maxDays) {
                  const alertId = `accountEvent-${account.id}-${event.id || index}`;
                  
                  if (isAlertSnoozed(alertId)) {
                    console.log(`  ⏰ Alert is snoozed, skipping`);
                    return;
                  }
                  
                  const savedAlert = savedAlerts.find(a => a.id === alertId);
                  
                  generatedAlerts.push({
                    id: alertId,
                    type: 'accountEvent',
                    title: 'Account Event Reminder',
                    description: `${event.title || 'Event'} for ${account.accountName} is ${daysUntilEvent === 0 ? 'today' : daysUntilEvent === 1 ? 'tomorrow' : `in ${daysUntilEvent} days`}`,
                    priority: daysUntilEvent <= 1 ? 'high' : daysUntilEvent <= 3 ? 'medium' : 'low',
                    dueDate: event.date,
                    relatedId: account.id,
                    relatedType: 'account',
                    relatedName: account.accountName,
                    status: savedAlert?.isCompleted ? 'completed' : 'pending',
                    createdAt: new Date().toISOString(),
                    actionRequired: true,
                    contactOwner: relationshipOwnerName,
                    vicePresident: vicePresidentName,
                    isCompleted: savedAlert?.isCompleted || false,
                    completedAt: savedAlert?.completedAt
                  });
                  
                  console.log(`  ✓ Created account event alert`);
                }
              }
            });
          }
        });
      }

      // Load tasks from localStorage and process for task due date alerts
      const savedTasks = loadFromStorage('crm-tasks', []) as Task[];
      
      if (savedTasks && Array.isArray(savedTasks)) {
        savedTasks.forEach((task: Task) => {
          if (task && task.dueDate && task.status !== 'completed' && task.status !== 'cancelled') {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
            
            const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            // Show task alerts based on user's checkbox selections
            const maxDays = getMaxDaysFromOptions(alertSettings.taskAlertOptions);
            if (daysUntilDue <= maxDays || daysUntilDue < 0) {
              const relatedAccount = accounts?.find(a => a.id === task.relatedId && task.relatedType === 'account');
              const relatedContact = contacts?.find(c => c.id === task.relatedId && task.relatedType === 'contact');
              
              const alertTitle = task.dueDateAlert ? 
                (daysUntilDue < 0 ? 'Task Overdue (Alert Enabled)' : 'Task Due (Alert Enabled)') :
                (daysUntilDue < 0 ? 'Task Overdue' : 'Task Due');
              
              const alertId = `task-${task.id}`;
              
              // Skip if snoozed
              if (isAlertSnoozed(alertId)) {
                return;
              }
              
              // Check if this alert was previously completed
              const savedAlert = savedAlerts.find(a => a.id === alertId);
              
              generatedAlerts.push({
                id: alertId,
                type: 'task-due',
                title: alertTitle,
                description: `Task "${task.title || 'Untitled'}" is ${daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : daysUntilDue === 0 ? 'due today' : daysUntilDue === 1 ? 'due tomorrow' : `due in ${daysUntilDue} days`}${task.dueDateAlert ? ' (Alert notifications enabled)' : ''}`,
                priority: daysUntilDue < 0 ? 'critical' : 
                         task.priority === 'critical' ? 'critical' :
                         task.priority === 'high' ? 'high' :
                         daysUntilDue <= 1 ? 'high' : 'medium',
                dueDate: task.dueDate,
                relatedId: task.relatedId || 'unassigned',
                relatedType: task.relatedType || 'task',
                relatedName: relatedAccount?.accountName || 
                            (relatedContact ? `${relatedContact.firstName} ${relatedContact.lastName}` : task.relatedName || 'Unassigned'),
                status: savedAlert?.isCompleted ? 'completed' : 'pending',
                createdAt: task.createdAt || new Date().toISOString(),
                actionRequired: true,
                contactOwner: task.assignedTo || 'Unassigned',
                vicePresident: relatedContact?.primaryDiageoRelationshipOwners?.svp || relatedContact?.relationshipOwner?.vicePresident || relatedAccount?.vp || 'Unassigned',
                isCompleted: savedAlert?.isCompleted || false,
                completedAt: savedAlert?.completedAt
              });
            }
          }
        });
      }

      console.log('\n=== ALERT SUMMARY ===');
      console.log('Total alerts generated:', generatedAlerts.length);
      console.log('Alert breakdown:', {
        birthday: generatedAlerts.filter(a => a.type === 'birthday').length,
        followUp: generatedAlerts.filter(a => a.type === 'follow-up').length,
        taskDue: generatedAlerts.filter(a => a.type === 'task-due').length,
        jbp: generatedAlerts.filter(a => a.type === 'jbp').length,
        accountEvent: generatedAlerts.filter(a => a.type === 'accountEvent').length,
        contactEvent: generatedAlerts.filter(a => a.type === 'contactEvent').length,
        completed: generatedAlerts.filter(a => a.isCompleted).length
      });
      
      return generatedAlerts;
    };

    setAlerts(generateAlerts());
  }, [contacts, accounts, alertSettings, snoozedAlerts]);

  const getAlertIcon = (type: AlertType['type']) => {
    switch (type) {
      case 'birthday': return '🎂';
      case 'follow-up': return '📞';
      case 'task-due': return '✅';
      case 'jbp': return '📊';
      case 'accountEvent': return '🏢';
      case 'contactEvent': return '👤';
      case 'contract-renewal': return '📋';
      case 'meeting': return '🤝';
      case 'milestone': return '🎯';
      default: return '📌';
    }
  };

  const getPriorityColor = (priority: AlertType['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const days = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Get unique relationship owners for filter from real data
  const getAllRelationshipOwners = () => {
    const owners = new Set<string>();
    const vps = new Set<string>();
    
    if (alerts && Array.isArray(alerts)) {
      alerts.forEach(alert => {
        if (alert.contactOwner && alert.contactOwner !== 'Unassigned') {
          owners.add(alert.contactOwner);
        }
        if (alert.vicePresident && alert.vicePresident !== 'Unassigned') {
          vps.add(alert.vicePresident);
        }
      });
    }
    
    if (contacts && Array.isArray(contacts)) {
      contacts.forEach(contact => {
        if (contact.primaryDiageoRelationshipOwners?.ownerName) {
          owners.add(contact.primaryDiageoRelationshipOwners.ownerName);
        }
        if (contact.relationshipOwner?.name) {
          owners.add(contact.relationshipOwner.name);
        }
        if (contact.primaryDiageoRelationshipOwners?.svp) {
          vps.add(contact.primaryDiageoRelationshipOwners.svp);
        }
        if (contact.relationshipOwner?.vicePresident) {
          vps.add(contact.relationshipOwner.vicePresident);
        }
      });
    }
    
    if (accounts && Array.isArray(accounts)) {
      accounts.forEach(account => {
        if (account.accountOwner) {
          owners.add(account.accountOwner);
        }
        if (account.vp) {
          vps.add(account.vp);
        }
      });
    }
    
    return {
      uniqueRelationshipOwners: Array.from(owners).sort(),
      uniqueVPs: Array.from(vps).sort()
    };
  };

  const { uniqueRelationshipOwners, uniqueVPs } = getAllRelationshipOwners();

  const filteredAlerts = (alerts || []).filter(alert => {
    if (filter === 'pending' && (alert.status !== 'pending' || alert.isCompleted)) return false;
    if (filter === 'completed' && !alert.isCompleted) return false;
    if (filter === 'high' && !['high', 'critical'].includes(alert.priority)) return false;
    if (filter === 'overdue' && (!isOverdue(alert.dueDate) || alert.isCompleted)) return false;
    
    if (relationshipOwnerFilter !== 'all') {
      if (!alert.contactOwner?.includes(relationshipOwnerFilter) && !alert.vicePresident?.includes(relationshipOwnerFilter)) {
        return false;
      }
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return alert.title.toLowerCase().includes(searchLower) ||
             alert.description.toLowerCase().includes(searchLower) ||
             alert.relatedName.toLowerCase().includes(searchLower) ||
             alert.contactOwner?.toLowerCase().includes(searchLower) ||
             alert.vicePresident?.toLowerCase().includes(searchLower);
    }
    
    return true;
  });

  const sendAlertToPowerAutomate = async (alert: AlertType, isAutoSend: boolean = false) => {
    console.log('=== SEND TO POWER AUTOMATE - DETAILED DEBUG ===');
    console.log('Alert ID:', alert.id);
    console.log('Alert Type:', alert.type);
    console.log('Alert Contact Owner:', alert.contactOwner);
    console.log('Is Auto Send:', isAutoSend);
    console.log('Power Automate Enabled:', powerAutomateEnabled);
    
    if (!powerAutomateEnabled) {
      const message = 'Power Automate is not configured. Please set up workflow URLs in .env';
      console.error(message);
      if (!isAutoSend) {
        window.alert(message);
      }
      return false;
    }

    // Now supports birthday, next contact, task, JBP, and event alerts
    if (alert.type !== 'birthday' && alert.type !== 'follow-up' && alert.type !== 'task-due' && alert.type !== 'jbp' && alert.type !== 'accountEvent' && alert.type !== 'contactEvent') {
      const message = 'This alert type is not configured for Power Automate';
      console.warn(message);
      if (!isAutoSend) {
        window.alert(message);
      }
      return false;
    }

    // Check if already sent - ONLY for auto-send, allow manual resend
    if (isAutoSend && wasAlertSent(alert.id)) {
      console.log('Auto-send skipped: Alert was already sent previously');
      return false;
    }

    // For manual send, show info if it was sent before but allow resending
    if (!isAutoSend && wasAlertSent(alert.id)) {
      console.log('Manual resend: Alert was previously sent, sending again...');
    }

    if (!isAutoSend) {
      setSendingAlerts(prev => new Set(prev).add(alert.id));
    }

    try {
      // Find the related contact or account
      const contact = contacts.find(c => c.id === alert.relatedId);
      const account = accounts.find(a => a.id === (contact?.accountId || alert.relatedId));

      console.log('Contact found:', contact ? `${contact.firstName} ${contact.lastName}` : 'Not found');
      console.log('Account found:', account?.accountName || 'Not found');

      // Load relationship owners from storage
      const relationshipOwners = loadFromStorage('crm-relationship-owners', []) as RelationshipOwner[];
      
      console.log('=== RELATIONSHIP OWNERS IN STORAGE ===');
      console.log('Total relationship owners:', relationshipOwners.length);
      relationshipOwners.forEach((ro, idx) => {
        console.log(`Owner ${idx + 1}:`, {
          name: ro.name,
          email: ro.email,
          teamsChannelId: ro.teamsChannelId
        });
      });
      
      console.log('=== LOOKING FOR MATCH ===');
      console.log('Searching for owner name:', alert.contactOwner);
      
      // Try multiple matching strategies
      let ownerDetails = relationshipOwners.find(ro => ro.name === alert.contactOwner);
      
      if (!ownerDetails) {
        console.log('Exact match not found, trying case-insensitive match...');
        ownerDetails = relationshipOwners.find(ro => 
          ro.name?.toLowerCase() === alert.contactOwner?.toLowerCase()
        );
      }
      
      if (!ownerDetails) {
        console.log('Case-insensitive match not found, trying partial match...');
        ownerDetails = relationshipOwners.find(ro => 
          ro.name?.toLowerCase().includes(alert.contactOwner?.toLowerCase() || '') ||
          alert.contactOwner?.toLowerCase().includes(ro.name?.toLowerCase() || '')
        );
      }

      console.log('=== MATCH RESULT ===');
      if (ownerDetails) {
        console.log('✓ Relationship Owner Found:', {
          name: ownerDetails.name,
          email: ownerDetails.email,
          teamsChannelId: ownerDetails.teamsChannelId
        });
      } else {
        console.log('✗ No matching relationship owner found in directory');
      }

      // Determine notification email and Teams channel
      // For CONTACT-RELATED alerts (birthday, follow-up, contactEvent):
      // Priority: contact override > PRIMARY Diageo owner email > relationship owner default > contact's relationship owner email
      // For ACCOUNT-RELATED alerts (jbp, accountEvent, task-due):
      // Priority: relationship owner directory email > contacts associated with account > account email
      // IMPORTANT: Trim all whitespace and newlines from email addresses
      
      let notificationEmail = '';
      let emailSource = '';
      
      if (alert.type === 'birthday' || alert.type === 'follow-up' || alert.type === 'contactEvent') {
        // Contact-related alerts
        notificationEmail = (
          contact?.notificationEmail || 
          contact?.primaryDiageoRelationshipOwners?.ownerEmail ||
          ownerDetails?.email || 
          contact?.relationshipOwner?.email || 
          ''
        ).trim().replace(/[\r\n\t]/g, '');
        
        if (contact?.notificationEmail) emailSource = 'contact notification email override';
        else if (contact?.primaryDiageoRelationshipOwners?.ownerEmail) emailSource = 'Primary Diageo owner email';
        else if (ownerDetails?.email) emailSource = 'relationship owner directory';
        else if (contact?.relationshipOwner?.email) emailSource = 'contact relationship owner';
      } else {
        // Account-related alerts (jbp, accountEvent, task-due)
        // First try relationship owner directory
        if (ownerDetails?.email) {
          notificationEmail = ownerDetails.email.trim().replace(/[\r\n\t]/g, '');
          emailSource = 'relationship owner directory';
        } else {
          // Fall back to contacts associated with this account
          console.log('=== FALLBACK TO ACCOUNT CONTACTS ===');
          const allContacts = loadFromStorage('crm-contacts', []) as Contact[];
          const accountContacts = allContacts.filter(c => c.accountId === account?.id);
          console.log(`Found ${accountContacts.length} contacts for account ${account?.accountName}`);
          
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
              if (accountContact.notificationEmail) emailSource = `contact ${accountContact.firstName} ${accountContact.lastName} notification email`;
              else if (accountContact.primaryDiageoRelationshipOwners?.ownerEmail) emailSource = `contact ${accountContact.firstName} ${accountContact.lastName} Primary Diageo owner`;
              else emailSource = `contact ${accountContact.firstName} ${accountContact.lastName} relationship owner`;
              console.log(`✓ Found valid email from ${emailSource}: ${notificationEmail}`);
              break;
            }
          }
          
          // Final fallback to account email
          if (!notificationEmail && account?.email) {
            notificationEmail = account.email.trim().replace(/[\r\n\t]/g, '');
            emailSource = 'account email';
          }
        }
      }
      
      const teamsChannel = (
        contact?.teamsChannelId || 
        ownerDetails?.teamsChannelId || 
        ''
      ).trim();

      console.log('=== EMAIL RESOLUTION ===');
      console.log('Alert type:', alert.type);
      if (alert.type === 'birthday' || alert.type === 'follow-up' || alert.type === 'contactEvent') {
        console.log('Contact notification email override:', contact?.notificationEmail || 'Not set');
        console.log('Primary Diageo owner email:', contact?.primaryDiageoRelationshipOwners?.ownerEmail || 'Not set');
        console.log('Contact relationship owner email:', contact?.relationshipOwner?.email || 'Not set');
      } else {
        console.log('Account email:', account?.email || 'Not set');
        console.log('Account contacts checked for fallback email');
      }
      console.log('Owner directory email:', ownerDetails?.email || 'Not set');
      console.log('Final notification email (cleaned):', notificationEmail || 'NOT FOUND');
      console.log('Email source:', emailSource || 'NOT FOUND');
      console.log('Teams Channel:', teamsChannel || 'Not set');

      // Validate email format
      if (!notificationEmail) {
        const errorMsg = `No notification email configured for relationship owner "${alert.contactOwner}"`;
        console.error('❌ ERROR:', errorMsg);
        if (!isAutoSend) {
          window.alert(`❌ ${errorMsg}\n\nPlease ensure:\n1. The relationship owner is added to Relationship Owner Directory with email, OR\n2. For contact alerts: Primary Diageo Relationship Owner email is set, OR\n3. For account alerts: At least one contact associated with the account has a valid email`);
        }
        return false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)) {
        const errorMsg = `Invalid email format: "${notificationEmail}"`;
        console.error(errorMsg);
        if (!isAutoSend) {
          window.alert(`❌ ${errorMsg}\n\nPlease click the "Clean Email Data" button in Settings to fix corrupted email addresses.`);
        }
        return false;
      }

      const powerAutomateAlert: PowerAutomateAlert = {
        alertType: alert.type === 'birthday' ? 'birthday' : 
                   alert.type === 'follow-up' ? 'next-contact' : 
                   alert.type === 'task-due' ? 'task-due' :
                   alert.type === 'jbp' ? 'jbp' :
                   alert.type === 'accountEvent' ? 'accountEvent' : 'contactEvent',
        contactName: alert.relatedName,
        contactEmail: contact?.email?.trim(),
        accountName: account?.accountName,
        dueDate: alert.dueDate,
        daysUntil: getDaysUntilDue(alert.dueDate),
        priority: alert.priority,
        relationshipOwner: alert.contactOwner || 'Unassigned',
        relationshipOwnerEmail: notificationEmail,
        relationshipOwnerTeamsChannel: teamsChannel,
        vicePresident: alert.vicePresident,
        description: alert.description,
        additionalData: {
          alertId: alert.id,
          contactId: contact?.id,
          accountId: account?.id,
          contactPhone: contact?.mobilePhone || contact?.officePhone,
          contactTitle: contact?.title,
          autoSent: isAutoSend
        }
      };

      console.log('Sending payload to Power Automate:', powerAutomateAlert);

      const success = await powerAutomateService.sendAlert(powerAutomateAlert);

      console.log('Power Automate response - Success:', success);

      if (success) {
        // Save to sent alerts tracking
        saveSentAlert({
          alertId: alert.id,
          alertType: alert.type === 'birthday' ? 'birthday' : 
                     alert.type === 'follow-up' ? 'next-contact' : 
                     alert.type === 'task-due' ? 'task-due' :
                     alert.type === 'jbp' ? 'jbp' :
                     alert.type === 'accountEvent' ? 'accountEvent' : 'contactEvent',
          contactId: alert.relatedId,
          sentAt: new Date().toISOString(),
          dueDate: alert.dueDate
        });
        
        setSentAlerts(prev => new Set(prev).add(alert.id));
        
        if (!isAutoSend) {
          const successMessage = `✅ Alert sent to Power Automate successfully!\n\n📧 Email will be sent to: ${notificationEmail}\n📍 Email source: ${emailSource}`;
          window.alert(successMessage);
        }
        
        console.log(`✅ Alert ${alert.id} sent successfully ${isAutoSend ? '(auto)' : '(manual)'} to ${notificationEmail} (source: ${emailSource})`);
        return true;
      } else {
        const errorMessage = '❌ Failed to send alert to Power Automate. Please check the browser console for details.';
        console.error(errorMessage);
        if (!isAutoSend) {
          window.alert(errorMessage);
        }
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending alert to Power Automate:', error);
      
      // Handle PowerAutomateConfigError specially to show the specific missing configuration
      if (error instanceof PowerAutomateConfigError) {
        const userMessage = `❌ Configuration Error:\n\n${error.message}\n\nPlease add ${error.envVarName} to your .env file with your Power Automate webhook URL, then restart the development server.`;
        if (!isAutoSend) {
          window.alert(userMessage);
        }
      } else {
        if (!isAutoSend) {
          window.alert(`❌ An error occurred while sending the alert:\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check the browser console for more details.`);
        }
      }
      return false;
    } finally {
      if (!isAutoSend) {
        setSendingAlerts(prev => {
          const newSet = new Set(prev);
          newSet.delete(alert.id);
          return newSet;
        });
      }
    }
  };

  const handleSendToPowerAutomate = async (alert: AlertType) => {
    await sendAlertToPowerAutomate(alert, false);
  };

  const canSendToPowerAutomate = (alert: AlertType): boolean => {
    return powerAutomateEnabled && (alert.type === 'birthday' || alert.type === 'follow-up' || 
                                    alert.type === 'task-due' || alert.type === 'jbp' || 
                                    alert.type === 'accountEvent' || alert.type === 'contactEvent');
  };

  const pendingCount = (alerts || []).filter(a => a.status === 'pending' && !a.isCompleted).length;
  const completedCount = (alerts || []).filter(a => a.isCompleted).length;
  const overdueCount = (alerts || []).filter(a => a.status === 'pending' && !a.isCompleted && isOverdue(a.dueDate)).length;
  const highPriorityCount = (alerts || []).filter(a => a.status === 'pending' && !a.isCompleted && ['high', 'critical'].includes(a.priority)).length;
  
  // Filter counts by relationship owner
  const getFilteredCount = (filterFn: (alert: AlertType) => boolean) => {
    return (alerts || []).filter(alert => {
      if (relationshipOwnerFilter !== 'all') {
        if (!alert.contactOwner?.includes(relationshipOwnerFilter) && !alert.vicePresident?.includes(relationshipOwnerFilter)) {
          return false;
        }
      }
      return filterFn(alert);
    }).length;
  };

  const filteredPendingCount = getFilteredCount(a => a.status === 'pending' && !a.isCompleted);
  const filteredCompletedCount = getFilteredCount(a => a.isCompleted === true);
  const filteredOverdueCount = getFilteredCount(a => a.status === 'pending' && !a.isCompleted && isOverdue(a.dueDate));
  const filteredHighPriorityCount = getFilteredCount(a => a.status === 'pending' && !a.isCompleted && ['high', 'critical'].includes(a.priority));
  const filteredThisWeekCount = getFilteredCount(a => {
    const days = getDaysUntilDue(a.dueDate);
    return days >= 0 && days <= 7 && a.status === 'pending' && !a.isCompleted;
  });

  const autoSendEligibleCount = alerts.filter(a => 
    (a.type === 'birthday' || a.type === 'follow-up' || a.type === 'task-due' || 
     a.type === 'jbp' || a.type === 'accountEvent' || a.type === 'contactEvent') && a.status === 'pending' && !a.isCompleted && !sentAlerts.has(a.id) && !isAlertSnoozed(a.id)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Alert System with Power Automate
          </h2>
          <p className="text-gray-600">Birthday, next contact, task, JBP, and event alerts with automatic workflow automation</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Power Automate Settings */}
      {showSettings && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Alert Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auto-Send Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-send" className="text-base font-medium">
                  Automatic Alert Sending
                </Label>
                <p className="text-sm text-gray-600">
                  Automatically send birthday, next contact, task, JBP, and event alerts to Power Automate when they're generated
                </p>
                {autoSendEnabled && autoSendEligibleCount > 0 && (
                  <p className="text-sm text-blue-600 font-medium">
                    {autoSendEligibleCount} alert{autoSendEligibleCount !== 1 ? 's' : ''} will be sent automatically
                  </p>
                )}
              </div>
              <Switch
                id="auto-send"
                checked={autoSendEnabled}
                onCheckedChange={handleAutoSendToggle}
                disabled={!powerAutomateEnabled}
              />
            </div>

            {/* Alert Timing Settings with Checkboxes */}
            <div className="pt-4 border-t border-blue-200 space-y-4">
              <Label className="text-base font-medium">Alert Timing (Days in Advance)</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Birthday Alerts */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Birthday Alerts</Label>
                  <div className="space-y-2">
                    {(['same_day', 'day_before', 'week_before'] as const).map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`birthday-${option}`}
                          checked={alertSettings.birthdayAlertOptions.includes(option)}
                          onCheckedChange={() => handleToggleAlertOption('birthdayAlertOptions', option)}
                        />
                        <Label
                          htmlFor={`birthday-${option}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {getAlertOptionLabel(option)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Contact Alerts */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Next Contact Alerts</Label>
                  <div className="space-y-2">
                    {(['same_day', 'day_before', 'week_before'] as const).map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`contact-${option}`}
                          checked={alertSettings.nextContactAlertOptions.includes(option)}
                          onCheckedChange={() => handleToggleAlertOption('nextContactAlertOptions', option)}
                        />
                        <Label
                          htmlFor={`contact-${option}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {getAlertOptionLabel(option)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Alerts */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Task Alerts</Label>
                  <div className="space-y-2">
                    {(['same_day', 'day_before', 'week_before'] as const).map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`task-${option}`}
                          checked={alertSettings.taskAlertOptions.includes(option)}
                          onCheckedChange={() => handleToggleAlertOption('taskAlertOptions', option)}
                        />
                        <Label
                          htmlFor={`task-${option}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {getAlertOptionLabel(option)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* JBP Alerts */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">JBP Alerts</Label>
                  <div className="space-y-2">
                    {(['same_day', 'day_before', 'week_before'] as const).map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`jbp-${option}`}
                          checked={alertSettings.jbpAlertOptions.includes(option)}
                          onCheckedChange={() => handleToggleAlertOption('jbpAlertOptions', option)}
                        />
                        <Label
                          htmlFor={`jbp-${option}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {getAlertOptionLabel(option)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Alerts */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Event Alerts</Label>
                  <div className="space-y-2">
                    {(['same_day', 'day_before', 'week_before'] as const).map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`event-${option}`}
                          checked={alertSettings.eventAlertOptions.includes(option)}
                          onCheckedChange={() => handleToggleAlertOption('eventAlertOptions', option)}
                        />
                        <Label
                          htmlFor={`event-${option}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {getAlertOptionLabel(option)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Reminder Frequency */}
            <div className="pt-4 border-t border-blue-200 space-y-2">
              <Label htmlFor="reminder-freq" className="text-base font-medium">Reminder Frequency</Label>
              <p className="text-sm text-gray-600">
                How often should you be reminded about the same alert until the due date?
              </p>
              <Select 
                value={alertSettings.reminderFrequency} 
                onValueChange={(v: 'daily' | 'every-3-days' | 'weekly' | 'once') => {
                  const newSettings = { ...alertSettings, reminderFrequency: v };
                  setAlertSettings(newSettings);
                  saveToStorage('crm-alert-settings', newSettings);
                }}
              >
                <SelectTrigger id="reminder-freq">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once only (default)</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="every-3-days">Every 3 days</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Clean Email Data Button */}
            <div className="pt-4 border-t border-blue-200">
              <div className="space-y-2">
                <Label className="text-base font-medium">Data Maintenance</Label>
                <p className="text-sm text-gray-600">
                  If you're getting email format errors, click this button to clean all email addresses in the system
                </p>
                <Button
                  variant="outline"
                  onClick={handleCleanEmailData}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clean Email Data
                </Button>
              </div>
            </div>
            
            {!powerAutomateEnabled && (
              <Alert className="bg-orange-50 border-orange-200">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-900">
                  Configure Power Automate workflow URLs in .env to enable automatic sending.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Power Automate Status */}
      <Alert className={powerAutomateEnabled ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}>
        <Zap className={`h-4 w-4 ${powerAutomateEnabled ? 'text-green-600' : 'text-orange-600'}`} />
        <AlertDescription className={powerAutomateEnabled ? 'text-green-900' : 'text-orange-900'}>
          {powerAutomateEnabled ? (
            <>
              <strong>Power Automate Connected:</strong> {autoSendEnabled ? 'Automatic sending is enabled. New birthday, next contact, task, JBP, and event alerts will be sent automatically with notification emails to relationship owners.' : 'Manual sending is available. You can resend alerts even if they were sent before.'}
            </>
          ) : (
            <>
              <strong>Power Automate Not Configured:</strong> To enable workflow automation, configure your Power Automate workflow URLs in .env
              <a href="/POWER_AUTOMATE_SETUP_GUIDE.md" target="_blank" className="underline ml-2">View Setup Guide</a>
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Relationship Owner Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Relationship Owner:</span>
            </div>
            <Select value={relationshipOwnerFilter} onValueChange={setRelationshipOwnerFilter}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select relationship owner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Relationship Owners</SelectItem>
                {uniqueRelationshipOwners.map(owner => (
                  <SelectItem key={owner} value={owner}>
                    {owner} (Relationship Owner)
                  </SelectItem>
                ))}
                {uniqueVPs.map(vp => (
                  <SelectItem key={vp} value={vp}>
                    {vp} (Vice President)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {relationshipOwnerFilter !== 'all' && (
              <Button variant="outline" size="sm" onClick={() => setRelationshipOwnerFilter('all')}>
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold">{filteredPendingCount}</p>
                {relationshipOwnerFilter !== 'all' && (
                  <p className="text-xs text-gray-500">for {relationshipOwnerFilter}</p>
                )}
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{filteredCompletedCount}</p>
                {relationshipOwnerFilter !== 'all' && (
                  <p className="text-xs text-gray-500">for {relationshipOwnerFilter}</p>
                )}
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{filteredOverdueCount}</p>
                {relationshipOwnerFilter !== 'all' && (
                  <p className="text-xs text-gray-500">for {relationshipOwnerFilter}</p>
                )}
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{filteredHighPriorityCount}</p>
                {relationshipOwnerFilter !== 'all' && (
                  <p className="text-xs text-gray-500">for {relationshipOwnerFilter}</p>
                )}
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-green-600">{filteredThisWeekCount}</p>
                {relationshipOwnerFilter !== 'all' && (
                  <p className="text-xs text-gray-500">for {relationshipOwnerFilter}</p>
                )}
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={(value: 'all' | 'pending' | 'high' | 'overdue' | 'completed') => setFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
                <SelectItem value="completed">Completed Only</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts ({filteredAlerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No alerts found</p>
                  <div className="text-sm mt-2 space-y-1">
                    <p>To see alerts here:</p>
                    <p>• Add contacts with birthdays and enable "Birthday Alert"</p>
                    <p>• Set next contact dates and enable "Next Contact Alert"</p>
                    <p>• Create tasks with due dates</p>
                    <p>• Set JBP dates for accounts and enable "JBP Alert"</p>
                    <p>• Add customer events to accounts or contacts with alerts enabled</p>
                    {relationshipOwnerFilter !== 'all' && (
                      <p className="text-blue-600 font-medium">• Currently filtering by: {relationshipOwnerFilter}</p>
                    )}
                  </div>
                </div>
              ) : (
                filteredAlerts.map(alert => {
                  const daysUntil = getDaysUntilDue(alert.dueDate);
                  const overdue = isOverdue(alert.dueDate);
                  const canSendPA = canSendToPowerAutomate(alert);
                  const isSending = sendingAlerts.has(alert.id);
                  const wasSent = sentAlerts.has(alert.id);
                  const isSnoozed = isAlertSnoozed(alert.id);
                  const isCompleted = alert.isCompleted || false;
                  
                  return (
                    <Card 
                      key={alert.id} 
                      className={`
                        ${overdue && !isCompleted ? 'border-red-200 bg-red-50' : ''} 
                        ${alert.priority === 'critical' && !isCompleted ? 'border-orange-200 bg-orange-50' : ''} 
                        ${isSnoozed ? 'opacity-60' : ''} 
                        ${isCompleted ? 'opacity-70 bg-gray-50' : ''}
                      `}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="text-2xl">{getAlertIcon(alert.type)}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                                  {alert.title}
                                </h3>
                                <Badge variant={getPriorityColor(alert.priority)}>
                                  {alert.priority}
                                </Badge>
                                {isCompleted && (
                                  <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                                {overdue && !isCompleted && (
                                  <Badge variant="destructive">
                                    Overdue
                                  </Badge>
                                )}
                                {isSnoozed && (
                                  <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-200">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Snoozed
                                  </Badge>
                                )}
                                {canSendPA && !isCompleted && (
                                  <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
                                    <Zap className="w-3 h-3 mr-1" />
                                    Power Automate Ready
                                  </Badge>
                                )}
                                {wasSent && (
                                  <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                    ✓ Sent to Power Automate
                                  </Badge>
                                )}
                                {autoSendEnabled && canSendPA && !wasSent && !isSnoozed && !isCompleted && (
                                  <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-200">
                                    Auto-Send Enabled
                                  </Badge>
                                )}
                              </div>
                              <p className={`text-sm mb-2 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                                {alert.description}
                              </p>
                              <div className="flex flex-col gap-1 text-sm text-gray-500">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {overdue && !isCompleted ? `${Math.abs(daysUntil)} days overdue` : 
                                     daysUntil === 0 ? 'Due today' :
                                     daysUntil === 1 ? 'Due tomorrow' :
                                     `Due in ${daysUntil} days`}
                                  </span>
                                  <span>Related to: {alert.relatedName}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  {alert.contactOwner && alert.contactOwner !== 'Unassigned' && (
                                    <span className="flex items-center gap-1">
                                      <User className="w-4 h-4" />
                                      {alert.type === 'task-due' ? 'Assigned to' : 'Relationship Owner'}: {alert.contactOwner}
                                    </span>
                                  )}
                                  {alert.vicePresident && alert.vicePresident !== 'Unassigned' && (
                                    <span className="flex items-center gap-1">
                                      <User className="w-4 h-4" />
                                      VP: {alert.vicePresident}
                                    </span>
                                  )}
                                </div>
                                {isCompleted && alert.completedAt && (
                                  <div className="text-xs text-green-600 mt-1">
                                    ✓ Completed on {new Date(alert.completedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {/* Complete/Uncomplete Toggle Button */}
                            <Button
                              size="sm"
                              variant={isCompleted ? "outline" : "default"}
                              onClick={() => handleToggleCompletion(alert.id)}
                              className={isCompleted ? "text-orange-600 border-orange-300 hover:bg-orange-50" : "bg-green-600 hover:bg-green-700"}
                            >
                              {isCompleted ? (
                                <>
                                  <RotateCcw className="w-4 h-4 mr-1" />
                                  Mark Incomplete
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Mark Complete
                                </>
                              )}
                            </Button>
                            
                            {!isCompleted && (
                              <>
                                {canSendPA && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSendToPowerAutomate(alert)}
                                    disabled={isSending}
                                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                  >
                                    {isSending ? (
                                      <>
                                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                        Sending...
                                      </>
                                    ) : (
                                      <>
                                        <Send className="w-4 h-4 mr-1" />
                                        {wasSent ? 'Resend to PA' : 'Send to PA'}
                                      </>
                                    )}
                                  </Button>
                                )}
                                
                                {/* Snooze Button */}
                                <Select onValueChange={(days) => handleSnoozeAlert(alert.id, parseInt(days))}>
                                  <SelectTrigger className="w-32">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <SelectValue placeholder="Snooze" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1 day</SelectItem>
                                    <SelectItem value="3">3 days</SelectItem>
                                    <SelectItem value="7">1 week</SelectItem>
                                    <SelectItem value="14">2 weeks</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDismissAlert(alert.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
