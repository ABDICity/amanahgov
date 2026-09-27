import { Complaint, ComplaintStatus, WhatsAppMessage, WhatsAppGatewayConfig } from '../types';

export const DEFAULT_WHATSAPP_CONFIG: WhatsAppGatewayConfig = {
  isEnabled: true,
  provider: 'Meta Cloud API (Simulasi)',
  senderNumber: '+62 811-9920-2026',
  businessName: 'AmanahGov Official (Pemerintah Kota Virtual Islamicity)',
  verifiedBadge: true,
  autoSendOnStatusChange: true,
};

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  Diajukan: 'Baru Diajukan (Tercatat di Ledger)',
  Diverifikasi_Shiddiq: 'Diverifikasi Shiddiq (Validasi Lapangan)',
  Disposisi_Amanah: 'Disposisi Amanah (Surat Tugas Diterbitkan)',
  Pengerjaan_Khidmat: 'Pengerjaan Khidmat (Tim Berada di Lokasi)',
  Audit_Validasi: 'Audit Validasi (Pemeriksaan Kualitas Hasil)',
  Selesai_Teruji: 'Selesai Teruji (Tuntas 100% On-Chain)',
};

// Seed initial dispatched messages for demonstration
const INITIAL_MESSAGES: WhatsAppMessage[] = [
  {
    id: 'wamid-init-01',
    recipientPhone: '+62 812-8821-0414',
    recipientName: 'Ahmad Faisal Rahman',
    complaintId: 'ADU-2026-0811',
    complaintTitle: 'Lubang Jalan Parah di Jl. Ahmad Dahlan KM 4 Menuju Pasar Induk',
    status: 'Pengerjaan_Khidmat',
    statusLabel: 'Pengerjaan Khidmat (Tim Berada di Lokasi)',
    messageBody: `*Assalamu'alaikum Wr. Wb.* Yth. Bpk/Ibu *Ahmad Faisal Rahman*,\n\nPemberitahuan resmi perkembangan pengaduan Anda di *AmanahGov Islamicity Smart City*:\n\n📋 *ID Aduan:* #ADU-2026-0811\n📍 *Judul:* Lubang Jalan Parah di Jl. Ahmad Dahlan KM 4 Menuju Pasar Induk\n🏢 *OPD Pelaksana:* Dinas Pekerjaan Umum & Tata Ruang\n👤 *Petugas Lapangan:* Ir. Hendra Gunawan, S.T.\n\n🔄 *STATUS TERKINI:* *Pengerjaan Khidmat (Tim Berada di Lokasi)*\n📝 *Catatan:* Pekerjaan penambalan dan perataan hotmix sedang berlangsung, arus lalu lintas diatur bersama warga.\n⏳ *Sisa SLA:* ~8 Jam Tersisa\n\n🔗 *Verifikasi Audit Blockchain:* \nhttps://amanahgov.islamicity.id/tx/0x7e29a9b3f46e59178e23f03b516886e92751df3ac8919cf62a4fa9bf3e41416e\n\n_Pemberitahuan otomatis ini menerapkan nilai Tabligh (Transparansi Cepat). Anda tidak perlu membuka aplikasi secara berkala._`,
    sentAt: '08 Sep 2026, 14:30 WIB',
    deliveryStatus: 'READ',
    templateName: 'amanahgov_progress_update',
    officerName: 'Ir. Hendra Gunawan, S.T.',
    department: 'Dinas Pekerjaan Umum & Tata Ruang',
    trackingUrl: 'https://amanahgov.islamicity.id/lacak/ADU-2026-0811',
    txHash: '0x7e29a9b3f46e59178e23f03b516886e92751df3ac8919cf62a4fa9bf3e41416e',
    apiProvider: 'Meta Cloud API (Simulasi)',
    rawApiResponse: {
      messaging_product: 'whatsapp',
      contacts: [{ input: '6281288210414', wa_id: '6281288210414' }],
      messages: [{ id: 'wamid.HBgMNjI4MTI4ODIxMDQxNBUCABEYEjExQzQxOEY2NUI0OUM0QzY5QQA=' }],
      http_status: 200,
      processing_time_ms: 184,
    },
  },
  {
    id: 'wamid-init-02',
    recipientPhone: '+62 856-9124-7809',
    recipientName: 'Siti Maryam Nurul',
    complaintId: 'ADU-2026-0812',
    complaintTitle: 'Penyaluran Beras Bantuan Pangan Belum Diterima Warga Difabel RT 02',
    status: 'Selesai_Teruji',
    statusLabel: 'Selesai Teruji (Tuntas 100% On-Chain)',
    messageBody: `*Assalamu'alaikum Wr. Wb.* Yth. Ibu *Siti Maryam Nurul*,\n\nAlhamdulillah, pengaduan khidmat sosial Anda telah dinyatakan *SELESAI 100%*:\n\n📋 *ID Aduan:* #ADU-2026-0812\n📍 *Judul:* Penyaluran Beras Bantuan Pangan Belum Diterima Warga Difabel RT 02\n🏢 *OPD:* Dinas Sosial & Khidmat Dhuafa\n👤 *Khadim Pelaksana:* Ust. Zulkifli Rahman, M.Si.\n\n🔄 *STATUS TERKINI:* *Selesai Teruji (Tuntas 100% On-Chain)*\n📝 *Catatan:* Paket bantuan beras dan santunan khusus lansia telah diserahkan langsung ke Ibu Salmah dengan berita acara digital.\n\n⭐ *Mohon Penilaian Anda:* Balas pesan ini dengan angka 1-5 untuk mengevaluasi kejujuran dan kecepatan pelayanan kami.\n\n_Sistem Layanan AmanahGov Kota Virtual Islamicity._`,
    sentAt: '08 Sep 2026, 16:45 WIB',
    deliveryStatus: 'READ',
    templateName: 'amanahgov_resolution_complete',
    officerName: 'Ust. Zulkifli Rahman, M.Si.',
    department: 'Dinas Sosial & Khidmat Dhuafa',
    trackingUrl: 'https://amanahgov.islamicity.id/lacak/ADU-2026-0812',
    txHash: '0x4c81a2f64e29b6348123ef382103f5ad84c172905187e5b618cf6741b0178e24',
    apiProvider: 'Meta Cloud API (Simulasi)',
    rawApiResponse: {
      messaging_product: 'whatsapp',
      contacts: [{ input: '6285691247809', wa_id: '6285691247809' }],
      messages: [{ id: 'wamid.HBgMNjI4NTY5MTI0NzgwORUCABEYEjRCMkQ4OTU2MzQ3N0Y2M0FGRAA=' }],
      http_status: 200,
      processing_time_ms: 212,
    },
  },
];

