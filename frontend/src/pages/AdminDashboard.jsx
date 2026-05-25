import { useState, useEffect } from 'react';
import { dashboardAPI, propertiesAPI, salesAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, TrendingUp, Users, DollarSign, Star, Trash2, CheckCircle } from 'lucide-react';
import { formatPrice } from '../components/PropertyCard';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{formatPrice(payload[0]?.value || 0)}</p>
        <p style={{ color: 'var(--accent-teal)', fontSize: '0.85rem' }}>{payload[1]?.value || 0} sales</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [saleModal, setSaleModal] = useState(null);
  const [saleForm, setSaleForm] = useState({ buyer_id: '', sale_price: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = () => {
    dashboardAPI.admin().then(res => { setData(res.data.data); setLoading(false); })
      .catch(() => { toast.error('Failed to load admin data'); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      await propertiesAPI.delete(deleteModal.id);
      toast.success('Property deleted');
      setDeleteModal(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    finally { setActionLoading(false); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await propertiesAPI.updateStatus(id, status);
      toast.success('Status updated');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const handleRecordSale = async () => {
    if (!saleForm.buyer_id || !saleForm.sale_price) { toast.error('Fill all fields'); return; }
    setActionLoading(true);
    try {
      await salesAPI.create({ property_id: saleModal.id, buyer_id: parseInt(saleForm.buyer_id), sale_price: Number(saleForm.sale_price) });
      toast.success('Sale recorded & property marked as sold!');
      setSaleModal(null);
      setSaleForm({ buyer_id: '', sale_price: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to record sale'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="page"><div className="container"><LoadingSpinner /></div></div>;

  const { stats, monthlySales, topAgents, recentInquiries, allProperties } = data;

  const filteredProps = statusFilter ? allProperties.filter(p => p.status === statusFilter) : allProperties;

  const statCards = [
    { label: 'Total Properties', value: stats.totalProperties, icon: Building2, color: 'var(--accent-teal)', sub: `${stats.available} available` },
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'var(--accent-gold)', sub: `${stats.sold} sold` },
    { label: 'Active Users', value: stats.totalUsers, icon: Users, color: '#a855f7', sub: 'buyers · sellers · agents' },
    { label: 'Pending Properties', value: stats.pending, icon: TrendingUp, color: 'var(--warning)', sub: 'awaiting decisions' },
  ];

  const chartData = monthlySales.map(m => ({
    month: m.month,
    revenue: m.revenue,
    count: m.count,
  }));

  const TABS = ['overview', 'properties', 'agents', 'inquiries'];

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">PropNest management panel — full control over all listings and users</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-4" style={{ marginBottom: 32 }}>
          {statCards.map(({ label, value, icon: Icon, color, sub }) => (
            <div className="stat-card" key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={color} />
                </div>
              </div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '10px 18px', background: 'none', border: 'none',
                borderBottom: tab === t ? '2px solid var(--accent-gold)' : '2px solid transparent',
                color: tab === t ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: tab === t ? 600 : 400, cursor: 'pointer',
                textTransform: 'capitalize', fontSize: '0.9rem', marginBottom: -1 }}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gap: 24 }}>
            {/* Revenue Chart */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Monthly Revenue (Last 6 Months)</h3>
              {chartData.length === 0 ? (
                <EmptyState icon="📊" title="No sales data yet" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="var(--accent-gold)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="count" fill="var(--accent-teal)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid grid-2">
              {/* Top Agents */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Top Agents</h3>
                {topAgents.length === 0 ? <EmptyState icon="🏆" title="No agent data yet" /> : (
                  topAgents.map((a, i) => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'var(--accent-gold)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: i === 0 ? '#0d0d1a' : 'var(--text-secondary)' }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.total_sales} sales · {formatPrice(a.revenue)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
                        <Star size={12} fill="currentColor" />{a.rating || '—'}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Recent Inquiries */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)' }}>Recent Inquiries</h3>
                  <Link to="/admin/inquiries" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>View all →</Link>
                </div>
                {recentInquiries.length === 0 ? <EmptyState icon="📬" title="No inquiries yet" /> : (
                  recentInquiries.map(q => (
                    <div key={q.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{q.buyer_name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{q.property_title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{q.message?.slice(0, 55)}...</div>
                        </div>
                        <StatusBadge status={q.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {tab === 'properties' && (
          <div className="card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <h3 style={{ fontFamily: 'var(--font-display)' }}>All Properties ({filteredProps.length})</h3>
              <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            {filteredProps.length === 0 ? <div style={{ padding: 40 }}><EmptyState icon="🏘️" title="No properties found" /></div> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Title</th><th>Type</th><th>Price</th><th>Location</th><th>Seller</th><th>Agent</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredProps.map(p => (
                      <tr key={p.id}>
                        <td><Link to={`/properties/${p.id}`} style={{ color: 'var(--accent-gold)', fontWeight: 500, fontSize: '0.9rem' }}>{p.title}</Link></td>
                        <td><span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{p.type}</span></td>
                        <td style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{formatPrice(p.price)}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.area}, {p.city}</td>
                        <td style={{ fontSize: '0.85rem' }}>{p.seller_name}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.agent_name || '—'}</td>
                        <td>
                          <select className="form-control" style={{ padding: '4px 8px', fontSize: '0.78rem', width: 120 }}
                            value={p.status} onChange={e => handleUpdateStatus(p.id, e.target.value)}>
                            <option value="available">Available</option>
                            <option value="pending">Pending</option>
                            <option value="sold">Sold</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {p.status !== 'sold' && (
                              <button className="btn btn-sm" onClick={() => { setSaleModal(p); setSaleForm({ buyer_id: '', sale_price: String(p.price) }); }}
                                style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--success)', border: '1px solid var(--success)' }}>
                                <CheckCircle size={11} /> Sell
                              </button>
                            )}
                            <button className="btn btn-sm btn-danger" onClick={() => setDeleteModal(p)}>
                              <Trash2 size={11} />
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

        {/* Agents Tab */}
        {tab === 'agents' && (
          <div className="card">
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)' }}>All Agents</h3>
            </div>
            {topAgents.length === 0 ? <div style={{ padding: 40 }}><EmptyState icon="👤" title="No agents found" /></div> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Agent</th><th>License</th><th>Experience</th><th>Specialization</th><th>Sales</th><th>Rating</th><th>Commission</th></tr></thead>
                  <tbody>
                    {topAgents.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600 }}>{a.name}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{a.license_number || '—'}</td>
                        <td>{a.experience_years ? `${a.experience_years} yrs` : '—'}</td>
                        <td style={{ fontSize: '0.85rem' }}>{a.specialization || '—'}</td>
                        <td style={{ fontWeight: 600, color: 'var(--accent-teal)' }}>{a.total_sales}</td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-gold)' }}>
                            <Star size={12} fill="currentColor" />{a.rating || '—'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>{formatPrice(a.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Inquiries Tab */}
        {tab === 'inquiries' && (
          <div>
            <Link to="/admin/inquiries" className="btn btn-primary" style={{ marginBottom: 16 }}>Open Full Inquiry Manager</Link>
            <div className="card">
              <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)' }}>Recent Inquiries</h3>
              </div>
              {recentInquiries.length === 0 ? <div style={{ padding: 40 }}><EmptyState icon="📬" title="No inquiries yet" /></div> : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Buyer</th><th>Property</th><th>Message</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {recentInquiries.map(q => (
                        <tr key={q.id}>
                          <td style={{ fontWeight: 500 }}>{q.buyer_name}</td>
                          <td><Link to={`/properties/${q.property_id}`} style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>{q.property_title}</Link></td>
                          <td style={{ maxWidth: 260, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{q.message?.slice(0, 70)}...</td>
                          <td><StatusBadge status={q.status} /></td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(q.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Property"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={actionLoading}>
            {actionLoading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </>}>
        <p style={{ color: 'var(--text-secondary)' }}>Are you sure you want to permanently delete <strong style={{ color: 'var(--text-primary)' }}>{deleteModal?.title}</strong>? This action cannot be undone.</p>
      </Modal>

      {/* Record Sale Modal */}
      <Modal open={!!saleModal} onClose={() => setSaleModal(null)} title="Record a Sale"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setSaleModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleRecordSale} disabled={actionLoading}>
            {actionLoading ? 'Recording...' : '✅ Confirm Sale'}
          </button>
        </>}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Recording sale for: <strong style={{ color: 'var(--accent-gold)' }}>{saleModal?.title}</strong></p>
        <div className="form-group">
          <label className="form-label">Buyer ID</label>
          <input className="form-control" type="number" placeholder="Enter buyer user ID" value={saleForm.buyer_id} onChange={e => setSaleForm(f => ({ ...f, buyer_id: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Final Sale Price (₹)</label>
          <input className="form-control" type="number" value={saleForm.sale_price} onChange={e => setSaleForm(f => ({ ...f, sale_price: e.target.value }))} />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>2% commission = {formatPrice(Number(saleForm.sale_price) * 0.02)}</p>
        </div>
      </Modal>
    </div>
  );
}
