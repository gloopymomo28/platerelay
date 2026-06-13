import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Building2, MapPin, ArrowRight, Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["donor", "recipient"], { required_error: "Please select a role" }),
  org_name: z.string().min(2, { message: "Organization name is required" }),
  contact_name: z.string().min(2, { message: "Contact name is required" }),
  city: z.string().min(2, { message: "City is required" }),
});

function FieldInput({ label, icon: Icon, error, ...inputProps }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && (
        <label className="block text-xs font-display font-medium mb-1.5" style={{ color: 'rgba(193,207,218,0.7)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: focused ? '#20A4F3' : 'rgba(193,207,218,0.35)' }} />
        )}
        <input
          {...inputProps}
          className="w-full py-3 pl-10 pr-3 rounded-xl font-body text-sm text-white placeholder-steel/30 outline-none transition-all"
          style={{
            background: 'rgba(193,207,218,0.05)',
            border: error ? '1px solid rgba(148,28,47,0.6)' : focused ? '1px solid rgba(32,164,243,0.5)' : '1px solid rgba(193,207,218,0.1)',
            boxShadow: focused && !error ? '0 0 0 3px rgba(32,164,243,0.08)' : 'none',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
      {error && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{error}</p>}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const registerAction = useAuthStore(state => state.register);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'donor' }
  });

  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerAction(data.email, data.password, data.role, data.org_name);
      toast.success("Welcome to PlateRelay! Your account is pending verification. 🎉");
      if (data.role === 'donor') navigate('/donor/dashboard');
      else navigate('/recipient/dashboard');
    } catch (error) {
      toast.error(error.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center py-12 px-4 relative" style={{ background: '#03191E' }}>
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, #20A4F3, transparent 70%)', transform: 'translate(-40%, -40%)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, #F4A22D, transparent 70%)', transform: 'translate(40%, 40%)' }} />

      <div className="w-full max-w-2xl relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #20A4F3, #59F8E8)', color: '#03191E' }}>PR</div>
          <span className="font-display font-bold text-lg text-white group-hover:text-azure transition-colors">PlateRelay</span>
        </Link>

        <div className="rounded-3xl p-8 md:p-10"
          style={{ background: 'rgba(193,207,218,0.04)', border: '1px solid rgba(193,207,218,0.1)' }}>
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">Join the Relay</h1>
            <p className="font-body" style={{ color: 'rgba(193,207,218,0.6)' }}>
              Every surplus meal finds its next table. Let's get you set up.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-display font-medium mb-3" style={{ color: 'rgba(193,207,218,0.7)' }}>
                WHO ARE YOU?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="cursor-pointer">
                  <input type="radio" value="donor" className="sr-only" {...register("role")} />
                  <div className="rounded-2xl p-5 text-center transition-all"
                    style={{
                      background: selectedRole === 'donor' ? 'rgba(32,164,243,0.12)' : 'rgba(193,207,218,0.04)',
                      border: selectedRole === 'donor' ? '2px solid rgba(32,164,243,0.5)' : '2px solid rgba(193,207,218,0.1)',
                      boxShadow: selectedRole === 'donor' ? '0 0 20px rgba(32,164,243,0.1)' : 'none',
                    }}>
                    <div className="text-3xl mb-2">🍽️</div>
                    <div className="font-display font-bold text-white text-sm mb-1">Food Donor</div>
                    <div className="text-xs font-body" style={{ color: 'rgba(193,207,218,0.5)' }}>Restaurants, Hotels, Caterers</div>
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input type="radio" value="recipient" className="sr-only" {...register("role")} />
                  <div className="rounded-2xl p-5 text-center transition-all"
                    style={{
                      background: selectedRole === 'recipient' ? 'rgba(244,162,45,0.12)' : 'rgba(193,207,218,0.04)',
                      border: selectedRole === 'recipient' ? '2px solid rgba(244,162,45,0.5)' : '2px solid rgba(193,207,218,0.1)',
                      boxShadow: selectedRole === 'recipient' ? '0 0 20px rgba(244,162,45,0.1)' : 'none',
                    }}>
                    <div className="text-3xl mb-2">🤝</div>
                    <div className="font-display font-bold text-white text-sm mb-1">Shelter / NGO</div>
                    <div className="text-xs font-body" style={{ color: 'rgba(193,207,218,0.5)' }}>Night shelters, Orphanages</div>
                  </div>
                </label>
              </div>
              {errors.role && <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>{errors.role.message}</p>}
            </div>

            {/* Org + Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldInput
                label="Organization Name"
                icon={Building2}
                error={errors.org_name?.message}
                placeholder={selectedRole === 'donor' ? "e.g. Royal Banquet Hall" : "e.g. Hope Shelter"}
                {...register("org_name")}
              />
              <FieldInput
                label="Contact Person"
                icon={User}
                error={errors.contact_name?.message}
                placeholder="Full Name"
                {...register("contact_name")}
              />
            </div>

            {/* Email + Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldInput
                label="Email Address"
                icon={Mail}
                type="email"
                error={errors.email?.message}
                placeholder="you@example.com"
                {...register("email")}
              />
              <FieldInput
                label="Password"
                icon={Lock}
                type="password"
                error={errors.password?.message}
                placeholder="Min. 6 characters"
                {...register("password")}
              />
            </div>

            {/* City */}
            <FieldInput
              label="City"
              icon={MapPin}
              error={errors.city?.message}
              placeholder="e.g. Bangalore"
              {...register("city")}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: selectedRole === 'donor'
                  ? 'linear-gradient(135deg, #20A4F3, #59F8E8)'
                  : 'linear-gradient(135deg, #F4A22D, #f59e0b)',
                color: '#03191E',
              }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {isLoading ? 'Creating account...' : 'Submit Registration →'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm font-body" style={{ color: 'rgba(193,207,218,0.5)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium hover:underline" style={{ color: '#20A4F3' }}>
            Log in →
          </Link>
        </p>
      </div>
    </div>
  );
}
