/**
 * Coordinate Utilities
 * 
 * This file contains utilities for working with geographic coordinates
 * and converting between different coordinate systems used in the campus map.
 */

import { CAMPUS_CENTER, CAMPUS_BOUNDS } from '../data/campusLocations';

/**
 * Haversine distance calculation between two points on Earth
 * @param {Array} coord1 - [latitude, longitude] of first point
 * @param {Array} coord2 - [latitude, longitude] of second point
 * @returns {number} - Distance in meters
 */
export const haversineDistance = (coord1, coord2) => {
  const toRadian = angle => (Math.PI / 180) * angle;
  const EARTH_RADIUS = 6371000; // Earth radius in meters

  const dLat = toRadian(coord2[0] - coord1[0]);
  const dLon = toRadian(coord2[1] - coord1[1]);
  const lat1 = toRadian(coord1[0]);
  const lat2 = toRadian(coord2[0]);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return EARTH_RADIUS * c;
};

/**
 * Improved conversion from standard lat/long coordinates to QGIS Cloud coordinates
 * Uses a more accurate transformation with scale correction
 * 
 * @param {Array} latLng - [latitude, longitude] coordinates to convert
 * @returns {Array} - [x, y] coordinates in QGIS Cloud system
 */
export const convertToQgisCloudCoordinates = (latLng) => {
  // Validate input
  if (!latLng || !Array.isArray(latLng) || latLng.length !== 2) {
    console.error("Invalid coordinates provided to converter:", latLng);
    return null;
  }
  
  const lat = latLng[0];
  const lon = latLng[1];
  
  // QGIS Cloud uses a different projection system
  // These values are calibrated for the Mahindra University map
  
  // Center point of campus
  const centerLat = CAMPUS_CENTER.latitude;
  const centerLong = CAMPUS_CENTER.longitude;
  
  // Reference QGIS center coordinates (from map)
  const centerX = 8731000; // Center X in QGIS coordinates
  const centerY = 1987400; // Center Y in QGIS coordinates
  
  // Base scale factor - this determines the zoom level and position
  const baseScaleFactorLat = 130000;
  const baseScaleFactorLong = 130000;
  
  // Apply non-linear corrections
  // These corrections account for the Earth's curvature at this specific location
  // and projection distortions in the QGIS system
  
  // Distance from center point
  const latDiff = lat - centerLat;
  const lonDiff = lon - centerLong;
  
  // Apply correction factors based on distance from center
  // These values were derived from empirical testing and calibration
  const latScale = baseScaleFactorLat * (1 + Math.abs(latDiff) * 0.05);
  const lonScale = baseScaleFactorLong * (1 + Math.abs(lonDiff) * 0.05);
  
  // Calculate adjusted offsets from center
  const latOffset = latDiff * latScale;
  const lonOffset = lonDiff * lonScale;
  
  // Convert to QGIS coordinates with rounding for integer pixels
  const x = Math.round(centerX + lonOffset);
  const y = Math.round(centerY + latOffset);
  
  return [x, y];
};

/**
 * Create a QGIS Cloud map URL centered on specific coordinates with appropriate zoom
 * 
 * @param {Array|null} latLng - [latitude, longitude] coordinates to center on, null for default view
 * @param {number} zoomLevel - Zoom level (1-5, where 1 is closest and 5 is furthest)
 * @returns {string} - Full URL for the QGIS Cloud map centered on the coordinates
 */
