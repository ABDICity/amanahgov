export interface TanyaMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  category?: string;
  sources?: string[];
  suggestedQuestions?: string[];
  mode?: 'gemini_ai' | 'knowledge_engine' | 'knowledge_engine_fallback';
  model?: string;
}

export interface TanyaResponse {
  answer: string;
  sources: string[];
  category: string;
  suggestedQuestions: string[];
  mode?: 'gemini_ai' | 'knowledge_engine' | 'knowledge_engine_fallback';
  model?: string;
}

export async function askTanyaAmanahGov(
  question: string,
  history: TanyaMessage[] = [],
  context?: any
): Promise<TanyaResponse> {
  try {
    const formattedHistory = history.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text,
    }));

    const response = await fetch('/api/tanya-amanahgov', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: question,
        history: formattedHistory,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    const data: TanyaResponse = await response.json();
    return data;
  } catch (error) {
    console.warn('Gagal menghubungi backend AI, beralih ke fallback cerdas lokal:', error);
    return {
      answer: `**Layanan Prosedur & Regulasi Tanya AmanahGov**\n\nUntuk pertanyaan Anda terkait *"**${question}**"*, berikut ketentuan resmi pemerintah berbasis SOP AmanahGov & UU No. 25/2009:\n\n1. **Kepastian Hak Warga:** Seluruh informasi alur dan biaya publik bersifat transparan, bebas calo, dan tercatat di buku besar digital.\n2. **Kepatuhan Anti-Pungli:** Biaya resmi untuk layanan mikro dan pengaduan adalah **Rp 0 (Gratis)**. Segala permintaan uang pelicin dapat langsung dilaporkan melalui kanal inspektorat.\n3. **Standar SLA:** Pengaduan darurat ditangani maks 8 jam, dan aduan standar diproses 24-48 jam kerja.\n\nSilakan cek status spesifik dengan memasukkan ID tiket aduan (contoh: \`ADU-2026-0811\`) pada kolom pertanyaan.`,
      sources: [
        'UU No. 25 Tahun 2009 tentang Pelayanan Publik',
        'SOP Terpadu Layanan & Pengaduan Warga AmanahGov',
        'Prinsip Shiddiq & Amanah Tata Kelola Pemerintahan',
      ],
      category: 'Prosedur & Regulasi Layanan',
      suggestedQuestions: [
        'Bagaimana melacak status tiket ADU-2026-0811?',
        'Apa saja syarat dan alur pembuatan NIB UMKM Rp 0?',
        'Bagaimana regulasi perlindungan bagi pelapor pungutan liar?',
      ],
      mode: 'knowledge_engine_fallback',
      model: 'AmanahGov Internal Knowledge Engine (Offline Mode)',
    };
  }
}
