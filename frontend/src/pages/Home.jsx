import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  FiHeart, FiShield, FiStar, FiUsers, FiCheck, FiArrowRight,
  FiMessageSquare, FiSearch, FiChevronDown,
} from 'react-icons/fi';

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((s) => s.auth);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-hero-gradient pt-16">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-secondary-200/20 rounded-full blur-3xl -z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary-100 text-primary-600 text-sm font-medium px-4 py-2 rounded-full shadow-sm mb-6">
                <FiStar className="text-accent-gold" />
                India's Most Trusted Matrimony Platform
              </div>

              <h1 className="text-5xl md:text-6xl font-heading font-bold text-gray-900 leading-tight">
                {t('hero.tagline').split('Perfect').map((part, i) => (
                  i === 0 ? (
                    <span key={i}>
                      {part}<span className="text-gradient">Perfect</span>
                    </span>
                  ) : <span key={i}>{part}</span>
                ))}
              </h1>

              <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-lg">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-primary text-base px-8 py-3">
                    {t('dashboard.title')} <FiArrowRight />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-primary text-base px-8 py-3">
                      {t('hero.register_free')} <FiHeart />
                    </Link>
                    <Link to="/search" className="btn-secondary text-base px-8 py-3">
                      {t('hero.view_profiles')}
                    </Link>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-10">
                {[
                  { value: '5M+', label: 'Happy Members' },
                  { value: '2M+', label: 'Marriages' },
                  { value: '200+', label: 'Communities' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold font-heading text-gradient">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image Grid */}
            <div className="hidden lg:block relative animate-slide-up">
              <div className="grid grid-cols-2 gap-4">
                {[
                  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=500&fit=crop',
                  'https://images.unsplash.com/photo-1537944434965-cf4679d1a598?w=400&h=320&fit=crop',
                  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=320&fit=crop',
                  'https://images.unsplash.com/photo-1529636798458-92182e662485?w=400&h=500&fit=crop',
                ].map((url, i) => (
                  <div
                    key={i}
                    className={`overflow-hidden rounded-2xl shadow-card ${
                      i % 2 === 0 ? 'mt-6' : ''
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
              {/* Floating match card */}
              <div className="absolute -bottom-4 left-4 glass-card p-3 flex items-center gap-3 shadow-glass animate-float">
                <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center">
                  <FiHeart className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">New Match Found!</p>
                  <p className="text-xs text-gray-500">94% Compatibility</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-400">
          <FiChevronDown className="text-2xl" />
        </div>
      </section>

      {/* Quick Search Bar */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <QuickSearchBar />
        </div>
      </section>

      {/* Why Choose VivahSetu */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Why Choose <span className="text-gradient">VivahSetu</span>?</h2>
            <p className="section-subtitle">Trusted by millions of Indians for finding their perfect life partner</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FiShield, title: 'Verified Profiles', desc: 'Every profile is manually verified for authenticity and safety.', color: 'blue' },
              { icon: FiSearch, title: 'Smart Matching', desc: 'AI-powered compatibility engine with 20+ match parameters.', color: 'purple' },
              { icon: FiMessageSquare, title: 'Private Messaging', desc: 'Secure, private conversations only after mutual interest.', color: 'pink' },
              { icon: FiHeart, title: '2M+ Success Stories', desc: 'Millions of couples found their perfect partner through us.', color: 'red' },
            ].map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Profiles */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title">Featured <span className="text-gradient">Profiles</span></h2>
              <p className="text-gray-500 mt-2">Discover verified profiles looking for their perfect match</p>
            </div>
            <Link to="/search" className="btn-secondary hidden sm:flex">
              View All <FiArrowRight />
            </Link>
          </div>
          <FeaturedProfiles />
        </div>
      </section>

      {/* Membership Plans Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Choose Your <span className="text-gradient">Plan</span></h2>
            <p className="section-subtitle">Start free, upgrade when you're ready to connect</p>
          </div>
          <PricingPreview />
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Success <span className="text-gradient">Stories</span></h2>
            <p className="section-subtitle">Real couples who found love through VivahSetu</p>
          </div>
          <SuccessStories />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">What Our <span className="text-gradient">Members</span> Say</h2>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="section-title">Frequently Asked <span className="text-gradient">Questions</span></h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-primary-gradient">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join over 5 million Indians who found their life partner on VivahSetu.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-10 py-4 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-lg"
          >
            Get Started Free <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}

function QuickSearchBar() {
  const { t } = useTranslation();
  return (
    <div className="glass-card p-2 flex flex-wrap gap-2 items-center shadow-card">
      <select className="flex-1 min-w-[120px] input-field py-3 border-0 bg-transparent focus:ring-0">
        <option>Looking for</option>
        <option>Bride</option>
        <option>Groom</option>
      </select>
      <div className="w-px h-8 bg-gray-200 hidden sm:block" />
      <select className="flex-1 min-w-[120px] input-field py-3 border-0 bg-transparent focus:ring-0">
        <option>Religion</option>
        {['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain'].map((r) => <option key={r}>{r}</option>)}
      </select>
      <div className="w-px h-8 bg-gray-200 hidden sm:block" />
      <select className="flex-1 min-w-[120px] input-field py-3 border-0 bg-transparent focus:ring-0">
        <option>Age Range</option>
        <option>21 - 25</option><option>26 - 30</option><option>31 - 35</option><option>36+</option>
      </select>
      <Link to="/search" className="btn-primary px-8 py-3 shrink-0">
        <FiSearch /> {t('common.search')}
      </Link>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="card p-6 text-center hover:shadow-card-hover transition-shadow group">
      <div className={`w-14 h-14 rounded-2xl ${colorMap[color]} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="text-2xl" />
      </div>
      <h3 className="font-semibold font-heading text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function FeaturedProfiles() {
  const profiles = [
    { name: 'Priya S.', age: 26, city: 'Mumbai', profession: 'Software Engineer', religion: 'Hindu', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face' },
    { name: 'Rahul M.', age: 29, city: 'Bangalore', profession: 'Doctor', religion: 'Hindu', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face' },
    { name: 'Sneha P.', age: 24, city: 'Pune', profession: 'CA', religion: 'Hindu', img: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=300&fit=crop&crop=face' },
    { name: 'Arun K.', age: 31, city: 'Delhi', profession: 'Business Owner', religion: 'Hindu', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
    { name: 'Meera R.', age: 27, city: 'Chennai', profession: 'Teacher', religion: 'Hindu', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face' },
    { name: 'Vikram S.', age: 30, city: 'Hyderabad', profession: 'Engineer', religion: 'Hindu', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face' },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {profiles.map((p) => (
        <Link key={p.name} to="/register" className="card p-4 text-center group hover:shadow-card-hover transition-all hover:-translate-y-1">
          <div className="w-20 h-20 rounded-full mx-auto overflow-hidden mb-3 ring-4 ring-primary-100 group-hover:ring-primary-300 transition-all">
            <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">{p.name}</h4>
          <p className="text-xs text-gray-500">{p.age} yrs • {p.city}</p>
          <p className="text-xs text-primary-500 mt-1">{p.profession}</p>
        </Link>
      ))}
    </div>
  );
}

function PricingPreview() {
  const plans = [
    {
      name: 'Free', price: '₹0', period: '', color: 'gray',
      features: ['10 Profile Views', '5 Interests', 'Basic Search', 'Chat after match'],
      cta: 'Get Started', href: '/register',
    },
    {
      name: 'Silver', price: '₹499', period: '/3 months', color: 'primary', popular: true,
      features: ['Unlimited Views', 'Unlimited Interests', 'Messaging', 'Advanced Filters'],
      cta: 'Choose Silver', href: '/register',
    },
    {
      name: 'Gold', price: '₹999', period: '/6 months', color: 'gold',
      features: ['All Silver Features', 'Priority Visibility', 'Premium Badge', 'Featured Profile'],
      cta: 'Choose Gold', href: '/register',
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`card p-6 relative ${plan.popular ? 'ring-2 ring-primary-400 shadow-xl' : ''}`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-gradient text-white text-xs font-bold px-4 py-1 rounded-full">
              Most Popular
            </div>
          )}
          <h3 className="text-xl font-heading font-bold text-gray-900">{plan.name}</h3>
          <div className="mt-2 mb-4">
            <span className="text-3xl font-bold text-gradient">{plan.price}</span>
            <span className="text-gray-500 text-sm">{plan.period}</span>
          </div>
          <ul className="space-y-2 mb-6">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <FiCheck className="text-green-500 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Link
            to={plan.href}
            className={plan.popular ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}
          >
            {plan.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}

function SuccessStories() {
  const stories = [
    {
      couple: 'Arjun & Divya',
      year: '2025',
      location: 'Mumbai',
      img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500&h=350&fit=crop',
      quote: 'We matched on VivahSetu and within 6 months we were engaged. The compatibility score was 94% and it was absolutely right!',
    },
    {
      couple: 'Vikram & Priya',
      year: '2025',
      location: 'Bangalore',
      img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=350&fit=crop',
      quote: "VivahSetu's smart matching helped us find each other despite living in different cities. Best decision we ever made!",
    },
    {
      couple: 'Ravi & Meera',
      year: '2024',
      location: 'Delhi',
      img: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=500&h=350&fit=crop',
      quote: 'The verified profiles gave us confidence. We knew the person we were talking to was genuine. Happily married for 2 years now!',
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {stories.map((s) => (
        <div key={s.couple} className="card overflow-hidden group">
          <div className="h-48 overflow-hidden relative">
            <img src={s.img} alt={s.couple} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-4 text-white">
              <h4 className="font-bold">{s.couple}</h4>
              <p className="text-xs text-white/70">{s.location} • {s.year}</p>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 leading-relaxed italic">"{s.quote}"</p>
            <div className="flex mt-3 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className="text-accent-gold text-sm fill-accent-gold" style={{ fill: '#f59e0b' }} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Testimonials() {
  const testimonials = [
    { name: 'Anita Sharma', role: 'Software Engineer, Pune', text: 'Found my husband in just 3 months! The matching algorithm is brilliant.', avatar: 'AS' },
    { name: 'Suresh Patel', role: 'Doctor, Ahmedabad', text: 'Premium membership was totally worth it. Got unlimited matches and messaging.', avatar: 'SP' },
    { name: 'Kavya Nair', role: 'Teacher, Kochi', text: 'The multilingual support in Malayalam made it so easy for my parents too!', avatar: 'KN' },
    { name: 'Rajesh Kumar', role: 'Business Owner, Delhi', text: 'Best matrimony platform in India. Genuine profiles and excellent support.', avatar: 'RK' },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {testimonials.map((t) => (
        <div key={t.name} className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
              {t.avatar}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
              <p className="text-xs text-gray-500">{t.role}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">"{t.text}"</p>
          <div className="flex mt-3 gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-accent-gold text-sm">★</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: 'Is VivahSetu free to use?', a: 'Yes! VivahSetu is free to register. You get 10 profile views and 5 interests on the free plan. Upgrade to Premium for unlimited access.' },
    { q: 'How are profiles verified?', a: 'Our team manually reviews each profile. We verify mobile numbers and check for authenticity. Verified profiles get a green checkmark badge.' },
    { q: 'Can I message anyone on the platform?', a: 'You can message users after both parties accept each other\'s interest. Premium members get unlimited messaging.' },
    { q: 'Is my personal information safe?', a: 'Absolutely. We use bank-grade encryption. Your mobile and email are hidden from other users unless you choose to share them.' },
    { q: 'How does the matching algorithm work?', a: 'Our AI analyzes 15+ parameters including religion, caste, age, education, location, and your partner preferences to calculate compatibility scores.' },
    { q: 'Can I use VivahSetu in Hindi or Marathi?', a: 'Yes! VivahSetu supports English, Hindi, and Marathi. Switch language from the navbar.' },
  ];

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="card overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-800">{faq.q}</span>
            <FiChevronDown className={`shrink-0 text-gray-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
