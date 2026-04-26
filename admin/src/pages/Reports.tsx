import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Check, X, Flag, RotateCcw, Eye } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export const Reports: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 15 });
  
  const [filters, setFilters] = useState({ status: '', issueType: '' });
  
  const [modalImage, setModalImage] = useState<{ src: string, desc: string } | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(filters.status && { status: filters.status }),
        ...(filters.issueType && { issueType: filters.issueType }),
      });
      
      const res: any = await api.get(`/admin/reports?${qs}`);
      setReports(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, filters]);

  const moderateReport = async (id: string, action: 'verify' | 'reject' | 'mark-spam' | 'unmark-spam') => {
    try {
      await api.patch(`/admin/reports/${id}/${action}`);
      toast(`Report ${action === 'unmark-spam' ? 'unmarked as spam' : action + 'ed'}`, 'success');
      fetchReports(); // Refresh the list
    } catch (err: any) {
      toast(err.message || 'Error updating report', 'error');
    }
  };

  const issueLabel = (type: string) => {
    const map: Record<string, string> = {
      elevator_out_of_order: '🛗 Elevator Out',
      ramp_blocked: '🚧 Ramp Blocked',
      parking_issue: '🅿️ Parking Issue',
      place_closed: '🚪 Place Closed',
      incorrect_info: 'ℹ️ Incorrect Info',
      other: '📌 Other',
    };
    return map[type] || type;
  };

  const fmtDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="card">
      <div className="filters">
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="spam">Spam</option>
        </select>
        
        <select
          className="filter-select"
          value={filters.issueType}
          onChange={(e) => { setFilters({ ...filters, issueType: e.target.value }); setPage(1); }}
        >
          <option value="">All Issue Types</option>
          <option value="elevator_out_of_order">Elevator Out</option>
          <option value="ramp_blocked">Ramp Blocked</option>
          <option value="parking_issue">Parking Issue</option>
          <option value="place_closed">Place Closed</option>
          <option value="incorrect_info">Incorrect Info</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Issue & Desc</th>
              <th>Place</th>
              <th>User</th>
              <th>Status</th>
              <th>Spam Score</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row"><td colSpan={8}><span className="spinner"></span></td></tr>
            ) : error ? (
              <tr className="loading-row"><td colSpan={8}>{error}</td></tr>
            ) : reports.length === 0 ? (
              <tr className="loading-row"><td colSpan={8}>No reports match your filters</td></tr>
            ) : (
              reports.map(r => {
                const spam = r.spamScore || 0;
                const spamColor = spam > 70 ? '#ef4444' : spam > 40 ? '#f59e0b' : '#10b981';

                return (
                  <tr key={r.id}>
                    <td>
                      {r.imageUrl ? (
                        <img
                          src={r.imageUrl}
                          className="img-thumb"
                          alt="Report"
                          onClick={() => setModalImage({ src: r.imageUrl, desc: r.description || '' })}
                        />
                      ) : (
                        <div className="no-img">—</div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>{issueLabel(r.issueType)}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--text-2)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.description || '—'}
                          </div>
                        </div>
                        <button className="btn btn-sm btn-ghost" title="View Details" onClick={() => navigate(`/reports/${r.id}`)}>
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                    <td style={{ fontSize: '.8rem', color: 'var(--text-2)' }}>
                      {r.place ? (r.place.name || r.place.sourceId) : '—'}
                    </td>
                    <td>
                      {r.user ? (
                        <>
                          <div style={{ fontSize: '.82rem', fontWeight: 500 }}>{r.user.firstName} {r.user.lastName}</div>
                          <div style={{ fontSize: '.73rem', color: 'var(--text-2)' }}>{r.user.email || ''}</div>
                        </>
                      ) : '—'}
                    </td>
                    <td>
                      {r.status === 'spam' ? (
                        <span className="badge badge-rejected">Rejected (Spam)</span>
                      ) : (
                        <span className={`badge badge-${r.status}`}>{r.status}</span>
                      )}
                    </td>
                    <td>
                      <div className="score-bar">
                        <div className="score-track" style={{ width: '60px' }}>
                          <div className="score-fill" style={{ width: `${spam}%`, background: spamColor }}></div>
                        </div>
                        <span style={{ fontSize: '.78rem', color: 'var(--text-2)' }}>{spam}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-2)', fontSize: '.8rem' }}>{fmtDate(r.createdAt)}</td>
                    <td>
                      <div className="actions">
                        {r.status !== 'verified' && (
                          <button className="btn btn-sm btn-success" onClick={() => moderateReport(r.id, 'verify')}>
                            <Check size={14} /> Verify
                          </button>
                        )}
                        {r.status !== 'rejected' && r.status !== 'spam' && (
                          <button className="btn btn-sm btn-danger" onClick={() => moderateReport(r.id, 'reject')}>
                            <X size={14} /> Reject
                          </button>
                        )}
                        {r.status !== 'spam' && (
                          <button className="btn btn-sm btn-warning" onClick={() => moderateReport(r.id, 'mark-spam')}>
                            <Flag size={14} /> {r.status === 'rejected' ? 'Flag as Spam' : 'Spam'}
                          </button>
                        )}
                        {r.status === 'spam' && (
                          <button className="btn btn-sm btn-ghost" onClick={() => moderateReport(r.id, 'reject')}>
                            <RotateCcw size={14} /> Unflag Spam
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div id="reports-info">
          Showing {Math.min((page - 1) * pagination.limit + 1, pagination.total || 0)}–{Math.min(page * pagination.limit, pagination.total || 0)} of {pagination.total || 0}
        </div>
        <div className="pagination-controls">
          <button className="btn btn-sm btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span style={{ margin: '0 10px' }}>Page {page} / {pagination.totalPages || 1}</span>
          <button className="btn btn-sm btn-ghost" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      </div>

      {modalImage && (
        <div className="modal-overlay" onClick={() => setModalImage(null)}>
          <div className="modal-box" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Image Preview</h3>
              <button className="modal-close" onClick={() => setModalImage(null)}>×</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <img src={modalImage.src} className="modal-img" alt="Preview" />
              <p style={{ marginTop: '12px', color: 'var(--text-2)' }}>{modalImage.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
