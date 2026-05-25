import { useState, useEffect } from 'react';
import { favoritesAPI } from '../api';
import PropertyCard from '../components/PropertyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Link } from 'react-router-dom';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoritesAPI.getAll().then(res => { setFavorites(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleRemove = (propertyId, favorited) => {
    if (!favorited) setFavorites(f => f.filter(p => p.id !== propertyId));
  };

  if (loading) return <div className="page"><div className="container"><LoadingSpinner/></div></div>;

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Saved Properties</h1>
        <p className="page-subtitle">{favorites.length} saved {favorites.length === 1 ? 'property' : 'properties'}</p>
        {favorites.length === 0 ? (
          <EmptyState icon="❤️" title="No saved properties yet"
            description="Browse properties and click the heart icon to save them here"
            action={<Link to="/properties" className="btn btn-primary">Browse Properties</Link>}/>
        ) : (
          <div className="grid grid-3">
            {favorites.map(p => <PropertyCard key={p.id} property={p} isFavorited={true} onFavoriteToggle={handleRemove}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
