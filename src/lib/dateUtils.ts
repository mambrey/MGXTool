/**
 * Format a birthday string to MM/DD format without year
 * Handles YYYY-MM-DD, MM-DD, MM/DD, M/D, M-D formats
 */
export function formatBirthday(birthday: string): string {
  if (!birthday) return '';
  
  // Handle YYYY-MM-DD format (new format)
  if (birthday.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
    const [, month, day] = birthday.split('-');
    return `${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
  }
  
  // Handle MM-DD or M-D format (dash separator)
  if (birthday.match(/^\d{1,2}-\d{1,2}$/)) {
    const [month, day] = birthday.split('-');
    return `${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
  }
  
  // Handle MM/DD or M/D format (slash separator)
  if (birthday.match(/^\d{1,2}\/\d{1,2}$/)) {
    const [month, day] = birthday.split('/');
    return `${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
  }
  
  return birthday;
}

/**
 * Parse a birthday string to get month and day without timezone issues
 * Returns an object with month (1-12) and day (1-31)
 * 
 * Supported formats:
 * - YYYY-MM-DD (e.g., "1985-11-15" or "2000-4-5")
 * - MM-DD (e.g., "04-21" or "4-5")
 * - MM/DD (e.g., "04/21" or "4/5")
 * - M-D, M/D single digit variants
 */
export function parseBirthdayForComparison(birthday: string): { month: number; day: number } | null {
  if (!birthday) return null;
  
  let month: number;
  let day: number;
  
  // Trim whitespace
  const trimmed = birthday.trim();
  
  // Handle YYYY-MM-DD format (with 1 or 2 digit month/day)
  if (trimmed.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
    const [, monthStr, dayStr] = trimmed.split('-');
    month = parseInt(monthStr, 10);
    day = parseInt(dayStr, 10);
  }
  // Handle MM-DD or M-D format (dash separator, no year)
  else if (trimmed.match(/^\d{1,2}-\d{1,2}$/)) {
    const [monthStr, dayStr] = trimmed.split('-');
    month = parseInt(monthStr, 10);
    day = parseInt(dayStr, 10);
  }
  // Handle MM/DD or M/D format (slash separator, no year)
  else if (trimmed.match(/^\d{1,2}\/\d{1,2}$/)) {
    const [monthStr, dayStr] = trimmed.split('/');
    month = parseInt(monthStr, 10);
    day = parseInt(dayStr, 10);
  }
  else {
    console.warn(`[parseBirthdayForComparison] Unrecognized birthday format: "${birthday}"`);
    return null;
  }
  
  // Validate month and day ranges
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    console.warn(`[parseBirthdayForComparison] Invalid month/day values: month=${month}, day=${day} from "${birthday}"`);
    return null;
  }
  
  return { month, day };
}

/**
 * Format birthday for display in "Month Day" format (e.g., "December 24")
 */
export function formatBirthdayLong(birthday: string): string {
  if (!birthday) return '';
  
  const parsed = parseBirthdayForComparison(birthday);
  if (!parsed) return birthday;
  
  const date = new Date(2000, parsed.month - 1, parsed.day);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}