// In-memory store of WhatsApp messages
let dispatchedMessages: WhatsAppMessage[] = [...INITIAL_MESSAGES];
const listeners: Array<(messages: WhatsAppMessage[]) => void> = [];

export function subscribeToWhatsAppMessages(listener: (messages: WhatsAppMessage[]) => void): () => void {
  listeners.push(listener);
  listener([...dispatchedMessages]);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  const snapshot = [...dispatchedMessages];
  listeners.forEach((l) => l(snapshot));
}

/**
 * Generates formatted WhatsApp message body following standard civic notification
 */
export function formatWhatsAppMessageBody(
  complaint: Complaint,
  nextStatus: ComplaintStatus,
  customNote?: string
): string {
  const statusLabel = STATUS_LABELS[nextStatus] || nextStatus.replace('_', ' ');
  const remainingSla = Math.max(0, complaint.slaTargetHours - (complaint.elapsedHours || 0));

  let note = customNote;
  if (!note) {
    if (nextStatus === 'Diverifikasi_Shiddiq') {
      note = 'Data lapangan dan bukti digital tervalidasi jujur sesuai prinsip Shiddiq tanpa rekayasa.';
    } else if (nextStatus === 'Disposisi_Amanah') {
      note = 'Surat tugas diterbitkan, petugas lapangan ditugaskan dengan komitmen penuh integritas.';
    } else if (nextStatus === 'Pengerjaan_Khidmat') {
      note = 'Tim reaksi cepat instansi sedang mengeksekusi penanganan fisik/administratif di lokasi.';
    } else if (nextStatus === 'Audit_Validasi') {
      note = 'Pekerjaan teknis tuntas, tim inspektorat sedang mengaudit kualitas dan kesesuaian standar.';
    } else if (nextStatus === 'Selesai_Teruji') {
      note = 'Alhamdulillah, penanganan aduan tuntas 100%! Data hasil akhir tersimpan permanen di blockchain publik.';
    } else {
      note = 'Laporan Anda telah terdaftar dan terenkripsi dalam sistem pengaduan terpadu.';
    }
  }

  return `*Assalamu'alaikum Wr. Wb.* Yth. Bpk/Ibu *${complaint.citizenName}*,\n\nPemberitahuan resmi pembaruan progres pengaduan Anda melalui *AmanahGov WhatsApp Gateway*:\n\n📋 *ID Aduan:* #${complaint.id}\n📍 *Perihal:* ${complaint.title}\n🏢 *OPD Penanggung Jawab:* ${complaint.assignedDepartment}\n👤 *Petugas Amanah:* ${complaint.officerName || 'Satgas Pelayanan Publik'}\n\n🔄 *STATUS TERKINI:* *${statusLabel}*\n📝 *Catatan Lapangan:* ${note}\n⏳ *Target Sisa SLA:* ~${remainingSla} Jam\n\n🔗 *Verifikasi Audit Kriptografis (Ledger):*\nhttps://amanahgov.islamicity.id/tx/${complaint.txHash.slice(0, 20)}...\n\n_Pemberitahuan otomatis ini berlandaskan nilai Tabligh (Keterbukaan & Kecepatan Komunikasi). Anda dapat memantau kapan saja tanpa perlu membuka aplikasi terus-menerus._`;
}

