import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation } from 'lucide-react';

// Gorgeous, high-contrast premium thematic Leaflet icons using DIV markers
const pickupIcon = L.divIcon({
  className: '',
  html: `<div style="
    font-size: 26px;
    line-height: 1;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
  ">📍</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

const destIcon = L.divIcon({
  className: '',
  html: `<div style="
    font-size: 26px;
    line-height: 1;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
  ">🏁</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

const carIcon = L.divIcon({
  className: '',
  html: `<div style="
    font-size: 30px;
    line-height: 1;
    filter: drop-shadow(0 3px 6px rgba(0,0,0,0.6));
    animation: pulse 1.5s infinite alternate;
  ">🚕</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const MapEventsHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng);
    },
  });
  return null;
};

// Stable Auto-focus and fit bounds to encompass pickups, destination, and moving driver vehicle
const MapBounds = ({ points, driverLocation, recenterTrigger }) => {
  const map = useMap();
  
  useEffect(() => {
    const coords = [];
    if (points && points.length > 0) {
      points.forEach(p => {
        if (p && p.lat && p.lng) {
          coords.push([p.lat, p.lng]);
        }
      });
    }
    if (driverLocation && driverLocation.lat && driverLocation.lng) {
      coords.push([driverLocation.lat, driverLocation.lng]);
    }
    if (coords.length > 0) {
      map.fitBounds(coords, { padding: [50, 50], maxZoom: 15 });
    }
  }, [points?.length, !!driverLocation, recenterTrigger, map]);

  return null;
};

const Map = ({ points, route, draftPoints, onMapClick, driverLocation, approachingRoute }) => {
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  
  const formattedRoute = route?.coordinates?.map(coord => [coord[1], coord[0]]) || [];

  // Use draftPoints if provided (for passenger requesting ride), else use active ride points
  const displayPoints = draftPoints && draftPoints.length > 0 ? draftPoints : (points || []);

  // Format draft line
  const draftRoute = draftPoints ? draftPoints.map(p => [p.lat, p.lng]) : [];

  // Dynamically load tile layer style from settings config
  const mapStyle = localStorage.getItem('rydo_map_style') || 'dark';
  let tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  if (mapStyle === 'voyager') {
    tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  } else if (mapStyle === 'osm') {
    tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  }

  const triggerRecenter = () => {
    setRecenterTrigger(prev => prev + 1);
  };

  return (
    <div className="relative w-full h-full">
      {/* Floating Focus Journey Button */}
      {(displayPoints.length > 0 || driverLocation) && (
        <button
          onClick={triggerRecenter}
          className="absolute top-4 right-4 z-[400] flex items-center gap-2 bg-surface-card border border-surface-border hover:bg-surface-base hover:border-amber-400 text-white hover:text-amber-400 transition-all px-3 py-2.5 rounded-xl shadow-lg font-black text-xs"
        >
          <Navigation size={14} className="rotate-45 shrink-0" />
          <span>Focus Journey</span>
        </button>
      )}

      <MapContainer
        center={[23.685, 90.3563]}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
        tap={false}
      >
        <TileLayer url={tileUrl} attribution="&copy; OpenStreetMap contributors &copy; CARTO" />
        <MapEventsHandler onMapClick={onMapClick} />
        <MapBounds points={displayPoints} driverLocation={driverLocation} recenterTrigger={recenterTrigger} />

        {displayPoints.map((p, i) => (
          <Marker
            key={i}
            position={[p.lat, p.lng]}
            icon={i === displayPoints.length - 1 && displayPoints.length > 1 ? destIcon : pickupIcon}
          />
        ))}

        {driverLocation && (
          <Marker
            position={[driverLocation.lat, driverLocation.lng]}
            icon={carIcon}
          />
        )}

        {approachingRoute && approachingRoute.length > 0 && (
          <Polyline
            positions={approachingRoute.map(c => [c.lat, c.lng])}
            color="#3b82f6"
            weight={3}
            dashArray="5, 10"
            opacity={0.8}
          />
        )}

        {formattedRoute.length > 0 && (
          <Polyline
            positions={formattedRoute}
            color="#FBBF24"
            weight={3}
            opacity={0.85}
          />
        )}

        {draftRoute.length > 1 && (
          <Polyline
            positions={draftRoute}
            color="#f87171"
            weight={3}
            dashArray="5, 10"
            opacity={0.6}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;