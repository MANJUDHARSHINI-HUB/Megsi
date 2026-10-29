import { AlertCircle, ChevronDown } from 'lucide-react';

// Label + control + inline error. Pass `as="select"` and <option> children for a dropdown.
export default function FormField({ id, label, icon: Icon, error, hint, as = 'input', children, ...rest }) {
  const Tag = as;
  const describedBy = [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className={`control${Icon ? ' with-icon' : ''}`}>
        {Icon && <Icon className="control-icon" size={18} aria-hidden="true" />}
        <Tag id={id} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy} {...rest}>
          {children}
        </Tag>
        {as === 'select' && <ChevronDown className="control-chevron" size={18} aria-hidden="true" />}
      </div>
      {hint && !error && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="field-error">
          <AlertCircle size={15} aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
