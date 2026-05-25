import { useState, useEffect } from 'react';
import { propertiesAPI } from '../api';
import { Link } from 'react-router-dom';
import { X, Plus, Bed, Bath, Maximize, MapPin } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatPrice } from '../components/PropertyCard';
import StatusBadge from '../components/StatusBadge';

export default function Compare() {
  const [compareList, setCompareList] = useState([]);
  const [allProps, setAllProps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    propertiesAPI.getAll({ limit: 50 }).then(res => setAllProps(res.data.data.properties));
  }, []);

  const addProperty = (prop) => {
    if (compareList.length >= 3) return;
    if (compareList.find(p => p.id === prop.id)) return;
    setCompareList([...compareList, prop]);
  };

  const removeProperty = (id) => setCompareList(compareList.filter(p => p.id !== id));

  const filtered = allProps.filter(p =>
    !compareList.find(c => c.id === p.id) &&
    (search === '' || p.title.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase()))
  );

  const specs = [
    { label: 'Price', key: p => formatPrice(p.price) },
    { label: 'Type', key: p => <span style={{textTransform:'capitalize'}}>{p.type}</span> },
    { label: 'Status', key: p => <StatusBadge status={p.status}/> },
    { label: 'Bedrooms', key: p => p.bedrooms || '—' },
    { label: 'Bathrooms', key: p => p.bathrooms || '—' },
    { label: 'Area (sqft)', key: p => p.area_sqft ? p.area_sqft.toLocaleString() : '—' },
    { label: 'Location', key: p => `${p.area || ''}${p.city ? `, ${p.city}` : ''}` || '—' },
    { label: 'Price/sqft', key: p => p.area_sqft ? `₹${Math.round(p.price/p.area_sqft).toLocaleString('en-IN')}` : '—' },
  ];

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Compare Properties</h1>
        <p className="page-subtitle">Compare up to 3 properties side by side</p>

        <div className="card" style={{ padding:20, marginBottom:24 }}>
          <div style={{ marginBottom:12, fontSize:'0.9rem', color:'var(--text-secondary)' }}>
            Add properties to compare ({compareList.length}/3)
          </div>
          <input className="form-control" placeholder="Search by name or city..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ marginBottom:12 }}/>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', maxHeight:200, overflowY:'auto' }}>
            {filtered.slice(0,20).map(p => (
              <button key={p.id} className="btn btn-secondary btn-sm" onClick={() => addProperty(p)}
                disabled={compareList.length >= 3}>
                <Plus size={12}/> {p.title}
              </button>
            ))}
          </div>
        </div>

        {compareList.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-secondary)' }}>
            <div style={{ fontSize:'3rem', marginBottom:16 }}>⚖️</div>
            <h3 style={{ color:'var(--text-primary)', marginBottom:8 }}>No properties selected</h3>
            <p>Search and add properties above to compare them</p>
          </div>
        ) : (
          <div className="card" style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', minWidth:600 }}>
              <thead>
                <tr>
                  <th style={{ width:160 }}>Feature</th>
                  {compareList.map(p => (
                    <th key={p.id} style={{ textAlign:'center' }}>
                      <div style={{ padding:'8px 0' }}>
                        <img src={p.primary_image} alt={p.title}
                          style={{ width:'100%', height:100, objectFit:'cover', borderRadius:8, marginBottom:8 }}
                          onError={e => e.target.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}/>
                        <div style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem', marginBottom:4 }}>{p.title}</div>
                        <button onClick={() => removeProperty(p.id)} className="btn btn-secondary btn-sm" style={{ color:'var(--error)', borderColor:'var(--error)' }}>
                          <X size={12}/> Remove
                        </button>
                      </div>
                    </th>
                  ))}
                  {compareList.length < 3 && (
                    <th style={{ textAlign:'center', opacity:0.4 }}>
                      <div style={{ padding:'40px 20px', border:'2px dashed var(--border)', borderRadius:8 }}>Add Property</div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {specs.map(({ label, key }) => (
                  <tr key={label}>
                    <td style={{ color:'var(--text-secondary)', fontWeight:500 }}>{label}</td>
                    {compareList.map(p => (
                      <td key={p.id} style={{ textAlign:'center', fontWeight: label==='Price' ? 600 : 400,
                        color: label==='Price' ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                        {key(p)}
                      </td>
                    ))}
                    {compareList.length < 3 && <td/>}
                  </tr>
                ))}
                <tr>
                  <td style={{ color:'var(--text-secondary)', fontWeight:500 }}>Action</td>
                  {compareList.map(p => (
                    <td key={p.id} style={{ textAlign:'center' }}>
                      <Link to={`/properties/${p.id}`} className="btn btn-primary btn-sm">View Details</Link>
                    </td>
                  ))}
                  {compareList.length < 3 && <td/>}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
