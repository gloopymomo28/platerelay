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
  phone: z.string().regex(/^\+?\d{10,15}$/, { message: "Valid phone number required" }),
  street: z.string().min(2, { message: "Street is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  pincode: z.string().regex(/^\d{6}$/, { message: "Valid 6-digit pincode required" }),
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

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'donor' }
  });

  const selectedRole = watch("role");

  const [coordinates, setCoordinates] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const fetchCoordinates = async (addressData) => {
    try {
      // 1. Try full address first
      const fullQuery = `${addressData.street}, ${addressData.city}, ${addressData.state}, ${addressData.pincode}`;
      let res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullQuery)}&format=json&limit=1`);
      let data = await res.json();
      
      if (data && data.length > 0) {
        return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
      }

      // 2. Fallback to just City, State, and Pincode if full street address is not found in OSM
      const cityQuery = `${addressData.city}, ${addressData.state}, ${addressData.pincode}`;
      res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityQuery)}&format=json&limit=1`);
      data = await res.json();

      if (data && data.length > 0) {
        return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
      }
    } catch (e) {
      console.error('Geocoding failed', e);
    }
    // Final Fallback: Bangalore
    return [77.5946, 12.9716]; 
  };

  const handleUseGPS = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoordinates([lng, lat]);
          toast.success("GPS Location acquired! 📍");
          
          // Reverse geocode to autofill address
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              if (addr.road || addr.suburb) setValue('street', addr.road || addr.suburb || '');
              if (addr.city || addr.town) setValue('city', addr.city || addr.town || '');
              if (addr.state) setValue('state', addr.state || '');
              if (addr.postcode) setValue('pincode', addr.postcode || '');
              toast.success("Address autofilled from location! ✨");
            }
          } catch (e) {
            console.error('Reverse geocoding failed', e);
          }
          
          setIsLocating(false);
        },
        (error) => {
          toast.error("Could not get GPS location. Please enter address manually.");
          setIsLocating(false);
        }
      );
    } else {
      toast.error("Geolocation not supported.");
      setIsLocating(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      let finalCoords = coordinates;
      if (!finalCoords) {
        finalCoords = await fetchCoordinates(data);
        setCoordinates(finalCoords);
      }

      const fullProfile = {
        org_name: data.org_name,
        contact_name: data.contact_name,
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        },
        location: {
          type: "Point",
          coordinates: finalCoords,
        },
        org_type: data.role === 'recipient' ? 'shelter' : null,
      };

      await registerAction(data.email, data.password, data.role, data.org_name, fullProfile);
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
        <Link to="/" className="flex items-center gap-3 mb-8 group">
          <img src="/pr-logo.jpg" alt="PlateRelay Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(255,122,0,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(255,122,0,0.5)] transition-all" />
          <span className="font-display font-bold text-xl text-white group-hover:text-[#FF7A00] transition-colors">PlateRelay</span>
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

            {/* Org */}
            <div className="grid grid-cols-1 gap-4">
              <FieldInput
                label="Organization Name"
                icon={Building2}
                error={errors.org_name?.message}
                placeholder={selectedRole === 'donor' ? "e.g. Royal Banquet Hall" : "e.g. Hope Shelter"}
                {...register("org_name")}
              />
            </div>
            
            {/* Contact + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldInput
                label="Contact Person"
                icon={User}
                error={errors.contact_name?.message}
                placeholder="Full Name"
                {...register("contact_name")}
              />
              <FieldInput
                label="Phone Number"
                icon={User} // Can replace with Phone icon if imported
                error={errors.phone?.message}
                placeholder="10-digit number"
                {...register("phone")}
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

            {/* Address Section */}
            <div className="p-4 rounded-xl border border-steel/20 bg-midnight/30 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-display font-bold text-steel">LOCATION DETAILS</label>
                <button 
                  type="button" 
                  onClick={handleUseGPS}
                  disabled={isLocating}
                  className="text-xs bg-azure/10 text-azure px-3 py-1 rounded-md font-bold hover:bg-azure/20 transition-colors disabled:opacity-50"
                >
                  {isLocating ? 'Locating...' : (coordinates ? '📍 GPS Acquired' : '📍 Use GPS Location')}
                </button>
              </div>

              <FieldInput
                label="Street Address"
                icon={MapPin}
                error={errors.street?.message}
                placeholder="e.g. 123 Main St, Near Park"
                {...register("street")}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FieldInput
                  label="City"
                  error={errors.city?.message}
                  placeholder="e.g. Bangalore"
                  {...register("city")}
                />
                <FieldInput
                  label="State"
                  error={errors.state?.message}
                  placeholder="e.g. Karnataka"
                  {...register("state")}
                />
                <FieldInput
                  label="Pincode"
                  error={errors.pincode?.message}
                  placeholder="e.g. 560001"
                  {...register("pincode")}
                />
              </div>
            </div>

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
