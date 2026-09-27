import React, { useState } from 'react';
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  X,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
  Zap,
  Sparkles,
  Eye,
  Settings2,
  Clock,
  Printer,
  ChevronRight,
  Info,
} from 'lucide-react';
import { DepartmentMetric } from '../types';
import {
  calculatePerformanceAggregates,
  exportPerformanceReportToCsv,
  exportPerformanceReportToPdf,
  PerformanceReportOptions,
} from '../utils/performanceReportExport';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: DepartmentMetric[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  metrics,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv'>('pdf');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7 Hari Terakhir (Mingguan)');
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState<boolean>(true);
  const [includeOpdDetails, setIncludeOpdDetails] = useState<boolean>(true);
  const [includeDailyTrends, setIncludeDailyTrends] = useState<boolean>(true);
  const [includeAiRecommendations, setIncludeAiRecommendations] = useState<boolean>(true);
  const [includeCryptoSignature, setIncludeCryptoSignature] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'preview'>('settings');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<{
    filename: string;
    format: 'pdf' | 'csv';
  } | null>(null);

  if (!isOpen) return null;

  const aggregates = calculatePerformanceAggregates(metrics);
  const now = new Date();
  const currentDateStr = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleExecuteExport = () => {
    setIsExporting(true);
    setExportSuccess(null);

    const options: PerformanceReportOptions = {
      period: selectedPeriod,
      agencyName: 'Pemerintah Kota Amanah Sejahtera',
      includeExecutiveSummary,
      includeOpdDetails,
      includeDailyTrends,
      includeAiRecommendations,
      includeCryptoSignature,
    };

    setTimeout(() => {
      try {
        if (selectedFormat === 'pdf') {
          const res = exportPerformanceReportToPdf(metrics, options);
          setExportSuccess({ filename: res.filename, format: 'pdf' });
        } else {
          const res = exportPerformanceReportToCsv(metrics, options);
          setExportSuccess({ filename: res.filename, format: 'csv' });
        }
      } catch (err) {
        console.error('Failed to export report:', err);
      } finally {
        setIsExporting(false);
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 mb-0.5">
                <span>Modul LAKIP &amp; Efisiensi Birokrasi</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                <span>PermenPAN-RB No. 88/2021</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Ekspor Laporan Kinerja &amp; Akuntabilitas Pelayanan
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Modal"
            id="btn-close-export-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Pengaturan Ekspor vs Pratinjau Dokumen */}
        <div className="px-5 pt-3 pb-0 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Konfigurasi Format</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
                activeTab === 'preview'
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau Dokumen Resmi</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
            {metrics.length} OPD Terpilih
          </span>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {exportSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-700/80 text-emerald-200 flex items-start gap-3 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm text-emerald-300">
                  Laporan Berhasil Diekspor &amp; Diunduh!
                </p>
                <p className="text-xs text-emerald-400/90 mt-0.5 font-mono">
                  Berkas: {exportSuccess.filename}
                </p>
                <p className="text-[11px] text-emerald-300/80 mt-1">
                  Format {exportSuccess.format.toUpperCase()} siap digunakan untuk arsip akuntabilitas kinerja, audit inspektorat, atau pelaporan resmi kepala daerah.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' ? (
            <>
              {/* Pilihan Format Ekspor: PDF vs CSV */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 block">
                  1. Pilih Format Berkas Laporan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedFormat('pdf')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      selectedFormat === 'pdf'
                        ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50'
                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        selectedFormat === 'pdf'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">PDF Dokumen Resmi (.pdf)</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          STANDAR LAKIP
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                        Dokumen cetak resmi A4 lengkap dengan KOP Surat Pemerintah Daerah, tanda tangan elektronik terverifikasi, dan format siap sidang/audit.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedFormat('csv')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      selectedFormat === 'csv'
                        ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/50'
                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        selectedFormat === 'csv'
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">CSV Spreadsheet (.csv)</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          EXCEL &amp; SIPD
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                        Data tabular ber-BOM UTF-8 untuk analisis lanjutan di Microsoft Excel, Google Sheets, atau diimpor ke sistem perencanaan SIPD.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pilihan Periode Pelaporan */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. Rentang Periode Evaluasi Kinerja:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    '7 Hari Terakhir (Mingguan)',
                    'Bulan Ini (September 2026)',
                    'Triwulan III 2026 (Q3)',
                    'Tahun Anggaran 2026',
                  ].map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left truncate cursor-pointer ${
                        selectedPeriod === period
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pilihan Komponen Laporan (Checklist) */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 block">
                  3. Komponen Data yang Disertakan dalam Laporan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 cursor-pointer hover:bg-slate-800/70">
                    <input
                      type="checkbox"
                      checked={includeExecutiveSummary}
                      onChange={(e) => setIncludeExecutiveSummary(e.target.checked)}
                      className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                    />
                    <div>
                      <span className="font-bold text-white block">Ringkasan Eksekutif &amp; KPI</span>
                      <span className="text-[11px] text-slate-400">
                        Rata-rata waktu ({aggregates.avgHoursOverall}j), SLA ({aggregates.overallOnTimeRate}%), IKM ({aggregates.avgSatisfaction})
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 cursor-pointer hover:bg-slate-800/70">
                    <input
                      type="checkbox"
                      checked={includeOpdDetails}
                      onChange={(e) => setIncludeOpdDetails(e.target.checked)}
                      className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                    />
                    <div>
                      <span className="font-bold text-white block">Rincian Lengkap Capaian Seluruh OPD</span>
                      <span className="text-[11px] text-slate-400">
                        {metrics.length} Dinas (Dinas Sosial, PUTR, DPMPTSP, Dinkes, Disdukcapil)
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 cursor-pointer hover:bg-slate-800/70">
                    <input
                      type="checkbox"
                      checked={includeDailyTrends}
                      onChange={(e) => setIncludeDailyTrends(e.target.checked)}
                      className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                    />
                    <div>
                      <span className="font-bold text-white block">Tren Kecepatan Layanan Harian</span>
                      <span className="text-[11px] text-slate-400">
                        Grafik &amp; data harian (Senin - Minggu) pemangkasan durasi
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 cursor-pointer hover:bg-slate-800/70">
                    <input
                      type="checkbox"
                      checked={includeAiRecommendations}
                      onChange={(e) => setIncludeAiRecommendations(e.target.checked)}
                      className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                    />
                    <div>
                      <span className="font-bold text-white block">Rekomendasi Efisiensi Birokrasi AI</span>
                      <span className="text-[11px] text-slate-400">
                        Penghapusan fotokopi KTP, otomasi NIB, kurir obat puskesmas
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Info Kotak Standar Akuntabilitas */}
              <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 flex items-start gap-3">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Laporan ini mengimplementasikan prinsip kepemimpinan kenabian <strong>Fathanah</strong> (Kecerdasan &amp; Ketangkasan Manajemen Publik) serta memenuhi kaidah Sistem Akuntabilitas Kinerja Instansi Pemerintah (SAKIP). Setiap berkas memuat kode *checksum* unik yang dapat diverifikasi integritasnya pada buku besar blockchain AmanahGov.
                </p>
              </div>
            </>
          ) : (
            /* Live Preview Tab */
            <div className="space-y-4">
              <div className="bg-white text-slate-900 rounded-xl p-5 shadow-inner border border-slate-300 font-sans space-y-4">
                {/* KOP Surat Pratinjau */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                      Pemerintah Kota Amanah Sejahtera
                    </h4>
                    <h5 className="font-extrabold text-sm text-slate-900">
                      Badan Pengawasan &amp; Reformasi Birokrasi Pelayanan Publik
                    </h5>
                    <p className="text-[10px] text-slate-600">
                      Sistem Informasi AmanahGov - Transparansi &amp; Integritas Tanpa Risywah
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-slate-600">
                    <span className="font-bold text-emerald-700 block">DOKUMEN RESMI (LAKIP)</span>
                    <span>No: LAKIP/AG-2026/09/EV-PREVIEW</span>
                    <span className="block">{currentDateStr}</span>
                  </div>
                </div>

                {/* Judul Laporan */}
                <div className="text-center py-1">
                  <h3 className="font-extrabold text-sm uppercase text-slate-900">
                    Laporan Akuntabilitas Kinerja &amp; Efisiensi Birokrasi
                  </h3>
                  <p className="text-[10px] text-slate-600">
                    Periode Evaluasi: {selectedPeriod} | Dasar: PermenPAN-RB No. 88/2021
                  </p>
                </div>

                {/* 4 Mini KPI Previews */}
                {includeExecutiveSummary && (
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="p-2 bg-slate-100 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[9px]">Rata-rata Waktu</span>
                      <span className="font-bold text-xs text-slate-900 font-mono">
                        {aggregates.avgHoursOverall} Jam
                      </span>
                    </div>
                    <div className="p-2 bg-slate-100 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[9px]">Tingkat SLA</span>
                      <span className="font-bold text-xs text-emerald-700 font-mono">
                        {aggregates.overallOnTimeRate}%
                      </span>
                    </div>
                    <div className="p-2 bg-slate-100 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[9px]">Kepuasan (IKM)</span>
                      <span className="font-bold text-xs text-amber-600 font-mono">
                        {aggregates.avgSatisfaction} / 5.0
                      </span>
                    </div>
                    <div className="p-2 bg-slate-100 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[9px]">Kepatuhan Bebas Pungli</span>
                      <span className="font-bold text-xs text-indigo-700 font-mono">
                        {aggregates.avgIntegrity}%
                      </span>
                    </div>
                  </div>
                )}

                {/* OPD Table Preview */}
                {includeOpdDetails && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white font-bold">
                          <th className="p-1.5">No</th>
                          <th className="p-1.5">Nama OPD</th>
                          <th className="p-1.5 text-center">Total Aduan</th>
                          <th className="p-1.5 text-center">Tepat SLA</th>
                          <th className="p-1.5 text-center">Waktu</th>
                          <th className="p-1.5 text-center">IKM</th>
                          <th className="p-1.5 text-right">Integritas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.map((m, idx) => (
                          <tr key={m.name} className="border-b border-slate-200">
                            <td className="p-1.5 text-slate-500">{idx + 1}</td>
                            <td className="p-1.5 font-bold text-slate-800">{m.name}</td>
                            <td className="p-1.5 text-center font-mono">{m.totalHandled}</td>
                            <td className="p-1.5 text-center font-mono text-emerald-700 font-bold">
                              {((m.resolvedOnTime / m.totalHandled) * 100).toFixed(1)}%
                            </td>
                            <td className="p-1.5 text-center font-mono">{m.avgResolutionHours}j</td>
                            <td className="p-1.5 text-center font-mono font-bold text-amber-700">
                              {m.satisfactionScore}
                            </td>
                            <td className="p-1.5 text-right font-mono font-bold text-emerald-700">
                              {m.integrityIndex}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Footer Signature Box Preview */}
                <div className="pt-2 border-t border-slate-300 flex justify-between text-[9px] text-slate-600">
                  <div>
                    <span className="font-bold block text-slate-800">Verifikasi Integritas Blockchain</span>
                    <span>Tersertifikasi Digital &amp; Sah Tanpa Stempel Basah</span>
                  </div>
                  <div className="text-right">
                    <span>Inspektur Utama Pengawas Pelayanan</span>
                    <span className="font-bold block text-slate-800 mt-3">
                      Dr. H. Muhammad Arifin, M.AP.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Format Terpilih:</span>
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                selectedFormat === 'pdf'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-sky-950 text-sky-300 border border-sky-800'
              }`}
            >
              {selectedFormat === 'pdf' ? 'DOKUMEN PDF RESMI (A4)' : 'SPREADSHEET CSV (EXCEL)'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleExecuteExport}
              disabled={isExporting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md cursor-pointer disabled:opacity-50"
              id="btn-confirm-export-report"
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses Dokumen...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Unduh {selectedFormat.toUpperCase()} Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
