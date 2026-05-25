import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const CITIES = ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'];
const TYPES = ['apartment', 'villa', 'plot', 'house', 'commercial'];

export default function FilterBar({ onFilter }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    status: searchParams.get('status') || '',
  });
  const [expanded, setExpanded] = useState(false);

  const apply = (f) => {
    const params = {};
    Object.entries(f).forEach(([k,v]) => { if (v) params[k] = v; });
    setSearchParams(params);
    onFilter(f);
  };

  const handleChange = (key, val) => {
    const updated = { ...filters, [key]: val };
    setFilters(updated);
    if (key === 'search') return;
    apply(updated);
  };

  const clearAll = () => {
    const empty = { search:'', location:'', type:'', minPrice:'', maxPrice:'', status:'' };
    setFilters(empty);
    setSearchParams({});
    onFilter(empty);
  };

  const hasFilters = Object.values(filters).some(v => v);

  return (
    <div className="card" style={{ padding:20, marginBottom:28 }}>
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ flex:1, minWidth:200, position:'relative' }}>
          <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
          <input className="form-control" placeholder="Search properties..."
            value={filters.search} style={{ paddingLeft:36 }}
            onChange={e => setFilters(f => ({...f, search: e.target.value}))}
            onKeyDown={e => e.key === 'Enter' && apply(filters)}/>
        </div>

        <select className="form-control" style={{ width:160 }} value={filters.location}
          onChange={e => handleChange('location', e.target.value)}>
          <option value="">All Cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="form-control" style={{ width:150 }} value={filters.type}
          onChange={e => handleChange('type', e.target.value)}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t} style={{textTransform:'capitalize'}}>{t}</option>)}
        </select>

        <select className="form-control" style={{ width:140 }} value={filters.status}
          onChange={e => handleChange('status', e.target.value)}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </select>

        <button className="btn btn-secondary btn-sm" onClick={() => setExpanded(!expanded)}>
          <SlidersHorizontal size={14}/> Price
        </button>

        {hasFilters && (
          <button className="btn btn-secondary btn-sm" onClick={clearAll} style={{ color:'var(--error)', borderColor:'var(--error)' }}>
            <X size={14}/> Clear
          </button>
        )}

        <button className="btn btn-primary btn-sm" onClick={() => apply(filters)}>
          <Search size={14}/> Search
        </button>
      </div>

      {expanded && (
        <div style={{ display:'flex', gap:12, marginTop:16, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>Min ₹</span>
            <input className="form-control" type="number" placeholder="Min Price" style={{ width:140 }}
              value={filters.minPrice} onChange={e => handleChange('minPrice', e.target.value)}/>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>Max ₹</span>
            <input className="form-control" type="number" placeholder="Max Price" style={{ width:140 }}
              value={filters.maxPrice} onChange={e => handleChange('maxPrice', e.target.value)}/>
          </div>
        </div>
      )}
    </div>
  );
}
