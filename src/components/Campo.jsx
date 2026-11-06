export default function Campo({ id, label, error, hint, as = "input", className = "", children, ...props }) {
  const Tag = as;
  const base = as === "select" ? "form-select" : "form-control";
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <Tag id={id} name={id} className={`${base} ${error ? "is-invalid" : ""} ${className}`} {...props}>
        {children}
      </Tag>
      {error ? <div className="invalid-feedback">{error}</div> : hint && <div className="form-hint">{hint}</div>}
    </div>
  );
}