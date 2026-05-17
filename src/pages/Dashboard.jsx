import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Map from '../components/Map';
import RideCard from '../components/RideCard';
import { Radio, Search, PlusCircle, RefreshCw, Menu, ChevronUp, ChevronDown, Wifi, Shield, Palette, Sparkles, Bell, User } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { fetchRoadRoute } from '../utils/distance';
import { reverseGeocode } from '../utils/geocoding';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'https://rydo-backend-4yr6.onrender.com').replace(/\/login\/?$/, '');

// Reusable Stat Component
const StatPill = ({ icon, value, accent }) => (
  <div className="flex items-center gap-2 bg-surface-base border border-surface-border rounded-lg px-2.5 py-1.5">
    <div className={`flex items-center justify-center ${accent} shrink-0`}>
      {icon}
    </div>
    <span className="text-[11px] font-bold text-white leading-tight capitalize">{value}</span>
  </div>
);

// --- Active Journey Floating Profile Cards ---
const ActiveJourneyPassenger = ({ ride, onCancel }) => {
  return (
    <div className="flex flex-col h-full justify-between p-5 bg-surface-card">
      <div>
        <div className="text-center py-4 border-b border-surface-border">
          <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            Driver Approaching
          </span>
          <p className="text-xs text-surface-muted mt-2">Your Rydo ride is active!</p>
        </div>
        
        <div className="flex items-center gap-4 py-6 border-b border-surface-border">
          <div className="w-14 h-14 rounded-full bg-amber-400/10 border-2 border-amber-400 flex items-center justify-center text-2xl">
            👨‍✈️
          </div>
          <div>
            <p className="text-sm font-bold text-white">{ride.driver?.username || 'Rydo Pilot'}</p>
            <p className="text-xs text-surface-muted mt-0.5">{ride.driver?.phone || 'No Contact Info'}</p>
            <div className="mt-2 text-[11px] bg-surface-base px-2.5 py-1 rounded border border-surface-border text-white inline-block font-mono">
              🚗 {ride.driver?.vehicle_number || 'PENDING'}
            </div>
          </div>
        </div>

        <div className="py-4 space-y-2 text-xs font-semibold text-surface-muted">
          <div className="flex justify-between">
            <span>Total Distance:</span>
            <span className="text-white">{ride.distance} km</span>
          </div>
          <div className="flex justify-between">
            <span>Est. Time:</span>
            <span className="text-white">~{Math.round(ride.duration / 60)} min</span>
          </div>
          <div className="flex justify-between">
            <span>Offer Fare:</span>
            <span className="text-amber-400 font-bold">PKR {ride.fare}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onCancel}
        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl transition-all"
      >
        Cancel Ride
      </button>
    </div>
  );
};

const ActiveJourneyDriver = ({ ride, onComplete }) => {
  return (
    <div className="flex flex-col h-full justify-between p-5 bg-surface-card">
      <div>
        <div className="text-center py-4 border-b border-surface-border">
          <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            Active Mission
          </span>
          <p className="text-xs text-surface-muted mt-2">Reaching pickup coordinates...</p>
        </div>
        
        <div className="flex items-center gap-4 py-6 border-b border-surface-border">
          <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400 flex items-center justify-center text-2xl">
            👤
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{ride.passenger?.username || 'Rydo Passenger'}</p>
            <p className="text-xs text-surface-muted truncate mt-0.5">{ride.passenger?.email || 'no-email@rydo.com'}</p>
            <p className="text-xs text-surface-muted mt-1">{ride.passenger?.phone || 'No Contact Info'}</p>
          </div>
        </div>

        <div className="py-4 space-y-2 text-xs font-semibold text-surface-muted">
          <div className="flex justify-between">
            <span>Total Distance:</span>
            <span className="text-white">{ride.distance} km</span>
          </div>
          <div className="flex justify-between">
            <span>Est. Time:</span>
            <span className="text-white">~{Math.round(ride.duration / 60)} min</span>
          </div>
          <div className="flex justify-between">
            <span>Total Fare:</span>
            <span className="text-amber-400 font-bold">PKR {ride.fare}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full py-3 bg-amber-400 text-surface-base text-xs font-bold rounded-xl hover:bg-amber-300 transition-all font-bold"
      >
        Mark Journey Completed
      </button>
    </div>
  );
};

