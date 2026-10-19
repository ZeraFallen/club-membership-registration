import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { isAxiosError } from 'axios';
import api, { getErrorMessage } from '../api/axios';
import { CLUBS, YEAR_LEVELS } from '../constants';
import { validateMemberForm } from '../validation';
import type { FormErrors, MemberFormData } from '../types';
import Field from './Field';

const initialForm: MemberFormData = {
  member_name: '',
  email: '',
  club: '',
  year_level: '',
  interests: '',
  agreed_to_terms: false,
};

interface Status {
  type: 'success' | 'error';
  text: string;
}

interface MemberFormProps {
  onCreated: () => void;
}

export default function MemberForm({ onCreated }: MemberFormProps) {
  const [form, setForm] = useState<MemberFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // One handler for every input: the input's `name` matches a key in `form`.
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    // Immutable updates: copy the old object, then change one key.
    setForm((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);

    const clientErrors = validateMemberForm(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return; // nothing is sent

    try {
      setSubmitting(true);
      await api.post('/members', form);
      setForm(initialForm); // reset after a successful save
      setStatus({ type: 'success', text: `Registered ${form.member_name.trim()} in ${form.club}.` });
      onCreated();
    } catch (err) {
      // The server validates too; show its per-field messages beside the fields.
      if (isAxiosError(err) && err.response?.status === 400 && err.response.data?.errors) {
        setErrors(err.response.data.errors as FormErrors);
      }
      setStatus({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel form" onSubmit={handleSubmit} noValidate>
      <h2>Register a member</h2>

      <Field label="Full name" htmlFor="member_name" error={errors.member_name}>
        <input
          id="member_name"
          name="member_name"
          type="text"
          autoComplete="name"
          value={form.member_name}
          onChange={handleChange}
          aria-invalid={Boolean(errors.member_name)}
          aria-describedby={errors.member_name ? 'member_name-error' : undefined}
        />
      </Field>

      <Field label="Email" htmlFor="email" error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
      </Field>

      <Field label="Club" htmlFor="club" error={errors.club}>
        <select
          id="club"
          name="club"
          value={form.club}
          onChange={handleChange}
          aria-invalid={Boolean(errors.club)}
          aria-describedby={errors.club ? 'club-error' : undefined}
        >
          <option value="">Choose a club</option>
          {CLUBS.map((club) => (
            <option key={club.name} value={club.name}>
              {club.name}
            </option>
          ))}
        </select>
      </Field>

      <fieldset className="field">
        <legend>Year level</legend>
        <div className="radio-row">
          {YEAR_LEVELS.map((level) => (
            <label key={level} className="choice">
              <input
                type="radio"
                name="year_level"
                value={level}
                checked={form.year_level === level}
                onChange={handleChange}
              />
              {level}
            </label>
          ))}
        </div>
        {errors.year_level && (
          <p className="error" role="alert">
            {errors.year_level}
          </p>
        )}
      </fieldset>

      <Field label="Interests" htmlFor="interests" error={errors.interests}>
        <textarea
          id="interests"
          name="interests"
          rows={3}
          placeholder="What do you want to do in the club?"
          value={form.interests}
          onChange={handleChange}
          aria-invalid={Boolean(errors.interests)}
          aria-describedby={errors.interests ? 'interests-error' : undefined}
        />
      </Field>

      <div className="field">
        <label className="choice">
          <input
            type="checkbox"
            name="agreed_to_terms"
            checked={form.agreed_to_terms}
            onChange={handleChange}
          />
          I agree to follow the club terms and code of conduct
        </label>
        {errors.agreed_to_terms && (
          <p className="error" role="alert">
            {errors.agreed_to_terms}
          </p>
        )}
      </div>

      <button type="submit" className="primary" disabled={submitting}>
        {submitting ? 'Registering...' : 'Register member'}
      </button>

      {status && (
        <p className={`status ${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>
          {status.text}
        </p>
      )}
    </form>
  );
}
