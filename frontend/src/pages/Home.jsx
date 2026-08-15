import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  FiHeart, FiShield, FiStar, FiCheck, FiArrowRight,
  FiMessageSquare, FiSearch, FiChevronDown,
} from 'react-icons/fi';
import { MATRIMONY_IMAGES, PROFILE_PORTRAITS } from '../utils/matrimonyImages';

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((s) => s.auth);

  return (
    <div className="overflow-x-hidden">
      <section className="relative min-h-screen flex items-center bg-hero-gradient pt-16 overflow-hidden">
        <div className="absolute inset-0 matrimony-pattern opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white border border-secondary-200 text-primary-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm mb-6">
                <FiStar className="text-secondary-500" />
                India's Trusted Matrimony Platform
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-gray-900 leading-tight">
                Find Your{' '}
                <span className="text-gradient">Perfect</span>
                {' '}Life Partner
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

            <div className="relative animate-slide-up">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="overflow-hidden rounded-2xl shadow-card bg-primary-100 h-64 sm:h-80 mt-0 sm:mt-8">
                  <img
                    src={MATRIMONY_IMAGES.couple}
                    alt="Happy Indian couple"
                    className="w-full h-full matrimony-photo hover:scale-105 transition-transform duration-500"
                    loading="eager"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-card bg-primary-100 h-64 sm:h-80">
                  <img
                    src={MATRIMONY_IMAGES.wedding}
                    alt="Indian wedding ceremony"
                    className="w-full h-full matrimony-photo hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="absolute -bottom-3 left-3 glass-card p-3 flex items-center gap-3 shadow-glass">
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

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-primary-400">
          <FiChevronDown className="text-2xl" />
        </div>
      </section>

      <section className="bg-white py-8 border-b border-primary-50">
        <div className="max-w-4xl mx-auto px-4">
          <QuickSearchBar />
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Why Choose <span className="text-gradient">Vivansa</span>?</h2>
            <p className="section-subtitle">Trusted by millions of Indians for finding their perfect life partner</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FiShield, title: 'Verified Profiles', desc: 'Every profile is manually verified for authenticity and safety.', color: 'rose' },
              { icon: FiSearch, title: 'Smart Matching', desc: 'Compatibility engine with 20+ match parameters.', color: 'gold' },
              { icon: FiMessageSquare, title: 'Private Messaging', desc: 'Secure conversations only after mutual interest.', color: 'rose' },
              { icon: FiHeart, title: '2M+ Success Stories', desc: 'Millions of couples found their partner through us.', color: 'gold' },
            ].map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 matrimony-pattern">
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

      <section className="py-14 sm:py-16 bg-primary-gradient">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">Begin Your Shaadi Journey with Vivansa</h2>
          <p className="text-white/85 mt-2 text-sm sm:text-base">Register free · Verified profiles · Trusted by Indian families</p>
          <Link to="/register" className="inline-flex items-center gap-2 mt-5 bg-white text-primary-700 font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow">
            Register Free <FiArrowRight />
          </Link>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Choose Your <span className="text-gradient">Plan</span></h2>
            <p className="section-subtitle">Start free, upgrade when you're ready to connect</p>
          </div>
          <PricingPreview />
        </div>
      </section>

      <section className="py-20 matrimony-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Success <span className="text-gradient">Stories</span></h2>
            <p className="section-subtitle">Real couples who found love through Vivansa</p>
          </div>
          <SuccessStories />
        </div>
      </section>

      <section className="py-16 bg-primary-gradient">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-white/85 text-lg mb-8">
            Join over 5 million Indians who found their life partner on Vivansa.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-10 py-4 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-lg"
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
    <div className="glass-card p-2 flex flex-wrap gap-2 items-center shadow-card border border-primary-100">
      <select className="flex-1 min-w-[120px] input-field py-3 border-0 bg-transparent focus:ring-0">
        <option>Looking for</option>
        <option>Bride</option>
        <option>Groom</option>
      </select>
      <div className="w-px h-8 bg-primary-100 hidden sm:block" />
      <select className="flex-1 min-w-[120px] input-field py-3 border-0 bg-transparent focus:ring-0">
        <option>Religion</option>
        {['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain'].map((r) => <option key={r}>{r}</option>)}
      </select>
      <div className="w-px h-8 bg-primary-100 hidden sm:block" />
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
    rose: 'bg-primary-50 text-primary-600',
    gold: 'bg-secondary-50 text-secondary-600',
  };
  return (
    <div className="card p-6 text-center hover:shadow-card-hover transition-shadow group border border-primary-50">
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
    { name: 'Priya S.', age: 26, city: 'Mumbai', profession: 'Software Engineer', img: PROFILE_PORTRAITS.woman1 },
    { name: 'Rahul M.', age: 29, city: 'Bangalore', profession: 'Doctor', img: PROFILE_PORTRAITS.man1 },
    { name: 'Sneha P.', age: 24, city: 'Pune', profession: 'CA', img: PROFILE_PORTRAITS.woman2 },
    { name: 'Arun K.', age: 31, city: 'Delhi', profession: 'Business Owner', img: PROFILE_PORTRAITS.man2 },
    { name: 'Meera R.', age: 27, city: 'Chennai', profession: 'Teacher', img: PROFILE_PORTRAITS.woman3 },
    { name: 'Vikram S.', age: 30, city: 'Hyderabad', profession: 'Engineer', img: PROFILE_PORTRAITS.man3 },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {profiles.map((p) => (
        <Link key={p.name} to="/register" className="card p-4 text-center group hover:shadow-card-hover transition-all hover:-translate-y-1 border border-primary-50">
          <div className="w-20 h-20 rounded-full mx-auto overflow-hidden mb-3 ring-4 ring-secondary-200 group-hover:ring-primary-400 transition-all bg-primary-100">
            <img src={p.img} alt={p.name} className="w-full h-full matrimony-photo" />
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">{p.name}</h4>
          <p className="text-xs text-gray-500">{p.age} yrs • {p.city}</p>
          <p className="text-xs text-primary-600 mt-1">{p.profession}</p>
        </Link>
      ))}
    </div>
  );
}

