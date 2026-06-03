import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
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
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 5) newErrors.password = 'Minimum 5 characters';
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
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      const res = login(emailPreset, passPreset);
      setLoading(false);
      if (res.success) navigate(roleRedirects[res.user.role] || '/');
    }, 300);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900">Sign in</h2>
        <p className="text-sm text-gray-500 mt-1">Enter your credentials to access your portal</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email Address" type="email" icon={Mail}
          placeholder="e.g. admin@gmail.com" value={email}
          onChange={(e) => setEmail(e.target.value)} error={errors.email} autoFocus
        />
        <Input
          label="Password" type="password" icon={Lock}
          placeholder="••••••••" value={password}
          onChange={(e) => setPassword(e.target.value)} error={errors.password}
        />
        <Button type="submit" variant="primary" loading={loading} className="w-full mt-1 gap-2">
          <LogIn size={16} /> Sign In
        </Button>
      </form>

      <div className="pt-5 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-400 text-center mb-3">Demo Accounts</p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@gmail.com', 'admin123')}
            className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-150 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-[10px] font-black text-blue-600">SA</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-800">Administrator</p>
                <p className="text-[11px] text-gray-400">admin@gmail.com</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
          </button>

          {/* <button
            type="button"
            onClick={() => handleQuickLogin('teacher@gmail.com', 'teacher123')}
            className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-150 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-[10px] font-black text-blue-600">TC</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-800">Teacher</p>
                <p className="text-[11px] text-gray-400">teacher@gmail.com</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
          </button> */}
        </div>
      </div>
    </div>
  );
};
