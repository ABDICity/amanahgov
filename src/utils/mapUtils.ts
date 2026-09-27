import { Complaint, ComplaintCoordinates, UrgencyLevel } from '../types';

export interface MunicipalDistrict {
  id: string;
  name: string;
  sector: 'Sentral' | 'Barat' | 'Timur' | 'Selatan' | 'Utara';
  code: string;
  color: string;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  headquarters: string;
  contactNumber: string;
}

export const MUNICIPAL_DISTRICTS: MunicipalDistrict[] = [
  {
    id: 'dist-sentral',
    name: 'Sektor Sentral (Pusat Pemerintahan & Niaga)',
    sector: 'Sentral',
    code: 'SKT-01',
    color: '#10b981', // emerald
    bounds: { minX: 38, maxX: 62, minY: 32, maxY: 56 },
    headquarters: 'Balaikota Khidmat & Posko Sentral Amanah',
    contactNumber: '021-500-111',
  },
  {
    id: 'dist-barat',
    name: 'Sektor Barat (Pemukiman & Faskes Sukamaju)',
    sector: 'Barat',
    code: 'SKT-02',
    color: '#06b6d4', // cyan
    bounds: { minX: 12, maxX: 36, minY: 28, maxY: 62 },
    headquarters: 'Posko Wilayah Barat Sukamaju',
    contactNumber: '021-500-112',
  },
  {
    id: 'dist-timur',
    name: 'Sektor Timur (Sentra UMKM & Industri Sunan Giri)',
    sector: 'Timur',
    code: 'SKT-03',
    color: '#8b5cf6', // purple
    bounds: { minX: 64, maxX: 88, minY: 34, maxY: 68 },
    headquarters: 'Posko Wilayah Timur Sunan Giri',
    contactNumber: '021-500-113',
  },
  {
    id: 'dist-selatan',
    name: 'Sektor Selatan (Kawasan Cipayung & Penghubung)',
    sector: 'Selatan',
    code: 'SKT-04',
    color: '#f59e0b', // amber
    bounds: { minX: 28, maxX: 72, minY: 64, maxY: 90 },
    headquarters: 'Posko Dinas PU & Tata Ruang Cipayung',
    contactNumber: '021-500-114',
  },
  {
    id: 'dist-utara',
    name: 'Sektor Utara (Administrasi & Logistik Sukajadi)',
    sector: 'Utara',
    code: 'SKT-05',
    color: '#3b82f6', // blue
    bounds: { minX: 30, maxX: 76, minY: 10, maxY: 30 },
    headquarters: 'Inspektorat Lapangan Sukajadi',
    contactNumber: '021-500-115',
  },
];

export interface FieldUnitStation {
  id: string;
  name: string;
  sector: string;
  xPercent: number;
  yPercent: number;
  availableVehicles: number;
  assignedTeam: string;
  status: 'SIAGA' | 'DI_LAPANGAN' | 'PATROLI';
}

export const FIELD_UNIT_STATIONS: FieldUnitStation[] = [
  {
    id: 'station-1',
    name: 'Posko TRC Cepat Sentral',
    sector: 'Sektor Sentral',
    xPercent: 50,
    yPercent: 44,
    availableVehicles: 4,
    assignedTeam: 'Satgas Khidmat Amanah 01',
    status: 'SIAGA',
  },
  {
    id: 'station-2',
    name: 'Depo Alat Berat & Aspal Selatan',
    sector: 'Sektor Selatan',
    xPercent: 35,
    yPercent: 78,
    availableVehicles: 2,
    assignedTeam: 'Tim Perbaikan Jalan PU',
    status: 'DI_LAPANGAN',
  },
  {
    id: 'station-3',
    name: 'Armada Logistik Farmasi Sukamaju',
    sector: 'Sektor Barat',
    xPercent: 18,
    yPercent: 38,
    availableVehicles: 3,
    assignedTeam: 'Unit Medis Keliling Dinkes',
    status: 'SIAGA',
  },
  {
    id: 'station-4',
    name: 'Inspektorat Reaksi Cepat Utara',
    sector: 'Sektor Utara',
    xPercent: 68,
    yPercent: 22,
    availableVehicles: 2,
    assignedTeam: 'Satgas Integritas Whistleblower',
    status: 'PATROLI',
  },
];

/**
 * Derives or fallback generates accurate map coordinates for any complaint.
 */
