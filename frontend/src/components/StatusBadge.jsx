export default function StatusBadge({ status, type = 'status' }) {
  return <span className={`badge badge-${status}`} style={{ textTransform:'capitalize' }}>{status}</span>;
}
