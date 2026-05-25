// StatusBadge.jsx
export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

// LoadingSpinner.jsx
export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="loading-center">
      <div className="spinner spinner-dark" />
      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{text}</span>
    </div>
  );
}

// EmptyState.jsx
export function EmptyState({ icon = '🏠', title = 'Nothing here', description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

// Modal.jsx
export function Modal({ open, onClose, title, children, maxWidth = 520 }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ImageGallery.jsx
import { useState } from 'react';
export function ImageGallery({ images = [], title = '' }) {
  const [active, setActive] = useState(0);
  const fallback = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
  const imgs = images.length > 0 ? images.map(i => i.image_url || i) : [fallback];

  return (
    <div className="gallery">
      <div className="gallery-main">
        <img src={imgs[active]} alt={title} onError={e => e.target.src = fallback} />
      </div>
      {imgs.length > 1 && (
        <div className="gallery-thumbs">
          {imgs.map((img, i) => (
            <div key={i} className={`gallery-thumb${active === i ? ' active' : ''}`} onClick={() => setActive(i)}>
              <img src={img} alt={`${title} ${i + 1}`} onError={e => e.target.src = fallback} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