const ActiveJourneyPassengerMobile = ({ ride, onCancel }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const dragControls = useDragControls();

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0, height: isExpanded ? '45vh' : '64px' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, { offset, velocity }) => {
        if (offset.y > 50 || velocity.y > 500) setIsExpanded(false);
        if (offset.y < -50 || velocity.y < -500) setIsExpanded(true);
      }}
      className="fixed bottom-0 left-0 right-0 z-[100] bg-surface-card border-t border-surface-border rounded-t-3xl flex flex-col shadow-2xl overflow-hidden"
    >
      <div 
        className="px-5 py-3.5 border-b border-surface-border shrink-0 cursor-pointer bg-surface-card hover:bg-surface-base transition-colors flex items-center justify-between touch-none select-none"
        onPointerDown={(e) => dragControls.start(e)}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 rounded-full bg-surface-border" />
          <h2 className="text-xs font-bold text-white tracking-widest ml-2 font-display">Active Trip Status</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full font-bold">
            Live Trip Tracking
          </span>
          <button className="text-surface-muted hover:text-white transition-colors">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
      </div>
      <div className={`flex-1 overflow-y-auto min-h-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <ActiveJourneyPassenger ride={ride} onCancel={onCancel} />
      </div>
    </motion.div>
  );
};

const ActiveJourneyDriverMobile = ({ ride, onComplete }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const dragControls = useDragControls();

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0, height: isExpanded ? '45vh' : '64px' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, { offset, velocity }) => {
        if (offset.y > 50 || velocity.y > 500) setIsExpanded(false);
        if (offset.y < -50 || velocity.y < -500) setIsExpanded(true);
      }}
      className="fixed bottom-0 left-0 right-0 z-[100] bg-surface-card border-t border-surface-border rounded-t-3xl flex flex-col shadow-2xl overflow-hidden"
    >
      <div 
        className="px-5 py-3.5 border-b border-surface-border shrink-0 cursor-pointer bg-surface-card hover:bg-surface-base transition-colors flex items-center justify-between touch-none select-none"
        onPointerDown={(e) => dragControls.start(e)}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 rounded-full bg-surface-border" />
          <h2 className="text-xs font-bold text-white tracking-widest ml-2 font-display">Active Trip Status</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full font-bold">
            Live Trip Tracking
          </span>
          <button className="text-surface-muted hover:text-white transition-colors">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
      </div>
      <div className={`flex-1 overflow-y-auto min-h-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <ActiveJourneyDriver ride={ride} onComplete={onComplete} />
      </div>
    </motion.div>
  );
};


const BroadcastTimerCard = ({ requestTimeout }) => (
  <div className="bg-surface-base border border-surface-border rounded-xl p-6 text-center">
    <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" />
      <span className="text-xl font-black text-white">{requestTimeout}s</span>
    </div>
    <h3 className="text-sm font-bold text-white">Broadcasting Offer...</h3>
    <p className="text-xs text-surface-muted mt-1 leading-relaxed">
      Sending ride request to nearby Rydo drivers. Waiting for pilot acceptance.
    </p>
  </div>
);

function interpolatePoints(start, end, steps = 15) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({
      lat: start.lat + (end.lat - start.lat) * t,
      lng: start.lng + (end.lng - start.lng) * t
    });
  }
  return pts;
}

