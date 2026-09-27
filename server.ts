import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Fallback smart rule-based answer generator for public services & regulations
function generateKnowledgeFallback(message: string, context?: any): {
  answer: string;
  sources: string[];
  category: string;
  suggestedQuestions: string[];
} {
  const lower = message.toLowerCase();

  // 1. Cek Aduan spesifik (misal ADU-2026-0811, 0812, 0813, dst)
  const aduMatch = message.match(/ADU-2026-\d{4}/i);
  if (aduMatch || lower.includes('status aduan') || lower.includes('cek aduan') || lower.includes('tiket')) {
    const complaintId = aduMatch ? aduMatch[0].toUpperCase() : 'ADU-2026-0811';
    return {
      answer: `**Hasil Pelacakan Status Otomatis AmanahGov**\n\n📌 **ID Pengaduan:** \`${complaintId}\`\n\n- **Status Terkini:** *Pengerjaan Khidmat (On Progress)*\n- **Tingkat Urgensi:** Darurat (Prioritas #1 Tim Reaksi Cepat)\n- **Instansi Penanggung Jawab:** Dinas Bina Marga & Penataan Ruang\n- **Target SLA:** Maksimal 8 Jam (Sisa waktu aman sesuai standar: ~4 jam)\n- **Integritas Rantai:** Hash transaksi tervalidasi pada Blok #3 Konsensus.\n\n**Alur Prosedur Selanjutnya:**\n1. Tim teknis menyelesaikan perbaikan di titik koordinat lapangan.\n2. Inspektorat melakukan validasi foto bukti fisik (*Audit Validasi*).\n3. Pelapor menerima notifikasi verifikasi penutupan aduan (*Selesai Teruji*).`,
      sources: [
        'SOP Penanganan Aduan Darurat No. 14/BinaMarga/2026',
        'Buku Besar Transaksi On-Chain AmanahGov Blok #3',
        'UU No. 25 Tahun 2009 tentang Pelayanan Publik (Pasal 15)',
      ],
      category: 'Status Pengaduan',
      suggestedQuestions: [
        'Berapa lama batas waktu (SLA) untuk aduan darurat?',
        'Bagaimana cara saya memberi ulasan kepuasan setelah aduan selesai?',
        'Apa yang terjadi jika petugas melewati batas waktu SLA?',
      ],
    };
  }

  // 2. Izin Usaha / NIB UMKM
  if (lower.includes('nib') || lower.includes('umkm') || lower.includes('izin usaha') || lower.includes('oss')) {
    return {
      answer: `**Prosedur Resmi Pembuatan NIB UMKM (100% Gratis / Rp 0)**\n\nMeneladani anjuran Rasulullah SAW untuk mempermudah para pedagang yang jujur, seluruh proses perizinan usaha mikro dan kecil dijamin tanpa calo dan tanpa pungutan:\n\n1. **Persyaratan Dokumen:**\n   - Nomor Induk Kependudukan (NIK KTP Elektronik).\n   - Nomor Pokok Wajib Pajak (NPWP) jika ada (opsional untuk mikro).\n   - Data bidang usaha (KBLI) dan perkiraan modal kerja.\n2. **Alur Pelayanan Digital:**\n   - Akses loket digital AmanahGov atau portal OSS Terpadu.\n   - Isi formulir identitas usaha dan verifikasi biometrik.\n   - NIB langsung terbit dalam hitungan menit secara otomatis tanpa tatap muka.\n3. **Ketentuan Biaya & Anti-Pungli:**\n   - Tarif resmi: **Rp 0,- (GRATIS)**.\n   - Dilarang keras memberikan amplop/uang ucapan terima kasih kepada oknum petugas loket. Seluruh transaksi terekam di buku besar publik.`,
      sources: [
        'UU No. 6 Tahun 2023 tentang Penetapan Perppu Cipta Kerja',
        'PP No. 5 Tahun 2021 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko',
        'Maklumat Pelayanan Terpadu Satu Pintu (DPMPTSP) Bebas Pungli',
      ],
      category: 'Prosedur Perizinan',
      suggestedQuestions: [
        'Apakah NIB otomatis berlaku sebagai sertifikat halal mikro?',
        'Bagaimana cara lapor jika ada oknum meminta uang administrasi NIB?',
        'Berapa lama masa berlaku NIB bagi pelaku usaha perorangan?',
      ],
    };
  }

  // 3. Pungli / Suap / Risywah & Regulasi
  if (lower.includes('pungli') || lower.includes('suap') || lower.includes('pelicin') || lower.includes('sanksi') || lower.includes('risywah') || lower.includes('lapor petugas')) {
    return {
      answer: `**Regulasi & Ketegasan Hukum Terhadap Pungli / Suap (Risywah)**\n\nDalam prinsip tata kelola kenabian, Rasulullah SAW menegaskan:\n> *“Ar-rasyi wal murtasyi fi an-nar”* (Penyuap dan penerima suap tempatnya di neraka — HR. Tirmidzi).\n\n**Landasan Hukum & Regulasi Negara:**\n- **UU No. 20 Tahun 2001** jo. **UU No. 31 Tahun 1999** tentang Pemberantasan Tindak Pidana Korupsi (ancaman pidana penjara minimal 4 tahun bagi pemberi dan penerima gratifikasi ilegal).\n- **Perpres No. 87 Tahun 2016** tentang Satuan Tugas Sapu Bersih Pungutan Liar (Saber Pungli).\n\n**Mekanisme Perlindungan Whistleblower AmanahGov:**\n1. Identitas pelapor (NIK & Nama) otomatis disamarkan secara kriptografis (*Zero-Knowledge Privacy*).\n2. Setiap laporan pungli otomatis membekukan hak otorisasi oknum yang dilaporkan untuk pemeriksaan tim inspektorat internal.\n3. Warga yang melaporkan pungli dilindungi dari segala bentuk intimidasi dan diskriminasi pelayanan.`,
      sources: [
        'Hadits Riwayat At-Tirmidzi No. 1337 (Hukum Risywah)',
        'UU No. 31 Tahun 1999 jo. UU No. 20 Tahun 2001 tentang Tipikor',
        'Perpres No. 87 Tahun 2016 tentang Satgas Saber Pungli',
      ],
      category: 'Regulasi & Integritas',
      suggestedQuestions: [
        'Bagaimana cara mengunggah bukti rekaman pungli secara rahasia?',
        'Berapa lama batas waktu penanganan investigasi oknum pungli?',
        'Apakah pelapor pungli berhak mendapatkan perlindungan LPSK?',
      ],
    };
  }

  // 4. Bansos & Beras / Bantuan Sosial
  if (lower.includes('bansos') || lower.includes('bantuan') || lower.includes('beras') || lower.includes('penerima')) {
    return {
      answer: `**Prosedur & Regulasi Transparansi Bantuan Sosial (Bansos) AmanahGov**\n\nMeneladani keteladanan Khalifah Umar bin Khattab dan Rasulullah SAW dalam mengelola Baitul Mal secara adil dan tepat sasaran:\n\n1. **Kriteria Penerima:**\n   - Terdaftar resmi dalam Data Tunggal Sosial Terpadu (DTST) berbasis desil kemiskinan valid.\n   - Diverifikasi lapangan melalui musyawarah kelurahan transparan (*Prinsip Shiddiq*).\n2. **Jaminan Anti-Potongan (Anti-Sunat):**\n   - Setiap bantuan disalurkan dengan tanda terima digital berbasis kode unik/QR biometric.\n   - Transaksi terdaftar di Buku Transparansi Blockchain (nominal bantuan tidak dapat dimanipulasi oleh siapapun).\n   - Dilarang keras adanya potongan biaya admin, uang kas lingkungan, atau pungutan sukarela semu.\n3. **Hak Warga:**\n   - Jika Anda berhak namun tidak menerima, Anda dapat mengajukan aduan kategori *Bansos & Bantuan Sosial* dengan melampirkan foto KK dan surat keterangan RT/RW.`,
      sources: [
        'Permensos No. 3 Tahun 2021 tentang Pengelolaan Data Terpadu Kesejahteraan Sosial',
        'Buku Besar Transaksi Publik AmanahGov (Bansos Beras & BLT)',
        'Pedoman Akuntabilitas Baitul Mal Kenabian',
      ],
      category: 'Prosedur Bansos',
      suggestedQuestions: [
        'Bagaimana cara mendaftar jika belum masuk DTST bansos?',
        'Berapa kuota beras bansos yang berhak diterima per kepala keluarga?',
        'Di mana saya bisa melihat riwayat transaksi penyaluran bansos di wilayah saya?',
      ],
    };
  }

  // 5. Jalan Rusak / Infrastruktur
  if (lower.includes('jalan') || lower.includes('lubang') || lower.includes('jembatan') || lower.includes('lampu jalan') || lower.includes('aspal')) {
    return {
      answer: `**Prosedur Pelaporan & Standar Penanganan Infrastruktur Jalan**\n\n1. **Tata Cara Pengajuan Aduan:**\n   - Klik tombol **Buat Pengaduan** di dashboard AmanahGov.\n   - Pilih Kategori **Infrastruktur Jalan**.\n   - Tentukan tingkat urgensi: pilih **Darurat** jika membahayakan keselamatan pengendara (misal: lubang amblas dalam/rawan kecelakaan) atau **Tinggi** untuk jalan arteri utama.\n   - Sertakan foto kondisi fisik dan pin lokasi GPS.\n2. **Standar Waktu Penanganan (SLA):**\n   - **Darurat:** Tim Reaksi Cepat (TRC) memasang rambu keselamatan dalam < 2 jam, dan penambalan/perbaikan permanen maks 8 jam.\n   - **Tinggi/Sedang:** Perbaikan dijadwalkan dalam 24-48 jam kerja.\n3. **Jaminan Anggaran:** Seluruh biaya operasional pengerjaan ditanggung APBD melalui kontrak kinerja yang terekam pada transparansi anggaran.`,
      sources: [
        'UU No. 22 Tahun 2009 tentang Lalu Lintas dan Angkutan Jalan (Pasal 24)',
        'SOP Tim Reaksi Cepat (TRC) Dinas Bina Marga',
        'Standar Pelayanan Minimal (SPM) Pekerjaan Umum',
      ],
      category: 'Prosedur Infrastruktur',
      suggestedQuestions: [
        'Apa dasar hukum penuntutan jika terjadi kecelakaan akibat jalan rusak?',
        'Bagaimana cara memantau pergerakan tim penambal jalan di peta?',
        'Siapa yang bertanggung jawab jika jalan yang rusak berstatus jalan provinsi/nasional?',
      ],
    };
  }

  // 6. Default general answer
  return {
    answer: `**Layanan Informasi & Konsultasi Cerdas Tanya AmanahGov**\n\nTerima kasih telah berkonsultasi. AmanahGov mengintegrasikan 4 pilar kepemimpinan Rasulullah SAW:\n\n- **Shiddiq (Kejujuran):** Semua data aduan, identitas pelapor, dan dokumen fisik diverifikasi tanpa rekayasa.\n- **Amanah (Akuntabilitas):** Setiap sen uang rakyat dan setiap detik pengerjaan dicatat dalam buku besar blockchain anti-manipulasi.\n- **Tabligh (Keterbukaan):** Warga berhak memperoleh transparansi status, estimasi SLA, dan dokumen keputusan secara terbuka.\n- **Fathanah (Kecerdasan):** Proses birokrasi disederhanakan secara digital dengan otomatisasi tanggap darurat.\n\nSilakan tanyakan hal-hal spesifik mengenai:\n1. Status aduan Anda (sebutkan ID Tiket misal \`ADU-2026-0811\`).\n2. Prosedur pembuatan NIB, perbaikan jalan, atau bansos.\n3. Regulasi hak warga dan pelaporan pungutan liar.`,
    sources: [
      'UU No. 25 Tahun 2009 tentang Pelayanan Publik',
      'Nilai Kepemimpinan Kenabian (Shiddiq, Amanah, Tabligh, Fathanah)',
      'Standar Operasional Prosedur (SOP) Terpadu AmanahGov 2026',
    ],
    category: 'Konsultasi Umum',
    suggestedQuestions: [
      'Bagaimana cara melacak aduan ADU-2026-0811?',
      'Berapa biaya pengurusan dokumen perizinan UMKM?',
      'Apa sanksi bagi oknum yang terbukti melakukan pungutan liar?',
    ],
  };
}

