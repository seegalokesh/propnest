import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertiesAPI } from '../api';
import PropertyCard from '../components/PropertyCard';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PropertyList() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});

  const fetchProperties = async (f = filters, p = page) => {
    setLoading(true);
    try {
      const res = await propertiesAPI.getAll({ ...f, page: p });
      setProperties(res.data.data.properties);
      setTotalPages(res.data.data.pages);
      setTotal(res.data.data.total);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initFilters = {
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || '',
      type: searchParams.get('type') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      status: searchParams.get('status') || '',
    };
    setFilters(initFilters);
    fetchProperties(initFilters, 1);
  }, []);

  const handleFilter = (f) => {
    setFilters(f);
    setPage(1);
    fetchProperties(f, 1);
  };

  const handlePage = (p) => { setPage(p); fetchProperties(filters, p); window.scrollTo(0,0); };

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom:24 }}>
          <h1 className="page-title">Find Your Dream Property</h1>
          <p className="page-subtitle">Explore {total} properties across India</p>
        </div>
        <FilterBar onFilter={handleFilter} />
        {loading ? <LoadingSpinner text="Finding properties for you..." /> : (
          properties.length === 0 ? (
            <EmptyState icon="🏘️" title="No properties found" description="Try adjusting your search filters or browse all properties"/>
          ) : (
            <>
              <div className="grid grid-3" style={{ marginBottom:32 }}>
                {properties.map(p => <PropertyCard key={p.id} property={p} showCompare={true}/>)}
              </div>
              {totalPages > 1 && (
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handlePage(page-1)} disabled={page===1}>
                    <ChevronLeft size={14}/>
                  </button>
                  {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
                    <button key={p} className={`btn btn-sm ${p===page?'btn-primary':'btn-secondary'}`} onClick={() => handlePage(p)}>{p}</button>
                  ))}
                  <button className="btn btn-secondary btn-sm" onClick={() => handlePage(page+1)} disabled={page===totalPages}>
                    <ChevronRight size={14}/>
                  </button>
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}
