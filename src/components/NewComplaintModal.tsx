import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Clock,
  MapPin,
  FileText,
  User,
  CheckCircle2,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { ComplaintCategory, UrgencyLevel, Complaint } from '../types';
import { sha256 } from '../services/blockchain';

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitComplaint: (newComplaint: Complaint) => void;
}

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({
  isOpen,
  onClose,
  onSubmitComplaint,
}) => {
  if (!isOpen) return null;

  const [citizenName, setCitizenName] = useState('');
  const [nik, setNik] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isWhatsappEnabled, setIsWhatsappEnabled] = useState(true);
  const [category, setCategory] = useState<ComplaintCategory>('Infrastruktur Jalan');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Sedang');
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: ComplaintCategory[] = [
    'Infrastruktur Jalan',
    'Bansos & Bantuan Sosial',
    'Kesehatan & Puskesmas',
    'Perizinan Usaha & UMKM',
    'Laporan Pungli & Integritas',
    'Administrasi Kependudukan',
  ];

  const getSlaHours = (urg: UrgencyLevel, cat: ComplaintCategory) => {
    if (urg === 'Darurat') return 8;
    if (cat === 'Bansos & Bantuan Sosial') return 12;
    if (cat === 'Kesehatan & Puskesmas') return 12;
    if (urg === 'Tinggi') return 24;
    return 48;
  };

  const getAssignedDepartment = (cat: ComplaintCategory) => {
    switch (cat) {
      case 'Infrastruktur Jalan':
        return 'Dinas Pekerjaan Umum & Tata Ruang';
      case 'Bansos & Bantuan Sosial':
        return 'Dinas Sosial & Khidmat Dhuafa';
      case 'Kesehatan & Puskesmas':
        return 'Dinas Kesehatan & Pengendalian Obat Publik';
      case 'Perizinan Usaha & UMKM':
        return 'Dinas Penanaman Modal & PTSP';
      case 'Laporan Pungli & Integritas':
        return 'Satgas Khusus Anti-Risywah & Integritas Aparatur';
      case 'Administrasi Kependudukan':
        return 'Dinas Kependudukan & Pencatatan Sipil';
      default:
        return 'Pemerintah Kota Terpadu';
    }
  };

  const handleAiAnalyze = () => {
    if (!description && !title) {
      setAiAdvice('Silakan isi judul dan rincian aduan terlebih dahulu agar AI Shiddiq dapat menganalisis.');
      return;
    }

    setIsAnalyzingAi(true);
    setAiAdvice(null);

    setTimeout(() => {
      let advice = '';
      const text = (title + ' ' + description).toLowerCase();

      if (text.includes('pungli') || text.includes('uang pelicin') || text.includes('suap') || text.includes('bayar')) {
        advice = 'Analisis Nilai Shiddiq: Terindikasi potensi pelanggaran integritas/risywah. Sistem otomatis merekomendasikan urgensi DARURAT dan memproteksi identitas saksi whistleblower.';
        setUrgency('Darurat');
        setCategory('Laporan Pungli & Integritas');
      } else if (text.includes('obat') || text.includes('darurat') || text.includes('puskesmas') || text.includes('sakit')) {
        advice = 'Analisis Khidmat: Terdeteksi kebutuhan medis prioritas. Target SLA disesuaikan menjadi 12 jam respons tanggap darurat.';
        setUrgency('Tinggi');
        setCategory('Kesehatan & Puskesmas');
      } else if (text.includes('bansos') || text.includes('beras') || text.includes('miskin') || text.includes('dhuafa') || text.includes('lansia')) {
        advice = 'Analisis Hak Dhuafa: Laporan hak dasar sosial terdeteksi. Disposisi langsung diteruskan ke tim jemput bola Dinas Sosial.';
        setUrgency('Tinggi');
        setCategory('Bansos & Bantuan Sosial');
      } else {
        advice = 'Analisis Berkas Cerdas: Deskripsi telah memenuhi standar transparansi publik. Estimasi penyelesaian sesuai SLA standar 24-48 jam.';
      }

      setAiAdvice(advice);
      setIsAnalyzingAi(false);
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName || !title || !description || !location) return;

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `ADU-2026-${randomSuffix}`;
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').slice(0, 19);
    const dateFormatted = `${now.getDate().toString().padStart(2, '0')} Sep 2026, ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Mask NIK: e.g. 3271********0192
    const cleanNik = nik.replace(/\D/g, '') || '3271048291020092';
    const maskedNik =
      cleanNik.length >= 8
        ? `${cleanNik.slice(0, 4)}********${cleanNik.slice(-4)}`
        : '3271********0099';

    // Compute cryptographic hash
    const payloadString = `${complaintId}:${title}:${description}:${citizenName}:${location}:${timestampStr}`;
    const txHash = '0x' + (await sha256(payloadString));

    const slaHours = getSlaHours(urgency, category);
    const department = getAssignedDepartment(category);

    const newComplaint: Complaint = {
      id: complaintId,
      citizenName,
      citizenNikMasked: maskedNik,
      category,
      title,
      description,
      location,
      urgency,
      createdAt: timestampStr,
      updatedAt: timestampStr,
      status: 'Diajukan',
      assignedDepartment: department,
      officerName: 'Sistem Penerimaan Cerdas Mandiri',
      slaTargetHours: slaHours,
      elapsedHours: 0,
      whatsappNumber: whatsappNumber.trim()
        ? whatsappNumber.startsWith('+62')
          ? whatsappNumber
          : whatsappNumber.startsWith('0')
          ? `+62 ${whatsappNumber.slice(1)}`
          : `+62 ${whatsappNumber}`
        : '+62 812-9900-1122',
      isWhatsappNotificationEnabled: isWhatsappEnabled,
      txHash,
      blockHeight: 4,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'Diajukan',
          title: 'Pengaduan Terdaftar di Buku Besar',
          timestamp: dateFormatted,
          note: 'Aduan warga telah tervalidasi tanda tangan digital dan otomatis terdistribusi ke node validator.',
          officer: 'Gateway Mandiri',
          blockHeight: 4,
          txHash,
        },
      ],
    };

    setTimeout(() => {
      onSubmitComplaint(newComplaint);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        id="modal-new-complaint"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Buat Pengaduan &amp; Permohonan Khidmat Warga
              </h3>
              <p className="text-xs text-slate-400">
                Terlindung nilai kejujuran (Shiddiq) dan diautentikasi ke ledger blockchain publik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4 flex-1">
          {/* Identity row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Lengkap Warga <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Faisal Rahman"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nomor Induk Kependudukan (NIK)
              </label>
              <input
                type="text"
                placeholder="16 Digit NIK (Akan dimask demi privasi)"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                maxLength={16}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* WhatsApp Notification Integration Field */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nomor WhatsApp untuk Pembaruan Real-Time (Simulasi Gateway)</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Contoh: 0812-8821-0414 atau +62 812..."
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-700/60 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-slate-300 select-none">
              <input
                type="checkbox"
                checked={isWhatsappEnabled}
                onChange={(e) => setIsWhatsappEnabled(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-[11px] text-slate-300">
                Kirimkan notifikasi WhatsApp otomatis di setiap pembaruan status (Anda tidak perlu membuka aplikasi terus-menerus)
              </span>
            </label>
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kategori Layanan
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tingkat Urgensi
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Sedang">Sedang (Standar SLA)</option>
                <option value="Tinggi">Tinggi (Maks 24 Jam)</option>
                <option value="Darurat">Darurat (Maks 8 Jam - Prioritas Tanggap)</option>
                <option value="Rendah">Rendah (Penyuluhan / Saran)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Judul Pengaduan / Permohonan <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Lubang jalan membahayakan pengendara di Jl. Sudirman KM 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lokasi Kejadian / Alamat Lengkap <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Kecamatan, Kelurahan, RT/RW atau nama jalan/fasilitas"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Uraian Fakta &amp; Kronologi <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleAiAnalyze}
                disabled={isAnalyzingAi}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>{isAnalyzingAi ? 'Menganalisis...' : 'Analisis Otomatis AI Shiddiq'}</span>
              </button>
            </div>
            <textarea
              required
              rows={4}
              placeholder="Jelaskan secara jujur dan rinci kronologi kejadian, bukti yang dimiliki, dan dampak bagi masyarakat..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* AI Advice Output Box */}
          {aiAdvice && (
            <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-3 text-xs text-emerald-300 flex items-start gap-2.5 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-white">Rekomendasi Cerdas AI Shiddiq:</p>
                <p className="text-emerald-300/90 leading-relaxed">{aiAdvice}</p>
              </div>
            </div>
          )}

          {/* SLA & Guarantee Info */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                Target Respons SLA:{' '}
                <strong className="text-white">
                  Maks {getSlaHours(urgency, category)} Jam
                </strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Dinas: <strong className="text-emerald-400">{getAssignedDepartment(category)}</strong>
            </span>
          </div>

          {/* Anti-Bribe Pledge */}
          <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Dengan mengirimkan laporan ini, Anda menyatakan informasi yang diberikan adalah jujur (Shiddiq). Seluruh pelayanan publik ini <strong>GRATIS (Rp 0)</strong> tanpa pungutan liar apapun meneladani sunnah Rasulullah SAW.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50"
              id="btn-submit-new-complaint"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Memproses ke Blockchain...' : 'Kirim & Mint ke Blockchain'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
