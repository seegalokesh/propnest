import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Building2, Heart, LayoutDashboard, PlusCircle, LogOut, ChevronDown, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100
    }}>
      <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height: 72 }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-teal))',
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>
            <Home size={18} color="#0d0d1a" />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:700, color:'var(--accent-gold)' }}>PropNest</span>
        </Link>

        <div style={{ display:'flex', alignItems:'center', gap:8 }} className="nav-links">
          <Link to="/properties" className={`btn btn-secondary btn-sm ${isActive('/properties') ? 'active-nav' : ''}`}
            style={isActive('/properties') ? {borderColor:'var(--accent-gold)',color:'var(--accent-gold)'} : {}}>
            <Building2 size={15}/> Browse
          </Link>
          <Link to="/compare" className="btn btn-secondary btn-sm"><Building2 size={15}/> Compare</Link>

          {isAuthenticated && user?.role === 'buyer' && (
            <Link to="/favorites" className="btn btn-secondary btn-sm"><Heart size={15}/> Saved</Link>
          )}
          {isAuthenticated && (user?.role === 'seller' || user?.role === 'admin') && (
            <Link to="/post-property" className="btn btn-primary btn-sm"><PlusCircle size={15}/> List Property</Link>
          )}
          {isAuthenticated && user?.role === 'agent' && (
            <Link to="/agent/dashboard" className="btn btn-secondary btn-sm"><LayoutDashboard size={15}/> Dashboard</Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin/dashboard" className="btn btn-secondary btn-sm"><LayoutDashboard size={15}/> Admin</Link>
          )}

          {isAuthenticated ? (
            <div style={{ position:'relative' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setDropOpen(!dropOpen)}>
                <div style={{
                  width:24, height:24, borderRadius:'50%',
                  background:'linear-gradient(135deg, var(--accent-gold), var(--accent-teal))',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.7rem', fontWeight:700, color:'#0d0d1a'
                }}>{user.name[0]}</div>
                {user.name.split(' ')[0]}
                <ChevronDown size={14}/>
              </button>
              {dropOpen && (
                <div style={{
                  position:'absolute', right:0, top:'calc(100% + 8px)',
                  background:'var(--bg-card)', border:'1px solid var(--border)',
                  borderRadius:'var(--radius)', padding:8, minWidth:160, zIndex:200
                }}>
                  <div style={{ padding:'8px 12px', fontSize:'0.8rem', color:'var(--text-secondary)', borderBottom:'1px solid var(--border)', marginBottom:4 }}>
                    <div style={{color:'var(--text-primary)', fontWeight:500}}>{user.name}</div>
                    <div style={{textTransform:'capitalize'}}>{user.role}</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={handleLogout}
                    style={{ width:'100%', justifyContent:'flex-start', border:'none', marginTop:4 }}>
                    <LogOut size={14}/> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