export const createCenteredMapUrl = (latLng, zoomLevel = 3) => {
  const baseUrl = "https://qgiscloud.com/Harshirh_517/Campus_Navigation/";
  const layers = "?l=Mahindra_Places%2CSnapped%20geometry%2CBuildings_icons%2CBuildings%2CPathways%2CMahindra_greens%2CSports%2Ccampus_boundary";
  const baseParams = "&bl=mapnik&t=Campus_Navigation";
  const hideControlsParam = "&hc=1";
  
  // Default viewport (full campus view) if no coordinates provided
  if (!latLng) {
    return `${baseUrl}${layers}${baseParams}${hideControlsParam}`;
  }
  
  const qgisCoords = convertToQgisCloudCoordinates(latLng);
  if (!qgisCoords) {
    return `${baseUrl}${layers}${baseParams}${hideControlsParam}`;
  }
  
  // Calculate buffer size based on zoom level
  // Smaller numbers = closer zoom
  const zoomBuffers = {
    1: { x: 100, y: 100 },   // Very close
    2: { x: 200, y: 200 },   // Close
    3: { x: 400, y: 400 },   // Medium (default)
    4: { x: 800, y: 800 },   // Far
    5: { x: 1600, y: 1600 }  // Very far (whole campus)
  };
  
  const buffer = zoomBuffers[zoomLevel] || zoomBuffers[3];
  
  // Calculate the bounding box (viewport) with the appropriate zoom buffer
  const e1 = qgisCoords[0] - buffer.x;
  const n1 = qgisCoords[1] - buffer.y;
  const e2 = qgisCoords[0] + buffer.x;
  const n2 = qgisCoords[1] + buffer.y;
  
  // Build the full URL with viewport parameters
  const viewportParam = `&e=${e1}%2C${n1}%2C${e2}%2C${n2}`;
  
  return `${baseUrl}${layers}${baseParams}${viewportParam}${hideControlsParam}`;
};

/**
 * Check if coordinates are within campus boundaries
 * 
 * @param {Array} coords - [latitude, longitude] coordinates to check
 * @returns {boolean} - True if coordinates are within campus boundaries
 */
export const isWithinCampusBounds = (coords) => {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) {
    return false;
  }
  
  const [lat, lng] = coords;
  return (
    lat >= CAMPUS_BOUNDS.south && 
    lat <= CAMPUS_BOUNDS.north && 
    lng >= CAMPUS_BOUNDS.west && 
    lng <= CAMPUS_BOUNDS.east
  );
};

/**
 * Calculate bearing between two points (direction from point 1 to point 2)
 * @param {Array} coord1 - [latitude, longitude] of first point
 * @param {Array} coord2 - [latitude, longitude] of second point
 * @returns {number} - Bearing in degrees (0-360, where 0 is North)
 */
export const calculateBearing = (coord1, coord2) => {
  const toRadian = angle => (Math.PI / 180) * angle;
  
  const lat1 = toRadian(coord1[0]);
  const lat2 = toRadian(coord2[0]);
  const lon1 = toRadian(coord1[1]);
  const lon2 = toRadian(coord2[1]);
  
  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - 
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  
  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  bearing = (bearing + 360) % 360; // Normalize to 0-360
  
  return bearing;
};

/**
 * Get a human-readable direction based on bearing
 * @param {number} bearing - Bearing in degrees
 * @returns {string} - Cardinal direction (N, NE, E, SE, S, SW, W, NW)
 */
export const getCardinalDirection = (bearing) => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};

/**
 * Generate human-readable directions between two locations
 * @param {Object} fromLocation - Starting location object with coordinates
 * @param {Object} toLocation - Destination location object with coordinates
 * @returns {string} - Human readable directions
 */
export const getSimpleDirections = (fromLocation, toLocation) => {
  const distance = haversineDistance(fromLocation.coordinates, toLocation.coordinates);
  const bearing = calculateBearing(fromLocation.coordinates, toLocation.coordinates);
  const direction = getCardinalDirection(bearing);
  
  // Format distance for display
  let formattedDistance;
  if (distance < 100) {
    formattedDistance = `${Math.round(distance)} meters`;
  } else {
    formattedDistance = `${(distance / 1000).toFixed(1)} km`;
  }
  
  return `Head ${direction} for approximately ${formattedDistance} to reach ${toLocation.name}.`;
};

export default {
  convertToQgisCloudCoordinates,
  createCenteredMapUrl,
  isWithinCampusBounds,
  haversineDistance,
  calculateBearing,
  getCardinalDirection,
  getSimpleDirections
};