// POST /api/tanya-amanahgov
app.post('/api/tanya-amanahgov', async (req, res) => {
  try {
    const { message, history, context } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({ error: 'Pesan pertanyaan tidak boleh kosong.' });
      return;
    }

    const ai = getGenAI();

    // If Gemini client is not configured, safely return smart knowledge base answer
    if (!ai) {
      const fallback = generateKnowledgeFallback(message, context);
      res.json({
        ...fallback,
        mode: 'knowledge_engine',
        model: 'AmanahGov Internal Knowledge Engine',
      });
      return;
    }

    // Build rich context for Gemini 3.8 Flash
    const systemInstruction = `Anda adalah "Tanya AmanahGov AI", asisten kecerdasan buatan resmi pemerintah yang bertugas menjawab pertanyaan warga masyarakat secara otomatis, akurat, santun, solutif, dan berwibawa berlandaskan nilai kepemimpinan Rasulullah SAW (Shiddiq/Jujur, Amanah/Akuntabel, Tabligh/Terbuka, Fathanah/Cerdas & Cepat).

Cakupan Tugas Utama:
1. Status & Prosedur Layanan Publik:
   - Menjelaskan tata cara dan alur layanan publik (pembuatan NIB UMKM Rp 0, pelaporan jalan rusak, verifikasi bantuan sosial/bansos beras, pengaduan puskesmas, administrasi kependudukan).
   - Menjelaskan tahapan penanganan aduan (Diajukan -> Diverifikasi Shiddiq -> Disposisi Amanah -> Pengerjaan Khidmat -> Audit Validasi -> Selesai Teruji).
   - Menjelaskan SLA (Service Level Agreement): Darurat (maks 8 jam, TRC < 2 jam), Tinggi (maks 24 jam), Sedang (maks 24-48 jam), Rendah (maks 48 jam).

2. Regulasi & Integritas Publik:
   - Merujuk pada UU No. 25 Tahun 2009 tentang Pelayanan Publik (hak warga atas kepastian waktu, transparansi biaya, dan ganti rugi).
   - Ketegasan terhadap suap & pungli (Risywah): Merujuk hadits Nabi SAW "Ar-rasyi wal murtasyi fi an-nar" dan Perpres No. 87 Tahun 2016 tentang Saber Pungli.
   - Perlindungan data pelapor (Whistleblower Protection): NIK disamarkan kriptografis, pelapor dilindungi kerahasiaannya.

3. Pengecekan Aduan Real-Time:
   - Jika warga menyebutkan nomor tiket aduan (misal ADU-2026-0811 atau ID lainnya), berikan penjelasan status penanganan, instansi penanggung jawab, dan estimasi waktu penyelesaian.
   - Contoh data aduan aktif dalam sistem:
     * ADU-2026-0811: Jalan Amblas & Pipa Air Bocor di Jl. Merdeka Barat, status: Pengerjaan Khidmat, urgensi: Darurat, OPD: Dinas Bina Marga, SLA: 8 jam.
     * ADU-2026-0812: Pemotongan Beras Bansos 5kg di Kelurahan Sukamaju, status: Diverifikasi Shiddiq, urgensi: Tinggi, OPD: Dinas Sosial, SLA: 24 jam.
     * ADU-2026-0813: Antrean Obat Puskesmas Lambat di Puskesmas Melati, status: Disposisi Amanah, urgensi: Sedang, OPD: Dinas Kesehatan, SLA: 24 jam.
     * ADU-2026-0814: Pungli Izin Usaha Mikro Rp 150rb di Kantor Camat, status: Audit Validasi, urgensi: Darurat, OPD: Inspektorat Daerah, SLA: 8 jam.
     * ADU-2026-0815: Pelayanan KTP Elektronik Tertunda di Dukcapil, status: Selesai Teruji, urgensi: Rendah, OPD: Disdukcapil, SLA: 48 jam.

Format Jawaban:
- Gunakan Bahasa Indonesia yang lugas, ramah, dan tertata rapi dengan markdown (bullet points, bold highlights).
- Berikan dasar hukum/regulasi dan kepastian biaya (misal Rp 0 tanpa calo).
- Selipkan 2-3 butir rekomendasi langkah praktis untuk warga.`;

    // Format chat history if any
    let contents: any[] = [];
    if (history && Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-6)) {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
        topP: 0.9,
      },
    });

    const answerText = response.text || '';

    // Extract dynamic follow-up suggestions
    const fallbackData = generateKnowledgeFallback(message, context);

    res.json({
      answer: answerText.trim() || fallbackData.answer,
      sources: fallbackData.sources,
      category: fallbackData.category,
      suggestedQuestions: fallbackData.suggestedQuestions,
      mode: 'gemini_ai',
      model: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error handling /api/tanya-amanahgov:', error);
    // Graceful fallback to avoid leaving user hanging
    const fallback = generateKnowledgeFallback(req.body?.message || '', req.body?.context);
    res.json({
      ...fallback,
      mode: 'knowledge_engine_fallback',
      model: 'AmanahGov Internal Knowledge Engine (Safe Fallback)',
    });
  }
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AmanahGov Platform API',
    aiModel: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AmanahGov Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
