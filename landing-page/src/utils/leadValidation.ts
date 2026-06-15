export type LeadType = 'demo';

export type PropertyType =
  | 'boutique_hotel'
  | 'luxury_villa'
  | 'glamping_resort'
  | 'vacation_rental'
  | 'other';

export type LeadFormValues = {
  fullName: string;
  role: string;
  propertyName: string;
  propertyType: PropertyType;
  email: string;
  phone: string;
  roomCount: string;
  leadType: LeadType;
  notes: string;
};

export type LeadPayload = Omit<LeadFormValues, 'roomCount'> & {
  roomCount: number;
  source: 'landing_page';
  submittedAt: string;
};

export type LeadFormErrors = Partial<Record<keyof LeadFormValues, string>>;

export const initialLeadValues: LeadFormValues = {
  fullName: '',
  role: '',
  propertyName: '',
  propertyType: 'boutique_hotel',
  email: '',
  phone: '',
  roomCount: '',
  leadType: 'demo',
  notes: ''
};

const MAX_LENGTHS: Record<keyof LeadFormValues, number> = {
  fullName: 50,
  role: 50,
  propertyName: 80,
  propertyType: 30,
  email: 120,
  phone: 30,
  roomCount: 5,
  leadType: 20,
  notes: 280
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+0-9 ()-]{7,30}$/;

export function sanitizeLeadInput(field: keyof LeadFormValues, value: string): string {
  if (field === 'roomCount') {
    return value.replace(/[^\d]/g, '').slice(0, MAX_LENGTHS.roomCount);
  }

  if (field === 'phone') {
    return value.replace(/[^+0-9 ()-]/g, '').slice(0, MAX_LENGTHS.phone);
  }

  return value.slice(0, MAX_LENGTHS[field]);
}

export function validateLeadForm(values: LeadFormValues): {
  errors: LeadFormErrors;
  payload?: LeadPayload;
} {
  const errors: LeadFormErrors = {};
  const clean = trimLeadValues(values);

  requireText(clean.fullName, 'fullName', 'Enter your name.', errors);
  requireText(clean.propertyName, 'propertyName', 'Enter the property name.', errors);
  requireText(clean.email, 'email', 'Enter a work email.', errors);

  enforceMaxLength(clean.fullName, 'fullName', MAX_LENGTHS.fullName, errors);
  enforceMaxLength(clean.role, 'role', MAX_LENGTHS.role, errors);
  enforceMaxLength(clean.propertyName, 'propertyName', MAX_LENGTHS.propertyName, errors);
  enforceMaxLength(clean.email, 'email', MAX_LENGTHS.email, errors);
  enforceMaxLength(clean.phone, 'phone', MAX_LENGTHS.phone, errors);
  enforceMaxLength(clean.notes, 'notes', MAX_LENGTHS.notes, errors);

  if (clean.email && !emailPattern.test(clean.email)) {
    errors.email = 'Use a valid work email address.';
  }

  if (clean.phone && !phonePattern.test(clean.phone)) {
    errors.phone = 'Use digits, spaces, +, -, or parentheses only.';
  }

  if (!clean.roomCount) {
    errors.roomCount = 'Enter the number of rooms or units.';
  } else if (!/^\d+$/.test(clean.roomCount)) {
    errors.roomCount = 'Room count must be a whole number.';
  } else {
    const roomCount = Number(clean.roomCount);
    if (!Number.isSafeInteger(roomCount) || roomCount < 1 || roomCount > 10000) {
      errors.roomCount = 'Room count must be between 1 and 10,000.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors,
    payload: {
      ...clean,
      roomCount: Number(clean.roomCount),
      source: 'landing_page',
      submittedAt: new Date().toISOString()
    }
  };
}

function trimLeadValues(values: LeadFormValues): LeadFormValues {
  return {
    ...values,
    fullName: values.fullName.trim(),
    role: values.role.trim(),
    propertyName: values.propertyName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    roomCount: values.roomCount.trim(),
    notes: values.notes.trim()
  };
}

function requireText(
  value: string,
  field: keyof LeadFormValues,
  message: string,
  errors: LeadFormErrors
): void {
  if (!value) {
    errors[field] = message;
  }
}

function enforceMaxLength(
  value: string,
  field: keyof LeadFormValues,
  maxLength: number,
  errors: LeadFormErrors
): void {
  if (value.length > maxLength) {
    errors[field] = `Use ${maxLength} characters or fewer.`;
  }
}
