import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  User,
  Radio,
  PlayCircle,
  Hash,
  AlertTriangle,
  Star,
  Building,
  Info,
  Map,
  LayoutList,
  Compass,
  ArrowUpDown,
  Flame,
  Zap,
  RotateCcw,
  SlidersHorizontal,
  AlertOctagon,
  Bot,
  MessageSquare,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { Complaint, ComplaintStatus, ComplaintCategory, UrgencyLevel } from '../types';
import { ComplaintMapPlaceholder } from './ComplaintMapPlaceholder';

interface CitizenComplaintViewProps {
  complaints: Complaint[];
  selectedComplaintId?: string | null;
  onSelectComplaint: (id: string) => void;
  onOpenNewComplaintModal: () => void;
  onSimulateProgress: (complaintId: string) => void;
  onRateComplaint?: (complaintId: string, rating: number, feedback: string) => void;
  onConsultAi?: (complaint: Complaint) => void;
  onOpenWhatsAppModal?: (complaintId?: string) => void;
  onSendManualWhatsApp?: (complaintId: string) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
  initialViewMode?: 'daftar' | 'peta';
}

const URGENCY_WEIGHT: Record<string, number> = {
  Darurat: 4,
  Tinggi: 3,
  Sedang: 2,
  Rendah: 1,
};

