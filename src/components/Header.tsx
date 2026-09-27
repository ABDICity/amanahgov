import React, { useState } from 'react';
import {
  ShieldCheck,
  Bell,
  Volume2,
  VolumeX,
  Search,
  Bot,
  Activity,
  CheckCircle2,
  Menu,
  X,
  Radio,
  Building2,
  Map,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { RealtimeNotification } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: RealtimeNotification[];
  onOpenNotifications: () => void;
  isAudioEnabled: boolean;
  setIsAudioEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenAiAssistant: () => void;
  onOpenWhatsAppSimulator?: () => void;
  onSearchGlobal: (query: string) => void;
  isAuditing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  onOpenNotifications,
  isAudioEnabled,
  setIsAudioEnabled,
  onOpenAiAssistant,
  onOpenWhatsAppSimulator,
  onSearchGlobal,
  isAuditing = false,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchGlobal(searchInput);
  };

  const navItems = [
    { id: 'beranda', label: 'Beranda & Nilai Amanah', shortLabel: 'Beranda' },
    { id: 'tanya', label: 'Tanya AmanahGov (AI)', shortLabel: 'Tanya AI' },
    { id: 'pengaduan', label: 'Layanan & Pengaduan', shortLabel: 'Pengaduan' },
    { id: 'peta', label: 'Peta Lapangan', shortLabel: 'Peta Lapangan' },
    { id: 'transparansi', label: 'Buku Transparansi Transaksi', shortLabel: 'Transparansi' },
    { id: 'blockchain', label: 'Audit Otomatis Blockchain', shortLabel: 'Audit Rantai' },
    { id: 'kinerja', label: 'Kinerja Layanan & Efisiensi', shortLabel: 'Kinerja' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-emerald-900/40 text-slate-100 shadow-md">
      {/* Top Banner: Prophetic Governance Subtext */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-800/30 px-4 py-1 text-xs text-emerald-300/90 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            KHIDMAT UMMAH
          </span>
          <span className="hidden sm:inline font-medium">
            Infrastruktur Pemerintahan Cerdas Meneladani Kepemimpinan Rasulullah SAW:
          </span>
          <span className="text-emerald-200 font-semibold tracking-wide">
            Shiddiq • Amanah • Tabligh • Fathanah
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono font-medium">Konsensus Rantai: Aktif (4 Node)</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => setActiveTab('beranda')}
            id="brand-logo"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-600/30 border border-emerald-400/40 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1">
                  Amanah<span className="text-emerald-400">Gov</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Audit AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none hidden sm:block">
                Platform Layanan Publik &amp; Transparansi Blockchain
              </p>
            </div>
          </div>

          {/* Search bar for desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm relative"
          >
            <input
              type="text"
              placeholder="Cari ID Aduan / TX Hash / NIK..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </form>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Advisor Button */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              title="Tanya AmanahGov - Konsultasi Status Prosedur & Regulasi Publik Otomatis"
              id="btn-open-ai"
            >
              <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Tanya AmanahGov AI</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setIsAudioEnabled((prev) => !prev)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
              title={isAudioEnabled ? 'Suara Notifikasi Aktif' : 'Suara Notifikasi Senyap'}
              id="btn-toggle-audio"
            >
              {isAudioEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* WhatsApp Gateway Status Button */}
            {onOpenWhatsAppSimulator && (
              <button
                onClick={onOpenWhatsAppSimulator}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                title="Buka Simulasi WhatsApp Gateway (Notifikasi Warga Otomatis)"
                id="btn-open-wa-gateway"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span className="hidden lg:inline text-[11px]">WhatsApp Gateway</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Pusat Notifikasi Warga Real-time"
              id="btn-notifications-center"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              id="btn-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Nav Tabs */}
        <nav className="hidden md:flex space-x-1 border-t border-slate-800/80 pt-1 pb-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                id={`nav-tab-${item.id}`}
              >
                {item.id === 'tanya' && <Bot className="w-3.5 h-3.5 text-emerald-400" />}
                {item.id === 'blockchain' && (
                  <Activity
                    className={`w-3.5 h-3.5 ${isAuditing ? 'text-amber-300 animate-spin' : ''}`}
                  />
                )}
                {item.id === 'pengaduan' && <Radio className="w-3.5 h-3.5 text-emerald-400" />}
                {item.id === 'peta' && <Map className="w-3.5 h-3.5 text-emerald-300" />}
                {item.id === 'transparansi' && <Building2 className="w-3.5 h-3.5" />}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-3 space-y-2">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Cari ID Tiket / TX..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </form>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
