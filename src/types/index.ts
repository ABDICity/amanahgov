export type PillarType = 'Shiddiq' | 'Amanah' | 'Tabligh' | 'Fathanah';

export type ComplaintStatus =
  | 'Diajukan'
  | 'Diverifikasi_Shiddiq'
  | 'Disposisi_Amanah'
  | 'Pengerjaan_Khidmat'
  | 'Audit_Validasi'
  | 'Selesai_Teruji';

export type ComplaintCategory =
  | 'Infrastruktur Jalan'
  | 'Bansos & Bantuan Sosial'
  | 'Kesehatan & Puskesmas'
  | 'Perizinan Usaha & UMKM'
  | 'Laporan Pungli & Integritas'
  | 'Administrasi Kependudukan';

export type UrgencyLevel = 'Rendah' | 'Sedang' | 'Tinggi' | 'Darurat';

export interface ComplaintTimelineStep {
  id: string;
  status: ComplaintStatus;
  title: string;
  timestamp: string;
  note: string;
  officer: string;
  blockHeight?: number;
  txHash?: string;
}

export interface ComplaintCoordinates {
  lat: number;
  lng: number;
  xPercent: number;
  yPercent: number;
  districtName: string;
}

export interface Complaint {
  id: string;
  citizenName: string;
  citizenNikMasked: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  location: string;
  urgency: UrgencyLevel;
  createdAt: string;
  updatedAt: string;
  status: ComplaintStatus;
  assignedDepartment: string;
  officerName: string;
  slaTargetHours: number;
  elapsedHours: number;
  txHash: string;
  blockHeight: number;
  timeline: ComplaintTimelineStep[];
  evidenceUrl?: string;
  rating?: number;
  feedback?: string;
  coordinates?: ComplaintCoordinates;
  whatsappNumber?: string;
  isWhatsappNotificationEnabled?: boolean;
}

export type TransactionType =
  | 'PENGADUAN_WARGA'
  | 'PENYALURAN_BANSOS'
  | 'PENGADAAN_MEDIS'
  | 'PERIZINAN_USAHA'
  | 'AUDIT_INTEGRITAS';

export interface BlockchainTransaction {
  txId: string;
  timestamp: string;
  type: TransactionType;
  title: string;
  amount?: number;
  recipient: string;
  officer: string;
  agency: string;
  pilar: PillarType;
  dataPayload: Record<string, unknown>;
  txHash: string;
  blockHeight: number;
  isTampered?: boolean;
  status: 'TERVERIFIKASI' | 'TERTUNDA' | 'DITOLAK_AUDIT';
}

export interface BlockchainBlock {
  blockHeight: number;
  timestamp: string;
  previousHash: string;
  merkleRoot: string;
  blockHash: string;
  nonce: number;
  transactions: BlockchainTransaction[];
  validatorNode: string;
  integrityStatus: 'VALID' | 'COMPROMISED' | 'PENDING';
}

export type NotificationType =
  | 'COMPLAINT_UPDATE'
  | 'BLOCKCHAIN_AUDIT'
  | 'TRANSPARENCY_ALERT'
  | 'SYSTEM';

export interface RealtimeNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: NotificationType;
  complaintId?: string;
  txHash?: string;
  read: boolean;
  severity?: 'info' | 'success' | 'warning' | 'error';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  blockHeight: number;
  status: 'PASSED' | 'FAILED' | 'REPAIRED';
  checksPerformed: string[];
  anomaliesDetected: number;
  details: string;
  auditor: string;
}

export interface DepartmentMetric {
  name: string;
  category: string;
  totalHandled: number;
  resolvedOnTime: number;
  avgResolutionHours: number;
  satisfactionScore: number; // 0 - 5.0
  integrityIndex: number; // 0 - 100%
  activeComplaints: number;
}

export interface ServiceCounter {
  id: string;
  code: string;
  name: string;
  serviceCategory: string;
  department: string;
  officerName: string;
  officerRole: string;
  currentTicketNumber: string;
  currentCitizenName: string;
  currentCitizenNikMasked: string;
  startedServingAt: string;
  avgServiceMinutes: number;
  waitingCount: number;
  servedTodayCount: number;
  status: 'MELAYANI' | 'MEMANGGIL' | 'SIAGA' | 'ISTIRAHAT';
  targetSlaMinutes: number;
  currentRemainingMinutes: number;
  serviceItems: string[];
}

export interface UserQueueTicket {
  ticketNumber: string;
  counterId: string;
  counterCode: string;
  counterName: string;
  serviceType: string;
  citizenName: string;
  citizenNikMasked: string;
  issuedAt: string;
  estimatedCallTime: string;
  estimatedWaitMinutes: number;
  queueAhead: number;
  qrVerificationHash: string;
  status: 'MENUNGGU' | 'DIPANGGIL' | 'SELESAI' | 'DIBATALKAN';
}

export interface HourlyQueueSlot {
  timeSlot: string;
  crowdLevel: 'RENDAH' | 'SEDANG' | 'PADAT';
  estWaitMinutes: number;
  recommendation: string;
  activeCounters: number;
}

export interface WhatsAppMessage {
  id: string;
  recipientPhone: string;
  recipientName: string;
  complaintId: string;
  complaintTitle: string;
  status: ComplaintStatus;
  statusLabel: string;
  messageBody: string;
  sentAt: string;
  deliveryStatus: 'SENT' | 'DELIVERED' | 'READ';
  templateName: string;
  officerName: string;
  department: string;
  trackingUrl: string;
  txHash?: string;
  apiProvider: 'Meta Cloud API (Simulasi)' | 'Wablas Gateway' | 'Fonnte Enterprise';
  rawApiResponse?: Record<string, unknown>;
}

export interface WhatsAppGatewayConfig {
  isEnabled: boolean;
  provider: 'Meta Cloud API (Simulasi)' | 'Wablas Gateway' | 'Fonnte Enterprise';
  senderNumber: string;
  businessName: string;
  verifiedBadge: boolean;
  autoSendOnStatusChange: boolean;
}

