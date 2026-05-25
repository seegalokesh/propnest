export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="loading-center" style={{ flexDirection:'column', gap:16 }}>
      <div className="spinner"/>
      <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>{text}</p>
    </div>
  );
}
