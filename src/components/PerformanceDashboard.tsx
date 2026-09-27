import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  Building,
  Zap,
  Sparkles,
  BarChart3,
  Award,
  ArrowDownRight,
  ArrowUpRight,
  FileDown,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Check,
} from 'lucide-react';
import { DepartmentMetric, Complaint } from '../types';
import { DEPARTMENT_METRICS, INITIAL_COMPLAINTS } from '../data/initialData';
import { ExportReportModal } from './ExportReportModal';
import { SlaWorkloadCalendar } from './SlaWorkloadCalendar';
import {
  exportPerformanceReportToCsv,
  exportPerformanceReportToPdf,
} from '../utils/performanceReportExport';

interface PerformanceDashboardProps {
  metrics?: DepartmentMetric[];
  complaints?: Complaint[];
  onSelectComplaint?: (complaintId: string) => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  metrics = DEPARTMENT_METRICS,
  complaints = INITIAL_COMPLAINTS,
  onSelectComplaint,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleQuickExportPdf = () => {
    setIsDropdownOpen(false);
    try {
      const res = exportPerformanceReportToPdf(metrics);
      showToast(`Laporan PDF resmi (${res.filename}) berhasil diunduh!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickExportCsv = () => {
    setIsDropdownOpen(false);
    try {
      const res = exportPerformanceReportToCsv(metrics);
      showToast(`Berkas CSV Excel (${res.filename}) berhasil diunduh!`);
    } catch (e) {
      console.error(e);
    }
  };

  const totalHandledAll = metrics.reduce((acc, m) => acc + m.totalHandled, 0);
  const totalResolvedOnTime = metrics.reduce((acc, m) => acc + m.resolvedOnTime, 0);
  const overallOnTimeRate = ((totalResolvedOnTime / totalHandledAll) * 100).toFixed(1);
  const avgHoursOverall = (
    metrics.reduce((acc, m) => acc + m.avgResolutionHours * m.totalHandled, 0) / totalHandledAll
  ).toFixed(1);
  const avgSatisfaction = (
    metrics.reduce((acc, m) => acc + m.satisfactionScore, 0) / metrics.length
  ).toFixed(2);

  // Daily trend mock data for SVG chart
  const dailyTrend = [
    { day: 'Sen', hours: 9.2, complaints: 42 },
    { day: 'Sel', hours: 8.4, complaints: 58 },
    { day: 'Rab', hours: 7.6, complaints: 64 },
    { day: 'Kam', hours: 6.9, complaints: 51 },
    { day: 'Jum', hours: 5.8, complaints: 49 },
    { day: 'Sab', hours: 5.4, complaints: 38 },
    { day: 'Min', hours: 4.8, complaints: 29 },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Prinsip Fathanah: Kecerdasan &amp; Efisiensi Birokrasi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Dasbor Statistik Kinerja Layanan &amp; Efisiensi Birokrasi
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Memantau kecepatan respons, kepatuhan batas SLA, kepuasan masyarakat, dan mengeliminasi proses berbelit-belit sesuai ajaran Rasulullah SAW: <em>“Permudahlah dan jangan mempersulit.”</em>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Optimasi AI Aktif
            </span>

            {/* Ekspor Laporan Kinerja Button Group */}
            <div className="relative">
              <div className="flex items-center rounded-xl overflow-hidden shadow-md border border-emerald-600/40 bg-emerald-600">
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 text-white font-bold text-xs hover:bg-emerald-500 transition-colors cursor-pointer"
                  id="btn-export-performance-main"
                  title="Buka panel ekspor laporan kinerja resmi (PDF/CSV)"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Ekspor Laporan Kinerja</span>
                </button>

                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-2 py-2 text-emerald-100 hover:bg-emerald-500 border-l border-emerald-500/40 transition-colors cursor-pointer"
                  title="Pilihan cepat unduh PDF atau CSV"
                  id="btn-export-dropdown-toggle"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Export Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Unduh Cepat Laporan
                  </div>
                  <button
                    onClick={handleQuickExportPdf}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-left"
                    id="btn-quick-export-pdf"
                  >
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Unduh PDF Resmi (LAKIP)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Format cetak A4 ber-KOP &amp; TTE</div>
                    </div>
                  </button>

                  <button
                    onClick={handleQuickExportCsv}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-left"
                    id="btn-quick-export-csv"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Unduh Data CSV (Excel)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Untuk analisis SIPD &amp; spreadsheet</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsExportModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40 transition-colors cursor-pointer"
                      id="btn-open-custom-export-modal"
                    >
                      <span>Kustomisasi &amp; Pratinjau</span>
                      <ChevronDown className="w-3 h-3 -rotate-90" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Quick Toast Notification */}
        {toastMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/80 text-emerald-200 flex items-center justify-between text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-400 hover:text-white text-[11px] font-semibold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* 4 Core KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Rata-rata Waktu Selesai</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">
              {avgHoursOverall} <span className="text-sm font-normal text-slate-400">Jam</span>
            </p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" />
              38% lebih cepat dari target 24 jam
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Tingkat Tepat Waktu SLA</span>
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">
              {overallOnTimeRate}%
            </p>
            <p className="text-[11px] text-sky-400 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              2.720 dari 2.740 aduan tuntas tepat waktu
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Indeks Kepuasan (IKM)</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">
              {avgSatisfaction} <span className="text-sm font-normal text-slate-400">/ 5.00</span>
            </p>
            <p className="text-[11px] text-amber-400 mt-1">Predikat: Sangat Memuaskan (A+)</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Kepatuhan Anti-Risywah</span>
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">
              99.7%
            </p>
            <p className="text-[11px] text-indigo-400 mt-1">Nol toleransi pungli &amp; gratifikasi</p>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid: SVG Trend Chart & Bureaucracy Speed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Trend of Average Resolution Time */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Tren Kecepatan Penyelesaian Layanan (7 Hari Terakhir)
              </h3>
              <p className="text-[11px] text-slate-400">Penurunan waktu tunggu warga per hari</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Efisien -48%
            </span>
          </div>

          {/* SVG Bar / Area Chart */}
          <div className="pt-4">
            <div className="h-44 w-full flex items-end justify-between gap-3 px-2">
              {dailyTrend.map((item) => {
                // Max height benchmark: 12 hours
                const barHeight = Math.max(15, Math.min(100, (item.hours / 12) * 100));
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-emerald-300 transition-colors">
                      {item.hours}j
                    </span>
                    <div className="w-full bg-slate-800 rounded-t-lg h-36 flex items-end p-1">
                      <div
                        style={{ height: `${barHeight}%` }}
                        className="w-full rounded-t bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all shadow-sm"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-300">{item.day}</span>
                    <span className="text-[9px] text-slate-500">{item.complaints} aduan</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Batas Maksimal Toleransi SLA: <strong>24.0 Jam</strong></span>
            <span className="text-emerald-400 font-semibold">Capaian Saat Ini: 4.8 - 9.2 Jam</span>
          </div>
        </div>

        {/* Right: AI Bottleneck & Bureaucracy Elimination Box */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Analisis Bottleneck &amp; Efisiensi Birokrasi AI
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300">Penghapusan Syarat Fotokopi KTP</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">TUNTAS</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Data NIK langsung dicocokkan ke database kependudukan on-chain, menghemat waktu warga rata-rata 45 menit per urusan.
                </p>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300">Pemberian NIB Usaha Mikro Otomatis</span>
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-950 px-1.5 py-0.5 rounded">TERAPKAN</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pemangkasan 3 meja paraf pejabat menjadi tanda tangan digital terverifikasi kriptografi. Izin terbit dalam hitungan menit.
                </p>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">Antrean Obat Pasien Kronis Puskesmas</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded">REKOMENDASI</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Disarankan sistem pesan antar rutin via kurir syariah untuk memangkas penumpukan lansia di ruang tunggu.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Audit Otomatis Kepatuhan SOP:</span>
            <span className="text-emerald-400 font-bold">100% Sesuai Sunnah Keadilan</span>
          </div>
        </div>
      </div>

      {/* Visual Calendar Component: Pemetaan Tenggat Waktu SLA & Proyeksi Beban Kerja */}
      <SlaWorkloadCalendar
        complaints={complaints}
        onSelectComplaint={onSelectComplaint}
      />

      {/* Detailed Department Performance Ranking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Evaluasi Kinerja &amp; Integritas Amanah per Organisasi Perangkat Daerah (OPD)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              {metrics.length} Dinas Terpantau
            </span>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Unduh rekapitulasi data kinerja OPD"
              id="btn-export-opd-table"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ekspor Rekap OPD</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Nama OPD / Dinas</th>
                <th className="py-3 px-4">Kategori Tugas</th>
                <th className="py-3 px-4 text-center">Total Aduan</th>
                <th className="py-3 px-4 text-center">Tepat Waktu (%)</th>
                <th className="py-3 px-4 text-center">Rata-rata Waktu</th>
                <th className="py-3 px-4 text-center">Kepuasan (IKM)</th>
                <th className="py-3 px-4 text-right">Skor Integritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {metrics.map((m) => {
                const rate = ((m.resolvedOnTime / m.totalHandled) * 100).toFixed(1);
                return (
                  <tr key={m.name} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      {m.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {m.category}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-200">
                      {m.totalHandled}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                        {rate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-200">
                      {m.avgResolutionHours} jam
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-amber-300">
                      {m.satisfactionScore} / 5.0
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-bold text-emerald-400">
                        {m.integrityIndex}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ekspor Laporan Kinerja (PDF/CSV) */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        metrics={metrics}
      />
    </div>
  );
};
