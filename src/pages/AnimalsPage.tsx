import React from 'react';
import { Clock, ShieldAlert, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { LivestockPackage } from '../types.ts';

interface AnimalsPageProps {
  packages: LivestockPackage[];
  onSelectPackageToInvest: (pkg: LivestockPackage) => void;
}

export const AnimalsPage: React.FC<AnimalsPageProps> = ({ packages, onSelectPackageToInvest }) => {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
            Livestock Portfolio
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-white">
            Available Livestock Packages
          </h1>
          <p className="text-base text-stone-300 leading-relaxed font-light">
            Each animal package represents a specific agricultural supply chain program in Ghana. Read the full operational details, contribution requirements, and projected return ranges below.
          </p>
        </div>

        {/* Informational Callout */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs sm:text-sm flex items-start gap-3 max-w-4xl mx-auto">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>Transparent Agribusiness Terms:</strong> All contribution figures are allocated directly to verified farm inputs. Payouts occur when documented agricultural produce is sold. We do not provide guaranteed returns; projected returns are estimates based on historical off-take contracts.
          </p>
        </div>

        {/* Detailed Packages List */}
        <div className="space-y-8">
          {packages.map((pkg, idx) => (
            <div
              key={pkg.id}
              className="rounded-3xl overflow-hidden bg-stone-950 border-2 border-emerald-900 hover:border-amber-400/70 transition-all shadow-xl grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Image Column */}
              <div className="lg:col-span-5 relative h-64 sm:h-80 lg:h-auto overflow-hidden">
                <img
                  src={pkg.image_url}
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent lg:hidden"></div>
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-950/90 text-amber-300 border border-amber-500/50 backdrop-blur-md">
                  Package #{idx + 1}
                </span>
              </div>

              {/* Details Column */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                        {pkg.animal_type}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                        {pkg.name}
                      </h2>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Contribution</span>
                      <span className="text-3xl font-extrabold text-amber-400 font-mono">
                        GH₵ {pkg.contribution_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                    {pkg.description}
                  </p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                      <span className="font-semibold text-emerald-300 block">Agro-Business Activity:</span>
                      <p className="text-stone-400">{pkg.business_activity}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                      <span className="font-semibold text-amber-300 block">Biosecurity & Risk Factors:</span>
                      <p className="text-stone-400">{pkg.risk_factors}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-stone-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Duration: <strong className="text-white font-mono">{pkg.duration_hours} Hours</strong></span>
                    </div>
                    <div>
                      <span>Projected Yield: <strong className="text-emerald-400 font-mono">GH₵ {pkg.projected_return_min.toFixed(2)} - GH₵ {pkg.projected_return_max.toFixed(2)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-[11px] text-stone-400">
                    Deducted from available balance after confirmation.
                  </span>
                  <button
                    onClick={() => onSelectPackageToInvest(pkg)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Invest GH₵ {pkg.contribution_amount.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimalsPage;
