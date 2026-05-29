import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const roleRedirects = { superadmin: '/admin', teacher: '/teacher' };

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 5) newErrors.password = 'Password must be at least 5 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (res.success) navigate(roleRedirects[res.user.role] || '/');
    }, 400);
  };

  const handleQuickLogin = (emailPreset, passPreset) => {
    setEmail(emailPreset);
    setPassword(passPreset);
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      const res = login(emailPreset, passPreset);
      setLoading(false);
      if (res.success) navigate(roleRedirects[res.user.role] || '/');
    }, 300);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-xl font-bold text-white tracking-tight">Portal Authentication</h2>
        <p className="text-slate-400 text-xs">Sign in as Super Admin or Teacher.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <Input
          label="Email Address" type="email" icon={Mail}
          placeholder="admin@gmail.com" value={email}
          onChange={(e) => setEmail(e.target.value)} error={errors.email} autoFocus
        />
        <Input
          label="Password" type="password" icon={Lock}
          placeholder="••••••••" value={password}
          onChange={(e) => setPassword(e.target.value)} error={errors.password}
        />
        <Button type="submit" variant="primary" loading={loading}
          className="w-full mt-2 font-bold py-3 text-sm flex items-center justify-center gap-2">
          <LogIn size={16} /> Sign In to Portal
        </Button>
      </form>

      <div className="mt-4 pt-6 border-t border-slate-800/80 flex flex-col gap-3">
        <span className="text-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Quick Access
        </span>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => handleQuickLogin('admin@gmail.com', 'admin123')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-900/30 hover:border-indigo-500/50 hover:bg-indigo-900/10 text-left transition-all duration-300 text-white cursor-pointer group">
            <div className="flex flex-col">
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                <Badge variant="indigo" className="text-[8px] px-1 py-0 border-none leading-none">Super Admin</Badge>
                admin@gmail.com
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5">Password: admin123</span>
            </div>
            <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
          </button>

          <button type="button" onClick={() => handleQuickLogin('teacher@gmail.com', 'teacher123')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-900/30 hover:border-indigo-500/50 hover:bg-indigo-900/10 text-left transition-all duration-300 text-white cursor-pointer group">
            <div className="flex flex-col">
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                <Badge variant="indigo" className="text-[8px] px-1 py-0 border-none leading-none">Teacher</Badge>
                teacher@gmail.com
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5">Password: teacher123</span>
            </div>
            <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
