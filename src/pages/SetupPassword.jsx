import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { AuthLayout } from '../layouts/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Lock, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export const SetupPassword = () => {
  const { triggerToast } = useApp();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionCheckLoading, setSessionCheckLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const checkInviteSession = async () => {
      // Check if we have an active session (Supabase establishes it when clicking confirmation links)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      } else {
        setHasSession(false);
      }
      setSessionCheckLoading(false);
    };

    checkInviteSession();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Save password and mark as activated in metadata
      const { error } = await supabase.auth.updateUser({
        password: password,
        data: { activated: true }
      });

      if (error) {
        triggerToast(`Failed to set password: ${error.message}`, 'error');
        setErrors({ submit: error.message });
      } else {
        triggerToast('Password configured successfully! Please log in.', 'success');
        
        // Log out immediately to clear any temporary invitation sessions
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error(err);
      triggerToast('An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (sessionCheckLoading) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-500 font-medium animate-pulse">Verifying invitation status...</p>
        </div>
      </AuthLayout>
    );
  }

  if (!hasSession) {
    return (
      <AuthLayout>
        <div className="flex flex-col gap-6 items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Invalid or Expired Link</h2>
            <p className="text-xs text-gray-500 mt-2 px-2">
              This invitation link is either invalid or has expired. Please contact your Super Admin to request a new invitation email.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/login')}
            className="w-full mt-2 gap-2 rounded-xl text-xs font-semibold"
          >
            <ArrowLeft size={14} /> Back to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mx-auto mb-3">
            <ShieldCheck size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Activate Your Account</h2>
          <p className="text-xs text-gray-500 mt-1">Configure your personal security credentials below to gain access</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="New Password"
            type="password"
            icon={Lock}
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoFocus
          />

          <Input
            label="Confirm New Password"
            type="password"
            icon={Lock}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />

          {errors.submit && (
            <p className="text-xs text-red-500 font-semibold mt-1 text-center bg-red-50 py-2 rounded-lg">
              {errors.submit}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full mt-2 gap-2 rounded-xl font-bold"
          >
            Activate Account
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};