/**
 * Simulates WhatsApp Cloud API (Meta API / Wablas / Fonnte)
 */
export async function sendWhatsAppNotification(
  complaint: Complaint,
  nextStatus: ComplaintStatus,
  customNote?: string
): Promise<WhatsAppMessage> {
  const now = new Date();
  const dateFormatted = `${now.getDate().toString().padStart(2, '0')} Sep 2026, ${now
    .getHours()
    .toString()
    .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;

  const statusLabel = STATUS_LABELS[nextStatus] || nextStatus.replace('_', ' ');
  const messageBody = formatWhatsAppMessageBody(complaint, nextStatus, customNote);

  // Derive phone number: if complaint has whatsappNumber use it, else generate standard masked one
  const phone = complaint.whatsappNumber || `+62 812-${Math.floor(1000 + Math.random() * 9000)}-${complaint.id.slice(-4)}`;

  // Generate unique simulated WhatsApp Message ID (wamid)
  const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
  const wamid = `wamid.HBgM${phone.replace(/\D/g, '')}UCABEYE${randomHex}A=`;

  const newMessage: WhatsAppMessage = {
    id: `wa-msg-${Date.now()}`,
    recipientPhone: phone,
    recipientName: complaint.citizenName,
    complaintId: complaint.id,
    complaintTitle: complaint.title,
    status: nextStatus,
    statusLabel,
    messageBody,
    sentAt: dateFormatted,
    deliveryStatus: 'SENT',
    templateName: nextStatus === 'Selesai_Teruji' ? 'amanahgov_resolution_complete' : 'amanahgov_progress_update',
    officerName: complaint.officerName || 'Satgas Pelayanan Amanah',
    department: complaint.assignedDepartment,
    trackingUrl: `https://amanahgov.islamicity.id/lacak/${complaint.id}`,
    txHash: complaint.txHash,
    apiProvider: 'Meta Cloud API (Simulasi)',
    rawApiResponse: {
      messaging_product: 'whatsapp',
      contacts: [{ input: phone.replace(/\D/g, ''), wa_id: phone.replace(/\D/g, '') }],
      messages: [{ id: wamid }],
      http_status: 200,
      processing_time_ms: Math.floor(120 + Math.random() * 150),
    },
  };

  // Prepend to list
  dispatchedMessages = [newMessage, ...dispatchedMessages];
  notifyListeners();

  // Simulate delivery webhook progression: SENT -> DELIVERED (after 1s) -> READ (after 2.5s)
  setTimeout(() => {
    dispatchedMessages = dispatchedMessages.map((m) =>
      m.id === newMessage.id ? { ...m, deliveryStatus: 'DELIVERED' } : m
    );
    notifyListeners();
  }, 1200);

  setTimeout(() => {
    dispatchedMessages = dispatchedMessages.map((m) =>
      m.id === newMessage.id ? { ...m, deliveryStatus: 'READ' } : m
    );
    notifyListeners();
  }, 2800);

  return newMessage;
}

/**
 * Send a custom test message to any custom number
 */
export async function sendTestWhatsApp(
  recipientPhone: string,
  recipientName: string,
  customMessage: string
): Promise<WhatsAppMessage> {
  const now = new Date();
  const dateFormatted = `${now.getDate().toString().padStart(2, '0')} Sep 2026, ${now
    .getHours()
    .toString()
    .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;

  const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
  const wamid = `wamid.HBgM${recipientPhone.replace(/\D/g, '')}UCABEYE${randomHex}A=`;

  const testMsg: WhatsAppMessage = {
    id: `wa-test-${Date.now()}`,
    recipientPhone,
    recipientName,
    complaintId: 'TEST-GATEWAY-2026',
    complaintTitle: 'Uji Konektivitas WhatsApp Gateway AmanahGov',
    status: 'Diajukan',
    statusLabel: 'Uji Coba API Berhasil',
    messageBody: customMessage,
    sentAt: dateFormatted,
    deliveryStatus: 'DELIVERED',
    templateName: 'amanahgov_direct_alert',
    officerName: 'Sistem Uji Gateway',
    department: 'Dinas Komunikasi & Informatika Virtual',
    trackingUrl: 'https://amanahgov.islamicity.id/status',
    apiProvider: 'Meta Cloud API (Simulasi)',
    rawApiResponse: {
      messaging_product: 'whatsapp',
      contacts: [{ input: recipientPhone.replace(/\D/g, ''), wa_id: recipientPhone.replace(/\D/g, '') }],
      messages: [{ id: wamid }],
      http_status: 200,
      processing_time_ms: 140,
    },
  };

  dispatchedMessages = [testMsg, ...dispatchedMessages];
  notifyListeners();
  return testMsg;
}

export function getAllDispatchedWhatsApp(): WhatsAppMessage[] {
  return [...dispatchedMessages];
}
