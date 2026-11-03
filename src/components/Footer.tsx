import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin, ExternalLink, AlertTriangle, FileText, Smartphone } from 'lucide-react';
import Logo from './Logo.tsx';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  openSupabaseModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, openSupabaseModal }) => {
  return (
    <footer className="bg-stone-950 border-t border-emerald-900/60 text-stone-300">
      {/* Top Agricultural Value Strip */}
      <div className="bg-emerald-950/80 border-b border-emerald-900/40 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-900 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white">Genuine Livestock Assets</h5>
              <p className="text-xs text-stone-400">Real herds, feeds, veterinary deworming, and licensed farm infrastructure in Ghana.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-900 text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white">Direct Mobile Money Settlement</h5>
              <p className="text-xs text-stone-400">Telecel & MTN verified processing with manual administrative verification.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-900 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white">Transparent Risk Model</h5>
              <p className="text-xs text-stone-400">Projections based on real commercial meat & livestock market sales. No false promises.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Logo size="md" variant="light" />
            <p className="text-xs leading-relaxed text-stone-400">
              AGRICULTURE INVESTMENT operates community livestock farming cooperatives and feedlot distribution networks across Ghana. We bridge capital directly with sustainable canine guard breeding, goat meat production, and cattle grazing agribusiness.
            </p>
            <div className="pt-2 text-xs text-amber-400/90 font-mono">
              Registrar of Companies Agribusiness License No: AGRO-GH-2026/894
            </div>
          </div>

          {/* Livestock Packages */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 font-serif">
              Livestock Packages
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => setCurrentTab('animals')}
                  className="hover:text-amber-300 transition-colors flex items-center justify-between w-full"
                >
                  <span>DOG PACKAGE (Security & Breeding)</span>
                  <span className="font-mono font-bold text-amber-400">GH₵ 15</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab('animals')}
                  className="hover:text-amber-300 transition-colors flex items-center justify-between w-full"
                >
                  <span>GOAT PACKAGE (Boer & Silage Meat)</span>
                  <span className="font-mono font-bold text-amber-400">GH₵ 40</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab('animals')}
                  className="hover:text-amber-300 transition-colors flex items-center justify-between w-full"
                >
                  <span>COW PACKAGE (Pasture Cattle & Beef)</span>
                  <span className="font-mono font-bold text-amber-400">GH₵ 80</span>
                </button>
              </li>
              <li className="pt-2 border-t border-stone-800 text-stone-400">
                Minimum Deposit: <strong className="text-white font-mono">GH₵ 10.00</strong>
              </li>
            </ul>
          </div>

          {/* Official MoMo Channel */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 font-serif">
              Official Payment Account
            </h4>
            <div className="p-3.5 rounded-xl bg-stone-900 border border-emerald-900/60 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Network:</span>
                <span className="font-semibold text-white">TELECEL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">MoMo Number:</span>
                <span className="font-mono font-bold text-amber-300">0507399029</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Account Name:</span>
                <span className="font-semibold text-white">JOYCE ASABEA</span>
              </div>
              <p className="text-[10px] text-emerald-400/80 pt-1 border-t border-stone-800">
                Always verify account name JOYCE ASABEA before confirming payment.
              </p>
            </div>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 font-serif">
              Office & Support
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Agro-Hub Complex, Sunyani Road, Kumasi, Ashanti Region, Ghana</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+233 50 739 9029</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@agricultureinvestment.com</span>
              </li>
              <li className="pt-2">
                <button
                  onClick={openSupabaseModal}
                  className="text-xs text-emerald-400 hover:text-amber-300 underline inline-flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Supabase Architecture & SQL Setup</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Risk Disclosure Note */}
        <div className="mt-10 p-4 rounded-xl bg-stone-900/80 border border-stone-800 text-[11px] leading-relaxed text-stone-400">
          <strong className="text-amber-400 block mb-1">AGRICULTURAL RISK AND INVESTMENT DISCLOSURE:</strong>
          Agriculture Investment does not advertise or provide guaranteed returns. Livestock agribusiness involves biological realities, including animal nutrition requirements, feed costs, veterinary healthcare, climatic shifts, and seasonal meat wholesale market dynamics. All projected yields displayed on this platform are estimates based strictly on verified historical farm off-take records and documented agribusiness operations. All payouts are disbursed solely from genuine, audited cooperative sales proceeds. Contributions are subject to agreed contract durations and administrative withdrawal validations.
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Agriculture Investment Ghana. All rights reserved.</p>
          <div className="flex gap-4">
            <button onClick={() => setCurrentTab('about')} className="hover:text-stone-300">About Us</button>
            <button onClick={() => setCurrentTab('animals')} className="hover:text-stone-300">Livestock Programs</button>
            <button onClick={() => setCurrentTab('contact')} className="hover:text-stone-300">Support Desk</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
