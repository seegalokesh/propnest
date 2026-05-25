import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { favoritesAPI } from '../api';
import toast from 'react-hot-toast';

const formatPrice = (price) => {
  if (price >= 10000000) return `₹${(price/10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price/100000).toFixed(2)} L`;
  return `₹${price?.toLocaleString('en-IN')}`;
};

export default function PropertyCard({ property, isFavorited = false, onFavoriteToggle, showCompare, isInCompare, onCompareToggle }) {
  const { isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  const [favorited, setFavorited] = useState(isFavorited);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!hasRole('buyer')) { toast.error('Only buyers can save favorites'); return; }
    setFavLoading(true);
    try {
      const res = await favoritesAPI.toggle(property.id);
      setFavorited(res.data.favorited);
      onFavoriteToggle?.(property.id, res.data.favorited);
      toast.success(res.data.message);
    } catch { toast.error('Failed to update favorites'); }
    finally { setFavLoading(false); }
  };

  return (
    <div className="card" style={{ transition:'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
      <div style={{ position:'relative', overflow:'hidden', height:200 }}>
        <img src={property.primary_image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}
          alt={property.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.3s' }}
          onMouseEnter={e => e.target.style.transform='scale(1.05)'}
          onMouseLeave={e => e.target.style.transform='scale(1)'}
          onError={e => e.target.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}/>
        <div style={{ position:'absolute', top:12, left:12, display:'flex', gap:6 }}>
          <span className={`badge badge-${property.status}`} style={{textTransform:'capitalize'}}>{property.status}</span>
          <span className={`badge badge-${property.type}`} style={{textTransform:'capitalize'}}>{property.type}</span>
        </div>
        <button onClick={handleFavorite} disabled={favLoading}
          style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.5)', border:'none',
            borderRadius:'50%', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center',
            color: favorited ? 'var(--error)' : 'white', transition:'all 0.2s' }}>
          <Heart size={16} fill={favorited ? 'currentColor' : 'none'}/>
        </button>
      </div>

      <div style={{ padding:16 }}>
        <div style={{ marginBottom:8 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:600, marginBottom:4,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{property.title}</div>
          <div style={{ color:'var(--accent-gold)', fontWeight:700, fontSize:'1.1rem' }}>{formatPrice(property.price)}</div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:4, color:'var(--text-secondary)', fontSize:'0.8rem', marginBottom:12 }}>
          <MapPin size={12}/> {property.area || property.city || 'Location N/A'}{property.city && property.area ? `, ${property.city}` : ''}
        </div>

        <div style={{ display:'flex', gap:12, color:'var(--text-secondary)', fontSize:'0.8rem', marginBottom:16, borderTop:'1px solid var(--border)', paddingTop:12 }}>
          {property.bedrooms > 0 && <span style={{display:'flex',alignItems:'center',gap:4}}><Bed size={12}/>{property.bedrooms} Bed</span>}
          {property.bathrooms > 0 && <span style={{display:'flex',alignItems:'center',gap:4}}><Bath size={12}/>{property.bathrooms} Bath</span>}
          {property.area_sqft && <span style={{display:'flex',alignItems:'center',gap:4}}><Maximize size={12}/>{property.area_sqft?.toLocaleString()} sqft</span>}
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <Link to={`/properties/${property.id}`} className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:'center' }}>View Details</Link>
          {showCompare && (
            <button onClick={() => onCompareToggle?.(property)}
              className={`btn btn-sm ${isInCompare ? 'btn-danger' : 'btn-secondary'}`}>
              {isInCompare ? '−' : '+'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { formatPrice };
