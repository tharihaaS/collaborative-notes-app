import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function PasswordStrength({ password }) {
  const rules = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'At most 32 characters', valid: password.length <= 32 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'One number', valid: /[0-9]/.test(password) },
    { label: 'One special character (!@#$...)', valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const passed = rules.filter(r => r.valid).length;
  const strength = passed <= 2 ? 'Weak' : passed <= 4 ? 'Fair' : 'Strong';
  const strengthColor = passed <= 2 ? 'bg-red-400' : passed <= 4 ? 'bg-yellow-400' : 'bg-green-500';
  const strengthTextColor = passed <= 2 ? 'text-red-500' : passed <= 4 ? 'text-yellow-500' : 'text-green-600';

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">Password strength</span>
        {password && <span className={`text-xs font-bold ${strengthTextColor}`}>{strength}</span>}
      </div>
      <div className="flex gap-1 mb-3">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
            i <= passed ? strengthColor : 'bg-gray-200'
          }`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {rules.map(rule => (
          <div key={rule.label} className={`text-xs flex items-center gap-1 ${
            rule.valid ? 'text-green-600' : 'text-gray-400'
          }`}>
            <span className="text-xs">{rule.valid ? '✅' : '⭕'}</span>
            <span className="truncate">{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const allRulesPass = (p) =>
    p.length >= 8 && p.length <= 32 &&
    /[A-Z]/.test(p) && /[a-z]/.test(p) &&
    /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRulesPass(form.password)) return setError('Password does not meet all requirements');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        username: form.username, email: form.email, password: form.password
      });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
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
            Start writing,<br />
            <span className="text-yellow-300">start collaborating.</span>
          </h2>
          <p className="text-blue-100 text-base leading-relaxed mb-10">
            Join thousands of people who organise their thoughts with CollabNotes.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-white text-sm italic leading-relaxed">
              "CollabNotes completely changed how our team shares ideas. It's fast, clean, and just works."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center text-sm font-bold text-gray-800">
                A
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Alex Johnson</p>
                <p className="text-blue-200 text-xs">Product Designer</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-blue-200 text-xs">© 2026 CollabNotes. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <span className="text-2xl">📝</span>
            <span className="font-bold text-xl text-blue-600">CollabNotes</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-800 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-6">Join CollabNotes — it's completely free</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username + Email side by side on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Username</label>
                <input
                  className="w-full border border-gray-200 bg-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm shadow-sm transition"
                  placeholder="johndoe"
                  value={form.username}
                  onChange={e => setForm({...form, username: e.target.value})}
                  required />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email</label>
                <input
                  className="w-full border border-gray-200 bg-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm shadow-sm transition"
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  className="w-full border border-gray-200 bg-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm shadow-sm transition pr-12"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={form.password}
                  maxLength={32}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {form.password && <PasswordStrength password={form.password} />}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Confirm Password</label>
              <input
                className={`w-full border bg-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm shadow-sm transition ${
                  form.confirm && form.confirm !== form.password
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-gray-200'
                }`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirm}
                maxLength={32}
                onChange={e => setForm({...form, confirm: e.target.value})}
                required />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <span>⚠️</span> Passwords do not match
                </p>
              )}
              {form.confirm && form.confirm === form.password && form.password && (
                <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1">
                  <span>✅</span> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!allRulesPass(form.password) || form.password !== form.confirm || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}