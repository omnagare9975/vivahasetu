import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import api from '../services/api';

const PLANS_DATA = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: '₹0',
    period: '',
    color: 'gray',
    features: ['10 Profile Views', '5 Interest Requests', 'Basic Search Filters', 'Chat after mutual acceptance'],
    notIncluded: ['Unlimited Views', 'Messaging', 'Priority Visibility', 'Premium Badge'],
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 49900,
    priceDisplay: '₹499',
    period: '/3 months',
    color: 'primary',
    popular: true,
    features: ['Unlimited Profile Views', 'Unlimited Interests', 'Private Messaging', 'Advanced Filters', 'Email Support'],
    notIncluded: ['Priority Visibility', 'Premium Badge'],
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 99900,
    priceDisplay: '₹999',
    period: '/6 months',
    color: 'gold',
    features: ['All Silver Features', 'Priority Visibility', 'Premium Badge on Profile', 'Featured in Search Results', 'Dedicated Support', '2x More Profile Views'],
    notIncluded: [],
  },
];

export default function Subscription() {
  const { t } = useTranslation();
  const { user } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (planId) => {
    if (planId === 'free') return;
    setLoading(planId);
    try {
      const { data } = await api.post('/payments/create-order', { plan: planId });
      const { orderId, amount, currency, keyId, paymentId } = data.data;

      // Load Razorpay script
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        document.body.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'VivahSetu',
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId,
            });
            toast.success('🎉 Payment successful! Welcome to Premium!');
            setTimeout(() => window.location.reload(), 1500);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: `${user?.firstName} ${user?.lastName}`, email: user?.email },
        theme: { color: '#e91e8c' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally { setLoading(null); }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-heading font-bold text-gray-900">{t('subscription.title')}</h1>
        <p className="text-gray-500 mt-2">{t('subscription.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS_DATA.map((plan) => {
          const isCurrent = user?.role === plan.id || (user?.role === 'user' && plan.id === 'free');
          return (
            <div
              key={plan.id}
              className={`card p-6 relative flex flex-col ${plan.popular ? 'ring-2 ring-primary-400 shadow-xl scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-gradient text-white text-sm font-bold px-5 py-1.5 rounded-full shadow">
                  Most Popular
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-2xl font-heading font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-bold text-gradient">{plan.priceDisplay}</span>
                  <span className="text-gray-400 text-sm pb-1">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <FiCheck className="text-green-500 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
                {plan.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                    <span className="mt-0.5 shrink-0">✗</span> {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-6">
                {isCurrent ? (
                  <div className="w-full py-3 bg-green-50 border border-green-200 text-green-700 font-semibold rounded-full text-center text-sm">
                    ✓ {t('subscription.current_plan')}
                  </div>
                ) : plan.id === 'free' ? (
                  <div className="w-full py-3 bg-gray-100 text-gray-500 font-semibold rounded-full text-center text-sm">
                    Free Forever
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full py-3 font-bold rounded-full flex items-center justify-center gap-2 transition-all hover:shadow-lg ${
                      plan.id === 'gold'
                        ? 'bg-gold-gradient text-white'
                        : 'btn-primary'
                    }`}
                  >
                    {loading === plan.id ? 'Processing...' : <>{t('subscription.upgrade')} <FiArrowRight /></>}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Badge */}
      <div className="text-center mt-10">
        <p className="text-sm text-gray-400">
          🔒 Secured by Razorpay • 256-bit SSL Encryption • 100% Safe & Secure
        </p>
      </div>

      {/* Payment History */}
      <PaymentHistory />
    </div>
  );
}

function PaymentHistory() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    api.get('/payments/history')
      .then((r) => setPayments(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  });

  if (loading || payments.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-heading font-semibold text-gray-900 mb-5">{t('subscription.payment_history')}</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Invoice</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Plan</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Amount</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">{p.invoiceNumber}</td>
                <td className="px-4 py-3 capitalize font-medium text-gray-800">{p.plan}</td>
                <td className="px-4 py-3 text-gray-800">₹{p.amount}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
