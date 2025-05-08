import React, { useState, useRef, useEffect } from 'react';

const CampusMap = () => {
  // State management
  const [activeView, setActiveView] = useState('map');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  // Removing route-related state variables
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationToast, setShowLocationToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Base map URL with hide UI controls parameter added
  const [mapUrl, setMapUrl] = useState("https://qgiscloud.com/Harshirh_517/Campus_Navigation/?l=Mahindra_Places%2CSnapped%20geometry%2CBuildings_icons%2CBuildings%2CPathways%2CMahindra_greens%2CSports%2Ccampus_boundary&bl=mapnik&t=Campus_Navigation&e=8729926%2C1986519%2C8733160%2C1988284&hc=1");

  // Function to convert lat/long to QGISCloud format (required for URL)
  const convertToQgisCloudCoordinates = (latLng) => {
    // QGIS Cloud uses a different projection system
    // These values are calibrated for the Mahindra University map
    const lat = latLng[0];
    const lon = latLng[1];
    
    // Center point of campus (approximate)
    const centerLat = 17.5674;
    const centerLong = 78.4360;
    const centerX = 8731000; // Approximate center X in QGIS coordinates
    const centerY = 1987400; // Approximate center Y in QGIS coordinates
    
    // Improved scale factors with non-linear adjustment
    // These values provide better accuracy across the entire campus
    const baseScaleFactor = 130000;
    
    // Adjust scale factor based on distance from center (slight non-linear correction)
    const latDiff = Math.abs(lat - centerLat);
    const lonDiff = Math.abs(lon - centerLong);
    const distanceFromCenter = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
    
    // Apply a small correction factor based on distance from center
    // This helps account for earth curvature and projection distortions
    const adjustedScaleFactor = baseScaleFactor * (1 + distanceFromCenter * 0.05);
    
    // Calculate offsets from center with adjusted scale factor
    const latOffset = (lat - centerLat) * adjustedScaleFactor;
    const lonOffset = (lon - centerLong) * adjustedScaleFactor;
    
    // Apply offsets to get QGIS coordinates
    const x = Math.round(centerX + lonOffset);
    const y = Math.round(centerY + latOffset);
    
    console.log(`Converting ${lat},${lon} to QGIS: ${x},${y} (scale: ${adjustedScaleFactor.toFixed(2)})`);
    
    return [x, y];
  };

  // Function to create a map URL centered on coordinates with proper zoom
  const createCenteredMapUrl = (latLng) => {
    if (!latLng) return mapUrl;
    
    const qgisCoords = convertToQgisCloudCoordinates(latLng);
    
    // Calculate the bounding box (viewport) with a smaller buffer for better zoom
    const bufferX = 150; // Horizontal buffer
    const bufferY = 150; // Vertical buffer
    
    const e1 = qgisCoords[0] - bufferX;
    const n1 = qgisCoords[1] - bufferY;
    const e2 = qgisCoords[0] + bufferX;
    const n2 = qgisCoords[1] + bufferY;
    
    // Add &hc=1 parameter to hide controls
    return `https://qgiscloud.com/Harshirh_517/Campus_Navigation/?l=Mahindra_Places%2CSnapped%20geometry%2CBuildings_icons%2CBuildings%2CPathways%2CMahindra_greens%2CSports%2Ccampus_boundary&bl=mapnik&t=Campus_Navigation&e=${e1}%2C${n1}%2C${e2}%2C${n2}&hc=1`;
  };

  // Function to find nearest place to a given coordinate
  const findNearestPlace = (coords) => {
    if (!coords) return null;
    
    // Calculate distances to all places
    const placesWithDistance = campusPlaces.map(place => {
      const dx = place.coordinates[0] - coords[0];
      const dy = place.coordinates[1] - coords[1];
      // Simple Euclidean distance
      const distance = Math.sqrt(dx * dx + dy * dy);
      return { ...place, distance };
    });
    
    // Sort by distance and get the closest place
    placesWithDistance.sort((a, b) => a.distance - b.distance);
    return placesWithDistance[0];
  };

  // Function to handle user location request
  const handleLocationRequest = () => {
    setIsLocating(true);
    setLocationError(null);
    setShowLocationToast(false); // Clear any previous messages

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      showToast("Geolocation is not supported by your browser", "error");
      return;
    }

    // First check if permissions are already granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        console.log('Geolocation permission state:', permissionStatus.state);
        
        if (permissionStatus.state === 'denied') {
          // Show specific instructions for re-enabling permissions
          setIsLocating(false);
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
          
          if (isSafari && isMac) {
            showToast("Please enable location in Safari preferences: Safari > Settings > Websites > Location > Allow", "warning", 8000);
          } else if (isMac) {
            showToast("Please enable location in System Settings: Privacy & Security > Location Services", "warning", 8000);
          } else {
            showToast("Location access denied. Please enable location permissions in your browser settings.", "warning", 8000);
          }
          return;
        }
        
        // Continue with getting position
        getPosition();
      }).catch(error => {
        console.error("Error checking permission:", error);
        // Fall back to standard geolocation if permissions API fails
        getPosition();
      });
    } else {
      // Permissions API not available, use standard geolocation
      getPosition();
    }
  };

  // Extracted position getting logic to avoid code duplication
  const getPosition = () => {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`User location successfully retrieved: ${latitude}, ${longitude}`);
        
        // For testing purposes, temporarily bypass bounds check
        // When ready for production, uncomment this code to check if within campus bounds
        /*
        // Approximate bounds of Mahindra University
        const campusBounds = {
          north: 17.5745,
          south: 17.5645,
          east: 78.4400,
          west: 78.4320
        };
        
        if (latitude >= campusBounds.south && 
            latitude <= campusBounds.north && 
            longitude >= campusBounds.west && 
            longitude <= campusBounds.east) {
        */
        // Temporarily always proceed as if in bounds for testing
        if (true) {
          // User is within campus or we're bypassing the check for testing
          setUserLocation([latitude, longitude]);
          
          // Update map to focus on user location
          setMapUrl(createCenteredMapUrl([latitude, longitude]));
          
          // Find the nearest building to the user
          const nearest = findNearestPlace([latitude, longitude]);
          if (nearest) {
            showToast(`You are near ${nearest.name}`, "success");
          } else {
            showToast("Your location has been found", "success");
          }
        } else {
          // User is outside campus
          showToast("You appear to be outside campus boundaries", "warning");
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationError(error.message);
        setIsLocating(false);
        
        switch(error.code) {
          case 1:
            showToast("Location access denied. Please check your browser and device settings to enable location permissions.", "error", 5000);
            break;
          case 2:
            showToast("Location unavailable. Please try again in a different area or with better signal.", "error");
            break;
          case 3:
            showToast("Location request timed out. Please check your internet connection and try again.", "error");
            break;
          default:
            showToast("Error getting your location. Please try again.", "error");
        }
      },
      options
    );
  };

  // Function to show a toast message with optional duration
  const showToast = (message, type = "info", duration = 3000) => {
    setToastMessage(message);
    setShowLocationToast(true);
    
    // Auto-hide after specified duration
    setTimeout(() => {
      setShowLocationToast(false);
    }, duration);
  };

  // Categories for places filter
  const categories = [
    { id: 'all', name: 'All', icon: 'fas fa-th' },
    { id: 'academic', name: 'Academic', icon: 'fas fa-graduation-cap' },
    { id: 'residence', name: 'Residence', icon: 'fas fa-home' },
    { id: 'dining', name: 'Dining', icon: 'fas fa-utensils' },
    { id: 'athletics', name: 'Athletics', icon: 'fas fa-futbol' },
    { id: 'libraries', name: 'Libraries', icon: 'fas fa-book' },
    { id: 'services', name: 'Services', icon: 'fas fa-concierge-bell' },
    { id: 'landmarks', name: 'Landmarks', icon: 'fas fa-monument' },
    { id: 'parking', name: 'Parking', icon: 'fas fa-parking' }
  ];

  // Sample campus buildings and places data - memoized to prevent recreation on every render
  const campusPlaces = React.useMemo(() => [
    {
      id: 'academic-block-a',
      name: 'Academic Block A',
      category: 'academic',
      coordinates: [17.5674, 78.4357], // Updated coordinates
      description: 'Main engineering departments including Computer Science, Electrical, and Mechanical Engineering',
      amenities: ['Lecture Halls', 'Labs', 'Faculty Offices', 'Student Lounge'],
      address: 'Central Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: '8:00 AM - 7:00 PM'
    },
    {
      id: 'academic-block-b',
      name: 'Academic Block B',
      category: 'academic',
      coordinates: [17.5665, 78.4352], // Updated coordinates
      description: 'Home to Business School, Law School, and Liberal Arts departments',
      amenities: ['Seminar Rooms', 'Auditorium', 'Faculty Offices', 'Conference Halls'],
      address: 'Central Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: '8:00 AM - 7:00 PM'
    },
    {
      id: 'central-library',
      name: 'Central Library',
      category: 'libraries',
      coordinates: [17.5682, 78.4361], // Updated coordinates
      description: '24/7 library facility with over 50,000 books and digital resources',
      amenities: ['Reading Areas', 'Digital Catalogs', 'Study Rooms', 'Multimedia Section'],
      address: 'Central Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: 'Open 24 hours'
    },
    {
      id: 'research-center',
      name: 'Research Center',
      category: 'academic',
      coordinates: [17.5671, 78.4348], // Updated coordinates
      description: 'Innovation hub with advanced research facilities and laboratories',
      amenities: ['Research Labs', 'Conference Rooms', 'Collaboration Spaces'],
      address: 'North Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: '9:00 AM - 8:00 PM'
    },
    {
      id: 'boys-hostel',
      name: 'Boys Hostel',
      category: 'residence',
      coordinates: [17.5655, 78.4335], // Updated coordinates
      description: 'Residential blocks 1-4 for male students',
      amenities: ['Common Rooms', 'Laundry', 'Study Areas', 'Recreation Room'],
      address: 'West Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: 'Resident access 24 hours'
    },
    {
      id: 'girls-hostel',
      name: 'Girls Hostel',
      category: 'residence',
      coordinates: [17.5647, 78.4353], // Updated coordinates
      description: 'Residential blocks 5-6 for female students',
      amenities: ['Common Rooms', 'Laundry', 'Study Areas', 'Recreation Room'],
      address: 'West Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: 'Resident access 24 hours'
    },
    {
      id: 'sports-complex',
      name: 'Sports Complex',
      category: 'athletics',
      coordinates: [17.5662, 78.4373], // Updated coordinates
      description: 'Multi-facility sports center with indoor and outdoor amenities',
      amenities: ['Gymnasium', 'Swimming Pool', 'Tennis Courts', 'Athletic Fields'],
      address: 'East Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: '6:00 AM - 9:00 PM'
    },
    {
      id: 'central-canteen',
      name: 'Central Canteen',
      category: 'dining',
      coordinates: [17.5669, 78.4339], // Updated coordinates
      description: 'Main dining hall and food court serving diverse cuisine',
      amenities: ['Multiple Food Stalls', 'Seating Area', 'Cafe', 'Convenience Store'],
      address: 'Central Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: '7:00 AM - 10:00 PM'
    },
    {
      id: 'admin-building',
      name: 'Administration Building',
      category: 'services',
      coordinates: [17.5678, 78.4342], // Updated coordinates
      description: 'Houses administrative offices and services for students and faculty',
      amenities: ['Admissions', 'Registrar', 'Finance', 'Human Resources'],
      address: 'Central Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: '9:00 AM - 5:00 PM'
    },
    {
      id: 'central-parking',
      name: 'Central Parking Lot',
      category: 'parking',
      coordinates: [17.5685, 78.4330], // Updated coordinates
      description: 'Main parking facility for students, faculty, and visitors',
      amenities: ['Car Parking', 'Bike Parking', 'EV Charging', 'Security'],
      address: 'Main Entrance, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: 'Open 24 hours'
    }
  ], []);

  // Effect for search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = campusPlaces.filter(place => 
      place.name.toLowerCase().includes(query) || 
      place.description.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
  }, [searchQuery, campusPlaces]);

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedPlace(null);
  };

  // Function to handle place selection
  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    // Update the map URL to center on the selected place
    setMapUrl(createCenteredMapUrl(place.coordinates));
    console.log(`Selected place: ${place.name} at coordinates ${place.coordinates}`);
  };

  // Function to handle map iframe load
  const handleMapLoad = () => {
    setMapLoaded(true);
  };

  // Filter places based on selected category
  const filteredPlaces = selectedCategory === 'all' 
    ? campusPlaces 
    : campusPlaces.filter(place => place.category === selectedCategory);

  // Effect to inject custom CSS to hide QGIS controls after map loads
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      try {
        // Function to inject CSS
        const injectCSS = () => {
          try {
            // Access the iframe document
            const iframeDocument = mapRef.current.contentDocument || mapRef.current.contentWindow.document;
            
            // Create a style element
            const styleElement = iframeDocument.createElement('style');
            styleElement.textContent = `
              /* Hide search bar and all search controls */
              .search-container, .ol-search, .search-bar,
              .searchbox, .ol-search-button, .ol-searchbar,
              .leaflet-control-search, .qgis-search, 
              input[type="search"], [placeholder*="Search"],
              .search-icon, .search-results, form[role="search"],
              [aria-label*="search"], .search-panel {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                width: 0 !important;
                height: 0 !important;
                position: absolute !important;
                left: -9999px !important;
              }
              
              /* Hide zoom controls */
              .ol-zoom, .ol-zoom-in, .ol-zoom-out,
              .leaflet-control-zoom, .zoom-control,
              .zoom-buttons, .zoom-container, .ol-zoom-slider,
              [aria-label*="zoom"], [title*="Zoom"],
              button[title*="in"], button[title*="out"],
              .qgis-zoom, .zoom-panel {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
              
              /* Hide home button and other navigation buttons */
              .ol-home, .home-button, .ol-zoom-home, .ol-zoomhome,
              .leaflet-control-home, .home-control, .ol-compass,
              .ol-rotate, .ol-north, .ol-overview, 
              .ol-zoomextent, .ol-zoomtoextent, .ol-fullextent,
              [aria-label*="home"], [title*="Home"], 
              [title*="extent"], [title*="overview"], 
              .qgis-navigate, .navigation-panel,
              .ol-overviewmap, .overview-map, .mini-map,
              .ol-control:not(.ol-attribution) {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
              
              /* Hide layer switcher and controls */
              .ol-layerswitcher, .layer-switcher, .layer-control,
              .leaflet-control-layers, .layers-panel, .layers-menu,
              .base-layers, .overlay-layers, .layer-list, 
              .layer-tree, .ol-layer-panel, .qgis-layers {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
              
              /* Minimize attribution panel */
              .ol-attribution.ol-uncollapsible,
              .leaflet-control-attribution {
                height: auto !important;
                max-height: 15px !important;
                max-width: 150px !important;
                bottom: 0 !important;
                font-size: 8px !important;
                opacity: 0.5 !important;
                background-color: transparent !important;
              }
            `;
            
            // Append the style element to the iframe's head
            iframeDocument.head.appendChild(styleElement);
            
            // Also hide elements directly
            const hideElements = () => {
              try {
                // Get all controls
                const controls = iframeDocument.querySelectorAll('.ol-control, .ol-search, .leaflet-control, .search-container, .layer-switcher');
                controls.forEach(control => {
                  if (!control.classList.contains('ol-attribution')) {
                    control.style.display = 'none';
                    control.style.visibility = 'hidden';
                    control.style.opacity = '0';
                    control.style.pointerEvents = 'none';
                  }
                });
              } catch (err) {
                console.error("Error hiding elements:", err);
              }
            };
            
            // Execute hide elements function
            hideElements();
            
            // Also set up a mutation observer to hide any dynamically added controls
            const observer = new MutationObserver(hideElements);
            observer.observe(iframeDocument.body, { 
              childList: true, 
              subtree: true 
            });
            
            // Store observer in the component instance
            return observer;
          } catch (err) {
            console.error("Error in injectCSS:", err);
            return null;
          }
        };
        
        // Initial CSS injection
        const observer = injectCSS();
        
        // Set up a recurring check to make sure the CSS is still applied
        // (in case the iframe gets reloaded)
        const intervalId = setInterval(() => {
          try {
            if (mapRef.current) {
              injectCSS();
            }
          } catch (err) {
            console.error("Error in interval check:", err);
          }
        }, 1000); // Check every second
        
        // Clean up
        return () => {
          clearInterval(intervalId);
          if (observer) observer.disconnect();
        };
      } catch (error) {
        console.error("Failed to set up CSS injection:", error);
      }
    }
  }, [mapLoaded]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="bg-white shadow-md p-4 sticky top-0 z-30">
          <div className="container mx-auto flex flex-wrap items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-red flex items-center">
              <i className="fas fa-map-marked-alt mr-2"></i>
              Mahindra University Map
            </h1>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-1/3 mt-4 md:mt-0">
              <input
                type="text"
                placeholder="Search for buildings, facilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent pl-10"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg mt-1 max-h-64 overflow-y-auto z-50">
                  {searchResults.map(result => (
                    <div 
                      key={result.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => {
                        handlePlaceSelect(result);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <i className={`fas fa-${result.category === 'academic' ? 'graduation-cap' : 
                                          result.category === 'residence' ? 'home' :
                                          result.category === 'dining' ? 'utensils' :
                                          result.category === 'athletics' ? 'futbol' :
                                          result.category === 'libraries' ? 'book' :
                                          result.category === 'services' ? 'concierge-bell' :
                                          result.category === 'landmarks' ? 'monument' :
                                          result.category === 'parking' ? 'parking' : 'map-marker-alt'} 
                                          mr-3 text-primary-red`}></i>
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-xs text-gray-500 truncate">{result.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* View Toggle Buttons - Removed directions button */}
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <button 
                className={`px-3 py-1 rounded-lg flex items-center ${activeView === 'map' ? 'bg-primary-red text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setActiveView('map')}
              >
                <i className="fas fa-map mr-1"></i> Map
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div 
            className={`bg-white h-[calc(100vh-100px)] overflow-y-auto transition-all duration-300 border-r border-gray-200 ${
              sidebarOpen ? 'w-80' : 'w-0'
            }`}
          >
            {sidebarOpen && (
              <div className="h-full flex flex-col">
                {/* Removed Route Planning Section */}
                
                {/* Category Filters */}
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold mb-3">Filter by Category</h2>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        className={`px-3 py-1.5 rounded-full flex items-center text-sm ${
                          selectedCategory === category.id 
                            ? 'bg-primary-red text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => handleCategoryChange(category.id)}
                      >
                        <i className={`${category.icon} mr-1.5`}></i> {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Places List */}
                <div className="flex-1 overflow-y-auto">
                  <h2 className="p-4 font-semibold text-lg border-b border-gray-200">
                    {selectedCategory === 'all' ? 'All Places' : categories.find(c => c.id === selectedCategory)?.name}
                    <span className="text-sm ml-2 text-gray-500">({filteredPlaces.length})</span>
                  </h2>
                  
                  <div className="divide-y divide-gray-100">
                    {filteredPlaces.map(place => (
                      <div 
                        key={place.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedPlace?.id === place.id ? 'bg-red-50' : ''
                        }`}
                        onClick={() => handlePlaceSelect(place)}
                      >
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-primary-red">
                              <i className={`fas fa-${
                                place.category === 'academic' ? 'graduation-cap' : 
                                place.category === 'residence' ? 'home' :
                                place.category === 'dining' ? 'utensils' :
                                place.category === 'athletics' ? 'futbol' :
                                place.category === 'libraries' ? 'book' :
                                place.category === 'services' ? 'concierge-bell' :
                                place.category === 'landmarks' ? 'monument' :
                                place.category === 'parking' ? 'parking' : 'map-marker-alt'
                              }`}></i>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{place.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{place.description}</p>
                            {place.accessibility && (
                              <div className="mt-1 text-xs flex items-center text-blue-600">
                                <i className="fas fa-wheelchair mr-1"></i> Accessible
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Map Container */}
          <div className="flex-1 relative">
            {/* Toggle Sidebar Button */}
            <button 
              className="absolute top-4 left-4 z-20 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <i className={`fas fa-${sidebarOpen ? 'chevron-left' : 'chevron-right'}`}></i>
            </button>
            
            {/* Map Iframe with Loading State */}
            <div className="w-full h-[calc(100vh-100px)] relative">
              {!mapLoaded && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red mb-4"></div>
                    <p className="text-gray-600">Loading campus map...</p>
                  </div>
                </div>
              )}
              
              {/* User Location Marker */}
              {userLocation && (
                <div 
                  className="absolute z-30 pointer-events-none"
                  style={{
                    // This positioning would need calibration based on actual map coordinates
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-0.5 rounded text-xs whitespace-nowrap">
                    You are here
                  </div>
                </div>
              )}
              
              {/* Toast Notification for Location */}
              {showLocationToast && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
                  <div className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium max-w-md text-center ${
                    toastMessage.includes("denied") || toastMessage.includes("error") ? 'bg-red-500' : 
                    toastMessage.includes("outside") || toastMessage.includes("enable") || toastMessage.includes("warning") ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {toastMessage}
                  </div>
                </div>
              )}
              
              {/* Add overlay div to block any remaining controls */}
              <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  background: 'transparent',
                  // We'll create specific clickable holes for the map but block controls
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
                }}
              ></div>
              
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Mahindra University Interactive Campus Map"
                onLoad={handleMapLoad}
                className={`z-10 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}
                ref={mapRef}
                sandbox="allow-scripts allow-same-origin"
              ></iframe>
              
              {/* Custom Map Controls */}
              <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
                {/* Zoom Controls */}
                <div className="bg-white rounded-lg shadow-lg flex flex-col">
                  <button 
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-t-lg text-gray-700"
                    onClick={() => {
                      try {
                        if (mapRef.current && mapRef.current.contentWindow) {
                          // Post a custom message to the iframe for zoom in
                          mapRef.current.contentWindow.postMessage({ action: 'zoomIn' }, '*');
                        }
                      } catch (error) {
                        console.error("Failed to send zoom command:", error);
                      }
                    }}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                  <div className="h-px w-full bg-gray-100"></div>
                  <button 
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-b-lg text-gray-700"
                    onClick={() => {
                      try {
                        if (mapRef.current && mapRef.current.contentWindow) {
                          // Post a custom message to the iframe for zoom out
                          mapRef.current.contentWindow.postMessage({ action: 'zoomOut' }, '*');
                        }
                      } catch (error) {
                        console.error("Failed to send zoom command:", error);
                      }
                    }}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                </div>
                
                {/* Location Button */}
                <div className="bg-white rounded-lg shadow-lg">
                  <button 
                    className={`w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg ${
                      isLocating ? 'text-blue-500 animate-pulse' : userLocation ? 'text-blue-600' : 'text-gray-700'
                    }`}
                    onClick={handleLocationRequest}
                    disabled={isLocating}
                    title="Find my location"
                  >
                    {isLocating ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : locationError ? (
                      <i className="fas fa-location-arrow text-red-500"></i>
                    ) : (
                      <i className="fas fa-location-arrow"></i>
                    )}
                  </button>
                </div>
                
                {/* Fullscreen Button */}
                <div className="bg-white rounded-lg shadow-lg">
                  <button 
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-700" 
                    title="Fullscreen"
                    onClick={() => {
                      const mapContainer = mapRef.current?.parentElement;
                      if (mapContainer && document.fullscreenEnabled) {
                        if (!document.fullscreenElement) {
                          mapContainer.requestFullscreen().catch(err => {
                            console.error(`Error attempting to enable fullscreen: ${err.message}`);
                          });
                        } else {
                          document.exitFullscreen();
                        }
                      }
                    }}
                  >
                    <i className="fas fa-expand"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Place Details Panel */}
          {selectedPlace && (
            <div className="bg-white border-l border-gray-200 w-80 h-[calc(100vh-100px)] overflow-y-auto">
              <div className="relative h-48">
                <img 
                  src={selectedPlace.image} 
                  alt={selectedPlace.name} 
                  className="w-full h-full object-cover"
                />
                <button 
                  className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                  onClick={() => setSelectedPlace(null)}
                >
                  <i className="fas fa-times"></i>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h2 className="text-white text-xl font-bold">{selectedPlace.name}</h2>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <i className={`fas fa-${
                      selectedPlace.category === 'academic' ? 'graduation-cap' : 
                      selectedPlace.category === 'residence' ? 'home' :
                      selectedPlace.category === 'dining' ? 'utensils' :
                      selectedPlace.category === 'athletics' ? 'futbol' :
                      selectedPlace.category === 'libraries' ? 'book' :
                      selectedPlace.category === 'services' ? 'concierge-bell' :
                      selectedPlace.category === 'landmarks' ? 'monument' :
                      selectedPlace.category === 'parking' ? 'parking' : 'map-marker-alt'
                    } text-primary-red`}></i>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{categories.find(c => c.id === selectedPlace.category)?.name}</div>
                    <div className="text-lg font-medium">{selectedPlace.name}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-700">{selectedPlace.description}</p>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Address:</h3>
                    <p className="text-sm text-gray-600">{selectedPlace.address}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Hours:</h3>
                    <p className="text-sm text-gray-600">{selectedPlace.hours}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Amenities:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlace.amenities.map((amenity, index) => (
                        <span 
                          key={index} 
                          className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Removed Navigation button, keeping only share button */}
                  <div className="flex space-x-2 pt-2">
                    <button className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <i className="fas fa-share-alt text-gray-700"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampusMap;
