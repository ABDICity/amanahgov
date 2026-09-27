import React from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Radio,
  ShieldCheck,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { RealtimeNotification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: RealtimeNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectComplaint?: (complaintId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectComplaint,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COMPLAINT_UPDATE':
        return <Radio className="w-4 h-4 text-emerald-400" />;
      case 'BLOCKCHAIN_AUDIT':
        return <ShieldCheck className="w-4 h-4 text-sky-400" />;
      case 'TRANSPARENCY_ALERT':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] mt-12 sm:mt-14"
        id="notification-center-panel"
      >
        {/* Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Pusat Notifikasi Warga Real-time
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {unreadCount} Baru
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                Pantau langsung status tindak lanjut pelayanan publik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            id="btn-close-notif"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{notifications.length} pemberitahuan terekam</span>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                id="btn-mark-all-read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tandai Dibaca
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
                id="btn-clear-notif"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Bersihkan
              </button>
            )}
          </div>
        </div>

        {/* Notification list */}
        <div className="overflow-y-auto p-3 space-y-2.5 flex-1 divide-y divide-slate-800/40">
          {notifications.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400">
              <Bell className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-60" />
              <p className="text-sm font-medium">Belum ada notifikasi baru</p>
              <p className="text-xs text-slate-500 mt-1">
                Pembaruan pengaduan dan transaksi publik akan muncul seketika di sini.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  onMarkAsRead(notif.id);
                  if (notif.complaintId && onSelectComplaint) {
                    onSelectComplaint(notif.complaintId);
                    onClose();
                  }
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                  notif.read
                    ? 'bg-slate-800/30 border-slate-800/80 opacity-75 hover:opacity-100 hover:bg-slate-800/50'
                    : 'bg-emerald-950/20 border-emerald-800/40 hover:bg-emerald-950/30 shadow-sm'
                }`}
                id={`notif-item-${notif.id}`}
              >
                <div className="shrink-0 mt-0.5 p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                  {getTypeIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h4 className="text-xs font-bold text-white leading-tight truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-snug">
                    {notif.message}
                  </p>
                  {notif.complaintId && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                      <span>Buka detail tiket {notif.complaintId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 self-center" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-[11px] text-center text-slate-400">
          Pemberitahuan terhubung dengan sistem broadcast real-time &amp; notifikasi audio.
        </div>
      </div>
    </div>
  );
};
