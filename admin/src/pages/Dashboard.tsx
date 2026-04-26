import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, CheckCircle, ShieldAlert, Eye } from 'lucide-react';
import { api } from '../services/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    pending: 0,
    verified: 0,
    spam: 0,
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, pendingRes, verifiedRes, spamRes, recentRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/reports?limit=1&status=pending'),
          api.get('/admin/reports?limit=1&status=verified'),
          api.get('/admin/reports?limit=1&status=spam'),
          api.get('/admin/reports?limit=5&page=1'),
        ]);

        const usersData = usersRes as any[];
        setStats({
          users: usersData.length,
          pending: (pendingRes as any).pagination?.total || 0,
          verified: (verifiedRes as any).pagination?.total || 0,
          spam: (spamRes as any).pagination?.total || 0,
        });

        setRecentReports((recentRes as any).data || []);
        setRecentUsers(usersData.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  if (loading) {
    return <div className="empty-state"><span className="spinner"></span></div>;
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f620', color: 'var(--primary)' }}>
            <Users />
          </div>
          <div>
            <div className="stat-value">{stats.users}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b20', color: 'var(--warning)' }}>
            <AlertTriangle />
          </div>
          <div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending Reports</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10b98120', color: 'var(--success)' }}>
            <CheckCircle />
          </div>
          <div>
            <div className="stat-value">{stats.verified}</div>
            <div className="stat-label">Verified Reports</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#6b728020', color: 'var(--spam)' }}>
            <ShieldAlert />
          </div>
          <div>
            <div className="stat-value">{stats.spam}</div>
            <div className="stat-label">Spam Reports</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>Recent Reports</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/reports')}>View All</button>
          </div>
          <div className="card-body" style={{ padding: '10px 0' }}>
            {recentReports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No reports yet</p>
              </div>
            ) : (
              <div className="mini-list">
                {recentReports.map((r, idx) => (
                  <div className="mini-item" key={r.id || idx}>
                    <div className="mini-item-left">
                      <span className="mini-item-name">{issueLabel(r.issueType)}</span>
                      <span className="mini-item-sub">
                        {r.place ? r.place.name || r.place.sourceId : 'Unknown place'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button className="btn btn-sm btn-ghost" title="View Details" onClick={() => navigate(`/reports/${r.id}`)}>
                        <Eye size={14} />
                      </button>
                      <span className={`badge badge-${r.status}`}>{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Newest Users</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/users')}>View All</button>
          </div>
          <div className="card-body" style={{ padding: '10px 0' }}>
            {recentUsers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <p>No users yet</p>
              </div>
            ) : (
              <div className="mini-list">
                {recentUsers.map((u, idx) => {
                  const fName = u.firstName || (u.profile && u.profile.name ? u.profile.name.split(' ')[0] : 'User');
                  const lName = u.lastName || (u.profile && u.profile.name ? u.profile.name.split(' ').slice(1).join(' ') : '');
                  return (
                    <div className="mini-item" key={u._id || idx}>
                      <div className="mini-item-left">
                        <span className="mini-item-name">{fName} {lName}</span>
                        <span className="mini-item-sub">{u.email}</span>
                      </div>
                      <span className={`badge badge-${u.role}`}>{u.role}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
