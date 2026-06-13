import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function PostRelay() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isPledgeChecked, setIsPledgeChecked] = useState(false);
  const [pledgeTimer, setPledgeTimer] = useState(3);
  
  const { register, handleSubmit } = useForm();

  // Simple countdown for the pledge
  React.useEffect(() => {
    if (step === 1 && pledgeTimer > 0) {
      const timer = setTimeout(() => setPledgeTimer(p => p - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, pledgeTimer]);

  const onSubmit = async (data) => {
    toast.success("Your relay is live! Someone's night just got better. 🍽️");
    navigate('/donor/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
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
              placeholder="e.g. Dal Makhani + Rice, Assorted Bread"
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantity"
                type="number"
                {...register("quantity")}
                placeholder="e.g. 20"
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-steel">Unit</label>
                <select 
                  {...register("unit")}
                  className="w-full h-[42px] px-3 bg-steel/10 border border-steel/20 rounded-md text-white focus:outline-none focus:border-azure transition-colors"
                >
                  <option value="servings">Servings / Meals</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="items">Individual Items</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-steel">Pickup Window End Time</label>
              <input 
                type="time" 
                {...register("pickup_end")}
                className="w-full h-[42px] px-3 bg-steel/10 border border-steel/20 rounded-md text-white focus:outline-none focus:border-azure transition-colors"
                required
              />
              <p className="text-xs text-steel mt-1">When does the shelter need to pick this up by?</p>
            </div>

            <div className="p-4 border-2 border-dashed border-steel/30 rounded-lg text-center hover:border-azure/50 transition-colors cursor-pointer bg-steel/5">
              <div className="text-4xl mb-2">📸</div>
              <p className="text-white font-bold font-display">Click to upload food photo</p>
              <p className="text-steel text-sm font-body mt-1">Photo is required to build trust.</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button type="submit" variant="primary" className="flex-1">Post Relay</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
