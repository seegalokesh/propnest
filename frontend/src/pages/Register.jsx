import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Home } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'buyer', phone:'' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.email) return 'Email is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setLoading(true);
    try {
      await authAPI.register(form);
      await login(form.email, form.password);
      toast.success('Account created successfully!');
      navigate('/properties');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20,
      background:'radial-gradient(ellipse at 40% 0%, rgba(45,212,191,0.06) 0%, transparent 60%)' }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:'linear-gradient(135deg,var(--accent-gold),var(--accent-teal))', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Home size={22} color="#0d0d1a"/>
            </div>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:700, color:'var(--accent-gold)' }}>PropNest</span>
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', marginBottom:4 }}>Create an Account</h2>
          <p style={{ color:'var(--text-secondary)' }}>Join thousands of property seekers</p>
        </div>

        <div className="card" style={{ padding:32 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" placeholder="John Doe" value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))} autoFocus/>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" placeholder="your@email.com" value={form.email}
                onChange={e => setForm(f => ({...f, email: e.target.value}))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-control" placeholder="9876543210" value={form.phone}
                onChange={e => setForm(f => ({...f, phone: e.target.value}))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <input className="form-control" type={showPwd ? 'text' : 'password'} placeholder="Min 8 characters"
                  value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} style={{ paddingRight:44 }}/>
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)' }}>
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">I am a...</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {['buyer','seller','agent'].map(r => (
                  <button key={r} type="button"
                    onClick={() => setForm(f => ({...f, role: r}))}
                    style={{ padding:'10px', borderRadius:'var(--radius-sm)', border:`1px solid ${form.role===r?'var(--accent-gold)':'var(--border)'}`,
                      background: form.role===r ? 'rgba(201,168,76,0.1)' : 'var(--bg-elevated)',
                      color: form.role===r ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      textTransform:'capitalize', fontWeight: form.role===r ? 600 : 400, cursor:'pointer', transition:'all 0.2s' }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:8 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <div style={{ textAlign:'center', marginTop:16, fontSize:'0.9rem', color:'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color:'var(--accent-gold)' }}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
