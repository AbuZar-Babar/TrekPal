import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../api/axios';
import { useAuthStore } from '../../../store/useAuthStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', data);
      const { user, token } = response.data.data;
      
      if (user.role !== 'HOTEL') {
        setError('Only hotel accounts can access this portal.');
        return;
      }

      if (user.status === 'PENDING') {
        setError('Your hotel account is pending approval from the admin.');
        return;
      }

      if (user.status === 'REJECTED') {
        setError('Your hotel registration was rejected. Please contact support.');
        return;
      }

      setAuth(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="flex justify-center mb-4">
          <motion.div 
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            className="bg-primary-600 p-3 rounded-2xl shadow-lg shadow-primary-200"
          >
            <Building2 className="w-10 h-10 text-white" />
          </motion.div>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Hotel Portal</h2>
        <p className="mt-2 text-slate-600">Manage your inventory and bookings</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100"
        >
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <input {...register('email')} className="input-field pl-10" placeholder="hotel@example.com" />
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label">Password</label>
                <Link to="/forgot-password" title="Forgot password?" className="text-xs font-semibold text-primary-600 hover:text-primary-500">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type="password" {...register('password')} className="input-field pl-10" placeholder="••••••••" />
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have a partner account?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500">
                Register Hotel
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