const PassengerPanelDesktop = ({ draftPoints, requestedFare, setRequestedFare, onSubmit, onClear, osrmRoute, submitting, activeRide, requestTimeout }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-surface-border shrink-0">
        <h2 className="text-xs font-bold text-surface-muted uppercase tracking-widest mb-4">Request a Ride</h2>

        {activeRide && activeRide.status === 'pending' ? (
          <BroadcastTimerCard requestTimeout={requestTimeout} />
        ) : (
          <>
            <div className="bg-surface-base border border-surface-border rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3 mb-3">
                <PlusCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-white">Select Points on Map</p>
                  <p className="text-[11px] text-surface-muted mt-0.5 leading-relaxed">
                    Click to add pickup points. Your very last click is the destination.
                  </p>
                </div>
              </div>

              <div className="space-y-2 mt-4 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-surface-muted">Total Points:</span>
                  <span className="text-white">{draftPoints.length}</span>
                </div>
                {osrmRoute && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-surface-muted">Road Distance:</span>
                      <span className="text-white">{osrmRoute.distanceKm} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-muted">Est. Time:</span>
                      <span className="text-white">~{Math.round(osrmRoute.durationSeconds / 60)} min</span>
                    </div>
                  </>
                )}
                {draftPoints.length > 1 && !osrmRoute && (
                  <div className="flex justify-center text-surface-muted mt-2 animate-pulse">
                    Calculating route...
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="number"
                placeholder="Offer Fare (PKR)"
                value={requestedFare}
                onChange={e => setRequestedFare(e.target.value)}
                className="w-full bg-surface-base border border-surface-border px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400 transition-colors text-white"
              />

              <div className="flex gap-2">
                <button
                  onClick={onClear}
                  disabled={submitting}
                  className="flex-1 py-3 bg-surface-base border border-surface-border text-surface-muted text-xs font-bold rounded-xl hover:bg-surface-card transition-all"
                >
                  Clear Map
                </button>
                <button
                  onClick={onSubmit}
                  disabled={!osrmRoute || !requestedFare || submitting}
                  className="flex-[2] py-3 bg-amber-400 text-surface-base text-xs font-bold rounded-xl hover:bg-amber-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Broadcast Request'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const DriverPanelDesktop = ({ rides, loading, onRefresh, setActiveRide, user, handleAccept, handleReject }) => (
  <div className="flex flex-col h-full">
    <div className="px-5 py-4 border-b border-surface-border shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-surface-muted uppercase tracking-widest">Ride Queue</h2>
        <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full font-bold">
          {rides?.length || 0} available
        </span>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-400 text-surface-base text-xs font-bold rounded-xl hover:bg-amber-300 transition-all disabled:opacity-70"
      >
        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Fetching...' : 'Refresh Queue'}
      </button>
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {(!rides || rides.length === 0) && !loading && (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <Radio size={20} className="text-surface-muted mb-3" />
          <p className="text-sm font-semibold text-white">No rides available</p>
          <p className="text-xs text-surface-muted mt-1">Click Refresh Queue to check again</p>
        </div>
      )}
      {rides?.map((ride) => (
        <div key={ride.id} onClick={() => setActiveRide(ride)} className="cursor-pointer">
          <RideCard
            ride={ride}
            onAccept={user?.role === 'driver' ? () => handleAccept(ride) : null}
            onReject={user?.role === 'driver' ? () => handleReject(ride.id) : null}
          />
        </div>
      ))}
    </div>
  </div>
);

const PassengerPanelMobile = ({ draftPoints, requestedFare, setRequestedFare, onSubmit, onClear, osrmRoute, submitting, activeRide, requestTimeout }) => {
  const [isExpanded, setIsExpanded] = useState(draftPoints.length > 0);

  // Auto-expand when a point is placed on map
  useEffect(() => {
    if (draftPoints.length > 0) {
      setIsExpanded(true);
    }
  }, [draftPoints.length]);

  const dragControls = useDragControls();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0, height: isExpanded ? '50vh' : '64px' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, { offset, velocity }) => {
          if (offset.y > 50 || velocity.y > 500) setIsExpanded(false);
          if (offset.y < -50 || velocity.y < -500) setIsExpanded(true);
        }}
        className="fixed bottom-0 left-0 right-0 z-[100] bg-surface-card border-t border-surface-border rounded-t-3xl flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Handle / Header */}
        <div 
          className="flex items-center justify-between px-5 py-3.5 border-b border-surface-border shrink-0 cursor-pointer bg-surface-card hover:bg-surface-base transition-colors touch-none select-none"
          onPointerDown={(e) => dragControls.start(e)}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 rounded-full bg-surface-border" />
            <h2 className="text-xs font-bold text-white tracking-widest ml-2 font-display">
              {activeRide && activeRide.status === 'pending' ? '⌛ Broadcasting Offer...' : '🚕 Request a Ride'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isExpanded && (
              <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-0.5 rounded-full font-bold">
                {draftPoints.length === 0 ? 'Tap map to start' : `${draftPoints.length} points selected`}
              </span>
            )}
            <button className="text-surface-muted hover:text-white transition-colors">
              {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto px-5 py-4 min-h-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {activeRide && activeRide.status === 'pending' ? (
            <BroadcastTimerCard requestTimeout={requestTimeout} />
          ) : (
            <>
              <div className="bg-surface-base border border-surface-border rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <PlusCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-white">Select Points on Map</p>
                    <p className="text-[11px] text-surface-muted mt-0.5 leading-relaxed">
                      Click to add pickup points. Your very last click is the destination.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-4 text-xs font-medium">
                  <div className="flex justify-between">
                    <span className="text-surface-muted">Total Points:</span>
                    <span className="text-white">{draftPoints.length}</span>
                  </div>
                  {osrmRoute && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-surface-muted">Road Distance:</span>
                        <span className="text-white">{osrmRoute.distanceKm} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-surface-muted">Est. Time:</span>
                        <span className="text-white">~{Math.round(osrmRoute.durationSeconds / 60)} min</span>
                      </div>
                    </>
                  )}
                  {draftPoints.length > 1 && !osrmRoute && (
                    <div className="flex justify-center text-surface-muted mt-2 animate-pulse">
                      Calculating route...
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pb-4">
                <input
                  type="number"
                  placeholder="Offer Fare (PKR)"
                  value={requestedFare}
                  onChange={e => setRequestedFare(e.target.value)}
                  className="w-full bg-surface-base border border-surface-border px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400 transition-colors text-white"
                />

                <div className="flex gap-2">
                  <button
                    onClick={onClear}
                    disabled={submitting}
                    className="flex-1 py-3 bg-surface-base border border-surface-border text-surface-muted text-xs font-bold rounded-xl hover:bg-surface-card transition-all"
                  >
                    Clear Map
                  </button>
                  <button
                    onClick={onSubmit}
                    disabled={!osrmRoute || !requestedFare || submitting}
                    className="flex-[2] py-3 bg-amber-400 text-surface-base text-xs font-bold rounded-xl hover:bg-amber-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending...' : 'Broadcast Request'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const DriverPanelMobile = ({ rides, loading, onRefresh, setActiveRide, user, handleAccept, handleReject }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const dragControls = useDragControls();

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0, height: isExpanded ? '50vh' : '64px' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, { offset, velocity }) => {
        if (offset.y > 50 || velocity.y > 500) setIsExpanded(false);
        if (offset.y < -50 || velocity.y < -500) setIsExpanded(true);
      }}
      className="fixed bottom-0 left-0 right-0 z-[100] bg-surface-card border-t border-surface-border rounded-t-3xl flex flex-col shadow-2xl overflow-hidden"
    >
      <div 
        className="px-5 py-3 border-b border-surface-border shrink-0 bg-surface-card cursor-pointer hover:bg-surface-base transition-colors touch-none select-none"
        onPointerDown={(e) => dragControls.start(e)}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-center mb-2">
          <div className="w-8 h-1 rounded-full bg-surface-border" />
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white tracking-widest font-display">🚕 Ride Queue</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full font-bold">
              {rides?.length || 0} active offers
            </span>
            <button className="text-surface-muted hover:text-white transition-colors">
              {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className={`flex-1 flex flex-col min-h-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="p-4 bg-surface-card border-b border-surface-border shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-400 text-surface-base text-xs font-bold rounded-xl hover:bg-amber-300 transition-all disabled:opacity-70"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Fetching...' : 'Refresh Queue'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-8">
          {(!rides || rides.length === 0) && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center py-6">
              <Radio size={20} className="text-surface-muted mb-3" />
              <p className="text-sm font-semibold text-white">No rides available</p>
              <p className="text-xs text-surface-muted mt-1">Click Refresh Queue to check again</p>
            </div>
          )}
          {rides?.map((ride) => (
            <div key={ride.id} onClick={() => setActiveRide(ride)} className="cursor-pointer">
              <RideCard
                ride={ride}
                onAccept={user?.role === 'driver' ? () => handleAccept(ride) : null}
                onReject={user?.role === 'driver' ? () => handleReject(ride.id) : null}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};


const MainView = ({
  user, rides, activeRide, setActiveRide, loading, onRefresh,
  draftPoints, setDraftPoints, requestedFare, setRequestedFare,
  onSubmitRequest, handleAccept, handleReject, osrmRoute, submitting,
  driverLocation, approachingRoute, onCancelRide, onCompleteRide,
  requestTimeout
}) => {
  const isPassenger = user?.role === 'passenger';
  const hasActiveRide = activeRide && activeRide.status === 'accepted';

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* Desktop Panel */}
      <div className="hidden md:flex w-[320px] shrink-0 border-r border-surface-border bg-surface-card flex-col overflow-hidden">
        {hasActiveRide ? (
          isPassenger ? (
            <ActiveJourneyPassenger ride={activeRide} onCancel={onCancelRide} />
          ) : (
            <ActiveJourneyDriver ride={activeRide} onComplete={onCompleteRide} />
          )
        ) : isPassenger ? (
          <PassengerPanelDesktop
            draftPoints={draftPoints}
            requestedFare={requestedFare}
            setRequestedFare={setRequestedFare}
            onSubmit={onSubmitRequest}
            onClear={() => setDraftPoints([])}
            osrmRoute={osrmRoute}
            submitting={submitting}
            activeRide={activeRide}
            requestTimeout={requestTimeout}
          />
        ) : (
          <DriverPanelDesktop
            rides={rides}
            loading={loading}
            onRefresh={onRefresh}
            setActiveRide={setActiveRide}
            user={user}
            handleAccept={handleAccept}
            handleReject={handleReject}
          />
        )}
      </div>

      {/* Mobile Sheets */}
      <div className="md:hidden">
        {hasActiveRide ? (
          isPassenger ? (
            <ActiveJourneyPassengerMobile ride={activeRide} onCancel={onCancelRide} />
          ) : (
            <ActiveJourneyDriverMobile ride={activeRide} onComplete={onCompleteRide} />
          )
        ) : isPassenger ? (
          <PassengerPanelMobile
            draftPoints={draftPoints}
            requestedFare={requestedFare}
            setRequestedFare={setRequestedFare}
            onSubmit={onSubmitRequest}
            onClear={() => setDraftPoints([])}
            osrmRoute={osrmRoute}
            submitting={submitting}
            activeRide={activeRide}
            requestTimeout={requestTimeout}
          />
        ) : (
          <DriverPanelMobile
            rides={rides}
            loading={loading}
            onRefresh={onRefresh}
            setActiveRide={setActiveRide}
            user={user}
            handleAccept={handleAccept}
            handleReject={handleReject}
          />
        )}
      </div>

      {/* Map View */}
      <div className="flex-1 relative overflow-hidden bg-surface-base">
        <Map
          points={activeRide?.pickup_points || []}
          route={activeRide?.optimized_route}
          draftPoints={isPassenger && !activeRide ? draftPoints : []}
          draftRoute={isPassenger && osrmRoute ? osrmRoute.coordinates : null}
          onMapClick={isPassenger && !activeRide ? (latlng) => setDraftPoints(prev => [...prev, latlng]) : undefined}
          driverLocation={driverLocation}
          approachingRoute={approachingRoute}
        />
      </div>
    </div>
  );
};

export default function Dashboard({ user, setUser }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [rides, setRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Rejections persistence
  const [rejectedRides, setRejectedRides] = useState(() => {
    try {
      const saved = localStorage.getItem(`rydo_rejected_rides_${user?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Countdown & Simulation states
  const [requestTimeout, setRequestTimeout] = useState(0);
  const [driverLocation, setDriverLocation] = useState(null);
  const [approachingRoute, setApproachingRoute] = useState([]);

  // Passenger states
  const [draftPoints, setDraftPoints] = useState([]);
  const [draftAddresses, setDraftAddresses] = useState([]);
  const [requestedFare, setRequestedFare] = useState('');
  const [osrmRoute, setOsrmRoute] = useState(null);

  // --- Fetch rides from real backend (for drivers) ---
  const fetchRides = useCallback(async () => {
    if (user?.role !== 'driver') return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/rides`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter out locally rejected rides
        const filtered = data.filter(r => !rejectedRides.includes(r.id));
        setRides(filtered);
      } else {
        console.error('Unexpected rides response:', data);
      }
    } catch (err) {
      console.error('Failed to fetch rides:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.role, rejectedRides]);

  // Auto-fetch rides when driver logs in, and poll every 10 seconds
  useEffect(() => {
    if (user?.role !== 'driver') return;
    fetchRides();
    const interval = setInterval(fetchRides, 10000);
    return () => clearInterval(interval);
  }, [fetchRides, user?.role]);

  // Play chime for new ride dispatch
  useEffect(() => {
    if (user?.role !== 'driver' || rides.length === 0) return;
    const soundEnabled = localStorage.getItem('rydo_notifications') !== 'false';
    if (!soundEnabled) return;

    // Use standard HTML5 Web Audio API Synth so we don't rely on static sound asset files that might 404!
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.15); // Higher note
      
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio Context beep suppressed or block by browser policies:", e);
    }
  }, [rides.length, user?.role]);


  // --- Poll active/pending ride for Passenger ---
  const fetchPassengerActiveRide = useCallback(async () => {
    if (user?.role !== 'passenger') return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/rides/active/passenger/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveRide(data);
        if (data && data.status === 'accepted') {
          setRequestTimeout(0); // Cancel countdown!
        }
      }
    } catch (err) {
      console.error('Failed to fetch active passenger ride:', err);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (user?.role !== 'passenger') return;
    fetchPassengerActiveRide();
    const interval = setInterval(fetchPassengerActiveRide, 5000);
    return () => clearInterval(interval);
  }, [fetchPassengerActiveRide, user?.role]);

  // --- Poll active ride for Driver (for recovery on mount) ---
  const fetchDriverActiveRide = useCallback(async () => {
    if (user?.role !== 'driver') return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/rides/active/driver/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setActiveRide(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch active driver ride:', err);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (user?.role !== 'driver') return;
    fetchDriverActiveRide();
  }, [fetchDriverActiveRide, user?.role]);

  // --- 10-Second Passenger Countdown Effect ---
  useEffect(() => {
    if (requestTimeout <= 0) return;
    const timer = setTimeout(async () => {
      const nextVal = requestTimeout - 1;
      setRequestTimeout(nextVal);

      if (nextVal === 0) {
        if (activeRide && activeRide.status === 'pending') {
          try {
            await fetch(`${BACKEND_URL}/api/rides/${activeRide.id}/void`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'void' })
            });
            setActiveRide(null);
            alert("⏳ No drivers accepted your request. Please try broadcasting again!");
          } catch (err) {
            console.error("Failed to void ride:", err);
          }
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [requestTimeout, activeRide]);

  // --- Driver Location GPS Simulation Effect ---
  useEffect(() => {
    if (user?.role !== 'driver' || !activeRide || activeRide.status !== 'accepted') {
      setDriverLocation(null);
      setApproachingRoute([]);
      return;
    }

    const pickup = activeRide.pickup_points[0];
    // Start at deterministic random point close to pickup
    const startPt = {
      lat: pickup.lat + 0.012,
      lng: pickup.lng + 0.012
    };

    const approachPts = interpolatePoints(startPt, pickup, 15);
    setApproachingRoute(approachPts);

    const ridePts = activeRide.optimized_route?.coordinates?.map(c => ({ lat: c[1], lng: c[0] })) || [];
    const fullPath = [...approachPts, ...ridePts];

    let index = 0;
    setDriverLocation(fullPath[0]);

    const simInterval = setInterval(async () => {
      index++;
      if (index >= fullPath.length) {
        clearInterval(simInterval);
        return;
      }
      
      const currentLoc = fullPath[index];
      setDriverLocation(currentLoc);

      // Send to DB
      try {
        await fetch(`${BACKEND_URL}/api/rides/${activeRide.id}/location`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: currentLoc })
        });
      } catch (err) {
        console.error("Failed to update simulated location:", err);
      }
    }, 3000);

    return () => clearInterval(simInterval);
  }, [user?.role, activeRide?.id, activeRide?.status]);

  // --- Passenger GPS Location & Approaching Route Sync Effect ---
  useEffect(() => {
    if (user?.role !== 'passenger' || !activeRide || activeRide.status !== 'accepted') {
      setDriverLocation(null);
      setApproachingRoute([]);
      return;
    }

    const pickup = activeRide.pickup_points[0];
    if (activeRide.driver_location) {
      setDriverLocation(activeRide.driver_location);

      const dist = Math.hypot(activeRide.driver_location.lat - pickup.lat, activeRide.driver_location.lng - pickup.lng);
      if (dist > 0.0001 && approachingRoute.length === 0) {
        setApproachingRoute(interpolatePoints(activeRide.driver_location, pickup, 15));
      } else if (dist <= 0.0001) {
        setApproachingRoute([]); // Driver reached pickup, hide approach path
      }
    }
  }, [user?.role, activeRide?.id, activeRide?.status, activeRide?.driver_location, approachingRoute.length]);

  // Fetch OSRM route + geocode addresses when draft points change
  useEffect(() => {
    if (draftPoints.length > 1) {
      let isMounted = true;
      const fetchData = async () => {
        try {
          const [route, ...addresses] = await Promise.all([
            fetchRoadRoute(draftPoints),
            ...draftPoints.map(p => reverseGeocode(p.lat, p.lng))
          ]);
          if (isMounted) {
            if (route) {
              setOsrmRoute(route);
              const suggested = Math.round(150 + route.distanceKm * 50);
              setRequestedFare(suggested.toString());
            }
            setDraftAddresses(addresses);
          }
        } catch (err) {
          console.error('Route/geocode error:', err);
        }
      };
      fetchData();
      return () => { isMounted = false; };
    } else {
      setOsrmRoute(null);
      setRequestedFare('');
      setDraftAddresses([]);
    }
  }, [draftPoints]);

  // --- Passenger submits a ride request to the real backend ---
  const handleSubmitRequest = async () => {
    if (!osrmRoute || draftPoints.length < 2 || !user?.id) return;
    setSubmitting(true);
    try {
      const pickups = draftPoints.slice(0, -1).map((p, i) => ({
        lat: p.lat,
        lng: p.lng,
        address: draftAddresses[i] || `Pickup ${i + 1}`
      }));
      const dest = draftPoints[draftPoints.length - 1];
      const destAddress = draftAddresses[draftAddresses.length - 1] || 'Destination';

      const body = {
        passenger_id: user.id,
        pickup_points: pickups,
        destination: { lat: dest.lat, lng: dest.lng, address: destAddress },
        fare: Number(requestedFare),
        distance: osrmRoute.distanceKm,
        duration: osrmRoute.durationSeconds,
        optimized_route: { coordinates: osrmRoute.coordinates }
      };

      const res = await fetch(`${BACKEND_URL}/api/rides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await res.json();
      if (!res.ok) {
        alert(`Error: ${result.error || 'Failed to create ride'}\n${result.detail || ''}`);
        return;
      }

      // Start 10 seconds timer
      setActiveRide(result);
      setRequestTimeout(10);

      // Clear map form inputs
      setDraftPoints([]);
      setDraftAddresses([]);
      setRequestedFare('');
      setOsrmRoute(null);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Could not reach the server. Is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Driver accepts a ride ---
  const handleAcceptRide = async (ride) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/rides/${ride.id}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: user.id })
      });
      const result = await res.json();
      if (res.ok) {
        setActiveRide(result.ride);
        setRides(prev => prev.filter(r => r.id !== ride.id));
      } else {
        alert(result.error || "Failed to accept ride.");
      }
    } catch (err) {
      console.error('Accept error:', err);
    }
  };

  // --- Driver rejects a ride (persistently) ---
  const handleRejectRide = (rideId) => {
    const updated = [...rejectedRides, rideId];
    setRejectedRides(updated);
    localStorage.setItem(`rydo_rejected_rides_${user?.id}`, JSON.stringify(updated));
    setRides(prev => prev.filter(r => r.id !== rideId));
    if (activeRide?.id === rideId) setActiveRide(null);
  };

  // --- Passenger cancels active ride ---
  const handleCancelRide = async () => {
    if (!activeRide) return;
    try {
      await fetch(`${BACKEND_URL}/api/rides/${activeRide.id}/void`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'void' })
      });
      setActiveRide(null);
      alert("✅ Ride request cancelled.");
    } catch (err) {
      console.error("Cancel ride error:", err);
    }
  };

  // --- Driver completes ride ---
  const handleCompleteRide = async () => {
    if (!activeRide) return;
    try {
      await fetch(`${BACKEND_URL}/api/rides/${activeRide.id}/void`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      setActiveRide(null);
      alert("🎉 Journey Completed! Safe travels.");
    } catch (err) {
      console.error("Complete ride error:", err);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const appTheme = localStorage.getItem('rydo_theme') || 'dark';

  return (
    <div className={`flex h-screen bg-surface-base overflow-hidden relative ${appTheme === 'cyberpunk' ? 'theme-cyberpunk' : ''}`}>
      <Sidebar user={user} setUser={setUser} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <header className="h-14 shrink-0 border-b border-surface-border bg-surface-card flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 text-surface-muted hover:text-white bg-surface-base border border-surface-border rounded-lg md:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-amber-400 rounded flex items-center justify-center shrink-0">
                <span className="text-surface-base font-black text-xs leading-none">R</span>
              </div>
              <span className="text-white font-black text-sm tracking-[-0.05em] hidden sm:block">RYDO</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatPill icon={<Wifi size={12} />} value="Active" accent="text-green-400" />
            <StatPill icon={<Shield size={12} />} value={user?.role} accent="text-amber-400" />
          </div>
        </header>

        <Routes>
          <Route path="/" element={
            <MainView
              user={user}
              rides={rides}
              activeRide={activeRide}
              setActiveRide={setActiveRide}
              loading={loading}
              onRefresh={fetchRides}
              draftPoints={draftPoints}
              setDraftPoints={setDraftPoints}
              requestedFare={requestedFare}
              setRequestedFare={setRequestedFare}
              onSubmitRequest={handleSubmitRequest}
              handleAccept={handleAcceptRide}
              handleReject={handleRejectRide}
              osrmRoute={osrmRoute}
              submitting={submitting}
              driverLocation={driverLocation}
              approachingRoute={approachingRoute}
              onCancelRide={handleCancelRide}
              onCompleteRide={handleCompleteRide}
              requestTimeout={requestTimeout}
            />
          } />
          <Route path="history" element={<HistoryView user={user} />} />
          <Route path="settings" element={<SettingsView user={user} />} />
        </Routes>
      </div>
    </div>
  );
}

const HistoryView = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/rides/history/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user.id]);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-surface-base">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-amber-400/10 text-amber-400 rounded-lg flex items-center justify-center font-bold">
            📜
          </div>
          <h2 className="text-lg font-black text-white">Your Travel History</h2>
        </div>
        
        {loading ? (
          <div className="text-center text-surface-muted py-12 animate-pulse font-medium text-sm">
            Loading your journeys...
          </div>
        ) : history.length === 0 ? (
          <div className="text-center text-surface-muted py-12 border border-dashed border-surface-border rounded-2xl">
            <span className="text-2xl block mb-2">📭</span>
            <p className="text-sm font-semibold text-white">No past rides</p>
            <p className="text-xs mt-1">Completed journeys will show up here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((ride) => (
              <div key={ride.id} className="bg-surface-card border border-surface-border p-5 rounded-2xl hover:border-surface-border/85 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Completed
                    </span>
                    <p className="text-[10px] text-surface-muted mt-2 font-mono">ID: #{String(ride.id).substring(0, 8)}</p>
                  </div>
                  <span className="text-sm font-black text-amber-400">PKR {ride.fare}</span>
                </div>
                
                <div className="space-y-2.5 border-t border-surface-border pt-3">
                  <div className="flex gap-2 text-xs">
                    <span className="text-amber-400 shrink-0 font-bold">📍</span>
                    <span className="text-white truncate font-medium">{ride.pickup_points[0]?.address || 'Pickup Point'}</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-red-400 shrink-0 font-bold">🏁</span>
                    <span className="text-white truncate font-medium">{ride.destination?.address || 'Destination'}</span>
                  </div>
                </div>

                <div className="flex gap-6 mt-4 border-t border-surface-border pt-3 text-[11px] font-bold text-surface-muted">
                  <span>📏 {ride.distance ? ride.distance.toFixed(1) : '0.0'} km</span>
                  <span>⏱️ {ride.duration ? Math.round(ride.duration / 60) : '0'} mins</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SettingsView = ({ user }) => {
  const [theme, setTheme] = useState(localStorage.getItem('rydo_theme') || 'dark');
  const [mapStyle, setMapStyle] = useState(localStorage.getItem('rydo_map_style') || 'dark');
  const [notifications, setNotifications] = useState(localStorage.getItem('rydo_notifications') !== 'false');
  const [phone, setPhone] = useState(localStorage.getItem(`rydo_phone_${user.id}`) || '');

  const handleSave = () => {
    localStorage.setItem('rydo_theme', theme);
    localStorage.setItem('rydo_map_style', mapStyle);
    localStorage.setItem('rydo_notifications', notifications ? 'true' : 'false');
    if (phone) {
      localStorage.setItem(`rydo_phone_${user.id}`, phone);
    }
    alert('🎨 Settings saved successfully! The page will refresh to apply your premium style.');
    window.location.reload();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-surface-base bg-grid-pattern">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-amber-400/10 text-amber-400 rounded-lg flex items-center justify-center font-bold">
            ⚙️
          </div>
          <h2 className="text-lg font-black text-white">System Settings</h2>
        </div>

        {/* Theme Settings */}
        <div className="bg-surface-card border border-surface-border p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Palette size={16} className="text-amber-400" />
            App Theme Selection
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'dark', name: 'Taxi Amber (Dark)', colors: 'bg-[#0F0F11] border-amber-400' },
              { id: 'cyberpunk', name: 'Cyberpunk Neon', colors: 'bg-black border-pink-500' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${theme === t.id ? 'border-amber-400 bg-amber-400/10' : 'border-surface-border bg-surface-base hover:border-surface-border/85'}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 ${t.colors}`} />
                <span className="text-xs font-bold text-white">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map Styles */}
        <div className="bg-surface-card border border-surface-border p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            Map Visual Layout
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'dark', name: 'Midnight', desc: 'Sleek Dark Map' },
              { id: 'voyager', name: 'Voyager', desc: 'Clean Light Map' },
              { id: 'osm', name: 'Street View', desc: 'Classic OSM Map' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMapStyle(m.id)}
                className={`p-4 border rounded-xl flex flex-col items-center justify-center text-center transition-all ${mapStyle === m.id ? 'border-amber-400 bg-amber-400/10' : 'border-surface-border bg-surface-base hover:border-surface-border/85'}`}
              >
                <span className="text-lg">🗺️</span>
                <span className="text-xs font-bold text-white mt-2">{m.name}</span>
                <span className="text-[10px] text-surface-muted mt-0.5">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications and Audio */}
        <div className="bg-surface-card border border-surface-border p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Bell size={16} className="text-amber-400" />
            Audio & Sound Alerts
          </h3>
          <div className="flex justify-between items-center bg-surface-base border border-surface-border p-4 rounded-xl">
            <div>
              <p className="text-xs font-bold text-white">Ride Dispatch Chime</p>
              <p className="text-[10px] text-surface-muted mt-1">Play alert audio when a new journey offer arrives</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full p-1 transition-all ${notifications ? 'bg-amber-400 flex justify-end' : 'bg-surface-border flex justify-start'}`}
            >
              <div className="w-4 h-4 bg-surface-card rounded-full shadow-md" />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-surface-card border border-surface-border p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <User size={16} className="text-amber-400" />
            Profile Details
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-surface-muted font-bold block mb-1">Account Primary Key / ID</label>
              <input
                type="text"
                disabled
                value={user.id}
                className="w-full bg-surface-base border border-surface-border rounded-xl px-4 py-2.5 text-xs text-surface-muted font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-surface-muted font-bold block mb-1">Gmail / Account Username</label>
              <input
                type="text"
                disabled
                value={user.email}
                className="w-full bg-surface-base border border-surface-border rounded-xl px-4 py-2.5 text-xs text-surface-muted font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-amber-400 font-bold block mb-1">Contact Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full bg-surface-base border border-surface-border rounded-xl px-4 py-2.5 text-xs text-white font-semibold focus:border-amber-400 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 bg-amber-400 text-surface-base hover:bg-amber-300 font-black rounded-xl text-sm transition-all shadow-lg"
        >
          Save System Configurations
        </button>
      </div>
    </div>
  );
};