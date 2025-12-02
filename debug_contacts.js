// Debug script to check contact events in localStorage
const contacts = JSON.parse(localStorage.getItem('crm-contacts') || '[]');

console.log('=== CONTACT EVENTS DEBUG ===');
console.log('Total contacts:', contacts.length);

contacts.forEach((contact, index) => {
  console.log(`\nContact ${index + 1}: ${contact.firstName} ${contact.lastName}`);
  console.log('  - Has contactEvents:', !!contact.contactEvents);
  console.log('  - contactEvents is array:', Array.isArray(contact.contactEvents));
  
  if (contact.contactEvents && Array.isArray(contact.contactEvents)) {
    console.log('  - Number of events:', contact.contactEvents.length);
    contact.contactEvents.forEach((event, eventIndex) => {
      console.log(`    Event ${eventIndex + 1}:`, {
        id: event.id,
        title: event.title,
        date: event.date,
        alertEnabled: event.alertEnabled,
        alertDays: event.alertDays
      });
    });
  } else {
    console.log('  - No contact events found');
  }
});

console.log('\n=== CHECKING ALERT GENERATION CONDITIONS ===');
const today = new Date();
today.setHours(0, 0, 0, 0);

contacts.forEach((contact) => {
  if (contact.contactEvents && Array.isArray(contact.contactEvents)) {
    contact.contactEvents.forEach((event) => {
      if (event.alertEnabled) {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        const daysUntil = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const alertDays = event.alertDays || 7;
        
        console.log(`\nEvent: ${event.title} for ${contact.firstName} ${contact.lastName}`);
        console.log('  - Event date:', event.date);
        console.log('  - Days until event:', daysUntil);
        console.log('  - Alert days setting:', alertDays);
        console.log('  - Should show alert:', daysUntil >= 0 && daysUntil <= alertDays);
        console.log('  - Alert enabled:', event.alertEnabled);
      }
    });
  }
});
