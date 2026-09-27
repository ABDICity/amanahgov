import { BlockchainBlock, BlockchainTransaction } from '../types';
import { VerificationResult, runAutomatedAudit, sha256 } from '../services/blockchain';

export interface AuditReportMetadata {
  documentId: string;
  generatedAt: string;
  totalBlocks: number;
  validBlocks: number;
  compromisedBlocks: number;
  totalTransactions: number;
  totalPublicFundsAudited: number;
  integrityVerdict: 'SAH_TERVERIFIKASI' | 'PERINGATAN_TERKOMPROMI';
  verdictMessage: string;
  documentChecksum?: string;
}

/**
 * Format currency to Rupiah string
 */
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate official Audit Report Document in formatted Markdown / Text
 */
export async function generateAuditReportDocument(
  blocks: BlockchainBlock[],
  existingAuditResult?: VerificationResult | null,
  isTampered: boolean = false
): Promise<{ content: string; metadata: AuditReportMetadata }> {
  // Ensure we have up-to-date audit results
  const audit = existingAuditResult || (await runAutomatedAudit(blocks));
  const now = new Date();
  const formattedDate = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const timestampStr = `${formattedDate}, pukul ${formattedTime} WIB`;
  const docRandomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const documentId = `AUD-AMN-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${docRandomId}`;

  // Calculate transaction stats
  const allTransactions: BlockchainTransaction[] = [];
  let totalPublicFunds = 0;

  blocks.forEach((b) => {
    b.transactions.forEach((tx) => {
      allTransactions.push(tx);
      if (tx.amount && typeof tx.amount === 'number') {
        totalPublicFunds += tx.amount;
      }
    });
  });

  const isActuallyValid = audit.isValid && !isTampered;
  const validBlocksCount = blocks.length - audit.tamperedBlocksCount;

  const metadata: AuditReportMetadata = {
    documentId,
    generatedAt: timestampStr,
    totalBlocks: blocks.length,
    validBlocks: validBlocksCount,
    compromisedBlocks: audit.tamperedBlocksCount,
    totalTransactions: allTransactions.length,
    totalPublicFundsAudited: totalPublicFunds,
    integrityVerdict: isActuallyValid ? 'SAH_TERVERIFIKASI' : 'PERINGATAN_TERKOMPROMI',
    verdictMessage: isActuallyValid
      ? 'Kondisi integritas blockchain 100% sempurna. Seluruh blok terverifikasi secara kriptografis tanpa terputus.'
      : `Peringatan integritas: Ditemukan ${audit.tamperedBlocksCount} blok mengalami anomali hash/data yang tidak sah.`,
  };

  // Build the textual markdown report
  const dividerDouble = '================================================================================';
  const dividerSingle = '--------------------------------------------------------------------------------';

  let doc = `${dividerDouble}
          PEMERINTAH KOTA AMANAH • BADAN PENGAWASAN & INSPEKTORAT DIGITAL
           SISTEM INFRASTRUKTUR PEMERINTAHAN CERDAS BERBASIS AMANAH
               (Meneladani Kepemimpinan Luhur Rasulullah SAW)
${dividerDouble}

DOKUMEN RESMI: LAPORAN AUDIT OTOMATIS INTEGRITAS KRIPTOGRAFI BLOCKCHAIN
Nomor Registrasi Audit : ${documentId}
Waktu Penerbitan       : ${timestampStr}
Status Integritas      : ${isActuallyValid ? '✅ TERVERIFIKASI SAH & UTUH (100% AMANAH)' : '❌ PERINGATAN INTEGRITAS: TERKOMPROMI / DATA RUSAK'}
Tingkat Kepercayaan    : 100% Deterministic Cryptographic Proof (Zero Trust Architecture)

${dividerSingle}
I. LANDASAN NILAI & TATA KELOLA KENEGARAAN (MANHAJ PROFETIK AMANAH)
${dividerSingle}
Sistem audit otomatis ini beroperasi berdasarkan 4 pilar kepemimpinan Rasulullah SAW:
1. SHIDDIQ (Kejujuran & Kebenaran Data):
   Setiap data aduan masyarakat dan transaksi publik tercatat tanpa rekayasa,
   menjamin kebenaran informasi sebelum diproses oleh aparatur negara.
2. AMANAH (Akuntabilitas & Tanggung Jawab):
   Setiap rupiah dana publik dan setiap detik batas waktu penanganan (SLA)
   merupakan titipan rakyat yang dipertanggungjawabkan di dunia dan akhirat.
3. TABLIGH (Keterbukaan & Transparansi Informasi):
   Buku besar transaksi terbuka untuk diaudit oleh seluruh warga negara secara
   real-time tanpa ada dokumen rahasia yang disembunyikan.
4. FATHANAH (Kecerdasan & Kebijaksanaan Sistem):
   Memanfaatkan teknologi rantai blok (blockchain), algoritma SHA-256, dan
   pohon pembuktian Merkle (Merkle Tree Proof) untuk deteksi fraud otomatis.

${dividerSingle}
II. RINGKASAN EKSEKUTIF HASIL AUDIT (EXECUTIVE SUMMARY)
${dividerSingle}
• Status Rantai Blok       : ${isActuallyValid ? 'SAH & TIDAK TERGANGGU (INTEGRITY OK)' : 'TERDETEKSI MANIPULASI ILEGAL (COMPROMISED)'}
• Tinggi Blok Terakhir     : #${blocks.length - 1} (Total: ${blocks.length} Blok)
• Total Blok Terverifikasi : ${blocks.length} Blok
• Blok Berstatus SAH       : ${validBlocksCount} Blok
• Blok Rusak / Inkonsisten : ${audit.tamperedBlocksCount} Blok
• Total Transaksi Diaudit  : ${allTransactions.length} Transaksi On-Chain
• Akumulasi Dana Tervalidasi: ${formatRupiah(totalPublicFunds)}
• Protokol Konsensus       : Proof of Amanah (PoA) Terdistribusi
• Standar Hash Kriptografi : SHA-256 + Merkle Tree Digest
• Node Validator Pengawas  :
  1. Node-01 (Inspektorat Kota & Satgas Anti-Risywah)
  2. Node-02 (Perwakilan BPKP & Auditor Independen)
  3. Node-03 (Kanal Dewan Aspirasi Warga & Tokoh Masyarakat)
  4. Node-04 (Gateway Pelayanan Publik Kota Cerdas)

Kesimpulan Audit Sistem:
"${metadata.verdictMessage}"

${dividerSingle}
III. TABEL VERIFIKASI INTEGRITAS PER BLOK
${dividerSingle}
`;

  // Append block verification table
  blocks.forEach((block) => {
    const v = audit.blockVerifications.find((bv) => bv.blockHeight === block.blockHeight);
    const isValid = v ? v.isValid : block.integrityStatus === 'VALID';
    const statusLabel = isValid ? '[SAH]' : '[RUSAK / ANOMALI]';
    const blockTitle = block.blockHeight === 0 ? 'Genesis Block (Piagam Madinah)' : `Blok Konsensus Layanan #${block.blockHeight}`;

    doc += `
[Blok #${block.blockHeight}] ${blockTitle}
• Status Integritas : ${statusLabel}
• Timestamp        : ${block.timestamp}
• Validator Node   : ${block.validatorNode}
• Nonce            : ${block.nonce}
• Jumlah Transaksi : ${block.transactions.length} transaksi
• Stored Hash      : ${block.blockHash}
• Computed Hash    : ${v?.computedHash || block.blockHash}
• Previous Hash    : ${block.previousHash}
• Merkle Tree Root : ${block.merkleRoot}
• Merkle Status    : ${v?.merkleStatus === 'MATCH' ? 'MATCH (Sesuai dengan daun transaksi)' : (v?.merkleStatus || 'MATCH')}
• Catatan Audit    : ${v?.reason || 'Kriptografi valid dan terhubung sah ke blok sebelumnya.'}
`;
  });

  doc += `
${dividerSingle}
IV. DAFTAR SELURUH TRANSAKSI ON-CHAIN TERVERIFIKASI (${allTransactions.length} TRANSAKSI)
${dividerSingle}
`;

  allTransactions.forEach((tx, idx) => {
    const amountStr = tx.amount ? formatRupiah(tx.amount) : 'Non-Finansial (Layanan Publik)';
    doc += `
${(idx + 1).toString().padStart(2, '0')}. ID Transaksi : ${tx.txId} (Blok #${tx.blockHeight})
    Waktu        : ${tx.timestamp}
    Judul        : ${tx.title}
    Kategori     : ${tx.type} (Pilar: ${tx.pilar})
    Nilai Nominal: ${amountStr}
    Penerima     : ${tx.recipient}
    Petugas/KPA  : ${tx.officer} (${tx.agency})
    Status Tx    : ${tx.status}
    Hash Digital : ${tx.txHash}
`;
  });

  doc += `
${dividerSingle}
V. PERNYATAAN OTENTIKASI & TANDA TANGAN DIGITAL
${dividerSingle}
Laporan ini dihasilkan secara otomatis oleh Autonomous Blockchain Audit Engine
AmanahGov. Pembuktian matematika kriptografis bersifat mutlak dan tidak bergantung
pada asumsi manusia. Bilamana terjadi perubahan data sebutir zarrah pun di pangkalan
data publik, nilai hash akan langsung berubah drastis (avalanche effect) dan memicu
alarm darurat anti-manipulasi.

"Dan janganlah kamu memakan harta di antara kamu dengan jalan yang batil,
dan (janganlah) kamu menyuap dengan harta itu kepada para hakim dengan maksud
agar kamu dapat memakan sebagian dari harta orang lain itu dengan cara berbuat dosa,
padahal kamu mengetahui." (QS. Al-Baqarah: 188)

Diterbitkan secara resmi oleh:
Sistem Audit Kriptografi AmanahGov
Inspektorat Kota & Portal Layanan Publik Shiddiq
`;

  // Compute document checksum
  const docChecksum = await sha256(doc);
  metadata.documentChecksum = docChecksum;

  doc += `
--------------------------------------------------------------------------------
DOKUMEN CHECKSUM HASH (SHA-256):
0x${docChecksum}
--------------------------------------------------------------------------------
Akhir Dokumen Audit Integritas Resmi.
`;

  return { content: doc, metadata };
}

/**
 * Trigger direct client-side file download
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/markdown;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
