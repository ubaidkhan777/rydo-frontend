// Haversine formula to calculate distance between two lat/lng coordinates in kilometers
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Calculate total distance for an array of points (must have lat and lng properties)
export const calculateTotalDistance = (points) => {
  if (!points || points.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += calculateDistance(
      points[i].lat, points[i].lng,
      points[i+1].lat, points[i+1].lng
    );
  }
  return Number(totalDistance.toFixed(2));
};

// Estimate duration in seconds based on an average speed of 30 km/h (8.33 m/s)
export const estimateDuration = (distanceKm) => {
  const averageSpeedKmH = 30;
  const timeHours = distanceKm / averageSpeedKmH;
  return Math.round(timeHours * 3600); // return in seconds
};

// Fetch real road route from OSRM
export const fetchRoadRoute = async (points) => {
  if (!points || points.length < 2) return null;
  
  // OSRM expects lon,lat separated by semicolons
  const coordsString = points.map(p => `${p.lng},${p.lat}`).join(';');
  const url = `http://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distanceKm: Number((route.distance / 1000).toFixed(2)),
        durationSeconds: Math.round(route.duration),
        // OSRM returns [lon, lat], our Map expects [lon, lat] but Map.jsx flips it to [lat, lon]
        // Actually, Map.jsx currently does: coord => [coord[1], coord[0]] which converts [lon, lat] to [lat, lon].
        // So we can just pass the OSRM geometry directly!
        coordinates: route.geometry.coordinates 
      };
    }
  } catch (err) {
    console.error("Failed to fetch route from OSRM:", err);
  }
  
  // Fallback to Haversine if API fails
  const dist = calculateTotalDistance(points);
  return {
    distanceKm: dist,
    durationSeconds: estimateDuration(dist),
    coordinates: points.map(p => [p.lng, p.lat])
  };
};
