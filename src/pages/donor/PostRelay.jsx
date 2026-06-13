import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { useCreateRelay } from '../../api/relays';
import { FloatingBackground } from '../../components/ui/FloatingBackground';

export default function PostRelay() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isPledgeChecked, setIsPledgeChecked] = useState(false);
  const [pledgeTimer, setPledgeTimer] = useState(3);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const fileInputRef = useRef(null);
  
  const user = useAuthStore(state => state.user);
  const createRelay = useCreateRelay();
  const { register, handleSubmit } = useForm();

  // Simple countdown for the pledge
  React.useEffect(() => {
    if (step === 1 && pledgeTimer > 0) {
      const timer = setTimeout(() => setPledgeTimer(p => p - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, pledgeTimer]);

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedPhoto(e.target.files[0]);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedPhoto) {
      toast.error('Please upload a photo of the food.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('food_name', data.food_name);
      formData.append('category', data.category);
      formData.append('quantity_value', parseFloat(data.quantity_value));
      formData.append('quantity_unit', data.quantity_unit);
      formData.append('is_vegetarian', data.is_vegetarian);
      formData.append('allergens', data.allergens || '');
      formData.append('notes', data.notes || '');
      
      // Auto-fill pickup location from user's profile
      const address = user?.address || {};
      const lng = user?.location?.coordinates?.[0] || 77.5946;  // Default: Bangalore
      const lat = user?.location?.coordinates?.[1] || 12.9716;
      formData.append('pickup_street', address.street || data.pickup_street || 'Main Street');
      formData.append('pickup_city', address.city || data.pickup_city || 'Bangalore');
      formData.append('pickup_instructions', data.pickup_instructions || '');
      formData.append('pickup_lng', lng);
      formData.append('pickup_lat', lat);

      // Pickup window: start = 5 minutes from now (to avoid server timezone drift)
      const start = new Date(Date.now() + 5 * 60 * 1000);
      // End time is from the time input (HH:MM), assumed to be today
      const [endHours, endMinutes] = data.pickup_end.split(':');
      const endDate = new Date();
      endDate.setHours(parseInt(endHours, 10));
      endDate.setMinutes(parseInt(endMinutes, 10));
      endDate.setSeconds(0);
      
      // If end date is in the past or before start, push to tomorrow
      if (endDate <= start) {
        endDate.setDate(endDate.getDate() + 1);
      }

      formData.append('pickup_window_start', start.toISOString());
      formData.append('pickup_window_end', endDate.toISOString());
      formData.append('quality_pledge_confirmed', 'true');
      formData.append('photo', selectedPhoto);

      createRelay.mutate(formData, {
        onSuccess: () => {
          toast.success("Your relay is live! Someone's night just got better. 🍽️");
          navigate('/donor/relays');
        },
        onError: (error) => {
          console.error('Relay creation failed:', error);
          toast.error(error?.response?.data?.detail || 'Failed to post relay.');
        }
      });
    } catch (err) {
      console.error('Form submission error:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#03191E' }}>
      <FloatingBackground />
      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Post a Relay</h1>
          <p className="text-steel font-body">Got food? Be someone's hero tonight.</p>
        </div>

      <Card className="p-8 border-steel/20 bg-midnight/50 backdrop-blur-md">
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-crimson/10 border border-crimson rounded-lg p-6">
              <h2 className="text-2xl font-display font-bold text-crimson mb-4 flex items-center gap-2">
                ⚠️ FOOD SAFETY COMMITMENT
              </h2>
              <p className="text-steel font-body mb-4">Before posting, confirm that this food:</p>
              <ul className="space-y-2 text-white font-body mb-6">
                <li className="flex items-center gap-2">✓ Was prepared or received TODAY</li>
                <li className="flex items-center gap-2">✓ Has been stored at safe temperatures</li>
                <li className="flex items-center gap-2">✓ Is free from visible spoilage or unusual smell</li>
                <li className="flex items-center gap-2">✓ Is packaged or covered for transport</li>
                <li className="flex items-center gap-2 text-azure font-bold mt-4">
                  ✓ You would confidently serve this to a paying guest
                </li>
              </ul>
              
              <label className="flex items-center gap-3 cursor-pointer mt-8 p-4 bg-midnight rounded-md border border-steel/20">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-azure"
                  checked={isPledgeChecked}
                  onChange={(e) => setIsPledgeChecked(e.target.checked)}
                />
                <span className="font-bold text-white">I confirm this food meets all safety standards above.</span>
              </label>
            </div>

            <Button 
              variant="primary" 
              className="w-full text-lg h-14"
              disabled={!isPledgeChecked || pledgeTimer > 0}
              onClick={() => setStep(2)}
            >
              {pledgeTimer > 0 ? `Please read (${pledgeTimer}s)` : "I Understand — Continue"}
            </Button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="What are you donating?"
              {...register("food_name")}
              placeholder="e.g. BBQ Chicken, Dal Makhani + Rice"
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-steel">Category</label>
                <select 
                  {...register("category")}
                  className="w-full h-[42px] px-3 bg-steel/10 border border-steel/20 rounded-md text-white focus:outline-none focus:border-azure transition-colors"
                  required
                >
                  <option value="cooked_meal" className="bg-midnight">Cooked Meals</option>
                  <option value="bakery" className="bg-midnight">Bakery & Pastries</option>
                  <option value="raw_produce" className="bg-midnight">Raw Produce</option>
                  <option value="packaged" className="bg-midnight">Packaged</option>
                  <option value="other" className="bg-midnight">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-steel">Dietary</label>
                <select 
                  {...register("is_vegetarian")}
                  className="w-full h-[42px] px-3 bg-steel/10 border border-steel/20 rounded-md text-white focus:outline-none focus:border-azure transition-colors"
                  required
                >
                  <option value="true" className="bg-midnight">Vegetarian</option>
                  <option value="false" className="bg-midnight">Non-Vegetarian</option>
                  <option value="mixed" className="bg-midnight">Mixed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantity"
                type="number"
                step="0.1"
                {...register("quantity_value")}
                placeholder="e.g. 20"
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-steel">Unit</label>
                <select 
                  {...register("quantity_unit")}
                  className="w-full h-[42px] px-3 bg-steel/10 border border-steel/20 rounded-md text-white focus:outline-none focus:border-azure transition-colors"
                >
                  <option value="servings" className="bg-midnight">Servings / Meals</option>
                  <option value="kg" className="bg-midnight">Kilograms (kg)</option>
                  <option value="items" className="bg-midnight">Individual Items</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-steel">Pickup Window End Time</label>
                <input 
                  type="time" 
                  {...register("pickup_end")}
                  className="w-full h-[42px] px-3 bg-steel/10 border border-steel/20 rounded-md text-white focus:outline-none focus:border-azure transition-colors"
                  required
                />
                <p className="text-xs text-steel mt-1">When does it need to be picked up by?</p>
              </div>
              <Input
                label="Pickup Instructions (Optional)"
                {...register("pickup_instructions")}
                placeholder="e.g. Come to the back door"
              />
            </div>

            <div 
              className="p-4 border-2 border-dashed border-steel/30 rounded-lg text-center hover:border-azure/50 transition-colors cursor-pointer bg-steel/5"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedPhoto ? (
                <div className="text-azure font-bold">{selectedPhoto.name} selected</div>
              ) : (
                <>
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-white font-bold font-display">Click to upload food photo</p>
                  <p className="text-steel text-sm font-body mt-1">Photo is required to build trust.</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="ghost" onClick={() => setStep(1)} disabled={createRelay.isPending}>Back</Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={createRelay.isPending}>
                {createRelay.isPending ? 'Posting...' : 'Post Relay'}
              </Button>
            </div>
          </form>
        )}
      </Card>
      </div>
    </div>
  );
}