export function getComplaintCoordinates(complaint: Complaint): ComplaintCoordinates {
  if (complaint.coordinates) {
    return complaint.coordinates;
  }

  // Determine district from location string if possible
  const loc = (complaint.location + ' ' + complaint.title).toLowerCase();
  let district = MUNICIPAL_DISTRICTS[0];

  if (loc.includes('cipayung') || loc.includes('pasar induk') || loc.includes('selatan')) {
    district = MUNICIPAL_DISTRICTS.find((d) => d.sector === 'Selatan') || district;
  } else if (loc.includes('sukamaju') || loc.includes('sehat') || loc.includes('barat') || loc.includes('puskesmas')) {
    district = MUNICIPAL_DISTRICTS.find((d) => d.sector === 'Barat') || district;
  } else if (loc.includes('sunan giri') || loc.includes('umkm') || loc.includes('timur')) {
    district = MUNICIPAL_DISTRICTS.find((d) => d.sector === 'Timur') || district;
  } else if (loc.includes('sukajadi') || loc.includes('ktp') || loc.includes('utara') || loc.includes('pungli')) {
    district = MUNICIPAL_DISTRICTS.find((d) => d.sector === 'Utara') || district;
  } else if (loc.includes('tanah abang') || loc.includes('kebon melati') || loc.includes('pusat')) {
    district = MUNICIPAL_DISTRICTS.find((d) => d.sector === 'Sentral') || district;
  }

  // Deterministic pseudorandom offset based on complaint ID
  let hash = 0;
  for (let i = 0; i < complaint.id.length; i++) {
    hash = (hash << 5) - hash + complaint.id.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const xSpan = district.bounds.maxX - district.bounds.minX;
  const ySpan = district.bounds.maxY - district.bounds.minY;

  const xPercent = Number((district.bounds.minX + (absHash % 100) * 0.01 * xSpan).toFixed(1));
  const yPercent = Number((district.bounds.minY + ((absHash >> 3) % 100) * 0.01 * ySpan).toFixed(1));

  // Realistic Jakarta/Madinah bounding coordinates
  const lat = Number((-6.2000 + (yPercent - 50) * 0.003).toFixed(5));
  const lng = Number((106.8300 + (xPercent - 50) * 0.003).toFixed(5));

  return {
    lat,
    lng,
    xPercent,
    yPercent,
    districtName: district.name,
  };
}

/**
 * Calculate distance in KM between 2 percentage points on city grid (~15km x 15km city)
 */
export function estimateDistanceKm(x1: number, y1: number, x2: number, y2: number): number {
  const dx = (x1 - x2) * 0.15;
  const dy = (y1 - y2) * 0.15;
  return Number(Math.sqrt(dx * dx + dy * dy).toFixed(1));
}

/**
 * Priority scoring calculation for Agency Dispatch (Higher = Needs Immediate Field Action)
 */
export function calculateFieldPriorityScore(complaint: Complaint): {
  score: number;
  reason: string;
  slaRemainingHours: number;
  isSlaWarning: boolean;
} {
  let score = 0;
  const slaRemaining = Math.max(0, complaint.slaTargetHours - complaint.elapsedHours);
  const isSlaWarning = slaRemaining <= 4 && complaint.status !== 'Selesai_Teruji';

  // Urgency weight
  if (complaint.urgency === 'Darurat') score += 50;
  else if (complaint.urgency === 'Tinggi') score += 35;
  else if (complaint.urgency === 'Sedang') score += 20;
  else score += 10;

  // SLA time remaining penalty
  if (complaint.status !== 'Selesai_Teruji') {
    if (slaRemaining <= 2) score += 40;
    else if (slaRemaining <= 6) score += 25;
    else if (slaRemaining <= 12) score += 15;
  }

  // Status weight
  if (complaint.status === 'Diajukan') score += 15;
  else if (complaint.status === 'Diverifikasi_Shiddiq') score += 20;
  else if (complaint.status === 'Disposisi_Amanah') score += 25;
  else if (complaint.status === 'Pengerjaan_Khidmat') score += 10;
  else score = 0; // Selesai

  let reason = 'Pengawasan rutin lapangan';
  if (complaint.urgency === 'Darurat') {
    reason = 'Tingkat Darurat Tinggi: Wajib respon tim lapangan segera!';
  } else if (isSlaWarning) {
    reason = `Peringatan SLA: Sisa waktu ${slaRemaining} jam menuju batas maksimal`;
  } else if (complaint.status === 'Disposisi_Amanah') {
    reason = 'Disposisi terbit: Menunggu keberangkatan unit ke lokasi';
  } else if (complaint.status === 'Diajukan') {
    reason = 'Aduan baru: Butuh verifikasi fisik lapangan';
  }

  return {
    score,
    reason,
    slaRemainingHours: slaRemaining,
    isSlaWarning,
  };
}
