import React from 'react';
import { ShieldCheck, Lock, Radio, Cpu, Sparkles, Scale, HeartHandshake, Eye } from 'lucide-react';
import { PROPHETIC_PILLARS } from '../data/initialData';

interface PillarsBannerProps {
  onSelectPillarFilter?: (pillar: string) => void;
  onExploreFeature?: (targetTab: string) => void;
}

export const PillarsBanner: React.FC<PillarsBannerProps> = ({
  onSelectPillarFilter,
  onExploreFeature,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Lock':
        return <Lock className="w-5 h-5 text-amber-400" />;
      case 'Radio':
        return <Radio className="w-5 h-5 text-sky-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-indigo-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getBorderColor = (id: string) => {
    switch (id) {
      case 'shiddiq':
        return 'border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/20';
      case 'amanah':
        return 'border-amber-500/30 hover:border-amber-400 bg-amber-950/20';
      case 'tabligh':
        return 'border-sky-500/30 hover:border-sky-400 bg-sky-950/20';
      case 'fathanah':
        return 'border-indigo-500/30 hover:border-indigo-400 bg-indigo-950/20';
      default:
        return 'border-slate-700 bg-slate-800/40';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-xl relative overflow-hidden">
      {/* Decorative background gradient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 max-w-3xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-3">
          <Scale className="w-3.5 h-3.5" />
          <span>Falsafah Kepemimpinan Nabawiyah dalam Tata Kelola Digital</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
          Infrastruktur Cerdas Pelayanan Publik Berintegritas Mutlak
        </h1>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          Meneladani perjuangan Rasulullah SAW sebagai <span className="text-emerald-300 font-semibold italic">Sayyidul qaumi khadimuhum</span> (Pemimpin suatu kaum adalah pelayan bagi kaumnya). Setiap transaksi publik, bantuan sosial, dan aduan warga dijaga dengan transparansi tanpa manipulasi serta diaudit otomatis oleh teknologi blockchain.
        </p>
      </div>

      {/* Four Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {PROPHETIC_PILLARS.map((pillar) => (
          <div
            key={pillar.id}
            onClick={() => onSelectPillarFilter && onSelectPillarFilter(pillar.name)}
            className={`border rounded-xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between group ${getBorderColor(
              pillar.id
            )}`}
            id={`pillar-card-${pillar.id}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pilar Kenabian
                </span>
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 group-hover:scale-110 transition-transform">
                  {getIcon(pillar.icon)}
                </div>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                {pillar.name}
              </h3>
              <p className="text-xs font-medium text-emerald-400 mt-0.5">
                {pillar.meaning}
              </p>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                {pillar.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <p className="text-[11px] italic text-slate-400 leading-normal">
                {pillar.hadith}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Action Bar */}
      <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Transparansi 100% Bebas Rekayasa</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <HeartHandshake className="w-4 h-4 text-amber-400" />
            <span>Anti-Risywah (Bebas Pungli)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onExploreFeature && onExploreFeature('pengaduan')}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow-sm"
            id="btn-quick-complaint"
          >
            Lapor / Pantau Aduan Warga
          </button>
          <button
            onClick={() => onExploreFeature && onExploreFeature('blockchain')}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors"
            id="btn-quick-audit"
          >
            Buka Audit Blockchain
          </button>
        </div>
      </div>
    </div>
  );
};
