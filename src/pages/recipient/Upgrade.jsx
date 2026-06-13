import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Zap, Star, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import client from '../../api/client';
import useAuthStore from '../../store/authStore';

const plans = [
  {
    id: 'free',
    name: 'Free Tier',
    price: '₹0',
    period: '/month',
    color: 'steel',
    borderColor: 'border-steel/30',
    features: [
      '3 active claims per month',
      '10 km search radius',
      'Email notifications',
      'Basic impact summary',
    ],
    cta: 'Current Plan',
    disabled: true,
    badge: null,
  },
  {
    id: 'saathi',
    name: 'Saathi Plan',
    price: '₹149',
    period: '/month',
    color: 'azure',
    borderColor: 'border-azure/50',
    highlight: true,
    features: [
      'Unlimited claims',
      '25 km search radius',
      'Instant email notifications',
      'Monthly impact summary',
      'Priority in claim queue',
      'Donor partner list',
    ],
    cta: 'Upgrade to Saathi',
    disabled: false,
    badge: 'MOST POPULAR',
  },
  {
    id: 'daan_pro',
    name: 'Daan Pro',
    price: '₹499',
    period: '/month',
    color: 'cyan',
    borderColor: 'border-cyan/30',
    features: [
      'Everything in Saathi',
      'CSR-ready PDF reports',
      'Certified Donor badge',
      'Advanced analytics',
      'Dedicated support',
    ],
    cta: 'Get Daan Pro',
    disabled: false,
    badge: 'FOR DONORS',
  },
];

const FAQ = [
  {
    q: 'How does the free plan work?',
    a: 'Free accounts can claim up to 3 relays per calendar month. The counter resets automatically on the 1st of each month.',
  },
  {
    q: 'Is my payment secure?',
    a: 'All payments are processed via Razorpay — India\'s most trusted payment gateway. We never store your card details.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel anytime from your account settings. You\'ll continue to have access until the end of your billing period.',
  },
  {
    q: 'Is there a trial?',
    a: 'New organizations automatically start on the Free plan. There\'s no time limit on the free tier.',
  },
];

export default function Upgrade() {
  const [loading, setLoading] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const refreshUser = useAuthStore(state => state.refreshUser);

  const handleUpgrade = async (planId) => {
    setLoading(planId);
    try {
      // Call the demo-upgrade endpoint on the backend
      await client.post('/api/subscriptions/demo-upgrade', { plan: planId });
      
      // Refresh the user profile in the global store so the UI knows they are upgraded
      await refreshUser();
      
      toast.success(`🎉 Successfully upgraded to ${planId === 'saathi' ? 'Saathi Plan' : 'Daan Pro'}! (Demo mode)`, {
        duration: 5000,
      });
    } catch (error) {
      toast.error('Failed to upgrade. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

      {/* Back link */}
      <Link to="/recipient/dashboard" className="inline-flex items-center gap-2 text-steel hover:text-white transition-colors mb-8 font-body text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          Feed More. Claim <span className="text-azure">Unlimited.</span>
        </h1>
        <p className="text-xl text-steel max-w-2xl mx-auto font-body">
          Upgrade your account to remove claim limits and get access to a wider area of food donations.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`relative glass-card p-8 flex flex-col border-2 ${plan.borderColor} ${
              plan.highlight ? 'shadow-xl shadow-azure/10 md:-translate-y-4 scale-[1.02]' : ''
            } transition-all`}
          >
            {plan.badge && (
              <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
                plan.id === 'saathi' ? 'bg-azure text-white' : 'bg-cyan text-midnight'
              }`}>
                {plan.badge}
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-display font-bold text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white font-display">{plan.price}</span>
                <span className="text-steel text-sm">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-start gap-3 text-sm font-body">
                  <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    plan.color === 'azure' ? 'text-azure' :
                    plan.color === 'cyan' ? 'text-cyan' : 'text-steel'
                  }`} />
                  <span className="text-steel">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.highlight ? 'primary' : plan.id === 'daan_pro' ? 'outline' : 'ghost'}
              className="w-full"
              disabled={plan.disabled}
              isLoading={loading === plan.id}
              onClick={() => !plan.disabled && handleUpgrade(plan.id)}
            >
              {plan.disabled ? (
                <><CheckCircle className="w-4 h-4" /> {plan.cta}</>
              ) : (
                <><Zap className="w-4 h-4" /> {plan.cta}</>
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="text-center mb-16">
        <div className="flex flex-wrap justify-center gap-6 text-steel font-body text-sm">
          <div className="flex items-center gap-2">
            <span>🔒</span> Secured by Razorpay
          </div>
          <div className="flex items-center gap-2">
            <span>🇮🇳</span> UPI & Cards accepted
          </div>
          <div className="flex items-center gap-2">
            <span>✅</span> Cancel anytime
          </div>
          <div className="flex items-center gap-2">
            <span>🧾</span> GST invoice provided
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-display font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <Card
              key={i}
              className="border-steel/20 cursor-pointer"
              hover={false}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="flex justify-between items-center p-2">
                <h3 className="font-display font-bold text-white text-sm">{item.q}</h3>
                <span className={`text-azure transition-transform text-lg ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </div>
              {openFaq === i && (
                <p className="text-steel font-body text-sm mt-2 px-2 pb-2">{item.a}</p>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Test Mode Notice */}
      <Card className="mt-12 p-4 border-saffron/30 bg-saffron/5 text-center" hover={false}>
        <p className="text-saffron text-sm font-body">
          🧪 <strong>Demo Mode:</strong> Payments use Razorpay test mode. No real charges will be made.
          Test card: <code className="text-white">4111 1111 1111 1111</code> · Any future date · Any CVV.
        </p>
      </Card>
    </div>
  );
}
