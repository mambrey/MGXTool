export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

// Power Automate sent alerts tracking
const PA_SENT_ALERTS_KEY = 'crm-pa-sent-alerts';

export interface SentAlertRecord {
  alertId: string;
  alertType: 'birthday' | 'next-contact';
  contactId: string;
  sentAt: string;
  dueDate: string;
}

export const saveSentAlert = (record: SentAlertRecord): void => {
  const sentAlerts = loadFromStorage<SentAlertRecord[]>(PA_SENT_ALERTS_KEY, []);
  
  // Check if alert was already sent
  const exists = sentAlerts.some(a => a.alertId === record.alertId);
  if (!exists) {
    sentAlerts.push(record);
    saveToStorage(PA_SENT_ALERTS_KEY, sentAlerts);
  }
};

export const getSentAlerts = (): SentAlertRecord[] => {
  return loadFromStorage<SentAlertRecord[]>(PA_SENT_ALERTS_KEY, []);
};

export const wasAlertSent = (alertId: string): boolean => {
  const sentAlerts = getSentAlerts();
  return sentAlerts.some(a => a.alertId === alertId);
};

export const clearOldSentAlerts = (daysToKeep: number = 30): void => {
  const sentAlerts = getSentAlerts();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const filteredAlerts = sentAlerts.filter(alert => {
    const sentDate = new Date(alert.sentAt);
    return sentDate > cutoffDate;
  });
  
  saveToStorage(PA_SENT_ALERTS_KEY, filteredAlerts);
};