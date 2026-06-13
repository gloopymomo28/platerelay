import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["donor", "recipient"], { required_error: "Please select a role" }),
  org_name: z.string().min(2, { message: "Organization name is required" }),
  contact_name: z.string().min(2, { message: "Contact name is required" }),
  city: z.string().min(2, { message: "City is required" }),
});

export default function Register() {
  const navigate = useNavigate();
  const registerAction = useAuthStore(state => state.register);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'donor'
    }
  });

  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // In a real app, this would call Supabase sign up, then our backend complete-profile API.
      // For the demo, we simulate a successful registration flow.
      await registerAction(data.email, data.password, data.role, data.org_name);
      toast.success("Welcome to PlateRelay! Your account is pending verification.");
      
      // Redirect to a pending approval page or dashboard
      if (data.role === 'donor') navigate('/donor/dashboard');
      else navigate('/recipient/dashboard');
      
    } catch (error) {
      toast.error(error.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 flex items-center justify-center p-4 bg-midnight">
      <Card className="w-full max-w-xl p-8 border-steel/20 bg-midnight/50 backdrop-blur-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Join the Relay</h1>
          <p className="text-steel font-body">Change the game. Every surplus meal finds its next table.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-steel/5 p-6 rounded-lg border border-steel/20">
            <h3 className="text-lg font-display text-white mb-4">Who are you?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center transition-colors ${selectedRole === 'donor' ? 'border-azure bg-azure/10' : 'border-steel/20 hover:border-steel/50'}`}>
                <input type="radio" value="donor" className="sr-only" {...register("role")} />
                <span className="text-3xl mb-2">🍽️</span>
                <span className="font-bold text-white font-display">Food Donor</span>
                <span className="text-xs text-steel text-center mt-1">Restaurants, Hotels, Caterers</span>
              </label>
              
              <label className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center transition-colors ${selectedRole === 'recipient' ? 'border-saffron bg-saffron/10' : 'border-steel/20 hover:border-steel/50'}`}>
                <input type="radio" value="recipient" className="sr-only" {...register("role")} />
                <span className="text-3xl mb-2">🤝</span>
                <span className="font-bold text-white font-display">Shelter / NGO</span>
                <span className="text-xs text-steel text-center mt-1">Night shelters, Orphanages</span>
              </label>
            </div>
            {errors.role && <p className="text-crimson text-sm mt-2">{errors.role.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Organization Name"
              {...register("org_name")}
              error={errors.org_name?.message}
              placeholder={selectedRole === 'donor' ? "e.g. Royal Banquet Hall" : "e.g. Hope Shelter"}
            />
            <Input
              label="Contact Person"
              {...register("contact_name")}
              error={errors.contact_name?.message}
              placeholder="Full Name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
              placeholder="••••••••"
            />
          </div>

          <Input
            label="City"
            {...register("city")}
            error={errors.city?.message}
            placeholder="e.g. Bangalore"
          />

          <div className="pt-4">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full text-lg h-12"
              isLoading={isLoading}
            >
              Submit Registration
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-steel font-body">
          Already have an account?{' '}
          <Link to="/login" className="text-azure hover:text-cyan transition-colors">
            Log in
          </Link>
        </div>
      </Card>
    </div>
  );
}
