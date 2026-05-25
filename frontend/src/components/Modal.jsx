import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center',
      background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)' }} onClick={onClose}>
      <div className="card" style={{ width:'100%', maxWidth:520, margin:20, maxHeight:'90vh', overflow:'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px',
          borderBottom:'1px solid var(--border)' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem' }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-secondary)' }}><X size={20}/></button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
        {footer && <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8 }}>{footer}</div>}
      </div>
    </div>
  );
}
