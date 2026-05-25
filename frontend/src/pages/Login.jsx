import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Home } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/properties';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'agent') navigate('/agent/dashboard');
      else navigate(from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const quickLogin = async (email, pwd) => {
    setForm({ email, password: pwd });
    setLoading(true);
    try {
      const user = await login(email, pwd);
      toast.success(`Logged in as ${user.role}`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'agent') navigate('/agent/dashboard');
      else navigate('/properties');
    } catch { toast.error('Quick login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20,
      background:'radial-gradient(ellipse at 60% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)' }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:'linear-gradient(135deg,var(--accent-gold),var(--accent-teal))', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Home size={22} color="#0d0d1a"/>
            </div>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:700, color:'var(--accent-gold)' }}>PropNest</span>
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', marginBottom:4 }}>Welcome back</h2>
          <p style={{ color:'var(--text-secondary)' }}>Sign in to your account</p>
        </div>

        <div className="card" style={{ padding:32 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" placeholder="your@email.com"
                value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} autoFocus/>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <input className="form-control" type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} style={{ paddingRight:44 }}/>
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)' }}>
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:8 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:16, fontSize:'0.9rem', color:'var(--text-secondary)' }}>
            Don't have an account? <Link to="/register" style={{ color:'var(--accent-gold)' }}>Register</Link>
          </div>
        </div>

        <div className="card" style={{ padding:20, marginTop:16 }}>
          <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Quick Demo Login</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[['Admin','admin@demo.com','Admin@123'],['Agent','agent@demo.com','Agent@123'],['Seller','seller@demo.com','Seller@123'],['Buyer','buyer@demo.com','Buyer@123']].map(([r,e,p]) => (
              <button key={r} className="btn btn-secondary btn-sm" style={{ justifyContent:'center' }}
                onClick={() => quickLogin(e,p)} disabled={loading}>{r}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
