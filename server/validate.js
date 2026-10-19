// Server-side validation: never trust the client.
// These lists must match the options offered in the React form.
export const CLUBS = [
  'Coding Club',
  'Robotics Club',
  'Photography Club',
  'Music Society',
  'Debate Society',
  'Volunteer Corps',
];

export const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns an object like { email: 'Enter a valid email address.' }.
// An empty object means the data is valid.
export function validateMember(body) {
  const errors = {};
  const { member_name, email, club, year_level, interests, agreed_to_terms } = body ?? {};

  if (typeof member_name !== 'string' || member_name.trim().length < 2) {
    errors.member_name = 'Name is required (at least 2 characters).';
  } else if (member_name.trim().length > 100) {
    errors.member_name = 'Name must be 100 characters or fewer.';
  }

  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  } else if (email.trim().length > 150) {
    errors.email = 'Email must be 150 characters or fewer.';
  }

  if (!CLUBS.includes(club)) {
    errors.club = 'Choose a club from the list.';
  }

  if (!YEAR_LEVELS.includes(year_level)) {
    errors.year_level = 'Choose a year level.';
  }

  if (typeof interests !== 'string' || interests.trim().length < 5) {
    errors.interests = 'Tell us your interests (at least 5 characters).';
  }

  if (agreed_to_terms !== true) {
    errors.agreed_to_terms = 'You must agree to the club terms to register.';
  }

  return errors;
}
