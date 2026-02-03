/**
 * Format a birthday string to MM/DD/YYYY format without timezone issues
 * Handles both YYYY-MM-DD and MM-DD formats
 */
export function formatBirthday(birthday: string): string {
  if (!birthday) return '';
  
  // Handle YYYY-MM-DD format (new format)
  if (birthday.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = birthday.split('-');
    return `${month}/${day}/${year}`;
  }
  
  // Handle MM-DD format (legacy format)
  if (birthday.match(/^\d{2}-\d{2}$/)) {
    const [month, day] = birthday.split('-');
    const currentYear = new Date().getFullYear();
    return `${month}/${day}/${currentYear}`;
  }
  
  return birthday;
}

/**
 * Parse a birthday string to get month and day without timezone issues
 * Returns an object with month (1-12) and day (1-31)
 */
export function parseBirthdayForComparison(birthday: string): { month: number; day: number } | null {
  if (!birthday) return null;
  
  let month: number;
  let day: number;
  
  // Handle YYYY-MM-DD format
  if (birthday.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [, monthStr, dayStr] = birthday.split('-');
    month = parseInt(monthStr, 10);
    day = parseInt(dayStr, 10);
  }
  // Handle MM-DD format
  else if (birthday.match(/^\d{2}-\d{2}$/)) {
    const [monthStr, dayStr] = birthday.split('-');
    month = parseInt(monthStr, 10);
    day = parseInt(dayStr, 10);
  }
  else {
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