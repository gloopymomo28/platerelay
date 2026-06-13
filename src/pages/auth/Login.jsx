import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success("Welcome back, food warrior! 🍽️");
      if (user?.role === 'donor') navigate('/donor/dashboard');
      else if (user?.role === 'recipient') navigate('/recipient/dashboard');
      else navigate('/donor/dashboard');
    } catch (error) {
      toast.error(error.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: '#03191E' }}>
      {/* Left — decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative p-16"
        style={{ background: 'linear-gradient(135deg, rgba(32,164,243,0.1), rgba(89,248,232,0.05))' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(193,207,218,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(193,207,218,0.04) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #20A4F3, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #59F8E8, transparent 70%)' }} />

        <div className="relative z-10 text-center max-w-sm">
          <div className="text-8xl mb-8">🍽️</div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Every relay matters.
          </h2>
          <p className="font-body text-lg leading-relaxed" style={{ color: 'rgba(193,207,218,0.7)' }}>
            Join the platform connecting surplus food with those who need it most — in under 15 minutes.
          </p>
          <div className="mt-10 space-y-3 text-sm font-body" style={{ color: 'rgba(193,207,218,0.5)' }}>
            {['25,000+ meals rescued', '150+ verified partners', 'Sub-2-hour pickup windows'].map(item => (
              <div key={item} className="flex items-center gap-2 justify-center">
                <span style={{ color: '#59F8E8' }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-10 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #20A4F3, #59F8E8)', color: '#03191E' }}>PR</div>
            <span className="font-display font-bold text-lg text-white group-hover:text-azure transition-colors">PlateRelay</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome back</h1>
            <p className="font-body" style={{ color: 'rgba(193,207,218,0.6)' }}>Log in to continue the relay.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-display font-medium mb-2" style={{ color: 'rgba(193,207,218,0.8)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(193,207,218,0.4)' }} />
                <input
                  type="email"
                  {...register("email")}
                  placeholder="you@example.com"
                  className="w-full py-3.5 pl-11 pr-4 rounded-xl font-body text-sm text-white placeholder-steel/40 transition-all outline-none"
                  style={{
                    background: 'rgba(193,207,218,0.06)',
                    border: errors.email ? '1px solid rgba(148,28,47,0.6)' : '1px solid rgba(193,207,218,0.12)',
                  }}
                  onFocus={e => { e.target.style.border = '1px solid rgba(32,164,243,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(32,164,243,0.1)'; }}
                  onBlur={e => { e.target.style.border = errors.email ? '1px solid rgba(148,28,47,0.6)' : '1px solid rgba(193,207,218,0.12)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {errors.email && <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-display font-medium mb-2" style={{ color: 'rgba(193,207,218,0.8)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(193,207,218,0.4)' }} />
                <input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="w-full py-3.5 pl-11 pr-4 rounded-xl font-body text-sm text-white placeholder-steel/40 transition-all outline-none"
                  style={{
                    background: 'rgba(193,207,218,0.06)',
                    border: errors.password ? '1px solid rgba(148,28,47,0.6)' : '1px solid rgba(193,207,218,0.12)',
                  }}
                  onFocus={e => { e.target.style.border = '1px solid rgba(32,164,243,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(32,164,243,0.1)'; }}
                  onBlur={e => { e.target.style.border = errors.password ? '1px solid rgba(148,28,47,0.6)' : '1px solid rgba(193,207,218,0.12)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {errors.password && <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: 'linear-gradient(135deg, #20A4F3, #59F8E8)', color: '#03191E' }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-body" style={{ color: 'rgba(193,207,218,0.5)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium hover:underline transition-colors" style={{ color: '#20A4F3' }}>
              Join the relay →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
