import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../api';
import toast from 'react-hot-toast';
import { CheckCircle, ChevronRight, ChevronLeft, Home, MapPin, Layers, Image as ImageIcon } from 'lucide-react';

const STEPS = [
  { label: 'Basic Info', icon: Home },
  { label: 'Location', icon: MapPin },
  { label: 'Specs', icon: Layers },
  { label: 'Images', icon: ImageIcon },
];

const TYPES = ['apartment', 'villa', 'plot', 'house', 'commercial'];

export default function PostProperty() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'apartment', price: '', description: '',
    city: '', area: '', state: '', pincode: '', address: '',
    bedrooms: '', bathrooms: '', area_sqft: '',
    primary_image: '', images: [],
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: '' })); };

  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!form.title.trim()) errs.title = 'Title is required';
      if (!form.price || Number(form.price) <= 0) errs.price = 'Valid price required (> 0)';
      if (Number(form.price) >= 999999999) errs.price = 'Price must be less than ₹99.99 Cr';
    }
    if (step === 1) {
      if (!form.city.trim()) errs.city = 'City is required';
      if (!form.area.trim()) errs.area = 'Area is required';
      if (!form.address.trim()) errs.address = 'Address is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        area_sqft: Number(form.area_sqft) || null,
        primary_image: form.primary_image || form.images[0] || null,
      };
      const res = await propertiesAPI.create(payload);
      toast.success('Property listed successfully!');
      navigate(`/properties/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post property');
    } finally { setLoading(false); }
  };

  const formatPrice = (val) => {
    const n = Number(val);
    if (!n) return '';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 660 }}>
        <h1 className="page-title">List a Property</h1>
        <p className="page-subtitle">Fill in details to publish your listing on PropNest</p>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36, gap: 0 }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 64 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? 'var(--success)' : active ? 'var(--accent-gold)' : 'var(--bg-elevated)',
                    border: `2px solid ${done ? 'var(--success)' : active ? 'var(--accent-gold)' : 'var(--border)'}`,
                    transition: 'all 0.3s',
                  }}>
                    {done ? <CheckCircle size={18} color="white" /> : <Icon size={16} color={active ? '#0d0d1a' : 'var(--text-muted)'} />}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: active ? 'var(--accent-gold)' : done ? 'var(--success)' : 'var(--text-muted)', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: done ? 'var(--success)' : 'var(--border)', margin: '0 4px', marginBottom: 22, transition: 'background 0.3s' }} />
                )}
              </div>
            );
          })}
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>Basic Information</h3>
              <div className="form-group">
                <label className="form-label">Property Title *</label>
                <input className="form-control" placeholder="e.g. Luxury 3BHK Apartment in Bandra" value={form.title} onChange={e => set('title', e.target.value)} />
                {errors.title && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: 4 }}>{errors.title}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Property Type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                  {TYPES.map(t => (
                    <button key={t} type="button" onClick={() => set('type', t)}
                      style={{ padding: '10px 4px', borderRadius: 'var(--radius-sm)', textTransform: 'capitalize', fontSize: '0.82rem',
                        border: `1px solid ${form.type === t ? 'var(--accent-gold)' : 'var(--border)'}`,
                        background: form.type === t ? 'rgba(201,168,76,0.12)' : 'var(--bg-elevated)',
                        color: form.type === t ? 'var(--accent-gold)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input className="form-control" type="number" placeholder="e.g. 4500000" value={form.price} onChange={e => set('price', e.target.value)} />
                {form.price > 0 && <p style={{ color: 'var(--accent-gold)', fontSize: '0.82rem', marginTop: 4 }}>{formatPrice(form.price)}</p>}
                {errors.price && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: 4 }}>{errors.price}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={4} placeholder="Describe the property..." value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* Step 1: Location */}
          {step === 1 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>Location Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input className="form-control" placeholder="e.g. Mumbai" value={form.city} onChange={e => set('city', e.target.value)} />
                  {errors.city && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: 4 }}>{errors.city}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Area / Locality *</label>
                  <input className="form-control" placeholder="e.g. Bandra West" value={form.area} onChange={e => set('area', e.target.value)} />
                  {errors.area && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: 4 }}>{errors.area}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-control" placeholder="e.g. Maharashtra" value={form.state} onChange={e => set('state', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">PIN Code</label>
                  <input className="form-control" placeholder="e.g. 400050" value={form.pincode} onChange={e => set('pincode', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Address *</label>
                <textarea className="form-control" rows={3} placeholder="Building name, street, landmark..." value={form.address} onChange={e => set('address', e.target.value)} style={{ resize: 'vertical' }} />
                {errors.address && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: 4 }}>{errors.address}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Specs */}
          {step === 2 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>Property Specifications</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Bedrooms</label>
                  <select className="form-control" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
                    {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n === 0 ? 'N/A' : n}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bathrooms</label>
                  <select className="form-control" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}>
                    {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n === 0 ? 'N/A' : n}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Area (sqft)</label>
                  <input className="form-control" type="number" placeholder="e.g. 1200" value={form.area_sqft} onChange={e => set('area_sqft', e.target.value)} />
                </div>
              </div>
              {(form.price && form.area_sqft) && (
                <div className="card" style={{ padding: 16, marginTop: 8, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estimated price per sqft</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                    ₹{Math.round(Number(form.price) / Number(form.area_sqft)).toLocaleString('en-IN')} / sqft
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Images */}
          {step === 3 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>Property Images</h3>
              <div className="form-group">
                <label className="form-label">Primary Image URL</label>
                <input className="form-control" placeholder="https://example.com/image.jpg" value={form.primary_image} onChange={e => set('primary_image', e.target.value)} />
                {form.primary_image && (
                  <img src={form.primary_image} alt="Preview" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, marginTop: 10 }}
                    onError={e => { e.target.style.display = 'none'; }} />
                )}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 8 }}>
                💡 Tip: Use image URLs from Unsplash, Cloudinary, or your own CDN. High quality images get 3x more inquiries.
              </div>

              {/* Summary before submit */}
              <div className="card" style={{ padding: 20, marginTop: 24, background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.2)' }}>
                <h4 style={{ marginBottom: 12, color: 'var(--accent-teal)' }}>📋 Listing Summary</h4>
                <div style={{ display: 'grid', gap: 8, fontSize: '0.88rem' }}>
                  {[
                    ['Title', form.title],
                    ['Type', form.type],
                    ['Price', formatPrice(form.price)],
                    ['Location', `${form.area}, ${form.city}`],
                    ['Bedrooms', form.bedrooms || 'N/A'],
                    ['Bathrooms', form.bathrooms || 'N/A'],
                    ['Area', form.area_sqft ? `${form.area_sqft} sqft` : 'N/A'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 12 }}>
                      <span style={{ color: 'var(--text-secondary)', minWidth: 80 }}>{k}</span>
                      <span style={{ fontWeight: 500, textTransform: k === 'Type' ? 'capitalize' : 'none', color: k === 'Price' ? 'var(--accent-gold)' : 'var(--text-primary)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={prev} disabled={step === 0}>
              <ChevronLeft size={16} /> Back
            </button>
            {step < 3 ? (
              <button className="btn btn-primary" onClick={next}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Publishing...' : '🚀 Publish Listing'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
