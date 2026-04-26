import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Login: React.FC = () => {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data: any = await api.post('/auth/login', { email, password });
      const token = data.access_token;
      
      // Temporarily store token in localStorage for the next request
      localStorage.setItem('da_admin_token', token);
      
      const me: any = await api.get('/auth/me');
      if (!['admin', 'moderator'].includes(me.role)) {
        throw new Error('Access denied. Admin or moderator role required.');
      }
      
      login(token, me);
    } catch (err: any) {
      localStorage.removeItem('da_admin_token');
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <ShieldAlert className="brand-icon" style={{ display: 'inline-block', color: 'var(--primary)' }} />
          <h1>D-Access Admin</h1>
          <p>Sign in to manage the platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && <div className="error-msg" style={{ marginBottom: '16px' }}>{error}</div>}
          
          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
