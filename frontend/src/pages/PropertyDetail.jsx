import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertiesAPI, inquiriesAPI, favoritesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import ImageGallery from '../components/ImageGallery';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { MapPin, Bed, Bath, Maximize, Phone, Mail, Star, Calendar, Heart, MessageSquare } from 'lucide-react';
import { formatPrice } from '../components/PropertyCard';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);

  useEffect(() => {
    propertiesAPI.getById(id).then(res => {
      setProperty(res.data.data);
      setLoading(false);
    }).catch(() => { toast.error('Property not found'); navigate('/properties'); });
  }, [id]);

  const handleFavorite = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!hasRole('buyer')) { toast.error('Only buyers can save favorites'); return; }
    try {
      const res = await favoritesAPI.toggle(id);
      setFavorited(res.data.favorited);
      toast.success(res.data.message);
    } catch { toast.error('Failed to update favorites'); }
  };

  const handleInquiry = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!hasRole('buyer')) { toast.error('Only buyers can send inquiries'); return; }
    if (!inquiryMsg.trim()) { toast.error('Please enter a message'); return; }
    setInquiryLoading(true);
    try {
      await inquiriesAPI.create({ property_id: id, message: inquiryMsg });
      toast.success('Inquiry sent successfully!');
      setInquiryMsg('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send inquiry'); }
    finally { setInquiryLoading(false); }
  };

  if (loading) return <div className="page"><div className="container"><LoadingSpinner/></div></div>;
  if (!property) return null;

  const isSold = property.status === 'sold';

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom:16, display:'flex', alignItems:'center', gap:8, fontSize:'0.85rem', color:'var(--text-secondary)' }}>
          <Link to="/properties" style={{ color:'var(--accent-gold)' }}>Properties</Link>
          <span>/</span> <span>{property.title}</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:32 }}>
          <div>
            <ImageGallery images={property.images} title={property.title}/>

            <div style={{ marginTop:28 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:16 }}>
                <div>
                  <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                    <StatusBadge status={property.status}/>
                    <span className={`badge badge-${property.type}`} style={{textTransform:'capitalize'}}>{property.type}</span>
                  </div>
                  <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:700, marginBottom:4 }}>{property.title}</h1>
                  <div style={{ display:'flex', alignItems:'center', gap:4, color:'var(--text-secondary)' }}>
                    <MapPin size={14}/> {property.address}{property.area ? `, ${property.area}` : ''}{property.city ? `, ${property.city}` : ''}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:700, color:'var(--accent-gold)' }}>
                    {formatPrice(property.price)}
                  </div>
                  {property.area_sqft && (
                    <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>
                      ₹{Math.round(property.price/property.area_sqft).toLocaleString('en-IN')}/sqft
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display:'flex', gap:24, padding:'16px 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', marginBottom:20 }}>
                {property.bedrooms > 0 && <div style={{ textAlign:'center' }}><Bed size={20} color="var(--accent-gold)"/><div style={{fontSize:'0.9rem',marginTop:4}}>{property.bedrooms} Bedrooms</div></div>}
                {property.bathrooms > 0 && <div style={{ textAlign:'center' }}><Bath size={20} color="var(--accent-gold)"/><div style={{fontSize:'0.9rem',marginTop:4}}>{property.bathrooms} Bathrooms</div></div>}
                {property.area_sqft && <div style={{ textAlign:'center' }}><Maximize size={20} color="var(--accent-gold)"/><div style={{fontSize:'0.9rem',marginTop:4}}>{property.area_sqft?.toLocaleString()} sqft</div></div>}
              </div>

              {property.description && (
                <div style={{ marginBottom:24 }}>
                  <h3 style={{ fontFamily:'var(--font-display)', marginBottom:12 }}>About this Property</h3>
                  <p style={{ color:'var(--text-secondary)', lineHeight:1.8 }}>{property.description}</p>
                </div>
              )}

              <div className="card" style={{ padding:20, marginBottom:24 }}>
                <h3 style={{ fontFamily:'var(--font-display)', marginBottom:16 }}>Ask a Question</h3>
                <textarea className="form-control" rows={4} placeholder="What would you like to know about this property?"
                  value={inquiryMsg} onChange={e => setInquiryMsg(e.target.value)}
                  disabled={isSold} style={{ marginBottom:12, resize:'vertical' }}/>
                <button className="btn btn-primary" onClick={handleInquiry}
                  disabled={inquiryLoading || isSold || !inquiryMsg.trim()}>
                  <MessageSquare size={15}/>
                  {isSold ? 'Property Sold' : inquiryLoading ? 'Sending...' : 'Send Inquiry'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ padding:20, marginBottom:16, position:'sticky', top:88 }}>
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                <Link to={isSold ? '#' : `/book-visit/${property.id}`}
                  className={`btn btn-primary ${isSold ? '' : ''}`}
                  style={{ flex:1, justifyContent:'center', opacity: isSold ? 0.5 : 1, pointerEvents: isSold ? 'none' : 'auto' }}
                  onClick={e => { if (!isAuthenticated) { e.preventDefault(); navigate('/login'); } }}>
                  <Calendar size={15}/> {isSold ? 'Property Sold' : 'Book a Visit'}
                </Link>
                <button onClick={handleFavorite}
                  style={{ padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border)',
                    borderRadius:'var(--radius-sm)', color: favorited ? 'var(--error)' : 'var(--text-secondary)' }}>
                  <Heart size={16} fill={favorited ? 'currentColor' : 'none'}/>
                </button>
              </div>

              {property.agent_name && (
                <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
                  <h4 style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:12 }}>ASSIGNED AGENT</h4>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                    <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent-gold),var(--accent-teal))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#0d0d1a' }}>
                      {property.agent_name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight:600 }}>{property.agent_name}</div>
                      {property.specialization && <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{property.specialization}</div>}
                    </div>
                  </div>
                  {property.rating && (
                    <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:8, fontSize:'0.85rem' }}>
                      <Star size={14} color="var(--accent-gold)" fill="var(--accent-gold)"/>
                      <span>{property.rating} Rating</span>
                      {property.experience_years && <span style={{color:'var(--text-secondary)'}}> · {property.experience_years} yrs exp</span>}
                    </div>
                  )}
                  {property.agent_phone && (
                    <a href={`tel:${property.agent_phone}`} className="btn btn-secondary btn-sm" style={{ width:'100%', justifyContent:'center', marginBottom:8 }}>
                      <Phone size={14}/> {property.agent_phone}
                    </a>
                  )}
                  {property.agent_email && (
                    <a href={`mailto:${property.agent_email}`} className="btn btn-secondary btn-sm" style={{ width:'100%', justifyContent:'center' }}>
                      <Mail size={14}/> Email Agent
                    </a>
                  )}
                </div>
              )}

              {property.seller_name && (
                <div style={{ borderTop:'1px solid var(--border)', paddingTop:16, marginTop:16 }}>
                  <h4 style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:8 }}>SELLER</h4>
                  <div style={{ fontWeight:500 }}>{property.seller_name}</div>
                  {property.seller_phone && <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginTop:4 }}>{property.seller_phone}</div>}
                </div>
              )}

              {(property.state || property.pincode) && (
                <div style={{ borderTop:'1px solid var(--border)', paddingTop:16, marginTop:16 }}>
                  <h4 style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:8 }}>LOCATION</h4>
                  <div style={{ fontSize:'0.9rem', color:'var(--text-secondary)' }}>
                    {property.area && <div>{property.area}</div>}
                    {property.city && <div>{property.city}{property.state ? `, ${property.state}` : ''}</div>}
                    {property.pincode && <div>PIN: {property.pincode}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
