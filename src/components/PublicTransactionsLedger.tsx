import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Eye,
  FileCheck,
  Building2,
  Coins,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BlockchainTransaction, TransactionType, PillarType } from '../types';

interface PublicTransactionsLedgerProps {
  transactions: BlockchainTransaction[];
  onViewBlockExplorer?: (blockHeight: number) => void;
}

export const PublicTransactionsLedger: React.FC<PublicTransactionsLedgerProps> = ({
  transactions,
  onViewBlockExplorer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('SEMUA');
  const [filterPillar, setFilterPillar] = useState<string>('SEMUA');
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<BlockchainTransaction | null>(null);

  // Filter logic
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      searchTerm === '' ||
      tx.txId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.officer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'SEMUA' || tx.type === filterType;
    const matchesPillar = filterPillar === 'SEMUA' || tx.pilar === filterPillar;

    return matchesSearch && matchesType && matchesPillar;
  });

  const totalAmount = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const zeroRupiahServicesCount = transactions.filter((tx) => !tx.amount || tx.amount === 0).length;

  const formatRupiah = (val?: number) => {
    if (val === undefined || val === 0) return 'Rp 0 (Bebas Biaya / Gratis)';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'PENYALURAN_BANSOS':
        return { label: 'Bantuan Sosial', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'PENGADAAN_MEDIS':
        return { label: 'Pengadaan Medis', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      case 'PERIZINAN_USAHA':
        return { label: 'Perizinan UMKM', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'PENGADUAN_WARGA':
        return { label: 'Aduan Publik', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'AUDIT_INTEGRITAS':
        return { label: 'Audit Rekonsiliasi', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      default:
        return { label: type, color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const getPillarBadge = (pillar: PillarType) => {
    switch (pillar) {
      case 'Shiddiq':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700/60';
      case 'Amanah':
        return 'bg-amber-950 text-amber-300 border-amber-700/60';
      case 'Tabligh':
        return 'bg-sky-950 text-sky-300 border-sky-700/60';
      case 'Fathanah':
        return 'bg-indigo-950 text-indigo-300 border-indigo-700/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <Eye className="w-3.5 h-3.5" />
              <span>Prinsip Tabligh: Keterbukaan Transaksi Publik</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Buku Besar Transparansi Transaksi Pelayanan Publik
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Seluruh transaksi dana bansos, pengadaan logistik kesehatan, alokasi infrastruktur, dan layanan perizinan terpatri terbuka dan tidak dapat diubah (immutable).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Terverifikasi Konsensus
            </span>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Total Dana Publik Terbuka</span>
              <Coins className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-white font-mono">
              {formatRupiah(totalAmount)}
            </p>
            <p className="text-[11px] text-emerald-400 mt-1">Audit real-time rekonsiliasi kas</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Layanan Bebas Pungli (Rp 0)</span>
              <FileCheck className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-white font-mono">
              {zeroRupiahServicesCount} Transaksi
            </p>
            <p className="text-[11px] text-sky-400 mt-1">Izin usaha mikro &amp; aduan gratis</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Indeks Integritas Amanah</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-white font-mono">
              100.0%
            </p>
            <p className="text-[11px] text-amber-400 mt-1">Zero fraud &amp; zero corruption</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Total Transaksi Publik</span>
              <Building2 className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-white font-mono">
              {transactions.length} Entri On-Chain
            </p>
            <p className="text-[11px] text-indigo-400 mt-1">Tersimpan dalam 4 blok aktif</p>
          </div>
        </div>
      </div>

      {/* Filter and search controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Cari nomor transaksi (TX-ID), penerima, judul, atau pejabat berwenang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Pillar filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold shrink-0">Pilar:</span>
            {['SEMUA', 'Shiddiq', 'Amanah', 'Tabligh', 'Fathanah'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPillar(p)}
                className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${
                  filterPillar === p
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Type Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-slate-400 text-[11px] font-semibold shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Jenis Transaksi:
          </span>
          <button
            onClick={() => setFilterType('SEMUA')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
              filterType === 'SEMUA'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
            }`}
          >
            Semua Jenis ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('PENYALURAN_BANSOS')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
              filterType === 'PENYALURAN_BANSOS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
            }`}
          >
            Bantuan Sosial
          </button>
          <button
            onClick={() => setFilterType('PENGADAAN_MEDIS')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
              filterType === 'PENGADAAN_MEDIS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
            }`}
          >
            Pengadaan Medis
          </button>
          <button
            onClick={() => setFilterType('PERIZINAN_USAHA')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
              filterType === 'PERIZINAN_USAHA'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
            }`}
          >
            Perizinan UMKM
          </button>
          <button
            onClick={() => setFilterType('AUDIT_INTEGRITAS')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
              filterType === 'AUDIT_INTEGRITAS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
            }`}
          >
            Audit Kas
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-4">ID Transaksi</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Jenis &amp; Judul Transaksi</th>
                <th className="py-3.5 px-4">Nilai Publik</th>
                <th className="py-3.5 px-4">Penerima &amp; Pejabat</th>
                <th className="py-3.5 px-4 text-center">Pilar</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Kriptografi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Tidak ada catatan transaksi publik yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const typeBadge = getTypeLabel(tx.type);
                  const isExpanded = selectedTxForDetail?.txId === tx.txId;

                  return (
                    <React.Fragment key={tx.txId}>
                      <tr
                        className={`hover:bg-slate-800/60 transition-colors ${
                          isExpanded ? 'bg-slate-800/40' : ''
                        }`}
                        id={`tx-row-${tx.txId}`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          {tx.txId}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {tx.timestamp}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${typeBadge.color}`}
                            >
                              {typeBadge.label}
                            </span>
                            <p className="font-semibold text-white leading-snug max-w-sm">
                              {tx.title}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                          {formatRupiah(tx.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[11px]">
                            <p className="font-medium text-slate-200">{tx.recipient}</p>
                            <p className="text-slate-400 text-[10px]">{tx.officer} • {tx.agency}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${getPillarBadge(
                              tx.pilar
                            )}`}
                          >
                            {tx.pilar}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedTxForDetail(isExpanded ? null : tx)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                          >
                            <span>Payload</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Raw Payload & Hash Details */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90 border-b border-slate-800">
                          <td colSpan={8} className="p-4 sm:p-5">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                                <span className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                                  <Lock className="w-3.5 h-3.5" />
                                  Kriptografi &amp; Integritas Data Blok #{tx.blockHeight}
                                </span>
                                {onViewBlockExplorer && (
                                  <button
                                    onClick={() => onViewBlockExplorer(tx.blockHeight)}
                                    className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
                                  >
                                    <span>Tinjau Blok #{tx.blockHeight} di Explorer</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <p className="text-[10px] text-slate-400 mb-1 font-semibold">
                                    SHA-256 Transaction Hash (Immutable):
                                  </p>
                                  <p className="font-mono text-[11px] bg-slate-900 text-emerald-400 p-2 rounded border border-slate-800 break-all select-all">
                                    {tx.txHash}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 mb-1 font-semibold">
                                    Instansi Penyelenggara &amp; Auditor:
                                  </p>
                                  <p className="text-[11px] bg-slate-900 text-slate-200 p-2 rounded border border-slate-800">
                                    {tx.agency} — Pejabat: {tx.officer}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <p className="text-[10px] text-slate-400 mb-1 font-semibold">
                                  Metadata &amp; Parameter Akuntabilitas:
                                </p>
                                <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto">
                                  {JSON.stringify(tx.dataPayload, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
