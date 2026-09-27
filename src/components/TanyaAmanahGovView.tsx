import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  BookOpen,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  FileText,
  AlertTriangle,
  Building2,
  Radio,
  ExternalLink,
  ChevronRight,
  Info,
  ThumbsUp,
} from 'lucide-react';
import { Complaint } from '../types';
import {
  askTanyaAmanahGov,
  TanyaMessage,
  TanyaResponse,
} from '../services/tanyaAmanahGovService';

interface TanyaAmanahGovViewProps {
  complaints: Complaint[];
  onSelectComplaint?: (id: string) => void;
  onOpenNewComplaintModal?: () => void;
}

export const TanyaAmanahGovView: React.FC<TanyaAmanahGovViewProps> = ({
  complaints,
  onSelectComplaint,
  onOpenNewComplaintModal,
}) => {
  const [messages, setMessages] = useState<TanyaMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Assalamu’alaikum Warahmatullahi Wabarakatuh. Selamat datang di **Tanya AmanahGov**.\n\nSaya adalah asisten kecerdasan buatan resmi untuk membantu warga menavigasi **status prosedur layanan publik**, **regulasi & hak warga**, serta **pelacakan pengaduan real-time** dengan mengedepankan nilai kepemimpinan Rasulullah SAW (Shiddiq, Amanah, Tabligh, dan Fathanah).\n\nSilakan ajukan pertanyaan seputar alur birokrasi, regulasi bebas pungli, atau lacak tiket aduan Anda secara otomatis.`,
      timestamp: 'Sekarang',
      category: 'Sambutan Resmi',
      sources: [
        'UU No. 25 Tahun 2009 tentang Pelayanan Publik',
        'Pedoman Tata Kelola Kenabian (AmanahGov 2026)',
      ],
      suggestedQuestions: [
        'Bagaimana cara melacak status aduan ADU-2026-0811?',
        'Apakah pembuatan NIB UMKM benar-benar gratis tanpa calo?',
        'Apa sanksi bagi oknum yang meminta uang pelicin (pungli)?',
        'Berapa batas waktu SLA penanganan aduan darurat?',
      ],
      mode: 'gemini_ai',
      model: 'gemini-3.8-flash',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<'semua' | 'prosedur' | 'regulasi' | 'status'>('semua');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSubmitting]);

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isSubmitting) return;

    const userMessage: TanyaMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Baru saja',
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryToSend) setInputQuery('');
    setIsSubmitting(true);

    // Call server-side Tanya AmanahGov API
    const responseData: TanyaResponse = await askTanyaAmanahGov(text, messages, {
      activeComplaintsCount: complaints.length,
      sampleComplaints: complaints.slice(0, 3).map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        urgency: c.urgency,
      })),
    });

    const aiMessage: TanyaMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: responseData.answer,
      timestamp: 'Baru saja',
      category: responseData.category,
      sources: responseData.sources,
      suggestedQuestions: responseData.suggestedQuestions,
      mode: responseData.mode,
      model: responseData.model,
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsSubmitting(false);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'ai',
        text: `Percakapan telah direset. Silakan tanyakan hal seputar **status prosedur**, **regulasi layanan publik**, atau **pelacakan nomor aduan** Anda.`,
        timestamp: 'Sekarang',
        category: 'Konsultasi Baru',
        suggestedQuestions: [
          'Bagaimana alur pelaporan jalan rusak darurat?',
          'Apakah ada biaya untuk pengurusan izin usaha mikro?',
          'Bagaimana sistem melindungi kerahasiaan pelapor pungli?',
        ],
      },
    ]);
  };

  // Curated knowledge cards for quick inquiry
  const knowledgePills = [
    {
      topic: 'prosedur',
      title: 'Izin NIB UMKM Rp 0',
      subtitle: 'Syarat & Alur Terbit Kilat',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      query: 'Bagaimana prosedur dan syarat resmi membuat NIB UMKM gratis Rp 0 tanpa calo?',
    },
    {
      topic: 'prosedur',
      title: 'Pelaporan Jalan Rusak',
      subtitle: 'Alur Tindak Cepat Tim TRC',
      icon: <Building2 className="w-4 h-4 text-sky-400" />,
      query: 'Bagaimana alur lapor jalan amblas darurat dan berapa jam tim TRC datang ke lokasi?',
    },
    {
      topic: 'regulasi',
      title: 'UU Pelayanan Publik',
      subtitle: 'Hak Warga & Kepastian SLA',
      icon: <Scale className="w-4 h-4 text-amber-400" />,
      query: 'Apa hak warga berdasarkan UU No. 25 Tahun 2009 jika pelayanan instansi terlambat?',
    },
    {
      topic: 'regulasi',
      title: 'Anti-Pungli & Risywah',
      subtitle: 'Sanksi Hukum & Hadits Nabi',
      icon: <ShieldCheck className="w-4 h-4 text-rose-400" />,
      query: 'Apa sanksi bagi oknum pegawai yang meminta uang pelicin (pungli/risywah)?',
    },
    {
      topic: 'status',
      title: 'Lacak Aduan Darurat',
      subtitle: 'Contoh Tiket: ADU-2026-0811',
      icon: <Search className="w-4 h-4 text-teal-400" />,
      query: 'Bagaimana status dan progres pengerjaan tiket aduan ADU-2026-0811 sekarang?',
    },
    {
      topic: 'prosedur',
      title: 'Bansos Bebas Potongan',
      subtitle: 'Penyaluran Beras & BLT',
      icon: <FileText className="w-4 h-4 text-emerald-400" />,
      query: 'Bagaimana prosedur penyaluran bansos beras dan jaminan agar tidak dipotong oknum?',
    },
  ];

  const filteredPills =
    selectedTopic === 'semua'
      ? knowledgePills
      : knowledgePills.filter((p) => p.topic === selectedTopic);

  return (
    <div className="space-y-6 animate-in fade-in duration-150" id="view-tanya-amanahgov">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border border-emerald-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Bot className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                Tanya AmanahGov AI
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                Model: Gemini 3.8 Flash
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/50 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-400" />
                Resmi &amp; Bebas Pungli
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Pusat Tanya Jawab Prosedur &amp; Regulasi Publik
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Dapatkan jawaban seketika dan otomatis mengenai alur pengurusan dokumen, standar waktu (SLA), sanksi pelanggaran birokrasi, serta pelacakan pengaduan Anda berlandaskan prinsip Shiddiq, Amanah, Tabligh, dan Fathanah.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleResetChat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
              title="Reset sesi percakapan"
              id="btn-reset-chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sesi Baru</span>
            </button>
            {onOpenNewComplaintModal && (
              <button
                onClick={onOpenNewComplaintModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-700/30 transition-all cursor-pointer"
                id="btn-tanya-buat-aduan"
              >
                <span>Buat Pengaduan Baru</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Chat Stream & Interactive Inquiry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chat Conversation Stream (7 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden min-h-[640px]">
          {/* Chat Stream Header */}
          <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Konsultasi AI Real-Time
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                </h3>
                <p className="text-[11px] text-slate-400">
                  Didukung integrasi database regulasi &amp; status buku besar AmanahGov
                </p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-mono bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
              {messages.length} Pesan
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-950/40">
            {messages.map((m, idx) => (
              <div
                key={m.id || idx}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shrink-0 shadow-md border border-emerald-400/30 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed transition-all ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-900 border border-slate-700/80 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {/* Category Pill for AI responses */}
                  {m.sender === 'ai' && m.category && (
                    <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800 text-[11px]">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {m.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {m.model && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {m.model}
                          </span>
                        )}
                        <button
                          onClick={() => handleCopy(m.text, idx)}
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                          title="Salin jawaban"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message Content rendered cleanly */}
                  <div className="space-y-2 whitespace-pre-line text-slate-200">
                    {m.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                        return (
                          <h4 key={pIdx} className="font-bold text-white text-sm">
                            {paragraph.replace(/\*\*/g, '')}
                          </h4>
                        );
                      }
                      return (
                        <p key={pIdx} className="leading-relaxed">
                          {paragraph.split('**').map((chunk, cIdx) =>
                            cIdx % 2 === 1 ? (
                              <strong key={cIdx} className="text-white font-semibold">
                                {chunk}
                              </strong>
                            ) : (
                              chunk
                            )
                          )}
                        </p>
                      );
                    })}
                  </div>

                  {/* Sources References */}
                  {m.sender === 'ai' && m.sources && m.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Scale className="w-3 h-3 text-emerald-400" />
                        Dasar Regulasi &amp; SOP Terkait:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.sources.map((src, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-up Questions */}
                  {m.sender === 'ai' &&
                    m.suggestedQuestions &&
                    m.suggestedQuestions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-800/60 space-y-1.5">
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-sky-400" />
                          Pertanyaan Lanjutan yang Sering Ditanyakan:
                        </span>
                        <div className="flex flex-col gap-1">
                          {m.suggestedQuestions.map((q, qIdx) => (
                            <button
                              key={qIdx}
                              onClick={() => handleSend(q)}
                              className="text-left text-[11px] text-emerald-300 hover:text-emerald-200 hover:underline py-0.5 flex items-center gap-1 transition-colors group cursor-pointer"
                            >
                              <ChevronRight className="w-3 h-3 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                              <span>{q}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="flex items-center justify-between text-[10px] mt-2 pt-1">
                    <span
                      className={
                        m.sender === 'user' ? 'text-emerald-100/80' : 'text-slate-400'
                      }
                    >
                      {m.timestamp}
                    </span>
                    {m.sender === 'ai' && (
                      <span className="text-emerald-400 font-medium">AmanahGov Verified</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isSubmitting && (
              <div className="flex items-center gap-2.5 text-xs text-slate-400 pl-11 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-100" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-200" />
                </div>
                <span>Tanya AmanahGov AI sedang memverifikasi regulasi &amp; menyusun jawaban...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompt Bar Above Input */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none">
            <span className="text-slate-400 shrink-0 font-medium flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" /> Tanya Cepat:
            </span>
            <button
              onClick={() =>
                handleSend('Bagaimana prosedur dan syarat pembuatan NIB UMKM 100% gratis?')
              }
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap shrink-0 transition-colors"
            >
              NIB UMKM Gratis
            </button>
            <button
              onClick={() =>
                handleSend('Apa sanksi bagi oknum pegawai dinas yang meminta uang suap atau pungli?')
              }
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap shrink-0 transition-colors"
            >
              Sanksi Pungli &amp; Suap
            </button>
            <button
              onClick={() =>
                handleSend('Berapa lama standar waktu (SLA) untuk penanganan jalan rusak darurat?')
              }
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap shrink-0 transition-colors"
            >
              SLA Jalan Rusak
            </button>
            <button
              onClick={() =>
                handleSend('Bagaimana cara mengecek keaslian transaksi bansos di buku besar blockchain?')
              }
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap shrink-0 transition-colors"
            >
              Audit Bansos Beras
            </button>
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 sm:p-4 bg-slate-850 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tanyakan status aduan (misal ADU-2026-0811), prosedur NIB, bansos, atau regulasi anti-pungli..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isSubmitting}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50"
              id="input-tanya-amanahgov"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isSubmitting}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
              id="btn-kirim-pertanyaan"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Tanya</span>
            </button>
          </form>
        </div>

        {/* Right Column: Direct Aduan Lookup & Knowledge Reference Cards (5 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 1: Direct Status Aduan Lookup */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                Lacak Status Pengaduan Warga
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Otomatis
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pilih salah satu tiket aduan aktif di bawah untuk menanyakan status dan estimasi selesai kepada AI:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {complaints.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() =>
                    handleSend(
                      `Bagaimana status terkini dari nomor aduan ${c.id} ("${c.title}") dan apa tindak lanjut berikutnya?`
                    )
                  }
                  className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-emerald-400 group-hover:underline">
                      {c.id}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-white">
                    {c.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{c.assignedDepartment}</span>
                    <span className="text-emerald-400 font-mono">{c.elapsedHours}j / {c.slaTargetHours}j</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Knowledge Pills Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                Panduan Prosedur &amp; Regulasi
              </h3>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setSelectedTopic('semua')}
                  className={`px-2 py-0.5 rounded ${
                    selectedTopic === 'semua'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setSelectedTopic('prosedur')}
                  className={`px-2 py-0.5 rounded ${
                    selectedTopic === 'prosedur'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Prosedur
                </button>
                <button
                  onClick={() => setSelectedTopic('regulasi')}
                  className={`px-2 py-0.5 rounded ${
                    selectedTopic === 'regulasi'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Regulasi
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {filteredPills.map((pill, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSend(pill.query)}
                  className="w-full text-left p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 group-hover:scale-105 transition-transform shrink-0">
                    {pill.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                      <span>{pill.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {pill.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Standar Waktu SLA & Maklumat Layanan */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Standar Waktu Penyelesaian (SLA)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/40 border border-rose-800/40">
                <span className="text-rose-300 font-semibold">Darurat (Ancaman Jiwa)</span>
                <span className="font-mono text-rose-200 font-bold">&le; 8 Jam (TRC &lt; 2j)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/40 border border-amber-800/40">
                <span className="text-amber-300 font-semibold">Tinggi (Arteri &amp; Faskes)</span>
                <span className="font-mono text-amber-200 font-bold">&le; 24 Jam</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-sky-950/40 border border-sky-800/40">
                <span className="text-sky-300 font-semibold">Sedang (Fasilitas Lingkungan)</span>
                <span className="font-mono text-sky-200 font-bold">24 - 48 Jam</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-700">
                <span className="text-slate-300 font-semibold">Rendah / Administrasi</span>
                <span className="font-mono text-slate-200 font-bold">&le; 48 Jam</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Sesuai Pasal 15 UU No. 25/2009, keterlambatan tanpa alasan sah akan memicu audit internal inspektorat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
