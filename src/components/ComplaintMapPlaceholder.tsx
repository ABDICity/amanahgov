import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Radio,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Truck,
  RotateCcw,
  Filter,
  Search,
  ArrowRight,
  Sparkles,
  Building2,
  X,
  Flame,
  ChevronRight,
  ShieldAlert,
  Send,
  Zap,
} from 'lucide-react';
import { Complaint, UrgencyLevel, ComplaintStatus } from '../types';
import {
  MUNICIPAL_DISTRICTS,
  FIELD_UNIT_STATIONS,
  getComplaintCoordinates,
  calculateFieldPriorityScore,
  estimateDistanceKm,
} from '../utils/mapUtils';

interface ComplaintMapPlaceholderProps {
  complaints: Complaint[];
  selectedComplaintId?: string | null;
  onSelectComplaint: (id: string) => void;
  onSimulateProgress: (complaintId: string) => void;
  onOpenNewComplaintModal?: () => void;
  onFocusDetailView?: (id: string) => void;
}

export const ComplaintMapPlaceholder: React.FC<ComplaintMapPlaceholderProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  onSimulateProgress,
  onOpenNewComplaintModal,
  onFocusDetailView,
}) => {
  // Map interactive states
  const [activeSectorFilter, setActiveSectorFilter] = useState<string>('SEMUA');
  const [activeUrgencyFilter, setActiveUrgencyFilter] = useState<string>('SEMUA');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'aktif' | 'semua'>('aktif');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStations, setShowStations] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSectors, setShowSectors] = useState(true);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const [activePinId, setActivePinId] = useState<string | null>(selectedComplaintId || null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [dispatchedSuccessId, setDispatchedSuccessId] = useState<string | null>(null);

  // Sync with prop when changed externally
  React.useEffect(() => {
    if (selectedComplaintId) {
      setActivePinId(selectedComplaintId);
    }
  }, [selectedComplaintId]);

  // Enrich complaints with coordinates and priority metrics
  const mappedComplaints = useMemo(() => {
    return complaints.map((c) => {
      const coords = getComplaintCoordinates(c);
      const priority = calculateFieldPriorityScore(c);
      return {
        ...c,
        computedCoords: coords,
        fieldPriority: priority,
      };
    });
  }, [complaints]);

  // Filter complaints based on user controls
  const filteredComplaints = useMemo(() => {
    return mappedComplaints.filter((item) => {
      // Status filter
      if (activeStatusFilter === 'aktif' && item.status === 'Selesai_Teruji') {
        return false;
      }

      // Urgency filter
      if (activeUrgencyFilter === 'DARURAT_TINGGI') {
        if (item.urgency !== 'Darurat' && item.urgency !== 'Tinggi') return false;
      } else if (activeUrgencyFilter !== 'SEMUA' && item.urgency !== activeUrgencyFilter) {
        return false;
      }

      // Sector filter
      if (activeSectorFilter !== 'SEMUA') {
        const matchesSector = item.computedCoords.districtName.includes(activeSectorFilter);
        if (!matchesSector) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [mappedComplaints, activeStatusFilter, activeUrgencyFilter, activeSectorFilter, searchQuery]);

  // Active or selected complaint details for popup
  const focusedComplaint = useMemo(() => {
    return mappedComplaints.find((c) => c.id === activePinId) || null;
  }, [mappedComplaints, activePinId]);

  // Closest station to the focused complaint
  const closestStation = useMemo(() => {
    if (!focusedComplaint) return null;
    let minDistance = Infinity;
    let closest = FIELD_UNIT_STATIONS[0];

    FIELD_UNIT_STATIONS.forEach((station) => {
      const dist = estimateDistanceKm(
        focusedComplaint.computedCoords.xPercent,
        focusedComplaint.computedCoords.yPercent,
        station.xPercent,
        station.yPercent
      );
      if (dist < minDistance) {
        minDistance = dist;
        closest = station;
      }
    });

    const estMinutes = Math.max(8, Math.round(minDistance * 2.8));
    return {
      station: closest,
      distanceKm: minDistance,
      etaMinutes: estMinutes,
    };
  }, [focusedComplaint]);

  // Priority queue sorted by score descending (Darurat & expiring SLA at the top)
  const priorityQueue = useMemo(() => {
    return [...mappedComplaints]
      .filter((c) => c.status !== 'Selesai_Teruji')
      .sort((a, b) => b.fieldPriority.score - a.fieldPriority.score);
  }, [mappedComplaints]);

  // Quick dispatch action for agency field units
  const handleQuickDispatch = (complaintId: string) => {
    setDispatchedSuccessId(complaintId);
    onSimulateProgress(complaintId);
    setTimeout(() => {
      setDispatchedSuccessId(null);
    }, 3500);
  };

  const getUrgencyColor = (urg: UrgencyLevel, isFinished = false) => {
    if (isFinished) return { bg: 'bg-slate-700', text: 'text-slate-300', border: 'border-slate-600', fill: '#475569' };
    switch (urg) {
      case 'Darurat':
        return { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-400', fill: '#f43f5e' };
      case 'Tinggi':
        return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-400', fill: '#f59e0b' };
      case 'Sedang':
        return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-400', fill: '#10b981' };
      case 'Rendah':
        return { bg: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-400', fill: '#0ea5e9' };
    }
  };

  return (
    <div className="space-y-4" id="agency-field-map-container">
      {/* Top Banner: Context & Field Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '24s' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Peta Sebaran &amp; Prioritas Tindakan Lapangan
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                    Telemetri Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Visualisasi geospasial aduan publik untuk memandu Satgas Dinas &amp; Inspektorat menentukan prioritas respon lapangan secara adil dan cepat
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Aduan Lapangan</span>
              <div className="text-lg font-bold text-white font-mono">
                {mappedComplaints.filter((c) => c.status !== 'Selesai_Teruji').length}
              </div>
            </div>
            <div className="bg-rose-950/30 border border-rose-800/50 rounded-xl p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 animate-bounce" /> Darurat / Prioritas
              </span>
              <div className="text-lg font-bold text-rose-300 font-mono">
                {mappedComplaints.filter((c) => c.urgency === 'Darurat' && c.status !== 'Selesai_Teruji').length}
              </div>
            </div>
            <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400">Peringatan SLA</span>
              <div className="text-lg font-bold text-amber-300 font-mono">
                {mappedComplaints.filter((c) => c.fieldPriority.isSlaWarning).length}
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Posko Lapangan</span>
              <div className="text-lg font-bold text-emerald-300 font-mono">
                {FIELD_UNIT_STATIONS.length} Posko
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Sector & Urgency Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3" /> Wilayah:
            </span>
            <select
              value={activeSectorFilter}
              onChange={(e) => setActiveSectorFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              id="select-sector-filter"
            >
              <option value="SEMUA">Semua Sektor Wilayah ({mappedComplaints.length})</option>
              <option value="Sentral">Sektor Sentral (Pemerintahan)</option>
              <option value="Barat">Sektor Barat (Faskes &amp; Pemukiman)</option>
              <option value="Timur">Sektor Timur (UMKM &amp; Pasar)</option>
              <option value="Selatan">Sektor Selatan (Cipayung &amp; Akses Jalan)</option>
              <option value="Utara">Sektor Utara (Sukajadi &amp; Pelayanan)</option>
            </select>

            <span className="text-slate-500">|</span>

            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setActiveUrgencyFilter('SEMUA')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  activeUrgencyFilter === 'SEMUA' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Semua Urgensi
              </button>
              <button
                onClick={() => setActiveUrgencyFilter('DARURAT_TINGGI')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  activeUrgencyFilter === 'DARURAT_TINGGI'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                Darurat &amp; Tinggi
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setActiveStatusFilter('aktif')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  activeStatusFilter === 'aktif' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Hanya Aktif
              </button>
              <button
                onClick={() => setActiveStatusFilter('semua')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  activeStatusFilter === 'semua' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Termasuk Selesai
              </button>
            </div>
          </div>

          {/* Right: Map Layers & Quick Search */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                placeholder="Cari ID/Lokasi di peta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                id="search-complaint-map"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowStations(!showStations)}
                title="Tampilkan/Sembunyikan Posko Reaksi Cepat"
                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                  showStations
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                title="Toggle Radar Kepadatan Masalah"
                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                  showHeatmap
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setZoomLevel(1);
                  setActivePinId(null);
                }}
                title="Reset Orientasi Peta"
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: Map View (8 cols) + Field Action Prioritization Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Visual Map Placeholder Canvas */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative shadow-inner flex flex-col min-h-[500px]">
          {/* Map Top Status Bar Overlay */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-slate-200 font-semibold">
              GIS-AMANAH v2.4 // Grid Wilayah Madinah-Modern
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-400 font-mono">
              {filteredComplaints.length} Titik Terplot
            </span>
          </div>

          {/* Compass Rose Badge */}
          <div className="absolute top-3 right-3 z-20 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700/80 text-[10px] font-mono text-slate-300 shadow-lg flex flex-col items-center gap-0.5 pointer-events-none">
            <span className="text-emerald-400 font-bold">U</span>
            <div className="w-4 h-4 border border-slate-600 rounded-full flex items-center justify-center">
              <Navigation className="w-2.5 h-2.5 text-emerald-400 -rotate-45" />
            </div>
            <span className="text-slate-500">S</span>
          </div>

          {/* Map Canvas with SVG Cartography */}
          <div className="relative w-full flex-1 h-full min-h-[500px] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 select-none">
            <svg
              className="w-full h-full absolute inset-0 transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
              viewBox="0 0 1000 650"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* Tactical grid pattern */}
                <pattern id="tactical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" strokeOpacity="0.4" />
                  <circle cx="40" cy="40" r="1" fill="#334155" opacity="0.3" />
                </pattern>
                <pattern id="dense-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#0f172a" strokeWidth="0.5" strokeOpacity="0.3" />
                </pattern>

                {/* Gradients */}
                <radialGradient id="radarSweep" cx="50%" cy="45%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                  <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#0369a1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#082f49" stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id="arteryGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                </linearGradient>

                {/* Pulsing Beacon Filters */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Base Background grids */}
              <rect width="1000" height="650" fill="#020617" />
              <rect width="1000" height="650" fill="url(#dense-grid)" />
              <rect width="1000" height="650" fill="url(#tactical-grid)" />

              {/* Radar sweep ambient circle */}
              <circle cx="500" cy="300" r="280" fill="url(#radarSweep)" />
              <circle cx="500" cy="300" r="280" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="6 6" strokeOpacity="0.2" />
              <circle cx="500" cy="300" r="160" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.2" />

              {/* Sector Polygons & Boundaries */}
              {showSectors && (
                <g id="sector-boundaries" opacity="0.85">
                  {/* Sektor Sentral */}
                  <polygon
                    points="380,210 620,210 620,380 380,380"
                    fill="#10b981"
                    fillOpacity="0.04"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text x="500" y="240" fill="#10b981" fontSize="12" fontWeight="700" textAnchor="middle" letterSpacing="2" opacity="0.8">
                    SEKTOR SENTRAL (PUSAT)
                  </text>

                  {/* Sektor Barat */}
                  <polygon
                    points="100,180 360,180 360,420 100,420"
                    fill="#06b6d4"
                    fillOpacity="0.04"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text x="230" y="210" fill="#06b6d4" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="1.5" opacity="0.8">
                    SEKTOR BARAT (SUKAMAJU)
                  </text>

                  {/* Sektor Timur */}
                  <polygon
                    points="640,210 900,210 900,450 640,450"
                    fill="#8b5cf6"
                    fillOpacity="0.04"
                    stroke="#8b5cf6"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text x="770" y="240" fill="#8b5cf6" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="1.5" opacity="0.8">
                    SEKTOR TIMUR (SUNAN GIRI)
                  </text>

                  {/* Sektor Selatan */}
                  <polygon
                    points="260,400 740,400 740,600 260,600"
                    fill="#f59e0b"
                    fillOpacity="0.04"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text x="500" y="440" fill="#f59e0b" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="1.5" opacity="0.8">
                    SEKTOR SELATAN (CIPAYUNG)
                  </text>

                  {/* Sektor Utara */}
                  <polygon
                    points="280,60 740,60 740,190 280,190"
                    fill="#3b82f6"
                    fillOpacity="0.04"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text x="510" y="100" fill="#3b82f6" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="1.5" opacity="0.8">
                    SEKTOR UTARA (SUKAJADI)
                  </text>
                </g>
              )}

              {/* Natural Geographic Feature: Sungai Barakah (Curved river pathway) */}
              <path
                d="M 50,80 Q 250,150 420,290 T 700,380 T 960,560"
                fill="none"
                stroke="url(#riverGradient)"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M 50,80 Q 250,150 420,290 T 700,380 T 960,560"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="12 8"
                strokeOpacity="0.4"
              />
              <text x="760" y="420" fill="#0284c7" fontSize="9" fontWeight="600" letterSpacing="1" opacity="0.7">
                Sungai Barakah (Arus Terbuka)
              </text>

              {/* Road Arteries: Jalan Protokol Amanah & Ring Road */}
              <g id="road-network" opacity="0.6">
                {/* Horizontal East-West Main Artery */}
                <line x1="80" y1="300" x2="920" y2="300" stroke="#334155" strokeWidth="6" />
                <line x1="80" y1="300" x2="920" y2="300" stroke="url(#arteryGlow)" strokeWidth="1.5" strokeDasharray="8 4" />

                {/* Vertical North-South Main Artery */}
                <line x1="500" y1="50" x2="500" y2="600" stroke="#334155" strokeWidth="6" />
                <line x1="500" y1="50" x2="500" y2="600" stroke="url(#arteryGlow)" strokeWidth="1.5" strokeDasharray="8 4" />

                {/* Ring Road Oval */}
                <ellipse cx="500" cy="300" rx="360" ry="210" fill="none" stroke="#1e293b" strokeWidth="4" />
                <ellipse cx="500" cy="300" rx="360" ry="210" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="10 10" />

                <text x="510" y="315" fill="#64748b" fontSize="8" fontWeight="600" letterSpacing="1">
                  Jl. Protokol Amanah Madinah No. 1
                </text>
              </g>

              {/* Heatmap Layer (Visual density blobs when toggled) */}
              {showHeatmap && (
                <g id="heatmap-blobs" opacity="0.45">
                  <circle cx="320" cy="440" r="90" fill="#f43f5e" filter="url(#glow)" opacity="0.35" />
                  <circle cx="620" cy="190" r="75" fill="#f59e0b" filter="url(#glow)" opacity="0.4" />
                  <circle cx="220" cy="280" r="60" fill="#06b6d4" filter="url(#glow)" opacity="0.3" />
                  <circle cx="480" cy="250" r="50" fill="#10b981" filter="url(#glow)" opacity="0.35" />
                </g>
              )}

              {/* City Hall / Central Command Icon */}
              <g id="city-hall" transform="translate(485, 275)">
                <rect x="-6" y="-6" width="42" height="32" rx="6" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                <text x="15" y="14" fill="#a7f3d0" fontSize="8" fontWeight="700" textAnchor="middle">
                  BALAIKOTA
                </text>
              </g>

              {/* Field Stations (Posko Siaga) */}
              {showStations &&
                FIELD_UNIT_STATIONS.map((station) => {
                  const sx = station.xPercent * 10;
                  const sy = (station.yPercent / 100) * 650;
                  return (
                    <g key={station.id} transform={`translate(${sx}, ${sy})`} className="cursor-pointer">
                      <circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="6" fill="#0284c7" />
                      <text x="0" y="24" fill="#7dd3fc" fontSize="9" fontWeight="600" textAnchor="middle">
                        {station.name.replace('Posko ', '')}
                      </text>
                    </g>
                  );
                })}

              {/* Dispatch Route Line to focused complaint */}
              {focusedComplaint && closestStation && (
                <g id="dispatch-route" opacity="0.8">
                  <line
                    x1={closestStation.station.xPercent * 10}
                    y1={(closestStation.station.yPercent / 100) * 650}
                    x2={focusedComplaint.computedCoords.xPercent * 10}
                    y2={(focusedComplaint.computedCoords.yPercent / 100) * 650}
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                </g>
              )}
            </svg>

            {/* Placed Interactive Complaint Pins (DOM Elements on top of SVG for rich tooltips & accessibility) */}
            <div className="absolute inset-0 pointer-events-none">
              {filteredComplaints.map((item) => {
                const isSelected = activePinId === item.id;
                const isHovered = hoveredPinId === item.id;
                const isDone = item.status === 'Selesai_Teruji';
                const color = getUrgencyColor(item.urgency, isDone);
                const isUrgent = item.urgency === 'Darurat' && !isDone;

                return (
                  <div
                    key={item.id}
                    style={{
                      left: `${item.computedCoords.xPercent}%`,
                      top: `${item.computedCoords.yPercent}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-full pointer-events-auto cursor-pointer group z-30 transition-transform duration-200"
                    onClick={() => {
                      setActivePinId(item.id);
                      onSelectComplaint(item.id);
                    }}
                    onMouseEnter={() => setHoveredPinId(item.id)}
                    onMouseLeave={() => setHoveredPinId(null)}
                    id={`map-pin-${item.id}`}
                  >
                    {/* Animated Ripple Beacon for Urgent / SLA Warning */}
                    {isUrgent && (
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-rose-500/40 animate-ping pointer-events-none" />
                    )}

                    {/* Pin Head */}
                    <div
                      className={`relative flex items-center justify-center rounded-xl p-1.5 shadow-xl transition-all ${
                        isSelected
                          ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950 z-40 ' + color.bg
                          : isHovered
                          ? 'scale-110 ' + color.bg
                          : color.bg
                      } border ${color.border}`}
                    >
                      <MapPin className="w-4 h-4 text-white drop-shadow" />

                      {/* Small badge count or indicator */}
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-slate-950 border border-white/60 flex items-center justify-center text-[8px] font-bold text-white">
                        {item.urgency === 'Darurat' ? '!' : item.category.slice(0, 1)}
                      </span>
                    </div>

                    {/* Pin Tip Arrow */}
                    <div className="w-2 h-2 mx-auto rotate-45 -mt-1 bg-slate-900 border-r border-b border-slate-700" />

                    {/* Floating Label / Mini Preview on Hover or Selected */}
                    {(isHovered || isSelected) && (
                      <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-48 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-2.5 shadow-2xl z-50 text-left pointer-events-auto animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-mono text-[10px] font-bold text-emerald-400">
                            {item.id}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${color.border} ${color.text}`}>
                            {item.urgency}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-white line-clamp-1 mb-1">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          📍 {item.location}
                        </p>
                        <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
                          <span>SLA: {item.elapsedHours}/{item.slaTargetHours}j</span>
                          <span className="text-emerald-400 font-semibold">Klik Detail →</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom-left interactive map legend */}
            <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[10px] text-slate-300 shadow-xl space-y-1">
              <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400 block mb-0.5">
                Legenda Kategori &amp; Urgensi
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
                  <span className="text-rose-300 font-semibold">Darurat</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="text-amber-300">Tinggi</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-emerald-300">Sedang</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                  <span className="text-slate-400">Selesai</span>
                </span>
              </div>
            </div>

            {/* Bottom-right Zoom Controls */}
            <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-xs text-slate-300 shadow-xl">
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.2))}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center font-bold text-white transition-colors cursor-pointer"
                title="Perbesar Peta"
              >
                +
              </button>
              <span className="px-1 font-mono text-[10px] text-slate-400">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center font-bold text-white transition-colors cursor-pointer"
                title="Perkecil Peta"
              >
                -
              </button>
            </div>
          </div>

          {/* Focused Complaint Action Card (Bottom Bar on Map) */}
          {focusedComplaint && (
            <div className="bg-slate-900/95 border-t border-slate-800 p-4 z-20 animate-in slide-in-from-bottom-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                      {focusedComplaint.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {focusedComplaint.category}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-400">
                      📍 {focusedComplaint.computedCoords.districtName}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {focusedComplaint.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    Lokasi: {focusedComplaint.location}
                  </p>
                </div>

                {/* Action Buttons for Agency Field Operations */}
                <div className="flex items-center gap-2 shrink-0">
                  {closestStation && (
                    <div className="hidden md:flex flex-col text-right text-[11px] pr-2 border-r border-slate-800">
                      <span className="text-slate-400">Posko Terdekat:</span>
                      <span className="font-semibold text-emerald-400">
                        {closestStation.station.name} (~{closestStation.distanceKm} km, {closestStation.etaMinutes} mnt)
                      </span>
                    </div>
                  )}

                  {focusedComplaint.status !== 'Selesai_Teruji' ? (
                    <button
                      onClick={() => handleQuickDispatch(focusedComplaint.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                      id="btn-quick-dispatch"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Prioritaskan / Tindak Lanjut</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sudah Tuntas Terverifikasi</span>
                    </div>
                  )}

                  {onFocusDetailView && (
                    <button
                      onClick={() => onFocusDetailView(focusedComplaint.id)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      Buka Rincian Tiket →
                    </button>
                  )}
                </div>
              </div>

              {/* Toast confirmation of dispatch */}
              {dispatchedSuccessId === focusedComplaint.id && (
                <div className="mt-2.5 p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Instruksi penanganan lapangan berhasil dimutasi ke buku besar blockchain! Tim reaksi cepat diperintahkan ke titik koordinat.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Agency Field Action Prioritization Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                  Antrean Prioritas Aksi Lapangan
                </h3>
                <p className="text-xs text-slate-400">
                  Diurutkan otomatis berbasis algoritma keparahan &amp; sisa SLA
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/80">
                {priorityQueue.length} Aduan
              </span>
            </div>

            {/* List of Prioritized Complaints */}
            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {priorityQueue.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-950/50 rounded-xl border border-slate-800/60">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-1.5" />
                  <p className="font-semibold text-xs text-slate-200">Semua Aduan Telah Tertangani!</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tidak ada tunggakan aduan aktif di lapangan saat ini.
                  </p>
                </div>
              ) : (
                priorityQueue.map((item, index) => {
                  const isSelected = activePinId === item.id;
                  const isUrgent = item.urgency === 'Darurat';
                  const isSlaExpiring = item.fieldPriority.isSlaWarning;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setActivePinId(item.id);
                        onSelectComplaint(item.id);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md'
                          : isUrgent
                          ? 'bg-rose-950/20 border-rose-800/60 hover:border-rose-700'
                          : isSlaExpiring
                          ? 'bg-amber-950/20 border-amber-800/60 hover:border-amber-700'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
                      }`}
                      id={`priority-item-${item.id}`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold flex items-center justify-center">
                            #{index + 1}
                          </span>
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            {item.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isUrgent && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                              DARURAT
                            </span>
                          )}
                          {isSlaExpiring && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              SLA &lt; {item.fieldPriority.slaRemainingHours}j
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                        📍 {item.location}
                      </p>

                      <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800/80">
                        <span className="text-slate-400 font-medium">
                          Dinas: <strong className="text-slate-200">{item.assignedDepartment.split('&')[0]}</strong>
                        </span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1 group-hover:underline">
                          Tampilkan di Peta 📍
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Prophetic Governance Motto in Field Dispatch */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Prinsip Khidmat Rasulullah SAW:</span>
              </div>
              <p className="italic text-slate-400 leading-relaxed text-[10px]">
                “Sayyidul qaumi khadimuhum — Pemimpin suatu kaum adalah pelayan bagi kaumnya.” Tindakan lapangan diprioritaskan demi keselamatan &amp; keadilan hak warga dhuafa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
