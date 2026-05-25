import { useState, useEffect } from 'react';
import { inquiriesAPI } from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { MessageSquare, Filter } from 'lucide-react';

export default function InquiryManagement() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchInquiries = (status = statusFilter) => {
    setLoading(true);
    const params = status ? { status } : {};
    inquiriesAPI.getAll(params)
      .then(res => { setInquiries(res.data.data); setLoading(false); })
      .catch(() => { toast.error('Failed to load inquiries'); setLoading(false); });
  };

  useEffect(() => { fetchInquiries(); }, []);

  const openModal = (inq) => {
    setSelected(inq);
    setNewStatus(inq.status);
    setResponse(inq.response || '');
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await inquiriesAPI.updateStatus(selected.id, { status: newStatus, response });
      toast.success('Inquiry updated');
      setSelected(null);
      fetchInquiries();
    } catch { toast.error('Failed to update inquiry'); }
    finally { setUpdating(false); }
  };

  const handleFilterChange = (val) => {
    setStatusFilter(val);
    fetchInquiries(val);
  };

  const counts = {
    all: inquiries.length,
    open: inquiries.filter(i => i.status === 'open').length,
    responded: inquiries.filter(i => i.status === 'responded').length,
    closed: inquiries.filter(i => i.status === 'closed').length,
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <h1 className="page-title">Inquiry Management</h1>
          <p className="page-subtitle">Manage all buyer inquiries and track lead status</p>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: 'Total', value: counts.all, color: 'var(--accent-teal)', filter: '' },
            { label: 'Open', value: counts.open, color: 'var(--warning)', filter: 'open' },
            { label: 'Responded', value: counts.responded, color: 'var(--success)', filter: 'responded' },
            { label: 'Closed', value: counts.closed, color: 'var(--text-secondary)', filter: 'closed' },
          ].map(({ label, value, color, filter }) => (
            <button key={label} onClick={() => handleFilterChange(filter)}
              className="stat-card"
              style={{ textAlign: 'left', cursor: 'pointer', border: `1px solid ${statusFilter === filter ? color : 'var(--border)'}`, transition: 'all 0.2s' }}>
              <div className="stat-value" style={{ color, fontSize: '1.8rem' }}>{value}</div>
              <div className="stat-label">{label} Inquiries</div>
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--text-secondary)" />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Filter by status:</span>
          {['', 'open', 'responded', 'closed'].map(s => (
            <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleFilterChange(s)} style={{ textTransform: 'capitalize' }}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? <LoadingSpinner /> : inquiries.length === 0 ? (
          <EmptyState icon="📬" title="No inquiries found" description="When buyers submit inquiries, they'll appear here" />
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Buyer</th>
                    <th>Property</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq, i) => (
                    <tr key={inq.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{inq.id}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{inq.buyer_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{inq.buyer_email}</div>
                        {inq.buyer_phone && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{inq.buyer_phone}</div>}
                      </td>
                      <td>
                        <Link to={`/properties/${inq.property_id}`} style={{ color: 'var(--accent-gold)', fontSize: '0.88rem', fontWeight: 500 }}>{inq.property_title}</Link>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>{inq.area}, {inq.city}</div>
                      </td>
                      <td style={{ maxWidth: 260 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{inq.message?.slice(0, 80)}{inq.message?.length > 80 ? '...' : ''}</span>
                        {inq.response && (
                          <div style={{ marginTop: 4, fontSize: '0.78rem', color: 'var(--success)' }}>↩ {inq.response?.slice(0, 50)}...</div>
                        )}
                      </td>
                      <td><StatusBadge status={inq.status} /></td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(inq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => openModal(inq)}>
                          <MessageSquare size={12} /> Respond
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Respond Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Inquiry #${selected?.id} — ${selected?.buyer_name}`}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleUpdate} disabled={updating}>
            {updating ? 'Updating...' : 'Save Response'}
          </button>
        </>}>
        {selected && (
          <div>
            <div className="card" style={{ padding: 16, marginBottom: 20, background: 'var(--bg-elevated)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                RE: <Link to={`/properties/${selected.property_id}`} style={{ color: 'var(--accent-gold)' }}>{selected.property_title}</Link>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{selected.message}</p>
            </div>

            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="open">Open</option>
                <option value="responded">Responded</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Response Message</label>
              <textarea className="form-control" rows={4} placeholder="Write your response to the buyer..."
                value={response} onChange={e => setResponse(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
