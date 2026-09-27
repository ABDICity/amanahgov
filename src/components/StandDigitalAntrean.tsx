import React, { useState, useEffect } from 'react';
import {
  Tv,
  Users,
  Clock,
  Ticket,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Printer,
  QrCode,
  ShieldCheck,
  Building2,
  ChevronRight,
  RefreshCw,
  Plus,
  X,
  Calendar,
  Layers,
  UserCheck,
  Zap,
} from 'lucide-react';
import { ServiceCounter, UserQueueTicket, HourlyQueueSlot } from '../types';
import {
  INITIAL_SERVICE_COUNTERS,
  HOURLY_QUEUE_SLOTS,
  INITIAL_USER_TICKET,
} from '../data/queueData';
import { playNotificationTone } from '../services/audioNotification';

interface StandDigitalAntreanProps {
  isAudioEnabled?: boolean;
  onNavigateToServices?: () => void;
}

export const StandDigitalAntrean: React.FC<StandDigitalAntreanProps> = ({
  isAudioEnabled = true,
  onNavigateToServices,
}) => {
  // Counters state
  const [counters, setCounters] = useState<ServiceCounter[]>(INITIAL_SERVICE_COUNTERS);
  
  // User personal ticket state
  const [userTicket, setUserTicket] = useState<UserQueueTicket | null>(INITIAL_USER_TICKET);
  
  // Simulation auto-tick state
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(false);
  const [lastCalledCounter, setLastCalledCounter] = useState<string | null>(null);

  // Active view tab inside Stand Digital
  const [activeSubTab, setActiveSubTab] = useState<'loket' | 'proyeksi' | 'tiket-saya'>('loket');

  // Modal states
  const [isTakeTicketModalOpen, setIsTakeTicketModalOpen] = useState<boolean>(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState<boolean>(false);

  // Form states for taking a new ticket
  const [newTicketCounterId, setNewTicketCounterId] = useState<string>('loket-a');
  const [newTicketServiceType, setNewTicketServiceType] = useState<string>('Perekaman & Cetak e-KTP Digital');
  const [newTicketCitizenName, setNewTicketCitizenName] = useState<string>('Ahmad Fauzi Ridwan');
  const [newTicketNikLast4, setNewTicketNikLast4] = useState<string>('8842');

  // Total served today calculation
  const totalServedToday = counters.reduce((acc, c) => acc + c.servedTodayCount, 0);
  const totalWaiting = counters.reduce((acc, c) => acc + c.waitingCount, 0);

  // Function to call next ticket for a counter
  const handleCallNextTicket = (counterId: string) => {
    setCounters((prev) =>
      prev.map((counter) => {
        if (counter.id !== counterId) return counter;

        // Parse current number: e.g. 'A-042' -> 'A-043'
        const currentNum = parseInt(counter.currentTicketNumber.split('-')[1], 10) || 1;
        const nextNum = currentNum + 1;
        const nextTicketStr = `${counter.code}-${String(nextNum).padStart(3, '0')}`;

        // Check if this called number matches user ticket
        if (userTicket && userTicket.counterId === counter.id) {
          if (userTicket.ticketNumber === nextTicketStr) {
            setUserTicket((ut) => (ut ? { ...ut, status: 'DIPANGGIL', queueAhead: 0 } : null));
          } else if (userTicket.queueAhead > 0) {
            setUserTicket((ut) =>
              ut ? { ...ut, queueAhead: Math.max(0, ut.queueAhead - 1) } : null
            );
          }
        }

        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return {
          ...counter,
          currentTicketNumber: nextTicketStr,
          currentCitizenName: `Warga Antrean #${nextNum}`,
          startedServingAt: `${hours}:${minutes} WIB`,
          servedTodayCount: counter.servedTodayCount + 1,
          waitingCount: Math.max(1, counter.waitingCount > 1 ? counter.waitingCount - 1 : 2),
          currentRemainingMinutes: Math.round(counter.avgServiceMinutes),
          status: 'MEMANGGIL',
        };
      })
    );

    setLastCalledCounter(counterId);
    setTimeout(() => {
      setCounters((prev) =>
        prev.map((c) => (c.id === counterId ? { ...c, status: 'MELAYANI' } : c))
      );
    }, 3000);

    if (isAudioEnabled) {
      playNotificationTone('queue');
    }
  };

  // Auto-simulation effect
  useEffect(() => {
    if (!isAutoSimulating) return;

    const interval = setInterval(() => {
      // Pick a random counter to advance
      const randomIndex = Math.floor(Math.random() * counters.length);
      const targetCounter = counters[randomIndex];
      if (targetCounter) {
        handleCallNextTicket(targetCounter.id);
      }
    }, 9000); // every 9 seconds

    return () => clearInterval(interval);
  }, [isAutoSimulating, counters, userTicket, isAudioEnabled]);

  // Handle take ticket submission
  const handleTakeNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCounter = counters.find((c) => c.id === newTicketCounterId) || counters[0];
    const currentNum = parseInt(selectedCounter.currentTicketNumber.split('-')[1], 10) || 1;
    const userAssignedNum = currentNum + selectedCounter.waitingCount + 1;
    const userTicketStr = `${selectedCounter.code}-${String(userAssignedNum).padStart(3, '0')}`;

    const now = new Date();
    const estDate = new Date(now.getTime() + (selectedCounter.waitingCount + 1) * selectedCounter.avgServiceMinutes * 60000);
    const estHour = String(estDate.getHours()).padStart(2, '0');
    const estMinute = String(estDate.getMinutes()).padStart(2, '0');

    const createdTicket: UserQueueTicket = {
      ticketNumber: userTicketStr,
      counterId: selectedCounter.id,
      counterCode: selectedCounter.code,
      counterName: selectedCounter.name,
      serviceType: newTicketServiceType,
      citizenName: newTicketCitizenName || 'Warga Islamicity',
      citizenNikMasked: `327101******${newTicketNikLast4 || '1234'}`,
      issuedAt: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`,
      estimatedCallTime: `${estHour}:${estMinute} WIB`,
      estimatedWaitMinutes: Math.round((selectedCounter.waitingCount + 1) * selectedCounter.avgServiceMinutes),
      queueAhead: selectedCounter.waitingCount + 1,
      qrVerificationHash: `0x${Math.random().toString(16).substring(2, 10)}${Date.now().toString(16)}8f4d92a1`,
      status: 'MENUNGGU',
    };

    setUserTicket(createdTicket);
    // Increase waiting count on that counter
    setCounters((prev) =>
      prev.map((c) => (c.id === selectedCounter.id ? { ...c, waitingCount: c.waitingCount + 1 } : c))
    );

    setIsTakeTicketModalOpen(false);
    setIsSlipModalOpen(true);
    setActiveSubTab('tiket-saya');

    if (isAudioEnabled) {
      playNotificationTone('success');
    }
  };

  return (
    <div
      id="stand-digital-antrean-container"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm relative overflow-hidden"
    >
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Stand Digital Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Tv className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Stand Digital Layanan Publik Terpadu (Kios Virtual)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Sistem Siaga Real-Time (5 Loket Buka)</span>
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Papan Antrean Terintegrasi &amp; Estimasi Waktu Layanan Warga
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Pantau giliran nomor antrean secara transparan tanpa calo dan pungutan liar (*Zero-Risywah*). Dilengkapi estimasi waktu pelayanan per loket berbasis prinsip ketepatan waktu *Fathanah* &amp; kejujuran *Shiddiq*.
          </p>
        </div>

        {/* Action Controls & Simulation Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Take Ticket Button */}
          <button
            onClick={() => setIsTakeTicketModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            id="btn-take-ticket-modal"
          >
            <Ticket className="w-4 h-4" />
            <span>Ambil Tiket Digital</span>
          </button>

          {/* Auto simulation toggle */}
          <button
            onClick={() => setIsAutoSimulating(!isAutoSimulating)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              isAutoSimulating
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
            title={isAutoSimulating ? 'Hentikan simulasi otomatis' : 'Jalankan simulasi pergantian antrean otomatis'}
            id="btn-toggle-auto-sim"
          >
            {isAutoSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulasi Auto: Aktif</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-400" />
                <span>Simulasi Auto</span>
              </>
            )}
          </button>

          {/* Advance random counter button */}
          <button
            onClick={() => {
              const randIdx = Math.floor(Math.random() * counters.length);
              handleCallNextTicket(counters[randIdx].id);
            }}
            className="p-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
            title="Panggil nomor berikutnya secara manual"
            id="btn-call-random-next"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Panggil Maju</span>
          </button>
        </div>
      </div>

      {/* 4 Efficiency KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Total Dilayani Hari Ini</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {totalServedToday}{' '}
            <span className="text-xs font-normal text-slate-400">Warga</span>
          </p>
          <p className="text-[10px] sm:text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Tercatat Kriptografis</span>
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Rata-rata Waktu Layanan</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-sky-300 font-mono">
            7.4{' '}
            <span className="text-xs font-normal text-slate-400">Menit / Berkas</span>
          </p>
          <p className="text-[10px] sm:text-[11px] text-sky-400 mt-1">
            Target Maksimal SLA: 15 Menit
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Warga Dalam Antrean</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-300 font-mono">
            {totalWaiting}{' '}
            <span className="text-xs font-normal text-slate-400">Menunggu</span>
          </p>
          <p className="text-[10px] sm:text-[11px] text-amber-400 mt-1">
            Tersebar di 5 Loket Terpadu
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Ketepatan Waktu (On-Time)</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-purple-300 font-mono">
            99.2%
          </p>
          <p className="text-[10px] sm:text-[11px] text-purple-400 mt-1">
            Sanksi Tegas Anti-Perlambatan
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs inside Stand Digital */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('loket')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'loket'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="tab-btn-stand-loket"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Papan Multi-Loket Stand</span>
          </button>

          <button
            onClick={() => setActiveSubTab('proyeksi')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'proyeksi'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="tab-btn-stand-proyeksi"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwal &amp; Jam Bebas Antrean</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tiket-saya')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 relative ${
              activeSubTab === 'tiket-saya'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="tab-btn-stand-tiket-saya"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Tiket Antrean Saya</span>
            {userTicket && userTicket.status === 'MENUNGGU' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Live Calling Alert Ticker */}
        {lastCalledCounter && (
          <div className="text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-lg flex items-center gap-2 animate-in fade-in duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              Panggilan baru di{' '}
              <strong>
                {counters.find((c) => c.id === lastCalledCounter)?.name.split('—')[0]}
              </strong>
              : Nomor{' '}
              <strong className="font-mono text-white">
                {counters.find((c) => c.id === lastCalledCounter)?.currentTicketNumber}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* VIEW 1: PAPAN MULTI-LOKET (DISPLAY TV BOOTH STAND) */}
      {activeSubTab === 'loket' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {counters.map((counter) => {
              const isCalling = counter.status === 'MEMANGGIL';
              const isUserCounter = userTicket?.counterId === counter.id;

              return (
                <div
                  key={counter.id}
                  className={`bg-slate-950 border rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all relative overflow-hidden group ${
                    isCalling
                      ? 'border-emerald-400 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10'
                      : isUserCounter
                      ? 'border-slate-700 bg-slate-950/90'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Badge: Counter Code & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold font-mono flex items-center justify-center text-sm border border-emerald-500/40">
                        {counter.code}
                      </span>
                      <span className="text-xs font-bold text-slate-300 truncate max-w-[180px]">
                        {counter.name.split('—')[1] || counter.name}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        isCalling
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-bounce'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {counter.status}
                    </span>
                  </div>

                  {/* Main Display Ticket Number Box (Like LCD Display) */}
                  <div className="my-2 p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between relative overflow-hidden">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        Nomor Sedang Dilayani
                      </span>
                      <div className="text-3xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                        <span>{counter.currentTicketNumber}</span>
                        {isCalling && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold uppercase tracking-wider">
                            Panggilan
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[200px]">
                        {counter.currentCitizenName}
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[10px] text-slate-500 block font-mono">
                        Sejak {counter.startedServingAt}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400 block">
                        ~{counter.currentRemainingMinutes} mnt tersisa
                      </span>
                    </div>
                  </div>

                  {/* Officer Info & Department */}
                  <div className="text-xs text-slate-400 space-y-1 mt-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Petugas:</span>
                      <span className="text-white font-medium truncate ml-2">
                        {counter.officerName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Kategori:</span>
                      <span className="text-slate-300 truncate ml-2">
                        {counter.serviceCategory}
                      </span>
                    </div>
                  </div>

                  {/* Queue Metrics & Action Button */}
                  <div className="pt-3 flex items-center justify-between text-xs">
                    <div className="text-slate-400">
                      <span className="text-white font-bold font-mono">
                        {counter.waitingCount}
                      </span>{' '}
                      antrean menunggu
                    </div>

                    <button
                      onClick={() => handleCallNextTicket(counter.id)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700 hover:border-emerald-500 transition-all cursor-pointer flex items-center gap-1"
                      title="Simulasikan pemanggilan nomor berikutnya di loket ini"
                    >
                      <span>Panggil Nomor</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: PROYEKSI WAKTU & JAM BEBAS ANTREAN (SMART SCHEDULE PEAKS) */}
      {activeSubTab === 'proyeksi' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
            <div>
              <span className="font-bold text-slate-200 block sm:inline">
                Peta Kepadatan Antrean Berdasarkan Jam Operasional
              </span>{' '}
              (08:00 - 15:30 WIB)
            </div>
            <span className="text-emerald-400 text-[11px]">
              Tip: Kunjungi pada jam dengan tanda hijau untuk waktu tunggu &lt; 5 menit
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {HOURLY_QUEUE_SLOTS.map((slot, idx) => {
              const isPadat = slot.crowdLevel === 'PADAT';
              const isSedang = slot.crowdLevel === 'SEDANG';
              const isRendah = slot.crowdLevel === 'RENDAH';

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                    isPadat
                      ? 'bg-rose-950/20 border-rose-800/50'
                      : isSedang
                      ? 'bg-amber-950/20 border-amber-800/50'
                      : 'bg-emerald-950/20 border-emerald-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-sm text-white font-mono">
                        {slot.timeSlot}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isPadat
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : isSedang
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {slot.crowdLevel}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Estimasi Tunggu:</span>
                      <span className="font-mono font-bold text-white">
                        ~{slot.estWaitMinutes} Menit
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Loket Siaga:</span>
                      <span className="text-slate-300 font-mono">
                        {slot.activeCounters} Meja
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug pt-2 border-t border-slate-800">
                    {slot.recommendation}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong>Efisiensi Syariah Terintegrasi:</strong> Jadwal loket secara cerdas mengakomodasi jeda Shalat Dhuhr berjamaah (11:45 - 13:00 WIB) dengan tetap menyiagakan 2 loket darurat (*Fast Track*) agar pelayanan publik esensial tidak terhenti.
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TIKET ANTREAN SAYA (PERSONAL CITIZEN TICKET MONITOR) */}
      {activeSubTab === 'tiket-saya' && (
        <div className="space-y-4">
          {userTicket ? (
            <div className="max-w-2xl mx-auto bg-slate-950 border border-slate-700/80 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden">
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500" />

              {/* Ticket Top Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Tiket Antrean Digital Warga
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      Islamicity Smart City
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-0.5">
                    {userTicket.counterName}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Layanan:{' '}
                    <span className="text-slate-200 font-medium">{userTicket.serviceType}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border inline-flex items-center gap-1 ${
                      userTicket.status === 'DIPANGGIL'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-bounce'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {userTicket.status === 'DIPANGGIL' ? 'SILAKAN MENUJU LOKET' : 'MENUNGGU GILIRAN'}
                  </span>
                </div>
              </div>

              {/* Big Ticket Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center items-center py-2">
                <div className="sm:col-span-2 p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Nomor Antrean Anda
                  </span>
                  <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight my-1">
                    {userTicket.ticketNumber}
                  </div>
                  <div className="text-xs text-slate-400">
                    Atas nama: <strong>{userTicket.citizenName}</strong> ({userTicket.citizenNikMasked})
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-center space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Estimasi Dipanggil</span>
                    <span className="text-lg font-bold font-mono text-white">
                      {userTicket.estimatedCallTime}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Di depan Anda:</span>
                    <div className="text-base font-bold font-mono text-amber-400">
                      {userTicket.queueAhead} Orang
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Verification & Security Note */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <QrCode className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-300 font-semibold block">
                      Verifikasi Kriptografis Anti-Calo
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono truncate block max-w-xs">
                      Hash: {userTicket.qrVerificationHash.substring(0, 24)}...
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSlipModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Slip</span>
                  </button>
                  <button
                    onClick={() => setUserTicket(null)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 border border-rose-900/40 transition-colors cursor-pointer"
                    title="Batalkan tiket antrean ini"
                  >
                    Batalkan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Ticket className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Belum Ada Tiket Antrean Aktif</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Anda belum mengambil nomor antrean. Ambil tiket digital untuk mendapatkan estimasi waktu dan kode verifikasi bebas calo.
              </p>
              <button
                onClick={() => setIsTakeTicketModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Ambil Tiket Antrean Sekarang</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: FORM AMBIL TIKET ANTREAN DIGITAL */}
      {isTakeTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Ambil Tiket Antrean Digital</h3>
              </div>
              <button
                onClick={() => setIsTakeTicketModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTakeNewTicket} className="space-y-4 text-xs">
              {/* Pilih Loket */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Pilih Loket Stand Terpadu</label>
                <select
                  value={newTicketCounterId}
                  onChange={(e) => {
                    setNewTicketCounterId(e.target.value);
                    const selected = counters.find((c) => c.id === e.target.value);
                    if (selected && selected.serviceItems[0]) {
                      setNewTicketServiceType(selected.serviceItems[0]);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {counters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.waitingCount} antrean menunggu)
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilih Jenis Layanan Khusus */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Jenis Dokumen / Urusan</label>
                <select
                  value={newTicketServiceType}
                  onChange={(e) => setNewTicketServiceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {(counters.find((c) => c.id === newTicketCounterId)?.serviceItems || []).map(
                    (item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Nama Warga */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Nama Lengkap Pemohon</label>
                <input
                  type="text"
                  required
                  value={newTicketCitizenName}
                  onChange={(e) => setNewTicketCitizenName(e.target.value)}
                  placeholder="Contoh: Ahmad Fauzi"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 4 Digit NIK */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  4 Digit Terakhir NIK (Verifikasi Kependudukan Aman)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={newTicketNikLast4}
                  onChange={(e) => setNewTicketNikLast4(e.target.value.replace(/\D/g, ''))}
                  placeholder="8842"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Anti-Risywah Notice */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-start gap-2 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Komitmen Shiddiq &amp; Bebas Biaya:</strong> Seluruh pelayanan antrean tidak dipungut biaya apa pun. Jangan melayani tawaran calo atau jalan pintas berbayar.
                </span>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTakeTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Konfirmasi &amp; Dapatkan Nomor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SLIP DIGITAL CETAK TIKET ANTREAN */}
      {isSlipModalOpen && userTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative font-sans">
            <button
              onClick={() => setIsSlipModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Slip Header */}
            <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center mx-auto text-sm">
                MPP
              </div>
              <h3 className="font-extrabold text-sm tracking-tight text-slate-900 uppercase">
                Stand Digital Pelayanan Terpadu
              </h3>
              <p className="text-[10px] text-slate-500">
                Islamicity Smart Virtual City • Standar Layanan Fathanah
              </p>
            </div>

            {/* Slip Body Ticket */}
            <div className="text-center py-2 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Nomor Antrean Anda
              </span>
              <div className="text-5xl font-black font-mono tracking-tighter text-slate-900">
                {userTicket.ticketNumber}
              </div>
              <div className="text-xs font-bold text-emerald-700 mt-1">
                {userTicket.counterName}
              </div>
            </div>

            {/* Key Information */}
            <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Pemohon:</span>
                <span className="font-semibold text-slate-800">{userTicket.citizenName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Layanan:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[170px] text-right">
                  {userTicket.serviceType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu Ambil:</span>
                <span className="font-mono text-slate-700">{userTicket.issuedAt}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1">
                <span className="text-slate-500">Estimasi Dipanggil:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {userTicket.estimatedCallTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sisa Antrean:</span>
                <span className="font-bold text-slate-800">{userTicket.queueAhead} Orang</span>
              </div>
            </div>

            {/* QR Simulation */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="p-2 border border-slate-300 rounded-lg inline-block bg-white shadow-inner">
                <QrCode className="w-16 h-16 text-slate-900 mx-auto" />
              </div>
              <p className="text-[9px] text-slate-400 font-mono break-all">
                {userTicket.qrVerificationHash}
              </p>
              <p className="text-[10px] text-slate-600 italic">
                Harap hadir di ruang tunggu 5 menit sebelum estimasi waktu panggilan.
              </p>
            </div>

            {/* Print Slip Button */}
            <div className="pt-2 border-t border-dashed border-slate-300">
              <button
                onClick={() => {
                  alert('Slip antrean digital berhasil disimpan ke perangkat Anda.');
                  setIsSlipModalOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Simpan / Cetak Slip Digital</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