function PricingPreview() {
  const plans = [
    {
      name: 'Free', price: '₹0', period: '',
      features: ['10 Profile Views', '5 Interests', 'Basic Search', 'Chat after match'],
      cta: 'Get Started', href: '/register', popular: false,
    },
    {
      name: 'Silver', price: '₹50', period: '/month', popular: true,
      features: ['Unlimited Views', 'Unlimited Interests', 'Messaging', 'Advanced Filters'],
      cta: 'Choose Silver', href: '/register',
    },
    {
      name: 'Gold', price: '₹99', period: '/month',
      features: ['All Silver Features', 'Priority Visibility', 'Premium Badge', 'Featured Profile'],
      cta: 'Choose Gold', href: '/register',
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`card p-6 relative border ${plan.popular ? 'ring-2 ring-primary-500 shadow-xl border-primary-200' : 'border-primary-50'}`}
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
                <FiCheck className="text-emerald-500 shrink-0" /> {f}
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
      quote: 'We matched on Vivansa and within 6 months we were engaged. The compatibility score was 94%!',
    },
    {
      couple: 'Vikram & Priya',
      year: '2025',
      location: 'Bangalore',
      quote: "Vivansa's matching helped us find each other despite living in different cities.",
    },
    {
      couple: 'Ravi & Meera',
      year: '2024',
      location: 'Delhi',
      quote: 'Verified profiles gave us confidence. Happily married for 2 years now!',
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {stories.map((s) => (
        <div key={s.couple} className="card p-6 border border-primary-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-primary-gradient flex items-center justify-center text-white font-bold">
              {s.couple.split(' & ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{s.couple}</h4>
              <p className="text-xs text-gray-500">{s.location} • {s.year}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed italic">"{s.quote}"</p>
          <div className="flex mt-3 gap-0.5 text-secondary-500 text-sm">★★★★★</div>
        </div>
      ))}
    </div>
  );
}
