import React from 'react';
import { 
  ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, 
  Clock, Award, ChevronRight, AlertCircle, PhoneCall, 
  BadgePercent, Layers, Shield, Droplets, HeartHandshake 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { LivestockPackage } from '../types.ts';

interface HomePageProps {
  packages: LivestockPackage[];
  setCurrentTab: (tab: string) => void;
  onSelectPackageToInvest: (pkg: LivestockPackage) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  packages, 
  setCurrentTab, 
  onSelectPackageToInvest 
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-stone-900 to-stone-900 py-16 md:py-24 border-b border-emerald-900/50">
        {/* Background Subtle Farm Glow */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80" 
            alt="Lush agricultural pasture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-emerald-950/90 to-emerald-950"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-amber-400/50 text-amber-300 text-xs font-semibold uppercase tracking-wider shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                Official Livestock Agribusiness Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-tight leading-[1.15]">
                Empower Real Farming. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-300">
                  Earn Documented Livestock Returns.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl font-light">
                Agriculture Investment connects everyday contributors directly to working livestock cooperatives in Ghana. We fund certified Boerboel canine guard programs, high-yield meat goats, and grazing pasture cattle with transparent Mobile Money deposits and verified sales proceeds.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {user ? (
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className="px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-xl hover:shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    <span>Go to My Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setCurrentTab('register')}
                      className="px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-xl hover:shadow-amber-500/20 transition-all flex items-center gap-2"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentTab('login')}
                      className="px-8 py-4 rounded-xl text-base font-semibold bg-emerald-900/60 hover:bg-emerald-900 text-white border border-emerald-700/60 transition-all"
                    >
                      Login to Account
                    </button>
                  </>
                )}

                <button
                  onClick={() => setCurrentTab('animals')}
                  className="px-6 py-4 rounded-xl text-sm font-medium text-amber-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Explore 3 Livestock Packages</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-emerald-900/60 grid grid-cols-3 gap-4 text-xs text-stone-400">
                <div>
                  <span className="font-bold text-white block text-sm font-mono">Telecel & MTN</span>
                  <span>Instant MoMo Gateway</span>
                </div>
                <div>
                  <span className="font-bold text-amber-400 block text-sm font-mono">GH₵ 10.00</span>
                  <span>Low Minimum Deposit</span>
                </div>
                <div>
                  <span className="font-bold text-white block text-sm font-mono">24h Farm Cycle</span>
                  <span>Transparent Harvest Terms</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-700/50 bg-emerald-950/80 shadow-2xl p-2">
                <img 
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1000&q=80" 
                  alt="Modern sustainable livestock agro-hub"
                  className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                />
                
                {/* Floating Highlight Badge */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-stone-950/90 backdrop-blur-md border border-amber-400/40 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">
                        Featured Agribusiness
                      </span>
                      <h4 className="text-sm font-bold text-white">Livestock Feedlots & Veterinary Hub</h4>
                      <p className="text-xs text-stone-400">Kumasi, Sunyani & Northern Region Ranches</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-950">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT US SECTION */}
      <section className="py-20 bg-stone-900 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=600&q=80" 
                  alt="Healthy goats in sustainable ranch"
                  className="rounded-2xl object-cover h-64 w-full border border-emerald-800 shadow-md"
                />
                <img 
                  src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80" 
                  alt="Cattle grazing in green pasture"
                  className="rounded-2xl object-cover h-64 w-full border border-emerald-800 shadow-md mt-6"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
                About Our Agricultural Operations
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                Sustainable Animal Husbandry Built On Science & Real Market Demand
              </h2>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light">
                Agriculture Investment is not a digital illusion or a get-rich-quick scheme. We operate physical animal breeding pens, veterinary vaccine schedules, organic feed production, and bulk commercial meat distribution lines across Ghana.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-emerald-900/70 text-amber-400 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Quality Nutritional Feeds & Pasture</h4>
                    <p className="text-xs text-stone-400">High-protein legume silage, vitamin premixes, and rotational grazing ensure optimal animal growth rates.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-emerald-900/70 text-amber-400 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Certified Veterinary Care & Biosecurity</h4>
                    <p className="text-xs text-stone-400">Mandatory vaccination, pest deworming, and quarantine protocols reduce biological mortality risks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-emerald-900/70 text-amber-400 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Guaranteed Commercial Off-Takers</h4>
                    <p className="text-xs text-stone-400">Direct bulk purchase contracts with regional hotels, meat markets, culinary retailers, and agro-security buyers.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCurrentTab('about')}
                  className="px-6 py-3 rounded-xl text-sm font-semibold bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 border border-emerald-700/60 transition-colors flex items-center gap-2"
                >
                  <span>Read Full About Us & Farm Model</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="py-20 bg-stone-950 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
              Clear & Transparent Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              How Livestock Investment Works
            </h2>
            <p className="text-sm sm:text-base text-stone-400 font-light">
              Simple, fully documented, and verified through official Ghanaian Mobile Money channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-stone-900/70 border border-emerald-900/50 hover:border-amber-400/50 transition-all flex flex-col justify-between">
              <div>
                <span className="w-10 h-10 rounded-xl bg-emerald-900/80 border border-emerald-700/60 text-amber-300 font-bold font-mono text-lg flex items-center justify-center mb-4">
                  01
                </span>
                <h3 className="text-base font-bold text-white mb-2">Register & Verify</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Sign up with your full name, email, and password. Receive a secure 5-digit verification code to activate your account.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-stone-800 text-[11px] text-emerald-400 font-medium">
                Verified Users Only
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-stone-900/70 border border-emerald-900/50 hover:border-amber-400/50 transition-all flex flex-col justify-between">
              <div>
                <span className="w-10 h-10 rounded-xl bg-emerald-900/80 border border-emerald-700/60 text-amber-300 font-bold font-mono text-lg flex items-center justify-center mb-4">
                  02
                </span>
                <h3 className="text-base font-bold text-white mb-2">Deposit via MoMo</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Deposit funds to official Telecel MoMo (0507399029 - JOYCE ASABEA) starting from GH₵10. Enter transaction reference for admin approval.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-stone-800 text-[11px] text-amber-400 font-medium">
                Admin Verified Deposit
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-stone-900/70 border border-emerald-900/50 hover:border-amber-400/50 transition-all flex flex-col justify-between">
              <div>
                <span className="w-10 h-10 rounded-xl bg-emerald-900/80 border border-emerald-700/60 text-amber-300 font-bold font-mono text-lg flex items-center justify-center mb-4">
                  03
                </span>
                <h3 className="text-base font-bold text-white mb-2">Choose Livestock Package</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Select DOG (GH₵15), GOAT (GH₵40), or COW (GH₵80). Confirm package deduction to initiate your 24-hour agricultural cycle.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-stone-800 text-[11px] text-emerald-400 font-medium">
                Dog, Goat, or Cow
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-stone-900/70 border border-emerald-900/50 hover:border-amber-400/50 transition-all flex flex-col justify-between">
              <div>
                <span className="w-10 h-10 rounded-xl bg-emerald-900/80 border border-emerald-700/60 text-amber-300 font-bold font-mono text-lg flex items-center justify-center mb-4">
                  04
                </span>
                <h3 className="text-base font-bold text-white mb-2">Harvest & Payout</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Upon cycle maturity, actual documented business proceeds and initial contribution credit automatically to your balance. Withdraw to Telecel/MTN anytime.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-stone-800 text-[11px] text-amber-400 font-medium">
                Real Documented Yields
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED LIVESTOCK PACKAGES */}
      <section className="py-20 bg-stone-900 border-b border-emerald-900/40" id="packages-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
                Active Farm Programs
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-1">
                Featured Livestock Packages
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-2 max-w-xl">
                Select an animal package to fund farm operations. All returns are realistic projections derived from real livestock sale records.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>No false promises. Documented market yields only.</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="group relative rounded-3xl overflow-hidden bg-stone-950 border-2 border-emerald-900/80 hover:border-amber-400/80 transition-all duration-300 flex flex-col justify-between shadow-xl"
              >
                {/* Animal Photo (Realistic Photography) */}
                <div className="relative h-64 overflow-hidden bg-stone-900">
                  <img
                    src={pkg.image_url}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent"></div>

                  {/* Animal Type Tag */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 backdrop-blur-md">
                    {pkg.animal_type}
                  </span>

                  {/* Cycle duration */}
                  <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-950/90 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{pkg.duration_hours}h Cycle</span>
                  </span>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-3 left-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                      Contribution Amount
                    </span>
                    <span className="text-3xl font-extrabold text-white font-mono">
                      GH₵ {pkg.contribution_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-white mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {pkg.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-stone-800/80 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-stone-300">
                        <span className="text-stone-400">Projected Market Yield:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          GH₵ {pkg.projected_return_min.toFixed(2)} - GH₵ {pkg.projected_return_max.toFixed(2)}*
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-stone-300">
                        <span className="text-stone-400">Agro Operation:</span>
                        <span className="text-right text-stone-300 truncate max-w-[180px]">
                          {pkg.business_activity.slice(0, 30)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => onSelectPackageToInvest(pkg)}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-amber-500 hover:to-amber-600 hover:text-stone-950 text-white shadow-md transition-all flex items-center justify-center gap-2 group"
                    >
                      <span>Invest in {pkg.name.replace(' PACKAGE', '')}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-[10px] text-center text-stone-500 mt-2">
                      *Projections based on historical wholesale off-take contracts. Not guaranteed.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRANSPARENT RISK & BUSINESS MODEL DISCLOSURE */}
      <section className="py-16 bg-emerald-950/60 border-b border-emerald-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-900/80 text-amber-400 border border-emerald-700/60">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Ethical Livestock Business Model & Real Risk Disclosure
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light max-w-3xl mx-auto">
            Unlike speculative platforms, every cedi contributed to Agriculture Investment corresponds to genuine physical livestock feeds, mineral licks, deworming medicine, and skilled farm labour. Payouts are made solely when livestock lots are sold to wholesale market off-takers. All yields are clearly marked as projections, not promises.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4 text-xs font-medium text-emerald-300">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 border border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-amber-400" /> Real Physical Herds
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 border border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-amber-400" /> Verified MoMo Processing
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 border border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-amber-400" /> Admin Double-Entry Ledger
            </span>
          </div>
        </div>
      </section>

      {/* 6. CONTACT SECTION */}
      <section className="py-20 bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
                Direct Communication
              </span>
              <h2 className="text-3xl font-serif font-bold text-white">
                Contact Our Livestock Cooperative
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                Have questions about livestock pens, feed formulations, or Mobile Money transfers? Speak directly to our field agricultural team.
              </p>

              <div className="space-y-4 pt-4">
                <div className="p-4 rounded-xl bg-stone-950 border border-emerald-900/50">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Mobile Money Support</span>
                  <p className="text-sm font-bold text-white mt-1">TELECEL: 0507399029</p>
                  <p className="text-xs text-stone-400">Account Name: JOYCE ASABEA</p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-emerald-900/50">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Farm Office</span>
                  <p className="text-xs text-stone-300 mt-1">Agro-Hub Complex, Sunyani Road, Kumasi, Ghana</p>
                  <p className="text-xs text-stone-400">Email: support@agricultureinvestment.com</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="p-8 rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-white font-serif">Send an In-App Inquiry</h3>
                <p className="text-xs text-stone-400">Our customer desk responds within standard business hours.</p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-stone-300 block mb-1">Your Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Kwame Mensah" 
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-300 block mb-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. kwame@example.com" 
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-300 block mb-1">Inquiry Details</label>
                    <textarea 
                      rows={3} 
                      placeholder="Tell us what you would like to know about our livestock packages..."
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                    ></textarea>
                  </div>
                  <button
                    onClick={() => {
                      alert('Thank you for reaching out! Your inquiry has been forwarded to the agricultural desk.');
                    }}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
