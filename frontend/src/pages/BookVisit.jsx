import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertiesAPI, visitsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

const TIME_SLOTS = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];

export default function BookVisit() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ visit_date: '', visit_time: '', notes: '' });
  const [dupWarning, setDupWarning] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    propertiesAPI.getById(propertyId).then(res => {
      setProperty(res.data.data);
      setLoading(false);
      if (res.data.data.status === 'sold') navigate(`/properties/${propertyId}`);
    }).catch(() => navigate('/properties'));
  }, [propertyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.visit_date || !form.visit_time) { toast.error('Please select date and time'); return; }
    setSubmitting(true);
    try {
      await visitsAPI.create({ property_id: parseInt(propertyId), ...form });
      toast.success('Visit booked successfully!');
      navigate('/properties');
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed';
      if (err.response?.status === 409) { setDupWarning(true); toast.error(msg); }
      else toast.error(msg);
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="page"><div className="container"><LoadingSpinner/></div></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth:600 }}>
        <Link to={`/properties/${propertyId}`} style={{ color:'var(--accent-gold)', fontSize:'0.9rem', display:'inline-flex', alignItems:'center', gap:4, marginBottom:24 }}>
          ← Back to Property
        </Link>
        <h1 className="page-title">Book a Site Visit</h1>
        <p className="page-subtitle">Schedule a visit for: <strong style={{color:'var(--text-primary)'}}>{property?.title}</strong></p>

        {property && (
          <div className="card" style={{ padding:16, marginBottom:24, display:'flex', gap:12 }}>
            <img src={property.primary_image} alt={property.title}
              style={{ width:80, height:60, objectFit:'cover', borderRadius:8 }}
              onError={e => e.target.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}/>
            <div>
              <div style={{ fontWeight:600, marginBottom:4 }}>{property.title}</div>
              <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:4 }}>
                <MapPin size={12}/> {property.area}, {property.city}
              </div>
            </div>
          </div>
        )}

        {dupWarning && (
          <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid var(--error)', borderRadius:'var(--radius-sm)',
            padding:'12px 16px', marginBottom:20, display:'flex', gap:8, alignItems:'flex-start' }}>
            <AlertCircle size={16} color="var(--error)" style={{flexShrink:0, marginTop:2}}/>
            <span style={{ fontSize:'0.9rem' }}>You already have a visit scheduled for this date. Please choose a different date.</span>
          </div>
        )}

        <div className="card" style={{ padding:28 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label"><Calendar size={14}/> Select Date</label>
              <input className="form-control" type="date" min={today}
                value={form.visit_date} onChange={e => { setForm(f => ({...f, visit_date: e.target.value})); setDupWarning(false); }}/>
            </div>

            <div className="form-group">
              <label className="form-label"><Clock size={14}/> Select Time Slot</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {TIME_SLOTS.map(slot => (
                  <button key={slot} type="button" onClick={() => setForm(f => ({...f, visit_time: slot}))}
                    style={{ padding:'8px', borderRadius:'var(--radius-sm)', border:`1px solid ${form.visit_time===slot?'var(--accent-gold)':'var(--border)'}`,
                      background: form.visit_time===slot ? 'rgba(201,168,76,0.15)' : 'var(--bg-elevated)',
                      color: form.visit_time===slot ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      fontSize:'0.8rem', cursor:'pointer', transition:'all 0.2s' }}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Notes (Optional)</label>
              <textarea className="form-control" rows={3} placeholder="Any special requirements or questions..."
                value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} style={{ resize:'vertical' }}/>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={submitting}>
              {submitting ? 'Booking...' : '📅 Confirm Visit Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
