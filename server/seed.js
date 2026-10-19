// Optional: adds three sample members if the collection is empty.
// Run with:  npm run seed
import { membersCollection } from './db.js';

const samples = [
  {
    member_name: 'Maria Santos',
    email: 'maria.santos@example.com',
    club: 'Coding Club',
    year_level: '2nd Year',
    interests: 'Web development, hackathons, open source',
  },
  {
    member_name: 'Juan Dela Cruz',
    email: 'juan.delacruz@example.com',
    club: 'Photography Club',
    year_level: '1st Year',
    interests: 'Street photography, film cameras, editing',
  },
  {
    member_name: 'Angela Reyes',
    email: 'angela.reyes@example.com',
    club: 'Debate Society',
    year_level: '3rd Year',
    interests: 'Public speaking, current events, moderation',
  },
];

const existing = await membersCollection.limit(1).get();
if (!existing.empty) {
  console.log('The members collection already has data. Nothing added.');
  process.exit(0);
}

for (const sample of samples) {
  await membersCollection.add({ ...sample, agreed_to_terms: true, created_at: new Date() });
}
console.log(`Added ${samples.length} sample members.`);
process.exit(0);
