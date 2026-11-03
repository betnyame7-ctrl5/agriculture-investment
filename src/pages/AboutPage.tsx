import React from 'react';
import { ShieldCheck, Leaf, HeartPulse, Scale, Users, Award, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  setCurrentTab: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setCurrentTab }) => {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
            Our Agribusiness Mission
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-white">
            Transforming Livestock Agriculture in Ghana
          </h1>
          <p className="text-base text-stone-300 leading-relaxed font-light">
            Agriculture Investment is an agricultural development enterprise uniting rural farmers, veterinary specialists, and everyday contributors to scale sustainable livestock production.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-900/80 border border-emerald-700/60 text-amber-400 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white">Sustainable Nutrition</h3>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              We cultivate high-protein drought-tolerant forage, cassava peel silage, and organic mineral salts, avoiding harmful industrial synthetic additives.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-900/80 border border-emerald-700/60 text-amber-400 flex items-center justify-center">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white">Strict Biosecurity</h3>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Our registered veterinary practitioners oversee preventative deworming, foot-and-mouth vaccinations, and sanitary isolation pens across all farms.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-900/80 border border-emerald-700/60 text-amber-400 flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white">Transparent Accounting</h3>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Every financial transaction is recorded in an immutable ledger with double-entry reconciliation. Payouts are generated from real meat market sales.
            </p>
          </div>
        </div>

        {/* Operational Flow */}
        <div className="p-8 sm:p-12 rounded-3xl bg-emerald-950/70 border border-emerald-800/60 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              The 24-Hour Livestock Cycle Explained
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              How funds move through our operational pipeline from contribution to distribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-300">
            <div className="p-5 rounded-2xl bg-stone-950/80 border border-emerald-900 space-y-2">
              <span className="text-amber-400 font-bold font-mono">Phase 1: Capital Allocation</span>
              <p>Your contribution is pooled into daily feed batch compounding, silage transport, and veterinary vaccine schedules.</p>
            </div>
            <div className="p-5 rounded-2xl bg-stone-950/80 border border-emerald-900 space-y-2">
              <span className="text-amber-400 font-bold font-mono">Phase 2: Livestock Management</span>
              <p>Animals undergo intensive supervised feeding, hydration monitoring, and biosecurity sanitation.</p>
            </div>
            <div className="p-5 rounded-2xl bg-stone-950/80 border border-emerald-900 space-y-2">
              <span className="text-amber-400 font-bold font-mono">Phase 3: Wholesale Off-Take</span>
              <p>Cooperative lots are weighed and distributed to wholesale butchery and security clients, generating verified yield.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setCurrentTab('animals')}
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors flex items-center gap-2"
            >
              <span>View Available Livestock Packages</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
