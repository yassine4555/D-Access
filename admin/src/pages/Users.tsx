import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Search, Ban } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Users: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  
  // Current user info to prevent self-deletion or demotion (simplified)
  const currentUserId = JSON.parse(atob(localStorage.getItem('da_admin_token')?.split('.')[1] || '{}')).sub;

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data: any[] = await api.get('/admin/users');
      setUsers(data);
      setFilteredUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    const filtered = users.filter(u =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(lower)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast(`Role updated to ${newRole}`, 'success');
    } catch (err: any) {
      toast(err.message || 'Error updating role', 'error');
      fetchUsers(); // Revert on failure
    }
  };

  const handleBan = async (userId: string, name: string) => {
    if (!window.confirm(`Ban user "${name}"? This will restrict their access.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      toast('User banned', 'success');
    } catch (err: any) {
      toast(err.message || 'Error banning user', 'error');
    }
  };

  const fmtDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="card">
      <div className="filters">
        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-3)' }} />
          <input
            type="text"
            className="search-input"
            style={{ paddingLeft: '32px', width: '100%' }}
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Provider</th>
              <th>Role</th>
              <th>Language</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row"><td colSpan={6}><span className="spinner"></span></td></tr>
            ) : error ? (
              <tr className="loading-row"><td colSpan={6}>{error}</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr className="loading-row"><td colSpan={6}>No users found</td></tr>
            ) : (
              filteredUsers.map(u => {
                const fName = u.firstName || (u.profile && u.profile.name ? u.profile.name.split(' ')[0] : 'User');
                const lName = u.lastName || (u.profile && u.profile.name ? u.profile.name.split(' ').slice(1).join(' ') : '');
                const firstChar = fName[0] ? fName[0].toUpperCase() : 'U';
                const isSelf = u._id === currentUserId;

                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '.8rem' }}>
                          {firstChar}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{fName} {lName}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--text-2)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge badge-${u.provider || 'local'}`}>{u.provider || 'local'}</span></td>
                    <td>
                      <select
                        className="role-select"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={isSelf}
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ color: 'var(--text-2)' }}>{u.language || 'en'}</td>
                    <td style={{ color: 'var(--text-2)' }}>{fmtDate(u.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleBan(u._id, `${fName} ${lName}`)}
                        disabled={isSelf}
                        title={isSelf ? 'Cannot ban yourself' : 'Ban user'}
                      >
                        <Ban size={14} /> Ban
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
