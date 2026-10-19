// A member as returned by the API
export interface Member {
  id: string;
  member_name: string;
  email: string;
  club: string;
  year_level: string;
  interests: string;
  agreed_to_terms: boolean;
  created_at: string;
}

// The shape of the form's single state object
export interface MemberFormData {
  member_name: string;
  email: string;
  club: string;
  year_level: string;
  interests: string;
  agreed_to_terms: boolean;
}

// One optional error message per form field
export type FormErrors = Partial<Record<keyof MemberFormData, string>>;
