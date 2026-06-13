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
      if (user?.role === 'recipient') navigate('/recipient/dashboard');
      else if (user?.role === 'donor') navigate('/donor/dashboard');
      else navigate('/');  // unknown role — stay on landing page
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
        style={{ background: 'linear-gradient(135deg, rgba(255,122,0,0.05), rgba(0,229,255,0.05))' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,122,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,122,0,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FF7A00, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #00E5FF, transparent 70%)' }} />

        {/* Floating foods to match landing vibe */}
        <img src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=400&auto=format&fit=crop" 
             className="absolute top-[15%] right-[15%] w-32 h-32 rounded-full object-cover animate-float"
             style={{ border: '3px solid #FF9800', boxShadow: '0 0 30px rgba(255,152,0,0.5)' }} alt="" />
        <img src="https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=400&auto=format&fit=crop" 
             className="absolute bottom-[20%] left-[10%] w-40 h-40 rounded-full object-cover animate-float"
             style={{ border: '3px solid #00E5FF', boxShadow: '0 0 30px rgba(0,229,255,0.4)', animationDelay: '1s' }} alt="" />

        <div className="relative z-10 text-center max-w-sm">
          <img src="/pr-logo.jpg" alt="PlateRelay Logo" className="w-40 h-40 object-contain mb-8 mx-auto drop-shadow-[0_0_15px_rgba(255,122,0,0.3)]" />
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Every relay matters.
          </h2>
          <p className="font-body text-lg leading-relaxed" style={{ color: 'rgba(193,207,218,0.7)' }}>
            Join the platform connecting surplus food with those who need it most — in under 15 minutes.
          </p>
          <div className="mt-10 space-y-3 text-sm font-body" style={{ color: 'rgba(193,207,218,0.5)' }}>
            {['25,000+ meals rescued', '150+ verified partners', 'Sub-2-hour pickup windows'].map(item => (
              <div key={item} className="flex items-center gap-2 justify-center">
                <span style={{ color: '#FF7A00' }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-3 mb-10 group">
            <img src="/pr-logo.jpg" alt="PlateRelay Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(255,122,0,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(255,122,0,0.5)] transition-all" />
            <span className="font-display font-bold text-xl text-white group-hover:text-[#FF7A00] transition-colors">PlateRelay</span>
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
                  onFocus={e => { e.target.style.border = '1px solid rgba(255,122,0,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,122,0,0.1)'; }}
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
                  onFocus={e => { e.target.style.border = '1px solid rgba(255,122,0,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,122,0,0.1)'; }}
                  onBlur={e => { e.target.style.border = errors.password ? '1px solid rgba(148,28,47,0.6)' : '1px solid rgba(193,207,218,0.12)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {errors.password && <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-display font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(234,88,12,0.6)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: 'linear-gradient(135deg, #FF7A00, #EA580C)', boxShadow: '0 0 20px rgba(234,88,12,0.4)' }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-body" style={{ color: 'rgba(193,207,218,0.5)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium hover:underline transition-colors" style={{ color: '#FF7A00' }}>
              Join the relay →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
