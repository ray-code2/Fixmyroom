import { useState, type FormEvent } from 'react';
import { submitLead } from '../../utils/leadApi';
import {
  initialLeadValues,
  sanitizeLeadInput,
  validateLeadForm,
  type LeadFormErrors,
  type LeadFormValues,
  type PropertyType
} from '../../utils/leadValidation';
import { Button } from '../ui/Button';

const propertyOptions: Array<{ label: string; value: PropertyType }> = [
  { label: 'Boutique hotel', value: 'boutique_hotel' },
  { label: 'Luxury villa', value: 'luxury_villa' },
  { label: 'Glamping resort', value: 'glamping_resort' },
  { label: 'Vacation rental', value: 'vacation_rental' },
  { label: 'Other', value: 'other' }
];

export function LeadCaptureForm() {
  const [values, setValues] = useState<LeadFormValues>(initialLeadValues);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  function updateField(field: keyof LeadFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: sanitizeLeadInput(field, value)
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateLeadForm(values);
    setErrors(result.errors);

    if (!result.payload) {
      setStatus('error');
      setStatusMessage('Please fix the highlighted fields.');
      return;
    }

    setStatus('submitting');
    setStatusMessage('');

    const submitResult = await submitLead(result.payload);

    if (submitResult.ok) {
      setStatus('success');
      setStatusMessage(
        submitResult.mode === 'api'
          ? 'Thanks. Your request was sent to the Satin. team.'
          : 'Thanks. Your request is saved for this local preview.'
      );
      setValues(initialLeadValues);
      return;
    }

    setStatus('error');
    setStatusMessage(submitResult.message);
  }

  return (
    <form
      id="lead-form"
      className="scroll-mt-24 rounded-3xl border border-[#eadfd2] bg-white p-5 shadow-[0_24px_70px_rgba(75,46,31,0.1)] sm:p-6"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="text-2xl font-semibold text-[#171412]">Book a Demo</h2>
      <p className="mt-2 text-sm leading-6 text-[#6b5c53]">
        Tell us about your property and we'll schedule a personalised walkthrough.
      </p>

      <div className="grid mt-6 gap-4 sm:grid-cols-2">
        <FormField
          label="Your name"
          name="fullName"
          value={values.fullName}
          error={errors.fullName}
          maxLength={50}
          onChange={(value) => updateField('fullName', value)}
        />
        <FormField
          label="Role"
          name="role"
          value={values.role}
          error={errors.role}
          maxLength={50}
          placeholder="General manager"
          onChange={(value) => updateField('role', value)}
        />
      </div>

      <FormField
        label="Property name"
        name="propertyName"
        value={values.propertyName}
        error={errors.propertyName}
        maxLength={80}
        onChange={(value) => updateField('propertyName', value)}
      />

      <SegmentedControl
        label="Property type"
        options={propertyOptions}
        value={values.propertyType}
        onChange={(nextValue) => updateField('propertyType', nextValue)}
        wrap
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Work email"
          name="email"
          value={values.email}
          error={errors.email}
          maxLength={120}
          inputMode="email"
          onChange={(value) => updateField('email', value)}
        />
        <FormField
          label="Phone"
          name="phone"
          value={values.phone}
          error={errors.phone}
          maxLength={30}
          inputMode="tel"
          placeholder="+66 ..."
          onChange={(value) => updateField('phone', value)}
        />
      </div>

      <FormField
        label="Number of rooms or units"
        name="roomCount"
        value={values.roomCount}
        error={errors.roomCount}
        maxLength={5}
        inputMode="numeric"
        placeholder="e.g. 24"
        helperText="Helps us match you to the right plan"
        onChange={(value) => updateField('roomCount', value)}
      />

      <FormField
        label="What do you want to improve?"
        name="notes"
        value={values.notes}
        error={errors.notes}
        maxLength={280}
        multiline
        placeholder="Example: We lose maintenance reports in WhatsApp and need approval before repair contacts are messaged."
        onChange={(value) => updateField('notes', value)}
      />

      {statusMessage ? (
        <p
          role="status"
          className={`mb-4 rounded-xl px-3 py-2 text-sm font-semibold ${
            status === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
          }`}
        >
          {statusMessage}
        </p>
      ) : null}

      <Button type="submit" disabled={status === 'submitting'} className="w-full disabled:cursor-not-allowed disabled:opacity-60">
        {status === 'submitting' ? 'Submitting...' : 'Book Your Demo'}
      </Button>
    </form>
  );
}

function FormField({
  label,
  name,
  value,
  error,
  maxLength,
  onChange,
  placeholder,
  inputMode = 'text',
  multiline = false,
  helperText
}: {
  label: string;
  name: keyof LeadFormValues;
  value: string;
  error?: string;
  maxLength: number;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  multiline?: boolean;
  helperText?: string;
}) {
  const id = `lead-${name}`;
  const counterId = `${id}-counter`;
  const errorId = `${id}-error`;
  const describedBy = error ? `${counterId} ${errorId}` : counterId;
  const inputClass =
    'w-full rounded-xl border bg-white px-3 py-3 text-sm text-[#171412] outline-none transition placeholder:text-[#9c8a7f] focus:border-[#4b2e1f] focus:ring-2 focus:ring-[#4b2e1f]/10';

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between gap-4">
        <label htmlFor={id} className="text-sm font-semibold text-[#171412]">
          {label}
        </label>
        <span id={counterId} className="text-xs font-medium text-[#8a786b]">
          {value.length}/{maxLength}
        </span>
      </div>

      {multiline ? (
        <textarea
          id={id}
          name={name}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className={`${inputClass} min-h-28 resize-y ${error ? 'border-red-600 bg-red-50/30' : 'border-[#eadfd2]'}`}
        />
      ) : (
        <input
          id={id}
          name={name}
          value={value}
          maxLength={maxLength}
          inputMode={inputMode}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} ${error ? 'border-red-600 bg-red-50/30' : 'border-[#eadfd2]'}`}
        />
      )}

      {helperText && !error ? (
        <p className="mt-1.5 text-xs text-[#9e8f85]">{helperText}</p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-2 text-xs font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SegmentedControl<TValue extends string>({
  label,
  options,
  value,
  onChange,
  wrap = false
}: {
  label: string;
  options: Array<{ label: string; value: TValue }>;
  value: TValue;
  onChange: (value: TValue) => void;
  wrap?: boolean;
}) {
  return (
    <fieldset className="mb-4">
      <legend className="mb-2 text-sm font-semibold text-[#171412]">{label}</legend>
      <div className={`flex gap-2 ${wrap ? 'flex-wrap' : 'flex-col sm:flex-row'}`}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`satin-button min-h-10 flex-1 rounded-full border px-3 py-2 text-center text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A2E1E] ${
                selected
                  ? 'border-[#4A2E1E] bg-[#4A2E1E] text-white'
                  : 'border-[#eadfd2] bg-white text-[#4d3a31] hover:border-[#4A2E1E]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
