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

      
    </div>
  );
};
