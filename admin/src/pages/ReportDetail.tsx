import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Check, X, Flag, RotateCcw, ArrowLeft, Calendar, User, MapPin, ShieldAlert } from 'lucide-react';

export const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res: any = await api.get(`/admin/reports/${id}`);
      setReport(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const moderateReport = async (action: 'verify' | 'reject' | 'mark-spam' | 'unmark-spam') => {
    try {
      await api.patch(`/admin/reports/${id}/${action}`);
      toast(`Report ${action === 'unmark-spam' ? 'unmarked as spam' : action + 'ed'}`, 'success');
      fetchReport();
    } catch (err: any) {
      toast(err.message || 'Error updating report', 'error');
    }
  };

  const issueLabel = (type: string) => {
    const map: Record<string, string> = {
      elevator_out_of_order: '🛗 Elevator Out of Order',
      ramp_blocked: '🚧 Ramp Blocked',
      parking_issue: '🅿️ Parking Issue',
      place_closed: '🚪 Place Closed',
      incorrect_info: 'ℹ️ Incorrect Information',
      other: '📌 Other Accessibility Issue',
    };
    return map[type] || type;
  };

  const fmtDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="empty-state"><span className="spinner"></span></div>;
  if (error) return (
    <div className="empty-state">
      <div className="empty-icon" style={{ color: 'var(--danger)' }}><X /></div>
      <p>{error}</p>
      <button className="btn btn-ghost" onClick={() => navigate('/reports')} style={{ marginTop: '20px' }}>
        <ArrowLeft size={16} /> Back to Reports
      </button>
    </div>
  );
  if (!report) return null;

  const spam = report.spamScore || 0;
  const spamColor = spam > 70 ? '#ef4444' : spam > 40 ? '#f59e0b' : '#10b981';

  return (
    <div className="report-detail-container">
      <button className="btn btn-ghost" onClick={() => navigate('/reports')} style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Reports
      </button>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 320px', alignItems: 'start' }}>
        
        {/* Left Column: Image and Description */}
        <div className="card">
          <div className="card-header">
            <h3>{issueLabel(report.issueType)}</h3>
            {report.status === 'spam' ? (
              <span className="badge badge-rejected">Rejected (Spam)</span>
            ) : (
              <span className={`badge badge-${report.status}`}>{report.status}</span>
            )}
          </div>
          
          <div className="modal-body" style={{ padding: '0' }}>
            {report.imageUrl ? (
              <div style={{ background: '#000', display: 'flex', justifyContent: 'center' }}>
                <img src={report.imageUrl} alt="Report" style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }} />
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '80px 0' }}>
                <div className="empty-icon">🖼️</div>
                <p>No image provided for this report</p>
              </div>
            )}
          </div>

          <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '1rem', color: 'var(--text)' }}>Description</h4>
            <div style={{ 
              whiteSpace: 'pre-wrap', 
              color: 'var(--text)', 
              lineHeight: '1.6', 
              fontSize: '0.95rem',
              background: 'var(--surface2)',
              padding: '16px',
              borderRadius: '8px'
            }}>
              {report.description || 'No description provided.'}
            </div>
          </div>
        </div>

        {/* Right Column: Details and Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Metadata Card */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Calendar size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Submitted on</div>
                  <div style={{ fontSize: '0.9rem' }}>{fmtDate(report.createdAt)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <User size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Reporter</div>
                  {report.user ? (
                    <>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{report.user.firstName} {report.user.lastName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{report.user.email}</div>
                    </>
                  ) : 'Unknown User'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <MapPin size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Location</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{report.place?.name || 'Unknown Place'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>ID: {report.place?.sourceId}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <ShieldAlert size={18} style={{ color: spamColor, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Spam Analysis</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div className="score-track" style={{ flex: 1, height: '6px' }}>
                      <div className="score-fill" style={{ width: `${spam}%`, background: spamColor }}></div>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{spam}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Moderation</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {report.status !== 'verified' && (
                <button className="btn btn-success" onClick={() => moderateReport('verify')} style={{ justifyContent: 'center' }}>
                  <Check size={18} /> Verify Report
                </button>
              )}
              {report.status !== 'rejected' && report.status !== 'spam' && (
                <button className="btn btn-danger" onClick={() => moderateReport('reject')} style={{ justifyContent: 'center' }}>
                  <X size={18} /> Reject Report
                </button>
              )}
              {report.status !== 'spam' && (
                <button className="btn btn-warning" onClick={() => moderateReport('mark-spam')} style={{ justifyContent: 'center' }}>
                  <Flag size={18} /> {report.status === 'rejected' ? 'Flag as Spam' : 'Spam'}
                </button>
              )}
              {report.status === 'spam' && (
                <button className="btn btn-ghost" onClick={() => moderateReport('reject')} style={{ justifyContent: 'center' }}>
                  <RotateCcw size={18} /> Unflag Spam
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
