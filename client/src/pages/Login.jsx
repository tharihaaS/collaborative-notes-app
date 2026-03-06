import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } 
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📝</span>
          <span className="text-white font-bold text-2xl">CollabNotes</span>
        </div>
        <div>
          <h2 className="text-4xl font-extrabold text-white leading-snug mb-4">
            Your thoughts,<br />
            <span className="text-yellow-300">organised beautifully.</span>
          </h2>
          <p className="text-blue-100 text-base leading-relaxed">
            Write, collaborate, and never lose an idea again.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: '✏️', text: 'Rich text editor with full formatting' },
              { icon: '👥', text: 'Invite collaborators to your notes' },
              { icon: '🔍', text: 'Search across all your notes instantly' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-blue-100 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-200 text-xs">© 2026 CollabNotes. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">📝</span>
            <span className="font-bold text-xl text-blue-600">CollabNotes</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-800 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to continue to your notes</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Email address
              </label>
              <input
                className="w-full border border-gray-200 bg-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition shadow-sm"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
              </div>
              <div className="relative">
                <input
                  className="w-full border border-gray-200 bg-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition shadow-sm pr-12"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-sm">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Create one free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}