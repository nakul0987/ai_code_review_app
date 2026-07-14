import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  // Auto-login if credentials exist in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/signup';
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      const loggedInUser = { id: data.userId, name: data.name };
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (user) {
    return <Dashboard user={user} onLogout={logout} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-500 tracking-tight">AI Code Reviewer</h1>
          <p className="text-slate-400 text-sm mt-2">Static analysis & AI-powered feedback combined</p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-lg px-4 py-2.5 text-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-lg px-4 py-2.5 text-sm"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-lg px-4 py-2.5 text-sm"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 font-semibold py-2.5 rounded-lg mt-6 shadow-lg shadow-indigo-600/20">
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {authMode === 'login' ? (
            <p>Don't have an account? <span onClick={() => setAuthMode('signup')} className="text-indigo-400 cursor-pointer hover:underline">Sign Up</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => setAuthMode('login')} className="text-indigo-400 cursor-pointer hover:underline">Log In</span></p>
          )}
        </div>
      </div>
    </div>
  );
}