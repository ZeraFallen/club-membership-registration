import { CLUBS, YEAR_LEVELS } from './constants';
import type { FormErrors, MemberFormData } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Client-side validation. The server repeats these checks on its own.
export function validateMemberForm(form: MemberFormData): FormErrors {
  const errors: FormErrors = {};

  if (form.member_name.trim().length < 2) {
    errors.member_name = 'Name is required (at least 2 characters).';
  } else if (form.member_name.trim().length > 100) {
    errors.member_name = 'Name must be 100 characters or fewer.';
  }

  if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  } else if (form.email.trim().length > 150) {
    errors.email = 'Email must be 150 characters or fewer.';
  }

  if (!CLUBS.some((club) => club.name === form.club)) {
    errors.club = 'Choose a club from the list.';
  }
  if (!YEAR_LEVELS.includes(form.year_level)) {
    errors.year_level = 'Choose a year level.';
  }
  if (form.interests.trim().length < 5) {
    errors.interests = 'Tell us your interests (at least 5 characters).';
  }
  if (!form.agreed_to_terms) {
    errors.agreed_to_terms = 'You must agree to the club terms to register.';
  }

  return errors;
}
