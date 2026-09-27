import React, { useState } from 'react';
import {
  ShieldCheck,
  Activity,
  AlertTriangle,
  RefreshCw,
  Lock,
  Layers,
  CheckCircle2,
  XCircle,
  Hash,
  Clock,
  Cpu,
  Server,
  ArrowRight,
  Sliders,
  AlertOctagon,
  FileCheck2,
  FileDown,
  FileText,
  FileCode,
  ChevronDown,
  Eye,
  Copy,
  Check,
  X,
  Download,
} from 'lucide-react';
import { BlockchainBlock } from '../types';
import { VerificationResult, runAutomatedAudit } from '../services/blockchain';
import {
  generateAuditReportDocument,
  downloadFile,
  AuditReportMetadata,
} from '../utils/auditReportGenerator';

interface BlockchainAuditExplorerProps {
  blocks: BlockchainBlock[];
  onRunAudit: () => Promise<VerificationResult>;
  onSimulateTamper: () => void;
  onRestoreChain: () => void;
  isTampered: boolean;
  isAuditing: boolean;
  lastAuditResult: VerificationResult | null;
}

export const BlockchainAuditExplorer: React.FC<BlockchainAuditExplorerProps> = ({
  blocks,
  onRunAudit,
  onSimulateTamper,
  onRestoreChain,
  isTampered,
  isAuditing,
  lastAuditResult,
}) => {
  const [selectedBlockHeight, setSelectedBlockHeight] = useState<number>(blocks.length - 1);
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewMetadata, setPreviewMetadata] = useState<AuditReportMetadata | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadNotification, setDownloadNotification] = useState<{
    message: string;
    filename: string;
    checksum?: string;
  } | null>(null);

  const selectedBlock = blocks.find((b) => b.blockHeight === selectedBlockHeight) || blocks[blocks.length - 1];

  const handleGenerateReportData = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateAuditReportDocument(blocks, lastAuditResult, isTampered);
      return report;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadReport = async (format: 'markdown' | 'txt' | 'json' = 'markdown') => {
    try {
      const { content, metadata } = await handleGenerateReportData();
      const dateStamp = new Date().toISOString().slice(0, 10);
      const statusSlug = isTampered ? 'PERINGATAN_KOMPROMI' : 'SAH_TERVERIFIKASI';

      let filename = '';
      if (format === 'json') {
        filename = `Laporan_Audit_Blockchain_${dateStamp}_${metadata.documentId}.json`;
        const jsonData = {
          metadata,
          auditResult: lastAuditResult,
          isTampered,
          blocks: blocks.map((b) => ({
            blockHeight: b.blockHeight,
            timestamp: b.timestamp,
            validatorNode: b.validatorNode,
            blockHash: b.blockHash,
            previousHash: b.previousHash,
            merkleRoot: b.merkleRoot,
            nonce: b.nonce,
            transactionsCount: b.transactions.length,
            transactions: b.transactions,
          })),
        };
        downloadFile(filename, JSON.stringify(jsonData, null, 2), 'application/json');
      } else {
        const ext = format === 'txt' ? 'txt' : 'md';
        const mime = format === 'txt' ? 'text/plain;charset=utf-8' : 'text/markdown;charset=utf-8';
        filename = `Laporan_Audit_Integritas_Blockchain_${statusSlug}_${dateStamp}_${metadata.documentId}.${ext}`;
        downloadFile(filename, content, mime);
      }

      setDownloadNotification({
        message: `Laporan Audit Integritas berhasil diunduh (${format.toUpperCase()})`,
        filename,
        checksum: metadata.documentChecksum,
      });

      setTimeout(() => {
        setDownloadNotification(null);
      }, 7000);
    } catch (err) {
      console.error('Gagal mengunduh laporan audit:', err);
    }
  };

  const handleOpenPreview = async () => {
    try {
      const { content, metadata } = await handleGenerateReportData();
      setPreviewContent(content);
      setPreviewMetadata(metadata);
      setPreviewModalOpen(true);
    } catch (err) {
      console.error('Gagal memuat pratinjau audit:', err);
    }
  };

  const handleCopyPreview = () => {
    if (!previewContent) return;
    navigator.clipboard.writeText(previewContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Audit Engine Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Sistem Audit Otomatis Mandiri (Autonomous Audit Engine)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Audit Otomatis Kriptografi Rantai Blok Amanah
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Memverifikasi secara matematis bahwa tidak ada data pengaduan atau transaksi publik yang diubah, dihapus, atau dimanipulasi setelah dicatat.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onRunAudit}
              disabled={isAuditing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-700/20 cursor-pointer disabled:opacity-50"
              id="btn-run-automated-audit"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Memeriksa Seluruh Rantai...' : 'Jalankan Audit Otomatis'}</span>
            </button>

            {/* Tombol Unduh Laporan Audit */}
            <div className="relative inline-flex items-center">
              <button
                onClick={() => handleDownloadReport('markdown')}
                disabled={isGeneratingReport}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-l-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600 font-semibold text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                id="btn-download-audit-report"
                title="Unduh Laporan Integritas Blockchain (.MD Resmi)"
              >
                <FileDown className={`w-3.5 h-3.5 text-emerald-400 ${isGeneratingReport ? 'animate-pulse' : ''}`} />
                <span>{isGeneratingReport ? 'Menyusun Laporan...' : 'Unduh Laporan Audit'}</span>
              </button>
              <button
                onClick={() => setIsReportMenuOpen((prev) => !prev)}
                className="px-2 py-2 rounded-r-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border-t border-r border-b border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                title="Pilihan format berkas laporan audit"
                id="btn-report-options-dropdown"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Dropdown Menu Format Laporan */}
              {isReportMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsReportMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 py-1.5 text-xs">
                    <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Format Dokumen Laporan
                    </div>
                    <button
                      onClick={() => {
                        handleDownloadReport('markdown');
                        setIsReportMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                      id="opt-download-markdown"
                    >
                      <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-white">Dokumen Resmi (.MD)</p>
                        <p className="text-[10px] text-slate-400">Format Markdown lengkap ber-checksum SHA-256</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadReport('txt');
                        setIsReportMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                      id="opt-download-txt"
                    >
                      <FileCode className="w-4 h-4 text-sky-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-white">Teks Polos Arsip (.TXT)</p>
                        <p className="text-[10px] text-slate-400">Cocok dicetak atau arsip plaintext</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadReport('json');
                        setIsReportMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                      id="opt-download-json"
                    >
                      <Hash className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-white">Data Audit Machine-Ready (.JSON)</p>
                        <p className="text-[10px] text-slate-400">Payload struktur blok untuk analisis teknis BPK</p>
                      </div>
                    </button>
                    <div className="border-t border-slate-800 my-1" />
                    <button
                      onClick={() => {
                        handleOpenPreview();
                        setIsReportMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 text-emerald-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                      id="opt-preview-report"
                    >
                      <Eye className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <p className="font-semibold">Pratinjau Dokumen di Layar</p>
                        <p className="text-[10px] text-slate-400">Baca seluruh isi dokumen sebelum diunduh</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {!isTampered ? (
              <button
                onClick={onSimulateTamper}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold text-xs transition-colors cursor-pointer"
                title="Uji coba ketahanan sistem audit terhadap percobaan suap / manipulasi data"
                id="btn-simulate-tamper"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Uji Manipulasi Data (Simulasi)</span>
              </button>
            ) : (
              <button
                onClick={onRestoreChain}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md cursor-pointer"
                id="btn-restore-chain"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pulihkan Rantai (Konsensus Shiddiq)</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifikasi Pengunduhan Berkas */}
        {downloadNotification && (
          <div className="mb-4 bg-emerald-950/80 border border-emerald-600/80 rounded-xl p-3.5 text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg shadow-emerald-950/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{downloadNotification.message}</p>
                <p className="text-[11px] text-emerald-300/80 font-mono truncate">
                  Berkas: {downloadNotification.filename}
                </p>
                {downloadNotification.checksum && (
                  <p className="text-[10px] text-emerald-400/90 font-mono truncate">
                    Checksum SHA-256: 0x{downloadNotification.checksum.slice(0, 24)}...
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleOpenPreview}
                className="px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>Buka Pratinjau</span>
              </button>
              <button
                onClick={() => setDownloadNotification(null)}
                className="p-1 text-emerald-400 hover:text-white rounded hover:bg-emerald-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Audit Status Alert Strip */}
        {isTampered ? (
          <div className="bg-rose-950/40 border border-rose-600/70 rounded-xl p-4 text-rose-200 flex items-start gap-3 animate-pulse">
            <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Peringatan Audit Otomatis: Pelanggaran Integritas Terdeteksi!
                </h4>
                <button
                  onClick={() => handleDownloadReport('markdown')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-900 border border-rose-700 text-rose-200 text-xs font-semibold transition-colors"
                  title="Unduh laporan forensik pelanggaran rantai blok"
                  id="btn-download-tamper-report"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Unduh Bukti Audit Pelanggaran</span>
                </button>
              </div>
              <p className="text-xs text-rose-300 leading-relaxed">
                Salah satu transaksi pada blok diubah secara ilegal tanpa otorisasi kunci konsensus. Sistem audit otomatis mendeteksi ketidaksesuaian nilai SHA-256 Merkle Root &amp; Block Hash. Akses transaksi ilegal segera dibekukan!
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={onRestoreChain}
                  className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                >
                  Tolak Manipulasi &amp; Pulihkan Konsensus Sah
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-4 text-emerald-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Kondisi Integritas Blockchain: 100% Sempurna &amp; Amanah
                </h4>
                <p className="text-[11px] text-emerald-300/80">
                  {lastAuditResult?.message ||
                    'Seluruh blok diverifikasi secara kriptografis tanpa terputus. Tidak ada indikasi kecurangan data.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleDownloadReport('markdown')}
                className="px-2.5 py-1 rounded-lg bg-emerald-900/50 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Unduh laporan audit lengkap"
                id="btn-strip-download-report"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Unduh Laporan Audit</span>
              </button>
              <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                HASH_MATCH_OK
              </span>
            </div>
          </div>
        )}

        {/* 4 Network Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="bg-slate-800/50 border border-slate-700/60 p-3 rounded-lg">
            <span className="text-slate-400 text-[11px]">Tinggi Blok Saat Ini</span>
            <p className="text-base font-bold font-mono text-white mt-0.5">
              #{blocks.length - 1} ({blocks.length} Blok)
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/60 p-3 rounded-lg">
            <span className="text-slate-400 text-[11px]">Algoritma Kriptografi</span>
            <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
              SHA-256 + Merkle Proof
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/60 p-3 rounded-lg">
            <span className="text-slate-400 text-[11px]">Protokol Konsensus</span>
            <p className="text-base font-bold font-mono text-amber-400 mt-0.5">
              PoA (Proof of Amanah)
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/60 p-3 rounded-lg">
            <span className="text-slate-400 text-[11px]">Node Pengawas Aktif</span>
            <p className="text-base font-bold font-mono text-sky-400 mt-0.5">
              4 Node Terdistribusi
            </p>
          </div>
        </div>
      </div>

      {/* Visual Chain of Blocks */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            Visualisasi Rantai Blok Terdistribusi (Chain of Custody)
          </h3>
          <span className="text-[11px] text-slate-400">
            Klik blok untuk memeriksa struktur internal
          </span>
        </div>

        {/* Blocks Horizontal Chain Flow */}
        <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
          {blocks.map((block, idx) => {
            const isSelected = selectedBlock.blockHeight === block.blockHeight;
            const isCompromised = block.integrityStatus === 'COMPROMISED';

            return (
              <React.Fragment key={block.blockHeight}>
                <div
                  onClick={() => setSelectedBlockHeight(block.blockHeight)}
                  className={`shrink-0 w-60 rounded-xl border p-3.5 cursor-pointer transition-all ${
                    isCompromised
                      ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/50'
                      : isSelected
                      ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500 shadow-md'
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                  id={`block-card-${block.blockHeight}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      Blok #{block.blockHeight}
                    </span>
                    {isCompromised ? (
                      <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> RUSAK
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> SAH
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono mb-1 truncate">
                    Hash: {block.blockHash.slice(0, 16)}...
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mb-2 truncate">
                    Prev: {block.previousHash.slice(0, 14)}...
                  </p>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
                    <span>{block.transactions.length} Transaksi</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Nonce: {block.nonce}
                    </span>
                  </div>
                </div>

                {idx < blocks.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Detail Inspector of Selected Block */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
              Blok #{selectedBlock.blockHeight}
            </span>
            <span className="text-xs font-semibold text-white">
              {selectedBlock.blockHeight === 0 ? 'Genesis Block (Piagam Madinah)' : 'Blok Konsensus Pelayanan Publik'}
            </span>
          </div>

          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {selectedBlock.timestamp}
          </span>
        </div>

        {/* Cryptographic Hashes Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-sans font-semibold">
              Current Block Hash (SHA-256):
            </span>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-emerald-400 break-all select-all">
              {selectedBlock.blockHash}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-sans font-semibold">
              Previous Block Hash:
            </span>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-400 break-all select-all">
              {selectedBlock.previousHash}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-sans font-semibold">
              Merkle Root Tree:
            </span>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-sky-400 break-all select-all">
              {selectedBlock.merkleRoot}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-sans font-semibold">
              Validator Node Konsensus:
            </span>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-amber-300 font-sans text-xs">
              {selectedBlock.validatorNode}
            </div>
          </div>
        </div>

        {/* Transactions in This Block */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Daftar Transaksi On-Chain Pada Blok Ini ({selectedBlock.transactions.length})
          </h4>

          <div className="space-y-2.5">
            {selectedBlock.transactions.map((tx) => (
              <div
                key={tx.txId}
                className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 text-xs space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-bold text-emerald-400">{tx.txId}</span>
                  <span className="font-mono text-[10px] text-slate-400">{tx.timestamp}</span>
                </div>
                <h5 className="font-bold text-white text-xs">{tx.title}</h5>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
                  <span>Penerima: <strong className="text-slate-200">{tx.recipient}</strong></span>
                  <span className="font-mono text-emerald-400 truncate max-w-xs">{tx.txHash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Dialog: Pratinjau Dokumen Laporan Audit */}
      {previewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <FileText className="w-3.5 h-3.5" />
                    Laporan Audit Resmi
                  </span>
                  {previewMetadata?.documentId && (
                    <span className="font-mono text-xs text-slate-400">
                      ID: {previewMetadata.documentId}
                    </span>
                  )}
                  {previewMetadata?.integrityVerdict === 'SAH_TERVERIFIKASI' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 100% AMANAH
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> ANOMALI DETECTED
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Pratinjau Dokumen Laporan Audit Kriptografi Blockchain
                </h3>
                <p className="text-xs text-slate-400">
                  Dihasilkan secara deterministik oleh Autonomous Audit Engine AmanahGov berdasarkan konsensus Proof of Amanah.
                </p>
              </div>

              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                id="btn-close-preview-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metadata Bar */}
            {previewMetadata && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-950/40 border-b border-slate-800/80 text-xs">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400">Total Blok Diaudit</span>
                  <p className="font-mono font-bold text-white">{previewMetadata.totalBlocks} Blok</p>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400">Blok Sah / Valid</span>
                  <p className="font-mono font-bold text-emerald-400">{previewMetadata.validBlocks} Blok</p>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400">Transaksi Publik Diaudit</span>
                  <p className="font-mono font-bold text-sky-400">{previewMetadata.totalTransactions} Transaksi</p>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400">Status Integritas</span>
                  <p className={`font-mono font-bold ${previewMetadata.integrityVerdict === 'SAH_TERVERIFIKASI' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {previewMetadata.integrityVerdict === 'SAH_TERVERIFIKASI' ? 'SAH & UTUH' : 'TERKOMPROMI'}
                  </p>
                </div>
              </div>
            )}

            {/* Document Content Viewer */}
            <div className="p-4 flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Naskah Dokumen Laporan (Markdown / Plain Text)
                </span>
                {previewMetadata?.documentChecksum && (
                  <span className="font-mono text-[10px] text-slate-500 truncate max-w-xs sm:max-w-md">
                    SHA-256 Checksum: 0x{previewMetadata.documentChecksum}
                  </span>
                )}
              </div>
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-[11px] text-emerald-300/90 whitespace-pre overflow-y-auto overflow-x-auto select-all scrollbar-thin">
                {previewContent}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPreview}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  id="btn-copy-report-text"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-bold">Tersalin ke Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Salin Naskah</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    handleDownloadReport('markdown');
                    setPreviewModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-700/20"
                  id="btn-modal-download-md"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Unduh (.MD Resmi)</span>
                </button>
                <button
                  onClick={() => {
                    handleDownloadReport('txt');
                    setPreviewModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  id="btn-modal-download-txt"
                >
                  <FileCode className="w-3.5 h-3.5 text-sky-400" />
                  <span>Unduh (.TXT)</span>
                </button>
                <button
                  onClick={() => {
                    handleDownloadReport('json');
                    setPreviewModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  id="btn-modal-download-json"
                >
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span>Unduh (.JSON)</span>
                </button>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
