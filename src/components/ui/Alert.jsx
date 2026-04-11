export function Alert({ children, tone = "info" }) {
  return <div className={`alert alert-${tone}`}>{children}</div>;
}
