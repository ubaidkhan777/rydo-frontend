import React from 'react';
import { Navigation, DollarSign, Clock, MapPin, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const statusColors = {
  pending:   'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  active:    'bg-green-400/10 text-green-400 border-green-400/20',
  completed: 'bg-surface-muted/10 text-surface-muted border-surface-muted/20',
};

const RideCard = ({ ride, onAccept, onReject }) => {
  const statusClass = statusColors[ride.status] || statusColors.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="bg-surface-card border border-surface-border rounded-2xl p-5 hover:border-amber-400/25 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <Navigation size={16} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">Route #{ride.id.slice(0, 6)}</h3>
            <p className="text-[11px] text-surface-muted mt-0.5">{ride.pickup_points.length} pickup points</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${statusClass}`}>
          {ride.status}
        </span>
      </div>

      {/* Route */}
      <div className="flex gap-3 mb-4">
        <div className="flex flex-col items-center pt-1 gap-1 shrink-0">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <div className="w-px flex-1 border-l border-dashed border-surface-border" />
          <div className="w-2 h-2 rounded-full bg-red-400" />
        </div>
        <div className="space-y-3 text-xs flex-1 overflow-hidden">
          <div>
            <p className="text-[10px] text-surface-muted uppercase tracking-wider mb-0.5">Pickup</p>
            <p className="text-white font-medium truncate">{ride.pickup_points[0].address}</p>
          </div>
          <div>
            <p className="text-[10px] text-surface-muted uppercase tracking-wider mb-0.5">Destination</p>
            <p className="text-white font-medium truncate">{ride.destination.address}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 bg-surface-base border border-surface-border rounded-xl px-3 py-2.5">
          <DollarSign size={13} className="text-amber-400 shrink-0" />
          <span className="text-sm font-bold text-white">{ride.fare} PKR</span>
        </div>
        <div className="flex items-center gap-2 bg-surface-base border border-surface-border rounded-xl px-3 py-2.5">
          <Clock size={13} className="text-amber-400 shrink-0" />
          <span className="text-sm font-bold text-white">~{Math.round(ride.duration / 60)} min</span>
        </div>
      </div>

      {/* Accept / Reject */}
      {(onAccept || onReject) && (
        <div className="flex gap-2">
          {onReject && (
            <button
              onClick={(e) => { e.stopPropagation(); onReject(ride.id); }}
              className="flex-1 py-2.5 flex items-center justify-center gap-1.5 bg-surface-base border border-surface-border text-surface-muted text-xs font-bold rounded-xl hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/20 active:scale-[0.98] transition-all"
            >
              <X size={14} /> Reject
            </button>
          )}
          {onAccept && (
            <button
              onClick={(e) => { e.stopPropagation(); onAccept(ride.id); }}
              className="flex-[2] py-2.5 flex items-center justify-center gap-1.5 bg-amber-400 text-surface-base text-sm font-bold rounded-xl hover:bg-amber-300 active:scale-[0.98] transition-all"
            >
              <Check size={16} /> Accept Ride
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default RideCard;