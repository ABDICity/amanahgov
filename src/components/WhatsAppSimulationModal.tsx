import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Check,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  ShieldCheck,
  ExternalLink,
  Copy,
  Clock,
  Terminal,
  RefreshCw,
  Sparkles,
  Smartphone,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { WhatsAppMessage, Complaint } from '../types';
import {
  subscribeToWhatsAppMessages,
  sendTestWhatsApp,
  getAllDispatchedWhatsApp,
} from '../services/whatsappService';

interface WhatsAppSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetComplaintId?: string | null;
  complaints?: Complaint[];
  onOpenComplaintDetail?: (complaintId: string) => void;
}

export const WhatsAppSimulationModal: React.FC<WhatsAppSimulationModalProps> = ({
  isOpen,
  onClose,
  targetComplaintId,
  complaints = [],
  onOpenComplaintDetail,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<WhatsAppMessage[]>(getAllDispatchedWhatsApp());
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'api-payload' | 'test-send'>('chat');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Test form state
  const [testPhone, setTestPhone] = useState('+62 812-3456-7890');
  const [testName, setTestName] = useState('Ahmad Faisal');
  const [testText, setTestText] = useState(
    'Assalamu\'alaikum! Ini adalah uji coba notifikasi WhatsApp otomatis dari sistem AmanahGov Islamicity Smart City. Prinsip Tabligh menjamin Anda menerima info aduan tanpa perlu membuka aplikasi.'
  );
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToWhatsAppMessages((updated) => {
      setMessages(updated);
      if (updated.length > 0 && !selectedMessageId) {
        if (targetComplaintId) {
          const match = updated.find((m) => m.complaintId === targetComplaintId);
          setSelectedMessageId(match ? match.id : updated[0].id);
        } else {
          setSelectedMessageId(updated[0].id);
        }
      }
    });
    return () => unsubscribe();
  }, [targetComplaintId, selectedMessageId]);

  // If targetComplaintId changes, pick that message
  useEffect(() => {
    if (targetComplaintId && messages.length > 0) {
      const match = messages.find((m) => m.complaintId === targetComplaintId);
      if (match) setSelectedMessageId(match.id);
    }
  }, [targetComplaintId, messages]);

  const activeMessage = messages.find((m) => m.id === selectedMessageId) || messages[0];

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingTest(true);
    try {
      const created = await sendTestWhatsApp(testPhone, testName, testText);
      setSelectedMessageId(created.id);
      setActiveTab('chat');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      id="modal-whatsapp-simulator"
    >
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header bar */}
        <div className="p-4 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  WhatsApp Notification Gateway (Simulasi API)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Meta Cloud API v19.0 Terhubung</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Penyampaian otomatis nilai Tabligh: Warga menerima notifikasi langsung di HP tanpa perlu membuka web
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-950 px-4 pt-3 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
                activeTab === 'chat'
                  ? 'border-emerald-400 text-emerald-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Simulasi Layar WhatsApp Warga ({messages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('api-payload')}
              className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
                activeTab === 'api-payload'
                  ? 'border-emerald-400 text-emerald-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Payload API &amp; Webhook Log</span>
            </button>

            <button
              onClick={() => setActiveTab('test-send')}
              className={`px-3.5 py-2 rounded-t-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
                activeTab === 'test-send'
                  ? 'border-emerald-400 text-emerald-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Kirim Pesan Uji Coba</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Enkripsi End-to-End &amp; Zero-Risywah</span>
          </div>
        </div>

        {/* Tab 1: Interactive WhatsApp Smartphone Mockup */}
        {activeTab === 'chat' && (
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
            {/* Sidebar list of all dispatched messages */}
            <div className="md:col-span-4 bg-slate-950 border-r border-slate-800 flex flex-col overflow-y-auto max-h-[500px]">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Daftar Pesan Keluar ({messages.length})</span>
                <span className="text-[10px] text-emerald-400">Status Otomatis</span>
              </div>

              <div className="divide-y divide-slate-800/60">
                {messages.map((m) => {
                  const isSelected = m.id === activeMessage?.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMessageId(m.id)}
                      className={`w-full text-left p-3 transition-colors cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-slate-800/80 border-l-4 border-emerald-400'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {m.recipientName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200 truncate">
                            {m.recipientName}
                          </span>
                          <span className="text-[10px] text-slate-500">{m.sentAt.split(',')[1]?.trim() || m.sentAt}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono truncate">
                          {m.recipientPhone}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-emerald-400 font-medium truncate max-w-[140px]">
                            #{m.complaintId}
                          </span>
                          <span className="text-[10px] flex items-center gap-0.5 text-sky-400 font-mono">
                            {m.deliveryStatus === 'READ' ? (
                              <>
                                <CheckCheck className="w-3 h-3 text-sky-400" />
                                <span>Dibaca</span>
                              </>
                            ) : m.deliveryStatus === 'DELIVERED' ? (
                              <>
                                <CheckCheck className="w-3 h-3 text-slate-400" />
                                <span>Terkirim</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3 text-slate-400" />
                                <span>Sent</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Phone Chat Viewer */}
            <div className="md:col-span-8 bg-slate-900 flex flex-col justify-between overflow-hidden">
              {activeMessage ? (
                <>
                  {/* WhatsApp Custom Header */}
                  <div className="bg-[#1f2c34] px-4 py-3 border-b border-slate-700 flex items-center justify-between text-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow">
                        <ShieldCheck className="w-5 h-5 text-emerald-200" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-white">
                            AmanahGov Official
                          </span>
                          <span className="inline-flex items-center text-[9px] bg-emerald-500/30 text-emerald-300 font-semibold px-1.5 py-0.2 rounded border border-emerald-400/40">
                            Terverifikasi ✓
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-none">
                          Kanal Notifikasi Warga Resmi • Online
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-300">
                      <span className="text-[10px] font-mono text-emerald-400 hidden sm:inline">
                        Penerima: {activeMessage.recipientPhone}
                      </span>
                      <button
                        onClick={() => handleCopyText(activeMessage.messageBody, activeMessage.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
                        title="Salin Teks WhatsApp"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {copiedId === activeMessage.id ? 'Tersalin!' : 'Salin'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Chat Wallpaper & Message Body */}
                  <div
                    className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#0b141a]"
                    style={{
                      backgroundImage:
                        'radial-gradient(#1f2c34 1px, transparent 1px), radial-gradient(#1f2c34 1px, #0b141a 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  >
                    {/* Timestamp Center Pill */}
                    <div className="text-center">
                      <span className="px-3 py-1 rounded-lg bg-[#182229] text-slate-400 text-[10px] font-medium shadow-xs border border-slate-800">
                        {activeMessage.sentAt}
                      </span>
                    </div>

                    {/* Official Message Bubble (WhatsApp Received Message) */}
                    <div className="max-w-xl mx-auto bg-[#005c4b] text-slate-100 rounded-2xl rounded-tl-xs p-4 shadow-lg border border-emerald-700/40 relative space-y-3">
                      {/* Department & Verification Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-600/40 text-[11px]">
                        <span className="font-bold text-emerald-200">
                          {activeMessage.department}
                        </span>
                        <span className="text-emerald-300/80 font-mono text-[10px]">
                          ID: #{activeMessage.complaintId}
                        </span>
                      </div>

                      {/* Formatted Text Message */}
                      <div className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-line text-slate-100 font-sans">
                        {activeMessage.messageBody}
                      </div>

                      {/* Action buttons inside WhatsApp message (WhatsApp Interactive Template Buttons) */}
                      <div className="pt-2 border-t border-emerald-600/40 space-y-1.5">
                        {onOpenComplaintDetail && (
                          <button
                            onClick={() => {
                              onOpenComplaintDetail(activeMessage.complaintId);
                              onClose();
                            }}
                            className="w-full py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Lihat Detail &amp; Lacak di Aplikasi</span>
                          </button>
                        )}

                        <a
                          href={`https://api.whatsapp.com/send?phone=${activeMessage.recipientPhone.replace(
                            /\D/g,
                            ''
                          )}&text=${encodeURIComponent(
                            `Halo Petugas AmanahGov, saya ingin menanyakan status laporan #${activeMessage.complaintId}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Hubungi Call Center / WhatsApp Warga</span>
                        </a>
                      </div>

                      {/* Bubble Footer with double blue check */}
                      <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/90 pt-1">
                        <span>{activeMessage.sentAt.split(',')[1]?.trim() || 'Baru saja'}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Mock Input Bar */}
                  <div className="bg-[#1f2c34] px-4 py-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>
                        Simulasi Notifikasi Aktif. Penerima:{' '}
                        <strong className="text-slate-200">{activeMessage.recipientName}</strong> (
                        {activeMessage.recipientPhone})
                      </span>
                    </span>

                    <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                      Meta Cloud API v19.0 (Simulasi)
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                  Pilih pesan dari daftar di samping untuk melihat simulasi tampilan chat.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: API Payload & Raw Webhook Log */}
        {activeTab === 'api-payload' && activeMessage && (
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                HTTP Request Payload (Kirim Pesan WhatsApp Template)
              </span>
              <span className="text-emerald-400 text-[11px]">
                POST https://graph.facebook.com/v19.0/1098481238912/messages
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 overflow-x-auto">
              <pre className="text-[11px] leading-relaxed">
                {JSON.stringify(
                  {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: activeMessage.recipientPhone.replace(/\D/g, ''),
                    type: 'template',
                    template: {
                      name: activeMessage.templateName,
                      language: { code: 'id' },
                      components: [
                        {
                          type: 'header',
                          parameters: [
                            { type: 'text', text: `AmanahGov #${activeMessage.complaintId}` },
                          ],
                        },
                        {
                          type: 'body',
                          parameters: [
                            { type: 'text', text: activeMessage.recipientName },
                            { type: 'text', text: activeMessage.complaintTitle },
                            { type: 'text', text: activeMessage.statusLabel },
                            { type: 'text', text: activeMessage.department },
                            { type: 'text', text: activeMessage.officerName },
                          ],
                        },
                        {
                          type: 'button',
                          sub_type: 'url',
                          index: '0',
                          parameters: [
                            { type: 'text', text: activeMessage.complaintId },
                          ],
                        },
                      ],
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">
                HTTP Response dari Meta WhatsApp Cloud Gateway (Status: 200 OK)
              </span>
              <span className="text-sky-400 text-[11px]">Duration: ~180ms</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 overflow-x-auto">
              <pre className="text-[11px] leading-relaxed">
                {JSON.stringify(activeMessage.rawApiResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Test Send Custom Message Form */}
        {activeTab === 'test-send' && (
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-slate-950">
            <form
              onSubmit={handleSendTestMessage}
              className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Send className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-white text-sm">
                  Uji Kirim Pesan WhatsApp Gateway Langsung
                </h4>
              </div>

              <p className="text-slate-400 text-[11px] leading-relaxed">
                Ketikkan nomor telepon dan nama warga untuk menguji simulasi pengiriman pesan seketika ke modul WhatsApp.
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nomor WhatsApp Penerima <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+62 812-xxxx-xxxx"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nama Warga Pemohon <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Contoh: Bpk. Ridwan"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Isi Pesan Notifikasi WhatsApp <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingTest ? 'Mengirim...' : 'Kirim Pesan Uji Coba'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal Bottom Footer */}
        <div className="p-3 bg-slate-800/90 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              Layanan ini beroperasi di bawah prinsip <strong>Tabligh</strong> (Penyampaian Transparan &amp; Tepat Waktu).
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Total {messages.length} notifikasi WhatsApp tercatat
          </span>
        </div>
      </div>
    </div>
  );
};
