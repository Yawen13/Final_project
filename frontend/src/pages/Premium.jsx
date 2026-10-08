import { useState } from 'react';
import Navbar from '../Components/Navbar';

const plans = [
  { name: 'Basic', price: '$3', features: ['Edit posts', 'Bookmark folders', 'Fewer ads'] },
  { name: 'Premium', price: '$8', popular: true, features: ['Everything in Basic', 'Verified checkmark', 'Half the ads', 'Longer posts'] },
  { name: 'Premium+', price: '$16', features: ['Everything in Premium', 'No ads in feed', 'Highest reply priority'] },
];

// Shows subscription tiers and lets users select a plan.
export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState('');

  return (
    <div className="min-h-screen bg-[#f5f4fa] text-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-[900px] px-4 pb-12 pt-12 sm:px-6 sm:pt-16">
        <div className="mx-auto mb-9 max-w-xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-[36px]">Upgrade your experience</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Pick the plan that fits how you use the platform.</p>
        </div>

        <div className="grid items-center gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className={`relative rounded-[24px] bg-white px-6 pb-6 pt-7 shadow-[0_8px_24px_rgba(31,24,65,0.06)] ${plan.popular ? 'md:py-8 md:shadow-[0_16px_32px_rgba(99,85,217,0.13)]' : ''}`}>
              {plan.popular && <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#6953d7] px-4 py-1 text-[10px] font-bold tracking-wide text-white">MOST POPULAR</span>}
              <h2 className="text-sm font-semibold">{plan.name}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-[32px] font-bold tracking-tight">{plan.price}</span>
                <span className="text-xs text-slate-500">/month</span>
              </div>
              <ul className="mt-5 min-h-[100px] space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-0.5 text-[#6953d7]" aria-hidden="true">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setSelectedPlan(plan.name)}
                aria-pressed={selectedPlan === plan.name}
                className={`mt-6 w-full rounded-full border px-4 py-2.5 text-sm font-semibold transition ${plan.popular || selectedPlan === plan.name ? 'border-[#6953d7] bg-[#6953d7] text-white hover:bg-[#5844c4]' : 'border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white'}`}
              >
                {selectedPlan === plan.name ? `${plan.name} selected` : `Get ${plan.name}`}
              </button>
            </article>
          ))}
        </div>
        {selectedPlan && <p role="status" className="mt-6 text-center text-sm font-medium text-[#5944bb]">{selectedPlan} selected. Subscription checkout will be available soon.</p>}
      </main>
    </div>
  );
}