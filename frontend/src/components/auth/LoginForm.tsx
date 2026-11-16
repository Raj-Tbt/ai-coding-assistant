import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    setApiError('');
    try {
      await login(form);
      navigate('/chat');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setApiError(msg || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {apiError && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{apiError}</div>}
      <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
      <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} error={errors.password} autoComplete="current-password" />
      <Button type="submit" size="lg" isLoading={isLoading} className="w-full mt-1">Sign In</Button>
      <p className="text-sm text-center text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline font-medium">Create one</Link>
      </p>
    </form>
  );
}