export const CitizenComplaintView: React.FC<CitizenComplaintViewProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  onOpenNewComplaintModal,
  onSimulateProgress,
  onRateComplaint,
  onConsultAi,
  onOpenWhatsAppModal,
  onSendManualWhatsApp,
  searchQuery = '',
  onClearSearch,
  initialViewMode = 'daftar',
}) => {
  const [viewMode, setViewMode] = useState<'daftar' | 'peta'>(initialViewMode);
  const [filterCategory, setFilterCategory] = useState<string>('SEMUA');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [filterUrgency, setFilterUrgency] = useState<string>('SEMUA');
  const [sortBy, setSortBy] = useState<'urgensi-desc' | 'urgensi-asc' | 'sla-kritis' | 'terbaru' | 'terlama'>('urgensi-desc');
  const [activeTabSub, setActiveTabSub] = useState<'semua' | 'aktif' | 'selesai'>('semua');
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [ratingInput, setRatingInput] = useState(5);
  const [feedbackInput, setFeedbackInput] = useState('');

  const selectedComplaint = complaints.find((c) => c.id === selectedComplaintId) || complaints[0];

  // Realtime count of complaints per urgency
  const urgencyCounts = useMemo(() => {
    return {
      total: complaints.length,
      Darurat: complaints.filter((c) => c.urgency === 'Darurat').length,
      Tinggi: complaints.filter((c) => c.urgency === 'Tinggi').length,
      Sedang: complaints.filter((c) => c.urgency === 'Sedang').length,
      Rendah: complaints.filter((c) => c.urgency === 'Rendah').length,
    };
  }, [complaints]);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        localSearch.trim() === '' ||
        c.id.toLowerCase().includes(localSearch.toLowerCase()) ||
        c.title.toLowerCase().includes(localSearch.toLowerCase()) ||
        c.location.toLowerCase().includes(localSearch.toLowerCase()) ||
        c.citizenName.toLowerCase().includes(localSearch.toLowerCase()) ||
        c.assignedDepartment.toLowerCase().includes(localSearch.toLowerCase()) ||
        c.txHash.toLowerCase().includes(localSearch.toLowerCase());

      const matchesCategory = filterCategory === 'SEMUA' || c.category === filterCategory;
      const matchesStatus = filterStatus === 'SEMUA' || c.status === filterStatus;
      const matchesUrgency = filterUrgency === 'SEMUA' || c.urgency === filterUrgency;

      const matchesSubTab =
        activeTabSub === 'semua' ||
        (activeTabSub === 'aktif' && c.status !== 'Selesai_Teruji') ||
        (activeTabSub === 'selesai' && c.status === 'Selesai_Teruji');

      return matchesSearch && matchesCategory && matchesStatus && matchesUrgency && matchesSubTab;
    });
  }, [complaints, localSearch, filterCategory, filterStatus, filterUrgency, activeTabSub]);

  // Sort complaints based on chosen sorting mode
  const sortedComplaints = useMemo(() => {
    return [...filteredComplaints].sort((a, b) => {
      if (sortBy === 'urgensi-desc') {
        const weightDiff = (URGENCY_WEIGHT[b.urgency] || 0) - (URGENCY_WEIGHT[a.urgency] || 0);
        if (weightDiff !== 0) return weightDiff;
        // Sisa waktu SLA terkecil lebih diutamakan jika bobot urgensi sama
        const remainingA = a.slaTargetHours - a.elapsedHours;
        const remainingB = b.slaTargetHours - b.elapsedHours;
        return remainingA - remainingB;
      }
      if (sortBy === 'urgensi-asc') {
        const weightDiff = (URGENCY_WEIGHT[a.urgency] || 0) - (URGENCY_WEIGHT[b.urgency] || 0);
        if (weightDiff !== 0) return weightDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'sla-kritis') {
        const remainingA = a.slaTargetHours - a.elapsedHours;
        const remainingB = b.slaTargetHours - b.elapsedHours;
        return remainingA - remainingB;
      }
      if (sortBy === 'terlama') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      // 'terbaru'
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredComplaints, sortBy]);

  const isAnyFilterActive =
    filterUrgency !== 'SEMUA' ||
    filterCategory !== 'SEMUA' ||
    filterStatus !== 'SEMUA' ||
    activeTabSub !== 'semua' ||
    localSearch.trim() !== '';

  const handleResetFilters = () => {
    setFilterUrgency('SEMUA');
    setFilterCategory('SEMUA');
    setFilterStatus('SEMUA');
    setActiveTabSub('semua');
    setLocalSearch('');
    if (onClearSearch) onClearSearch();
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Diajukan':
        return {
          label: 'Diajukan',
          className: 'bg-slate-700/60 text-slate-300 border-slate-600',
        };
      case 'Diverifikasi_Shiddiq':
        return {
          label: 'Verifikasi Shiddiq',
          className: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        };
      case 'Disposisi_Amanah':
        return {
          label: 'Disposisi Amanah',
          className: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'Pengerjaan_Khidmat':
        return {
          label: 'Pengerjaan Lapangan',
          className: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        };
      case 'Audit_Validasi':
        return {
          label: 'Audit Validasi',
          className: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        };
      case 'Selesai_Teruji':
        return {
          label: 'Selesai Teruji',
          className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      default:
        return {
          label: status,
          className: 'bg-slate-700 text-slate-300 border-slate-600',
        };
    }
  };

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'Darurat':
        return {
          label: 'Darurat',
          badgeClass: 'bg-rose-500/25 text-rose-300 border-rose-500/40 font-bold',
          cardBorderClass: 'border-l-4 border-l-rose-500 hover:border-l-rose-400 bg-rose-950/10',
          dotClass: 'bg-rose-500',
          icon: Flame,
          rankBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          priorityTitle: 'Prioritas #1 (Tanggap Darurat)',
          slaHoursLabel: 'Maks 8 Jam',
          protocolTitle: 'Protokol Tindak Cepat Tim Reaksi Cepat (TRC)',
          actionGuidance:
            'Tingkat DARURAT: Petugas lapangan/TRC wajib bergerak dalam < 2 jam. Koordinasikan unit darurat dan hubungi pelapor untuk menjamin keselamatan warga.',
        };
      case 'Tinggi':
        return {
          label: 'Tinggi',
          badgeClass: 'bg-orange-500/25 text-orange-300 border-orange-500/40 font-bold',
          cardBorderClass: 'border-l-4 border-l-orange-500 hover:border-l-orange-400 bg-orange-950/10',
          dotClass: 'bg-orange-500',
          icon: Zap,
          rankBadge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          priorityTitle: 'Prioritas #2 (Penyelesaian Hari Ini)',
          slaHoursLabel: 'Maks 24 Jam',
          protocolTitle: 'Protokol Prioritas Tinggi Instansi',
          actionGuidance:
            'Tingkat TINGGI: Penanganan ditargetkan selesai dalam 24 jam. Siapkan personel, alat berat/material, dan perbarui status on-chain berkala.',
        };
      case 'Sedang':
        return {
          label: 'Sedang',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold',
          cardBorderClass: 'border-l-4 border-l-amber-500/80 hover:border-l-amber-400',
          dotClass: 'bg-amber-500',
          icon: Clock,
          rankBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          priorityTitle: 'Prioritas #3 (Standar Khidmat)',
          slaHoursLabel: 'Maks 24-48 Jam',
          protocolTitle: 'Protokol Pelayanan Standar SOP',
          actionGuidance:
            'Tingkat SEDANG: Disposisi dan penanganan teknis dijadwalkan secara sistematis sesuai urutan antrean dan ketersediaan petugas.',
        };
      case 'Rendah':
      default:
        return {
          label: 'Rendah',
          badgeClass: 'bg-slate-700/80 text-slate-300 border-slate-600 font-semibold',
          cardBorderClass: 'border-l-4 border-l-slate-600 hover:border-l-slate-500',
          dotClass: 'bg-slate-400',
          icon: Info,
          rankBadge: 'bg-slate-800 text-slate-400 border-slate-700',
          priorityTitle: 'Prioritas #4 (Terjadwal/Rutin)',
          slaHoursLabel: 'Maks 48 Jam',
          protocolTitle: 'Protokol Konsultasi & Layanan Informasi',
          actionGuidance:
            'Tingkat RENDAH: Konsultasi regulasi, pemutakhiran data, atau penjadwalan layanan informasi berkala tanpa risiko keselamatan mendesak.',
        };
    }
  };

  const categories: ComplaintCategory[] = [
    'Infrastruktur Jalan',
    'Bansos & Bantuan Sosial',
    'Kesehatan & Puskesmas',
    'Perizinan Usaha & UMKM',
    'Laporan Pungli & Integritas',
    'Administrasi Kependudukan',
  ];

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Layanan &amp; Pengaduan Warga Real-time
              </h2>
              <p className="text-xs text-slate-400">
                Setiap aduan diautentikasi dengan tanda tangan digital dan dipantau transparan hingga tuntas
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* View switcher: Daftar Aduan vs Peta Sebaran Lapangan */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('daftar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'daftar'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
              id="btn-switch-list-view"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Daftar Aduan</span>
            </button>
            <button
              onClick={() => setViewMode('peta')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'peta'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
              id="btn-switch-map-view"
            >
              <Map className="w-3.5 h-3.5 text-emerald-300" />
              <span>Peta Lapangan</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>

          <button
            onClick={onOpenNewComplaintModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-700/20 transition-all cursor-pointer shrink-0"
            id="btn-create-complaint"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Pengaduan Baru</span>
          </button>
        </div>
      </div>

      {viewMode === 'peta' ? (
        <ComplaintMapPlaceholder
          complaints={complaints}
          selectedComplaintId={selectedComplaint?.id}
          onSelectComplaint={onSelectComplaint}
          onSimulateProgress={onSimulateProgress}
          onOpenNewComplaintModal={onOpenNewComplaintModal}
          onFocusDetailView={(id) => {
            onSelectComplaint(id);
            setViewMode('daftar');
          }}
        />
      ) : (
        <>
          {/* Filter and search bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3.5 shadow-sm">
            {/* Row 1: Search box & Sub-tabs */}
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search box */}
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Cari kata kunci, ID (misal: ADU-2026-0811), nama warga, OPD, atau lokasi..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  id="input-filter-complaint"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                {localSearch && (
                  <button
                    onClick={() => {
                      setLocalSearch('');
                      if (onClearSearch) onClearSearch();
                    }}
                    className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sub-tabs: Semua / Aktif / Selesai */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setActiveTabSub('semua')}
                  className={`flex-1 md:flex-none px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    activeTabSub === 'semua' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Semua ({complaints.length})
                </button>
                <button
                  onClick={() => setActiveTabSub('aktif')}
                  className={`flex-1 md:flex-none px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    activeTabSub === 'aktif' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Diproses ({complaints.filter((c) => c.status !== 'Selesai_Teruji').length})
                </button>
                <button
                  onClick={() => setActiveTabSub('selesai')}
                  className={`flex-1 md:flex-none px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    activeTabSub === 'selesai' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Selesai ({complaints.filter((c) => c.status === 'Selesai_Teruji').length})
                </button>
              </div>
            </div>

            {/* Row 2: Tingkat Urgensi Filter Bar (Instansi Prioritization) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none pt-0.5">
              <span className="text-slate-400 text-[11px] font-semibold shrink-0 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" /> Prioritas Urgensi:
              </span>
              <button
                onClick={() => setFilterUrgency('SEMUA')}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterUrgency === 'SEMUA'
                    ? 'bg-slate-200 text-slate-900 font-bold shadow'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
                }`}
                id="btn-filter-urgency-all"
              >
                <span>Semua Urgensi</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                  {urgencyCounts.total}
                </span>
              </button>

              <button
                onClick={() => setFilterUrgency('Darurat')}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterUrgency === 'Darurat'
                    ? 'bg-rose-600 text-white font-bold shadow ring-2 ring-rose-400/40'
                    : 'bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/50'
                }`}
                id="btn-filter-urgency-darurat"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Darurat</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-rose-900/70 text-white border border-rose-700/50">
                  {urgencyCounts.Darurat}
                </span>
              </button>

              <button
                onClick={() => setFilterUrgency('Tinggi')}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterUrgency === 'Tinggi'
                    ? 'bg-orange-600 text-white font-bold shadow ring-2 ring-orange-400/40'
                    : 'bg-orange-950/40 text-orange-300 border border-orange-800/60 hover:bg-orange-900/50'
                }`}
                id="btn-filter-urgency-tinggi"
              >
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                <span>Tinggi</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-orange-900/70 text-white border border-orange-700/50">
                  {urgencyCounts.Tinggi}
                </span>
              </button>

              <button
                onClick={() => setFilterUrgency('Sedang')}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterUrgency === 'Sedang'
                    ? 'bg-amber-600 text-white font-bold shadow ring-2 ring-amber-400/40'
                    : 'bg-amber-950/40 text-amber-300 border border-amber-800/60 hover:bg-amber-900/50'
                }`}
                id="btn-filter-urgency-sedang"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Sedang</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-900/70 text-white border border-amber-700/50">
                  {urgencyCounts.Sedang}
                </span>
              </button>

              <button
                onClick={() => setFilterUrgency('Rendah')}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterUrgency === 'Rendah'
                    ? 'bg-slate-600 text-white font-bold shadow ring-2 ring-slate-400/40'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
                }`}
                id="btn-filter-urgency-rendah"
              >
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Rendah</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-200 border border-slate-600">
                  {urgencyCounts.Rendah}
                </span>
              </button>
            </div>

            {/* Row 3: Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
              <span className="text-slate-400 text-[11px] font-semibold shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3 text-emerald-400" /> Kategori Layanan:
              </span>
              <button
                onClick={() => setFilterCategory('SEMUA')}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
                  filterCategory === 'SEMUA'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
                }`}
              >
                Semua Kategori
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Row 4: Active Filter Indicators & Quick Reset */}
            {isAnyFilterActive && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-400">Filter Aktif:</span>
                  {filterUrgency !== 'SEMUA' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Urgensi: {filterUrgency}
                      <button
                        onClick={() => setFilterUrgency('SEMUA')}
                        className="hover:text-white ml-0.5 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {filterCategory !== 'SEMUA' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      Kategori: {filterCategory}
                      <button
                        onClick={() => setFilterCategory('SEMUA')}
                        className="hover:text-white ml-0.5 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {activeTabSub !== 'semua' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Status: {activeTabSub === 'aktif' ? 'Diproses' : 'Selesai'}
                      <button
                        onClick={() => setActiveTabSub('semua')}
                        className="hover:text-white ml-0.5 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {localSearch && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                      Kata kunci: &ldquo;{localSearch}&rdquo;
                      <button
                        onClick={() => {
                          setLocalSearch('');
                          if (onClearSearch) onClearSearch();
                        }}
                        className="hover:text-white ml-0.5 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                </div>

                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer transition-colors"
                  id="btn-reset-all-filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Semua Filter</span>
                </button>
              </div>
            )}
          </div>

          {/* Main Grid: List on Left, Detail Viewer on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Complaint Cards */}
            <div className="lg:col-span-5 space-y-3">
              {/* List Header with Interactive Sorting Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1 pb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">
                    Daftar Pengaduan ({sortedComplaints.length})
                  </span>
                  {filterUrgency !== 'SEMUA' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-emerald-300 border border-emerald-500/30">
                      {filterUrgency}
                    </span>
                  )}
                </div>

                {/* Sort selector dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                    Urutkan:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
                    id="select-sort-urgency"
                  >
                    <option value="urgensi-desc">🚨 Urgensi Tertinggi (Darurat → Rendah)</option>
                    <option value="sla-kritis">⏱️ Sisa Waktu SLA Paling Kritis</option>
                    <option value="urgensi-asc">📋 Urgensi Terendah (Rendah → Darurat)</option>
                    <option value="terbaru">🕒 Masuk Paling Baru</option>
                    <option value="terlama">⏳ Masuk Paling Lama</option>
                  </select>
                </div>
              </div>

              {sortedComplaints.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                  <Info className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-sm">Tidak ada pengaduan yang cocok</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Silakan sesuaikan kata kunci pencarian atau filter urgensi &amp; kategori.
                  </p>
                  {isAnyFilterActive && (
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Semua Filter
                    </button>
                  )}
                </div>
              ) : (
                sortedComplaints.map((item, index) => {
                  const isSelected = selectedComplaint?.id === item.id;
                  const statusBadge = getStatusBadge(item.status);
                  const urgencyConfig = getUrgencyConfig(item.urgency);
                  const UrgencyIcon = urgencyConfig.icon;
                  const remainingHours = item.slaTargetHours - item.elapsedHours;

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectComplaint(item.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${urgencyConfig.cardBorderClass} ${
                        isSelected
                          ? 'bg-slate-800/95 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-lg'
                          : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                      id={`card-complaint-${item.id}`}
                    >
                      {/* Card Header: ID, Priority Rank, Urgency & Status Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                            {item.id}
                          </span>
                          {(sortBy === 'urgensi-desc' || sortBy === 'sla-kritis') && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                              Prioritas #{index + 1}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${urgencyConfig.badgeClass}`}
                            title={`Tingkat Urgensi: ${item.urgency}`}
                          >
                            <UrgencyIcon className="w-3 h-3" />
                            <span>{item.urgency}</span>
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge.className}`}
                          >
                            {statusBadge.label}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white line-clamp-2 mb-1.5">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                        <span className="flex items-center gap-1 text-slate-300 min-w-0">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[130px]">{item.location}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            className="text-[9px] text-emerald-400 font-medium flex items-center gap-1 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60"
                            title="Tersambung Notifikasi WhatsApp Otomatis"
                          >
                            <MessageSquare className="w-2.5 h-2.5 text-emerald-400" />
                            <span>WA Aktif</span>
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectComplaint(item.id);
                              setViewMode('peta');
                            }}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 flex items-center gap-1 cursor-pointer transition-colors"
                            title="Tinjau Lokasi di Peta Lapangan"
                          >
                            <Compass className="w-2.5 h-2.5" />
                            <span>Peta</span>
                          </button>

                          <span
                            className={`flex items-center gap-1 font-mono text-[10px] ${
                              remainingHours <= 4 && item.status !== 'Selesai_Teruji'
                                ? 'text-rose-400 font-bold'
                                : 'text-slate-400'
                            }`}
                            title={`Target SLA: ${item.slaTargetHours} jam, sisa: ${remainingHours} jam`}
                          >
                            <Clock className="w-3 h-3 text-slate-500" />
                            {item.status === 'Selesai_Teruji' ? (
                              <span>Tuntas</span>
                            ) : remainingHours <= 4 ? (
                              <span>Sisa {remainingHours}j!</span>
                            ) : (
                              <span>{item.slaTargetHours}j SLA</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Active Complaint Detail & Interactive Timeline Tracker */}
            <div className="lg:col-span-7">
              {selectedComplaint ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-md space-y-6">
                  {/* Detail Header */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">
                          {selectedComplaint.id}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {selectedComplaint.category}
                        </span>

                        {/* Urgency Badge in Detail Header */}
                        {(() => {
                          const detailUrgency = getUrgencyConfig(selectedComplaint.urgency);
                          const DetailUrgencyIcon = detailUrgency.icon;
                          return (
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${detailUrgency.badgeClass}`}
                            >
                              <DetailUrgencyIcon className="w-3.5 h-3.5" />
                              <span>Urgensi: {selectedComplaint.urgency}</span>
                            </span>
                          );
                        })()}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {onConsultAi && (
                          <button
                            onClick={() => onConsultAi(selectedComplaint)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                            title="Tanyakan status prosedur dan estimasi pengaduan ini ke Tanya AmanahGov AI"
                            id="btn-ask-ai-complaint"
                          >
                            <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            <span>Tanya AI Aduan Ini</span>
                          </button>
                        )}

                        {/* Realtime Progress Simulator Button */}
                        {selectedComplaint.status !== 'Selesai_Teruji' ? (
                          <button
                            onClick={() => onSimulateProgress(selectedComplaint.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
                            title="Simulasikan pembaruan progres lapangan secara real-time"
                            id="btn-simulate-progress"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span>Simulasikan Progres Real-Time</span>
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aduan Tuntas &amp; Tervalidasi
                          </span>
                        )}
                      </div>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                      {selectedComplaint.title}
                    </h2>

                    {/* Instansi Field Action Protocol Guidance Box */}
                    {(() => {
                      const selConfig = getUrgencyConfig(selectedComplaint.urgency);
                      const SelIcon = selConfig.icon;
                      return (
                        <div
                          className={`mt-3.5 p-3 rounded-xl border flex items-start gap-3 text-xs ${
                            selectedComplaint.urgency === 'Darurat'
                              ? 'bg-rose-950/30 border-rose-600/50 text-rose-200'
                              : selectedComplaint.urgency === 'Tinggi'
                              ? 'bg-orange-950/30 border-orange-600/50 text-orange-200'
                              : selectedComplaint.urgency === 'Sedang'
                              ? 'bg-amber-950/20 border-amber-600/40 text-amber-200'
                              : 'bg-slate-800/70 border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-black/30 shrink-0 mt-0.5">
                            <SelIcon className="w-4 h-4 text-current" />
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <span className="font-bold text-xs uppercase tracking-wider">
                                {selConfig.protocolTitle}
                              </span>
                              <span className="font-mono text-[11px] px-2 py-0.2 rounded bg-black/40 font-semibold">
                                Target: {selConfig.slaHoursLabel}
                              </span>
                            </div>
                            <p className="text-[11px] opacity-90 leading-relaxed">
                              {selConfig.actionGuidance}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs bg-slate-800/50 p-3.5 rounded-lg border border-slate-700/60">
                      <div className="flex items-center gap-2 text-slate-300">
                        <User className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400">Pelapor (Data Terlindungi)</p>
                          <p className="font-semibold">{selectedComplaint.citizenName} ({selectedComplaint.citizenNikMasked})</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Building className="w-4 h-4 text-sky-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400">OPD Penanggung Jawab (Amanah)</p>
                          <p className="font-semibold truncate">{selectedComplaint.assignedDepartment}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-slate-300">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400">Lokasi Penanganan</p>
                            <p className="font-semibold truncate">{selectedComplaint.location}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setViewMode('peta')}
                          className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold transition-colors cursor-pointer shrink-0"
                          title="Lihat Titik di Peta Lapangan"
                        >
                          Buka Peta 📍
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400">Target SLA &amp; Waktu Terpakai</p>
                          <p className="font-semibold">
                            {selectedComplaint.elapsedHours} jam berlalu / Maks {selectedComplaint.slaTargetHours} jam
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

              {/* Description Body */}
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3.5 rounded-lg border border-slate-800">
                <p className="font-semibold text-slate-200 mb-1">Rincian Laporan:</p>
                <p>{selectedComplaint.description}</p>
              </div>

              {/* WhatsApp Notification Integration Card */}
              <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 text-xs space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">
                          Layanan Notifikasi WhatsApp Warga (Simulasi API)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                          Tabligh • Real-Time
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Setiap pembaruan status dikirim otomatis via WhatsApp sehingga warga tidak perlu membuka aplikasi terus-menerus.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenWhatsAppModal && (
                      <button
                        onClick={() => onOpenWhatsAppModal(selectedComplaint.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                        title="Tinjau simulasi tampilan pesan WhatsApp warga"
                        id="btn-open-wa-modal"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Lihat Chat WhatsApp</span>
                      </button>
                    )}

                    {onSendManualWhatsApp && (
                      <button
                        onClick={() => onSendManualWhatsApp(selectedComplaint.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-800/60 text-xs font-semibold transition-colors cursor-pointer"
                        title="Kirimkan salinan pembaruan status ke WhatsApp warga sekarang"
                      >
                        <span>Kirim Ulang WA</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-slate-400">Penerima WA:</span>
                    <strong className="font-mono text-emerald-400 truncate">
                      {selectedComplaint.whatsappNumber || '+62 812-8821-0414'}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-slate-400">Gateway:</span>
                    <span className="text-slate-200 truncate">Meta Cloud API v19.0 (Verified)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-slate-400">Kondisi:</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Aktif Otomatis
                    </span>
                  </div>
                </div>
              </div>

              {/* Blockchain Cryptographic Verification Strip */}
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Sertifikat Kriptografis Blockchain
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700/50">
                    Blok #{selectedComplaint.blockHeight}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800 overflow-x-auto">
                  <Hash className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{selectedComplaint.txHash}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Hash ini menjamin isi pengaduan, disposisi anggaran, dan riwayat penanganan tidak dapat diubah oleh pihak manapun (Prinsip Amanah &amp; Anti-Manipulasi).
                </p>
              </div>

              {/* Interactive Timeline Tracker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Jejak Waktu &amp; Tahapan Khidmat Real-Time
                  </h4>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {selectedComplaint.timeline.length} Tahapan Tercatat
                  </span>
                </div>

                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                  {selectedComplaint.timeline.map((step, idx) => {
                    const isLast = idx === selectedComplaint.timeline.length - 1;
                    return (
                      <div key={step.id} className="relative group">
                        {/* Dot on line */}
                        <div
                          className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            isLast
                              ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/20'
                              : 'bg-slate-800 border-emerald-500'
                          }`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>

                        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-white">
                              {step.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {step.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-snug">
                            {step.note}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700/40">
                            <span>Petugas: <strong className="text-slate-300">{step.officer}</strong></span>
                            {step.blockHeight && (
                              <span className="font-mono text-emerald-400">
                                Blok #{step.blockHeight}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Citizen Rating & Feedback Section */}
              {selectedComplaint.status === 'Selesai_Teruji' && (
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    Penilaian Kepuasan Masyarakat (IKM)
                  </h4>
                  {selectedComplaint.rating ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= selectedComplaint.rating!
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-white ml-2">
                          {selectedComplaint.rating}.0 / 5.0
                        </span>
                      </div>
                      {selectedComplaint.feedback && (
                        <p className="text-xs italic text-slate-300 mt-2 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                          “{selectedComplaint.feedback}”
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300">
                        Bantu kami menjaga amanah kepemimpinan publik dengan memberikan evaluasi jujur:
                      </p>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            onClick={() => setRatingInput(s)}
                            className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                s <= ratingInput
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Tuliskan testimoni atau saran kejujuran layanan..."
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                      <button
                        onClick={() => {
                          if (onRateComplaint) {
                            onRateComplaint(
                              selectedComplaint.id,
                              ratingInput,
                              feedbackInput || 'Pelayanan amanah, cepat, dan transparan.'
                            );
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                      >
                        Kirim Penilaian Amanah
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
              <Info className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-white">Pilih Pengaduan untuk Melihat Detail</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Pilih salah satu tiket di sebelah kiri untuk meninjau riwayat audit, petugas penanggung jawab, dan jejak waktu real-time.
              </p>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};
