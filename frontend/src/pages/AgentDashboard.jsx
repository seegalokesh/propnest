import { useState, useEffect } from 'react';
import { dashboardAPI, visitsAPI, propertiesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Calendar, TrendingUp, CheckCircle, XCircle, Clock, Building2 } from 'lucide-react';
import { formatPrice } from '../components/PropertyCard';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [updatingVisit, setUpdatingVisit] = useState(null);
  const [updatingProp, setUpdatingProp] = useState(null);

  const fetchData = () => {
    dashboardAPI.agent().then(res => { setData(res.data.data); setLoading(false); })
      .catch(() => { toast.error('Failed to load dashboard'); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const updateVisitStatus = async (id, status) => {
    setUpdatingVisit(id);
    try {
      await visitsAPI.updateStatus(id, status);
      toast.success('Visit status updated');
      fetchData();
    } catch { toast.error('Failed to update visit'); }
    finally { setUpdatingVisit(null); }
  };

  const updatePropertyStatus = async (id, status) => {
    setUpdatingProp(id);
    try {
      await propertiesAPI.updateStatus(id, status);
      toast.success('Property status updated');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setUpdatingProp(null); }
  };

  if (loading) return <div className="page"><div className="container"><LoadingSpinner /></div></div>;

  const { stats, assignedProperties, openLeads, upcomingVisits, closedSales } = data;

  const statCards = [
    { label: 'Assigned Properties', value: stats.totalAssigned, icon: Building2, color: 'var(--accent-teal)' },
    { label: 'Open Leads', value: stats.openLeads, icon: MessageSquare, color: 'var(--warning)' },
    { label: 'Upcoming Visits', value: stats.upcomingVisits, icon: Calendar, color: 'var(--accent-gold)' },
    { label: 'Closed Sales', value: stats.closedSales, icon: TrendingUp, color: 'var(--success)' },
  ];

  const TABS = ['overview', 'leads', 'visits', 'properties', 'sales'];

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <h1 className="page-title">Agent Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name} · Total Commission: <strong style={{ color: 'var(--accent-gold)' }}>{formatPrice(stats.totalCommission)}</strong></p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-4" style={{ marginBottom: 32 }}>
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div className="stat-card" key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-value" style={{ color }}>{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '10px 18px', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--accent-gold)' : '2px solid transparent',
                color: tab === t ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: tab === t ? 600 : 400, cursor: 'pointer',
                textTransform: 'capitalize', fontSize: '0.9rem', transition: 'all 0.2s', marginBottom: -1 }}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="grid grid-2">
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Recent Open Leads</h3>
              {openLeads.length === 0 ? <EmptyState icon="📬" title="No open leads" /> : (
                openLeads.slice(0, 5).map(l => (
                  <div key={l.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{l.buyer_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{l.property_title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{l.message?.slice(0, 60)}...</div>
                    </div>
                    <StatusBadge status={l.status} />
                  </div>
                ))
              )}
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Upcoming Visits</h3>
              {upcomingVisits.length === 0 ? <EmptyState icon="📅" title="No upcoming visits" /> : (
                upcomingVisits.slice(0, 5).map(v => (
                  <div key={v.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{v.buyer_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v.property_title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', marginTop: 2 }}>
                          <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />{v.visit_date} at {v.visit_time}
                        </div>
                      </div>
                      <StatusBadge status={v.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {tab === 'leads' && (
          <div className="card">
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)' }}>All Open Leads ({openLeads.length})</h3>
            </div>
            {openLeads.length === 0 ? <EmptyState icon="📬" title="No leads yet" /> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Buyer</th><th>Property</th><th>Message</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {openLeads.map(l => (
                      <tr key={l.id}>
                        <td><div style={{ fontWeight: 500 }}>{l.buyer_name}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{l.buyer_phone}</div></td>
                        <td><Link to={`/properties/${l.property_id}`} style={{ color: 'var(--accent-gold)' }}>{l.property_title}</Link></td>
                        <td style={{ maxWidth: 250 }}><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{l.message?.slice(0, 80)}...</span></td>
                        <td><StatusBadge status={l.status} /></td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(l.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Visits Tab */}
        {tab === 'visits' && (
          <div className="card">
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)' }}>Site Visits</h3>
            </div>
            {upcomingVisits.length === 0 ? <EmptyState icon="📅" title="No visits scheduled" /> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Buyer</th><th>Property</th><th>Date & Time</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {upcomingVisits.map(v => (
                      <tr key={v.id}>
                        <td><div style={{ fontWeight: 500 }}>{v.buyer_name}</div></td>
                        <td><span style={{ fontSize: '0.9rem' }}>{v.property_title}</span></td>
                        <td><span style={{ color: 'var(--accent-gold)', fontSize: '0.88rem' }}>{v.visit_date}</span><br /><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v.visit_time}</span></td>
                        <td><StatusBadge status={v.status} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-sm" disabled={updatingVisit === v.id}
                              style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)', border: '1px solid var(--success)' }}
                              onClick={() => updateVisitStatus(v.id, 'completed')}>
                              <CheckCircle size={12} /> Done
                            </button>
                            <button className="btn btn-sm" disabled={updatingVisit === v.id}
                              style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid var(--error)' }}
                              onClick={() => updateVisitStatus(v.id, 'cancelled')}>
                              <XCircle size={12} /> Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Properties Tab */}
        {tab === 'properties' && (
          <div className="card">
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)' }}>Assigned Properties ({assignedProperties.length})</h3>
            </div>
            {assignedProperties.length === 0 ? <EmptyState icon="🏠" title="No properties assigned" /> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Property</th><th>Type</th><th>Price</th><th>Location</th><th>Status</th><th>Update Status</th></tr></thead>
                  <tbody>
                    {assignedProperties.map(p => (
                      <tr key={p.id}>
                        <td>
                          <Link to={`/properties/${p.id}`} style={{ color: 'var(--accent-gold)', fontWeight: 500 }}>{p.title}</Link>
                        </td>
                        <td><span style={{ textTransform: 'capitalize' }}>{p.type}</span></td>
                        <td style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{formatPrice(p.price)}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.area}, {p.city}</td>
                        <td><StatusBadge status={p.status} /></td>
                        <td>
                          <select className="form-control" style={{ padding: '5px 10px', fontSize: '0.8rem', width: 130 }}
                            value={p.status} disabled={updatingProp === p.id}
                            onChange={e => updatePropertyStatus(p.id, e.target.value)}>
                            <option value="available">Available</option>
                            <option value="pending">Pending</option>
                            <option value="sold">Sold</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Sales Tab */}
        {tab === 'sales' && (
          <div className="card">
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)' }}>Closed Sales ({closedSales.length})</h3>
            </div>
            {closedSales.length === 0 ? <EmptyState icon="💰" title="No sales yet" /> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Property</th><th>Sale Price</th><th>Commission (2%)</th><th>Date</th></tr></thead>
                  <tbody>
                    {closedSales.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 500 }}>{s.property_title}</td>
                        <td style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{formatPrice(s.sale_price)}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>{formatPrice(s.commission)}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(s.sale_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
