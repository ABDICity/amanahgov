import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Building,
  User,
  ShieldCheck,
  Zap,
  Filter,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  CalendarRange,
  ListOrdered,
  Layers,
  MapPin,
  ExternalLink,
  Info,
  X,
} from 'lucide-react';
import { Complaint, ComplaintStatus, UrgencyLevel } from '../types';

interface SlaWorkloadCalendarProps {
  complaints: Complaint[];
  onSelectComplaint?: (complaintId: string) => void;
  referenceDate?: Date; // Default to 2026-09-09
}

export interface SlaDeadlineItem {
  complaint: Complaint;
  deadlineDate: Date;
  deadlineDateStr: string; // YYYY-MM-DD
  deadlineTimeFormatted: string; // HH:mm WIB
  deadlineFullFormatted: string; // e.g. "09 Sep 2026, 14:00 WIB"
  hoursRemaining: number;
  isOverdue: boolean;
  isCritical: boolean; // < 4 hours remaining
  isUrgent: boolean; // < 12 hours remaining
  urgencyLevel: UrgencyLevel;
  department: string;
}

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_NAMES_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export const SlaWorkloadCalendar: React.FC<SlaWorkloadCalendarProps> = ({
  complaints,
  onSelectComplaint,
  referenceDate = new Date(2026, 8, 9, 10, 0, 0), // 9 Sep 2026 10:00:00
}) => {
  // Navigation: Month and Year (Default September 2026)
  const [currentYear, setCurrentYear] = useState<number>(referenceDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(referenceDate.getMonth()); // 0-indexed (8 = Sep)
  
  // Selected day for detailed inspector (default 9 Sep 2026)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-09');

  // View Mode: Month Grid | 7-Day Week | Chronological List
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');

  // Filters
  const [filterDepartment, setFilterDepartment] = useState<string>('SEMUA');
  const [filterUrgency, setFilterUrgency] = useState<string>('SEMUA');
  const [filterSlaStatus, setFilterSlaStatus] = useState<string>('SEMUA'); // 'SEMUA' | 'KRITIS' | 'HARI_INI' | 'TERKENDALI'

  // Modal for quick inspection
  const [inspectingComplaint, setInspectingComplaint] = useState<Complaint | null>(null);

  // Parse all active complaints and calculate SLA deadline timestamps
  const allActiveSlaItems = useMemo<SlaDeadlineItem[]>(() => {
    return complaints
      .filter((c) => c.status !== 'Selesai_Teruji')
      .map((c) => {
        // Parse createdAt
        const createdTime = new Date(c.createdAt).getTime();
        const validCreatedTime = isNaN(createdTime) ? referenceDate.getTime() : createdTime;
        const deadlineTimestamp = validCreatedTime + c.slaTargetHours * 3600 * 1000;
        const deadlineDate = new Date(deadlineTimestamp);

        const year = deadlineDate.getFullYear();
        const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
        const day = String(deadlineDate.getDate()).padStart(2, '0');
        const deadlineDateStr = `${year}-${month}-${day}`;

        const hours = String(deadlineDate.getHours()).padStart(2, '0');
        const minutes = String(deadlineDate.getMinutes()).padStart(2, '0');
        const deadlineTimeFormatted = `${hours}:${minutes} WIB`;

        const monthName = MONTH_NAMES_ID[deadlineDate.getMonth()];
        const deadlineFullFormatted = `${day} ${monthName} ${year}, ${deadlineTimeFormatted}`;

        // Compute hours remaining relative to referenceDate
        const diffMs = deadlineTimestamp - referenceDate.getTime();
        const hoursRemaining = parseFloat((diffMs / (3600 * 1000)).toFixed(1));
        const isOverdue = hoursRemaining < 0;
        const isCritical = hoursRemaining >= 0 && hoursRemaining <= 4;
        const isUrgent = hoursRemaining > 4 && hoursRemaining <= 12;

        return {
          complaint: c,
          deadlineDate,
          deadlineDateStr,
          deadlineTimeFormatted,
          deadlineFullFormatted,
          hoursRemaining,
          isOverdue,
          isCritical,
          isUrgent,
          urgencyLevel: c.urgency,
          department: c.assignedDepartment,
        };
      })
      .sort((a, b) => a.hoursRemaining - b.hoursRemaining);
  }, [complaints, referenceDate]);

  // Unique departments from complaints
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    complaints.forEach((c) => {
      if (c.assignedDepartment) set.add(c.assignedDepartment);
    });
    return Array.from(set);
  }, [complaints]);

  // Apply filters
  const filteredSlaItems = useMemo(() => {
    const todayStr = '2026-09-09';
    return allActiveSlaItems.filter((item) => {
      if (filterDepartment !== 'SEMUA' && item.department !== filterDepartment) {
        return false;
      }
      if (filterUrgency !== 'SEMUA' && item.urgencyLevel !== filterUrgency) {
        return false;
      }
      if (filterSlaStatus === 'KRITIS') {
        if (!item.isOverdue && !item.isCritical) return false;
      } else if (filterSlaStatus === 'HARI_INI') {
        if (item.deadlineDateStr !== todayStr) return false;
      } else if (filterSlaStatus === 'TERKENDALI') {
        if (item.isOverdue || item.isCritical) return false;
      }
      return true;
    });
  }, [allActiveSlaItems, filterDepartment, filterUrgency, filterSlaStatus]);

  // Map of date string -> SlaDeadlineItem[]
  const dateToItemsMap = useMemo(() => {
    const map = new Map<string, SlaDeadlineItem[]>();
    filteredSlaItems.forEach((item) => {
      const existing = map.get(item.deadlineDateStr) || [];
      existing.push(item);
      map.set(item.deadlineDateStr, existing);
    });
    return map;
  }, [filteredSlaItems]);

  // Workload Summary KPI stats
  const summaryKpi = useMemo(() => {
    const todayStr = '2026-09-09';
    const tomorrowStr = '2026-09-10';

    const totalActive = allActiveSlaItems.length;
    const dueToday = allActiveSlaItems.filter((i) => i.deadlineDateStr === todayStr).length;
    const dueTomorrow = allActiveSlaItems.filter((i) => i.deadlineDateStr === tomorrowStr).length;
    const criticalOrOverdue = allActiveSlaItems.filter((i) => i.isOverdue || i.isCritical).length;

    // Dept with max load
    const deptCounts: Record<string, number> = {};
    allActiveSlaItems.forEach((i) => {
      deptCounts[i.department] = (deptCounts[i.department] || 0) + 1;
    });
    let topDept = 'Tidak ada';
    let maxCount = 0;
    Object.entries(deptCounts).forEach(([dept, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topDept = dept;
      }
    });

    return {
      totalActive,
      dueToday,
      dueTomorrow,
      criticalOrOverdue,
      topDept,
      topDeptCount: maxCount,
    };
  }, [allActiveSlaItems]);

  // Generate Month Calendar Grid cells
  const monthGridDays = useMemo(() => {
    // First day of currentMonth
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // In Indonesian/European calendar, Monday is first day:
    // Sunday (0) -> 6, Monday (1) -> 0, Tuesday (2) -> 1, etc.
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    // Total days in currentMonth
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Days from previous month to fill row
    const prevMonthDaysCount = new Date(currentYear, currentMonth, 0).getDate();
    const cells: {
      date: Date;
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Prev month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthDaysCount - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const d = String(dayNum).padStart(2, '0');
      cells.push({
        date: prevDate,
        dateStr: `${y}-${m}-${d}`,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: `${y}-${m}-${d}` === '2026-09-09',
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const y = currentYear;
      const m = String(currentMonth + 1).padStart(2, '0');
      const d = String(dayNum).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      cells.push({
        date: new Date(currentYear, currentMonth, dayNum),
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dateStr === '2026-09-09',
      });
    }

    // Next month padding to fill grid (multiples of 7)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextDate = new Date(currentYear, currentMonth + 1, dayNum);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const d = String(dayNum).padStart(2, '0');
      cells.push({
        date: nextDate,
        dateStr: `${y}-${m}-${d}`,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: `${y}-${m}-${d}` === '2026-09-09',
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Current Week Days (Week of 7 - 13 Sep 2026)
  const weekDays = useMemo(() => {
    // 9 Sep 2026 is Wednesday (index 2 in Monday-start week)
    const base = new Date(2026, 8, 9);
    const dayOfWeek = (base.getDay() + 6) % 7; // Monday = 0, Wed = 2
    const monday = new Date(base);
    monday.setDate(base.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dt = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dt}`;
      days.push({
        date: d,
        dateStr,
        dayName: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][i],
        dayNumber: d.getDate(),
        isToday: dateStr === '2026-09-09',
      });
    }
    return days;
  }, []);

  // Items for the currently selected date
  const selectedDateItems = useMemo(() => {
    return dateToItemsMap.get(selectedDateStr) || [];
  }, [dateToItemsMap, selectedDateStr]);

  // Format selected date title
  const selectedDateTitle = useMemo(() => {
    const parts = selectedDateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dateObj = new Date(y, m, d);
      const dayNamesLong = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dayName = dayNamesLong[dateObj.getDay()];
      const isToday = selectedDateStr === '2026-09-09';
      return `${dayName}, ${d} ${MONTH_NAMES_ID[m]} ${y}${isToday ? ' (Hari Ini)' : ''}`;
    }
    return selectedDateStr;
  }, [selectedDateStr]);

  // Handlers for month nav
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8); // September
    setSelectedDateStr('2026-09-09');
  };

  const handleResetFilters = () => {
    setFilterDepartment('SEMUA');
    setFilterUrgency('SEMUA');
    setFilterSlaStatus('SEMUA');
  };

  const isFilterActive =
    filterDepartment !== 'SEMUA' || filterUrgency !== 'SEMUA' || filterSlaStatus !== 'SEMUA';

  // Helper for Urgency Badge
  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'Darurat':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-500 animate-pulse',
        };
      case 'Tinggi':
        return {
          bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          dot: 'bg-orange-500',
        };
      case 'Sedang':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-500',
        };
      case 'Rendah':
        return {
          bg: 'bg-slate-700 text-slate-300 border-slate-600',
          dot: 'bg-slate-400',
        };
    }
  };

  // Helper for Status Badge
  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Diajukan':
        return 'bg-slate-700/70 text-slate-300 border-slate-600';
      case 'Diverifikasi_Shiddiq':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Disposisi_Amanah':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Pengerjaan_Khidmat':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Audit_Validasi':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm">
      {/* Calendar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Manajemen Beban Kerja &amp; Batas Waktu SLA</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Kalender Pemetaan Tenggat SLA &amp; Proyeksi Beban Harian
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Visualisasi kalender komprehensif untuk mengantisipasi batas waktu penyelesaian aduan aktif. Membantu pimpinan dan petugas OPD mendistribusikan penugasan lapangan agar standar SLA 100% tepat waktu terpenuhi.
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 shrink-0 self-start lg:self-center">
          <button
            onClick={() => setViewMode('month')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'month'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilan kalender bulanan"
            id="btn-calendar-view-month"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Bulanan</span>
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'week'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilan agenda mingguan"
            id="btn-calendar-view-week"
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Mingguan</span>
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'agenda'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilan daftar proyeksi kronologis"
            id="btn-calendar-view-agenda"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Daftar Proyeksi</span>
          </button>
        </div>
      </div>

      {/* 4 Workload Summary KPI Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Total Aduan Terjadwal</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {summaryKpi.totalActive}{' '}
            <span className="text-xs font-normal text-slate-400">Berkas Aktif</span>
          </p>
          <p className="text-[10px] sm:text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            100% Terpetakan pada SLA
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Jatuh Tempo Hari Ini</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-300 font-mono">
            {summaryKpi.dueToday}{' '}
            <span className="text-xs font-normal text-slate-400">Aduan (9 Sep)</span>
          </p>
          <p className="text-[10px] sm:text-[11px] text-amber-400 mt-1">
            Prioritas penuntasan hari kerja ini
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Tenggat Kritis / Terlewat</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-rose-400 font-mono">
            {summaryKpi.criticalOrOverdue}{' '}
            <span className="text-xs font-normal text-slate-400">Perlu Aksi Segera</span>
          </p>
          <p className="text-[10px] sm:text-[11px] text-rose-400 mt-1">
            Sisa waktu &lt; 4 jam atau terlewat
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Beban Tertinggi per Dinas</span>
            <Building className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-sm sm:text-base font-bold text-white truncate" title={summaryKpi.topDept}>
            {summaryKpi.topDept}
          </p>
          <p className="text-[10px] sm:text-[11px] text-sky-400 mt-1">
            {summaryKpi.topDeptCount} tugas aktif terjadwal
          </p>
        </div>
      </div>

      {/* Filter Toolbar & Month Navigation Bar */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Month Navigator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Bulan sebelumnya"
              id="btn-prev-month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 font-bold text-xs sm:text-sm text-white min-w-[130px] text-center font-mono">
              {MONTH_NAMES_ID[currentMonth]} {currentYear}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Bulan berikutnya"
              id="btn-next-month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGoToday}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Kembali ke hari ini (9 September 2026)"
            id="btn-go-today"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hari Ini</span>
          </button>
        </div>

        {/* Right: Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Filter OPD */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="SEMUA">Semua Dinas (OPD)</option>
              {departmentsList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Urgensi */}
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="SEMUA">Semua Urgensi</option>
            <option value="Darurat">Darurat</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </select>

          {/* Filter SLA Status */}
          <select
            value={filterSlaStatus}
            onChange={(e) => setFilterSlaStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="SEMUA">Semua Status SLA</option>
            <option value="KRITIS">Kritis &amp; Terlewat</option>
            <option value="HARI_INI">Jatuh Tempo Hari Ini</option>
            <option value="TERKENDALI">Terkendali (&gt; 12 Jam)</option>
          </select>

          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Reset filter kalender"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: MONTHLY CALENDAR GRID + DAY INSPECTOR */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main Month Grid (8 Cols) */}
          <div className="xl:col-span-8 space-y-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
              {/* Day Headers (Senin s/d Minggu) */}
              <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/80 text-center text-xs font-bold text-slate-400 py-2.5">
                {DAY_NAMES_ID.map((day) => (
                  <div key={day} className="tracking-wide">
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/80 bg-slate-950">
                {monthGridDays.map((cell) => {
                  const itemsOnDay = dateToItemsMap.get(cell.dateStr) || [];
                  const isSelected = selectedDateStr === cell.dateStr;
                  const hasItems = itemsOnDay.length > 0;
                  const hasCritical = itemsOnDay.some((i) => i.isOverdue || i.isCritical);
                  const hasUrgent = itemsOnDay.some((i) => i.isUrgent);

                  return (
                    <div
                      key={cell.dateStr}
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      className={`min-h-[92px] sm:min-h-[105px] p-1.5 sm:p-2 flex flex-col justify-between transition-all cursor-pointer select-none group relative ${
                        isSelected
                          ? 'bg-emerald-950/40 ring-2 ring-emerald-500/80 z-10'
                          : cell.isCurrentMonth
                          ? 'hover:bg-slate-900/70 bg-slate-950'
                          : 'bg-slate-950/40 opacity-40 hover:opacity-70'
                      }`}
                    >
                      {/* Top bar in cell: Day number + Today badge + Workload Dot */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs sm:text-sm font-bold font-mono px-1.5 py-0.5 rounded ${
                            cell.isToday
                              ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                              : isSelected
                              ? 'text-emerald-400 font-extrabold'
                              : cell.isCurrentMonth
                              ? 'text-slate-300'
                              : 'text-slate-500'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {hasItems && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono flex items-center gap-1 ${
                              hasCritical
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : hasUrgent
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                hasCritical
                                  ? 'bg-rose-500 animate-ping'
                                  : hasUrgent
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                            />
                            <span>{itemsOnDay.length} SLA</span>
                          </span>
                        )}
                      </div>

                      {/* Complaint Chips inside Day cell */}
                      <div className="space-y-1 my-1 overflow-hidden">
                        {itemsOnDay.slice(0, 2).map((item) => {
                          const uBadge = getUrgencyBadge(item.urgencyLevel);
                          return (
                            <div
                              key={item.complaint.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectingComplaint(item.complaint);
                              }}
                              className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 transition-all ${
                                item.isOverdue
                                  ? 'bg-rose-950/80 text-rose-200 border border-rose-700/60'
                                  : item.isCritical
                                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 hover:border-slate-500'
                              }`}
                              title={`${item.complaint.id}: ${item.complaint.title} (${item.deadlineTimeFormatted})`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${uBadge.dot}`} />
                              <span className="truncate font-semibold">{item.complaint.id}</span>
                              <span className="text-[9px] text-slate-400 hidden sm:inline">
                                {item.deadlineTimeFormatted}
                              </span>
                            </div>
                          );
                        })}

                        {itemsOnDay.length > 2 && (
                          <div className="text-[9px] font-bold text-slate-400 px-1 truncate">
                            +{itemsOnDay.length - 2} lainnya...
                          </div>
                        )}
                      </div>

                      {/* Bottom status line */}
                      <div className="text-[9px] text-slate-500 text-right font-mono">
                        {cell.isToday ? (
                          <span className="text-emerald-400 font-semibold">HARI INI</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend / Info Bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Terkendali (&gt; 12 Jam)</span>
                </span>
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Mendesak (4-12 Jam)</span>
                </span>
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>Kritis / Terlewat (&lt; 4 Jam)</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Klik tanggal untuk melihat proyeksi beban kerja &amp; tugas lapangan
              </span>
            </div>
          </div>

          {/* Right: Detailed Day Workload Inspector (4 Cols) */}
          <div className="xl:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Day Inspector Header */}
              <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                    Rincian Beban Kerja Harian
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {selectedDateTitle}
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedDateItems.length} Pengaduan
                </span>
              </div>

              {/* Day Content: List of complaints due on selected day */}
              {selectedDateItems.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400/80" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-300">
                      Kapasitas Bebas / Tidak Ada Tenggat SLA
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      Tidak ada aduan aktif dengan batas waktu SLA pada tanggal ini. Tim dapat difokuskan untuk inspeksi preventif atau percepatan tiket berjalan lainnya.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {selectedDateItems.map((item) => {
                    const uBadge = getUrgencyBadge(item.urgencyLevel);
                    return (
                      <div
                        key={item.complaint.id}
                        className={`p-3.5 rounded-xl border transition-all text-xs space-y-2.5 ${
                          item.isOverdue
                            ? 'bg-rose-950/30 border-rose-700/80'
                            : item.isCritical
                            ? 'bg-rose-950/20 border-rose-800/60'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Card Header: ID, Urgency, Deadline */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-emerald-400">
                              {item.complaint.id}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${uBadge.bg}`}
                            >
                              {item.urgencyLevel}
                            </span>
                          </div>

                          <span
                            className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                              item.isOverdue
                                ? 'bg-rose-900/80 text-rose-200'
                                : item.isCritical
                                ? 'bg-amber-900/60 text-amber-200'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.deadlineTimeFormatted}
                          </span>
                        </div>

                        {/* Title */}
                        <h5 className="font-bold text-white text-xs leading-snug">
                          {item.complaint.title}
                        </h5>

                        {/* Department & Officer */}
                        <div className="space-y-1 text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5 truncate">
                            <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{item.department}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{item.complaint.officerName}</span>
                          </div>
                        </div>

                        {/* SLA Progress Countdown Indicator */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">
                            {item.isOverdue ? (
                              <span className="text-rose-400 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Terlewat {Math.abs(item.hoursRemaining)} jam
                              </span>
                            ) : (
                              <span className="text-slate-300 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                Sisa waktu: <strong>{item.hoursRemaining} jam</strong>
                              </span>
                            )}
                          </span>

                          <button
                            onClick={() => setInspectingComplaint(item.complaint)}
                            className="text-emerald-400 hover:text-emerald-300 font-semibold text-[11px] cursor-pointer flex items-center gap-1"
                          >
                            <span>Detail</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Fathanah Workload Balancing Hint */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-300 leading-relaxed">
                <strong>Prinsip Fathanah:</strong> Penugasan terdistribusi secara seimbang antar petugas dan satgas lapangan untuk mencegah <em>bottleneck</em> pada tanggal-tanggal padat.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: WEEKLY SCHEDULE VIEW (7 DAYS) */}
      {viewMode === 'week' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">
              Jadwal Pekan Ini: 7 - 13 September 2026
            </span>
            <span>Distribusi Beban Jam Kerja Harian</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const itemsOnDay = dateToItemsMap.get(day.dateStr) || [];
              const isSelected = selectedDateStr === day.dateStr;

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between min-h-[220px] transition-all cursor-pointer ${
                    day.isToday
                      ? 'bg-slate-900 border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-sm'
                      : isSelected
                      ? 'bg-slate-900 border-slate-600 ring-1 ring-slate-600'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Day Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                      <div>
                        <span className="text-xs font-bold text-white block">{day.dayName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {day.dayNumber} Sep
                        </span>
                      </div>
                      {day.isToday ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                          HARI INI
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {itemsOnDay.length} SLA
                        </span>
                      )}
                    </div>

                    {/* Cards on this day */}
                    <div className="space-y-1.5">
                      {itemsOnDay.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic py-4 text-center">
                          Bebas antrean SLA
                        </p>
                      ) : (
                        itemsOnDay.map((item) => (
                          <div
                            key={item.complaint.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingComplaint(item.complaint);
                            }}
                            className={`p-2 rounded-lg border text-[10px] space-y-1 ${
                              item.isOverdue
                                ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                                : item.isCritical
                                ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                                : 'bg-slate-850 bg-slate-900 border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between font-mono font-bold">
                              <span>{item.complaint.id}</span>
                              <span>{item.deadlineTimeFormatted}</span>
                            </div>
                            <p className="line-clamp-2 font-medium leading-tight">
                              {item.complaint.title}
                            </p>
                            <div className="text-[9px] text-slate-400 truncate">
                              {item.department.replace('Dinas ', '')}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] font-semibold text-right">
                    {itemsOnDay.length > 0 ? (
                      <span className="text-emerald-400 font-mono">
                        {itemsOnDay.length} Penugasan
                      </span>
                    ) : (
                      <span className="text-slate-600">Siaga</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: CHRONOLOGICAL AGENDA PROJECTION */}
      {viewMode === 'agenda' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">
              Daftar Proyeksi SLA Terurut Berdasarkan Waktu Batas Terdekat
            </span>
            <span className="font-mono">{filteredSlaItems.length} Pengaduan Aktif</span>
          </div>

          <div className="space-y-2.5">
            {filteredSlaItems.map((item) => {
              const uBadge = getUrgencyBadge(item.urgencyLevel);
              const isToday = item.deadlineDateStr === '2026-09-09';

              return (
                <div
                  key={item.complaint.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    item.isOverdue
                      ? 'bg-rose-950/40 border-rose-700/80'
                      : item.isCritical
                      ? 'bg-rose-950/20 border-rose-800/60'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Left: ID, Urgency, Title, OPD */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-emerald-400">
                        {item.complaint.id}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${uBadge.bg}`}
                      >
                        {item.urgencyLevel}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadge(
                          item.complaint.status
                        )}`}
                      >
                        {item.complaint.status.replace('_', ' ')}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                          HARI INI
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-white">{item.complaint.title}</h4>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.department}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.complaint.officerName}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate max-w-[200px]">{item.complaint.location}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Deadline info and Action button */}
                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <div className="text-xs font-mono font-bold text-white">
                        {item.deadlineFullFormatted}
                      </div>
                      <div className="text-[11px] mt-0.5">
                        {item.isOverdue ? (
                          <span className="text-rose-400 font-bold flex items-center gap-1 md:justify-end">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Terlewat {Math.abs(item.hoursRemaining)} jam
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            Sisa:{' '}
                            <strong
                              className={
                                item.isCritical ? 'text-amber-400' : 'text-emerald-400'
                              }
                            >
                              {item.hoursRemaining} jam
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectingComplaint(item.complaint)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Lihat Detail</span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Detailed Quick Inspector for a Complaint */}
      {inspectingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {inspectingComplaint.id}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      getUrgencyBadge(inspectingComplaint.urgency).bg
                    }`}
                  >
                    Urgensi {inspectingComplaint.urgency}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadge(
                      inspectingComplaint.status
                    )}`}
                  >
                    {inspectingComplaint.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">{inspectingComplaint.title}</h4>
              </div>

              <button
                onClick={() => setInspectingComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {inspectingComplaint.description}
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">Dinas Bertanggung Jawab:</span>
                <span className="font-bold text-white block">
                  {inspectingComplaint.assignedDepartment}
                </span>
                <span className="text-slate-400 text-[11px] block">
                  Petugas: {inspectingComplaint.officerName}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">Batas Waktu Standar SLA:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm block">
                  {inspectingComplaint.slaTargetHours} Jam
                </span>
                <span className="text-slate-400 text-[11px] block">
                  Durasi Berjalan: {inspectingComplaint.elapsedHours} Jam
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">Pelapor / Pemohon:</span>
                <span className="font-semibold text-white block">
                  {inspectingComplaint.citizenName}
                </span>
                <span className="text-slate-400 text-[11px] font-mono block">
                  NIK: {inspectingComplaint.citizenNikMasked}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                <span className="text-slate-400 text-[11px] block">Lokasi Lapangan:</span>
                <span className="font-semibold text-white block truncate">
                  {inspectingComplaint.location}
                </span>
              </div>
            </div>

            {/* Blockchain Immutability Proof */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Kriptografi Transparansi Blockchain AmanahGov</span>
              </div>
              <p className="text-slate-400 font-mono truncate">
                TxHash: {inspectingComplaint.txHash}
              </p>
              <p className="text-slate-500">
                Tercatat pada Blok #{inspectingComplaint.blockHeight} • Tidak Dapat Dimanipulasi
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setInspectingComplaint(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Tutup
              </button>

              {onSelectComplaint && (
                <button
                  onClick={() => {
                    const id = inspectingComplaint.id;
                    setInspectingComplaint(null);
                    onSelectComplaint(id);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  id="btn-goto-complaint-view"
                >
                  <span>Buka di Pelacakan Tiket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
