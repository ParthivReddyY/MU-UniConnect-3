import React, { useState, useEffect } from 'react';
import { 
  convertToQgisCloudCoordinates, 
  createCenteredMapUrl, 
  isWithinCampusBounds,
  getSimpleDirections
} from '../utils/coordinateUtils';
import { 
  getAllLocations, 
  getLocationsByCategory, 
  getLocationById, 
  findNearestLocations,
  LOCATION_CATEGORIES
} from '../data/campusLocations';
import '../CSS/campus-map.css';

/**
 * CampusMap Component
 * 
 * An interactive campus map that allows users to:
 * - View different locations on campus by category
 * - Search for specific locations
 * - Get directions to locations
 * - View their current location and nearby points of interest
 */
const CampusMap = () => {
  // State variables
  const [mapUrl, setMapUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPosition, setCurrentPosition] = useState(null);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [directions, setDirections] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load map and initial locations on component mount
  useEffect(() => {
    // Initialize map with default view
    setMapUrl(createCenteredMapUrl());
    
    // Load all locations
    try {
      const allLocations = getAllLocations();
      setLocations(allLocations);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load locations:", err);
      setError("Failed to load campus locations. Please refresh the page.");
      setLoading(false);
    }
  }, []);
  
  // Update locations when category changes
  useEffect(() => {
    try {
      const filteredLocations = getLocationsByCategory(selectedCategory);
      setLocations(filteredLocations);
    } catch (err) {
      console.error("Error filtering locations:", err);
      setError("Error filtering locations by category.");
    }
  }, [selectedCategory]);
  
  // Handle location selection
  const handleLocationSelect = (locationId) => {
    const location = getLocationById(locationId);
    if (!location) return;
    
    setSelectedLocation(location);
    setMapUrl(createCenteredMapUrl(location.coordinates, 2));
    
    // If user's position is known, generate directions
    if (currentPosition) {
      const userLocation = {
        name: "Your Location",
        coordinates: currentPosition
      };
      
      const directionsText = getSimpleDirections(userLocation, location);
      setDirections(directionsText);
    } else {
      setDirections(null);
    }
  };
  
  // Get user's current position
  const getUserLocation = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        
        if (isWithinCampusBounds(coords)) {
          setCurrentPosition(coords);
          setMapUrl(createCenteredMapUrl(coords, 2));
          
          // Find nearby locations
          const nearby = findNearestLocations(coords, 3);
          setNearbyLocations(nearby);
          
          // Clear any previous directions since location has changed
          setDirections(null);
        } else {
          setError("Your current location appears to be outside the campus boundaries.");
        }
        
        setLoading(false);
      },
      (err) => {
        console.error("Error getting location:", err);
        setError("Failed to get your current location. Please check your browser permissions.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    const allLocations = getAllLocations();
    const searchResults = allLocations.filter(location => 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (location.description && location.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setLocations(searchResults);
    
    // If we have a specific match, select it
    if (searchResults.length === 1) {
      handleLocationSelect(searchResults[0].id);
    }
  };
  
  // Clear search and reset to selected category
  const clearSearch = () => {
    setSearchQuery("");
    setLocations(getLocationsByCategory(selectedCategory));
  };
  
  // Generate map using iframe
  return (
    <div className="campus-map-container">
      <h2>Campus Map</h2>
      
      {/* Error message */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Map controls */}
      <div className="map-controls">
        {/* Category filter */}
        <div className="category-filter">
          <label htmlFor="category-select">Filter by:</label>
          <select 
            id="category-select" 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {LOCATION_CATEGORIES.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="location-search">
          <input 
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
          {searchQuery && <button type="button" onClick={clearSearch}>Clear</button>}
        </form>
        
        {/* Get current location */}
        <button 
          onClick={getUserLocation} 
          className="get-location-btn" 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'My Location'}
        </button>
      </div>
      
      {/* Map and location information display */}
      <div className="map-content">
        {/* Location list */}
        <div className="location-list">
          <h3>
            {searchQuery 
              ? `Search Results (${locations.length})` 
              : LOCATION_CATEGORIES.find(c => c.id === selectedCategory)?.name || "All Locations"
            }
          </h3>
          
          {locations.length === 0 ? (
            <p>No locations found.</p>
          ) : (
            <ul>
              {locations.map(location => (
                <li 
                  key={location.id} 
                  className={selectedLocation?.id === location.id ? "selected" : ""}
                  onClick={() => handleLocationSelect(location.id)}
                >
                  <span className="location-name">{location.name}</span>
                  <span className="location-category">
                    {LOCATION_CATEGORIES.find(c => c.id === location.category)?.name || location.category}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Map display */}
        <div className="map-display">
          {mapUrl && (
            <iframe
              src={mapUrl}
              title="Campus Map"
              width="100%"
              height="400"
              frameBorder="0"
              loading="lazy"
              allowFullScreen
            />
          )}
        </div>
        
        {/* Location details */}
        <div className="location-details">
          {selectedLocation ? (
            <>
              <h3>{selectedLocation.name}</h3>
              <p className="location-description">{selectedLocation.description}</p>
              
              {selectedLocation.amenities && (
                <>
                  <h4>Amenities</h4>
                  <ul className="amenities-list">
                    {selectedLocation.amenities.map((amenity, index) => (
                      <li key={index}>{amenity}</li>
                    ))}
                  </ul>
                </>
              )}
              
              {selectedLocation.hours && (
                <p className="hours"><strong>Hours:</strong> {selectedLocation.hours}</p>
              )}
              
              {/* Directions */}
              {directions && (
                <div className="directions">
                  <h4>Directions</h4>
                  <p>{directions}</p>
                </div>
              )}
            </>
          ) : (
            <p>Select a location to view details</p>
          )}
          
          {/* Nearby locations */}
          {currentPosition && nearbyLocations.length > 0 && (
            <div className="nearby-locations">
              <h4>Nearby Locations</h4>
              <ul>
                {nearbyLocations.map(location => (
                  <li 
                    key={location.id}
                    onClick={() => handleLocationSelect(location.id)}
                  >
                    {location.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampusMap;