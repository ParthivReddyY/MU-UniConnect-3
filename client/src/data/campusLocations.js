/**
 * Campus Locations Data
 * 
 * This file contains structured data for all campus locations organized by category.
 * Each location includes detailed information including precise coordinates,
 * descriptions, amenities, and other metadata.
 */

// Main campus reference point (used for relative positioning)
export const CAMPUS_CENTER = {
  latitude: 17.5674, 
  longitude: 78.4360
};

// Boundary coordinates of the campus
export const CAMPUS_BOUNDS = {
  north: 17.5745,  // Northernmost boundary  
  south: 17.5645,  // Southernmost boundary
  east: 78.4400,   // Easternmost boundary
  west: 78.4320    // Westernmost boundary
};

// Categories with metadata
export const LOCATION_CATEGORIES = [
  { 
    id: 'all', 
    name: 'All', 
    icon: 'fas fa-th',
    description: 'All campus locations'
  },
  { 
    id: 'academic', 
    name: 'Academic', 
    icon: 'fas fa-graduation-cap',
    description: 'Academic buildings, classrooms, and lecture halls'
  },
  { 
    id: 'residence', 
    name: 'Residence', 
    icon: 'fas fa-home',
    description: 'Dormitories and residential buildings'
  },
  { 
    id: 'dining', 
    name: 'Dining', 
    icon: 'fas fa-utensils',
    description: 'Cafeterias, restaurants, and food courts'
  },
  { 
    id: 'athletics', 
    name: 'Athletics', 
    icon: 'fas fa-futbol',
    description: 'Sports facilities, fields, and gymnasiums'
  },
  { 
    id: 'libraries', 
    name: 'Libraries', 
    icon: 'fas fa-book',
    description: 'Libraries and study spaces'
  },
  { 
    id: 'services', 
    name: 'Services', 
    icon: 'fas fa-concierge-bell',
    description: 'Administrative offices and student services'
  },
  { 
    id: 'landmarks', 
    name: 'Landmarks', 
    icon: 'fas fa-monument',
    description: 'Notable campus landmarks and monuments'
  },
  { 
    id: 'parking', 
    name: 'Parking', 
    icon: 'fas fa-parking',
    description: 'Parking lots and structures'
  }
];

// Campus locations organized by category
const locations = {
  academic: [
    {
      id: 'academic-block-a',
      name: 'Academic Block A',
      shortName: 'Block A',
      coordinates: [17.5674, 78.4357], // Precisely measured coordinates
      description: 'Main engineering departments including Computer Science, Electrical, and Mechanical Engineering',
      amenities: ['Lecture Halls', 'Labs', 'Faculty Offices', 'Student Lounge'],
      address: 'Central Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: '8:00 AM - 7:00 PM',
      floors: 4,
      departments: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering'],
      entrances: [
        {name: 'Main Entrance', coordinates: [17.5675, 78.4359]},
        {name: 'East Door', coordinates: [17.5673, 78.4361]}
      ]
    },
    {
      id: 'academic-block-b',
      name: 'Academic Block B',
      shortName: 'Block B',
      coordinates: [17.5665, 78.4352],
      description: 'Home to Business School, Law School, and Liberal Arts departments',
      amenities: ['Seminar Rooms', 'Auditorium', 'Faculty Offices', 'Conference Halls'],
      address: 'Central Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: '8:00 AM - 7:00 PM',
      floors: 3,
      departments: ['Business School', 'Law School', 'Liberal Arts'],
      entrances: [
        {name: 'Main Entrance', coordinates: [17.5666, 78.4350]},
        {name: 'North Door', coordinates: [17.5668, 78.4352]}
      ]
    },
    {
      id: 'research-center',
      name: 'Research Center',
      shortName: 'R&D',
      coordinates: [17.5671, 78.4348],
      description: 'Innovation hub with advanced research facilities and laboratories',
      amenities: ['Research Labs', 'Conference Rooms', 'Collaboration Spaces'],
      address: 'North Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: '9:00 AM - 8:00 PM',
      floors: 2,
      departments: ['Research & Development', 'Innovation Lab'],
      entrances: [
        {name: 'Main Entrance', coordinates: [17.5671, 78.4346]}
      ]
    }
  ],
  libraries: [
    {
      id: 'central-library',
      name: 'Central Library',
      shortName: 'Library',
      coordinates: [17.5682, 78.4361],
      description: '24/7 library facility with over 50,000 books and digital resources',
      amenities: ['Reading Areas', 'Digital Catalogs', 'Study Rooms', 'Multimedia Section'],
      address: 'Central Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: 'Open 24 hours',
      floors: 2,
      collections: ['Engineering', 'Business', 'Law', 'Sciences', 'Humanities'],
      quietZones: ['2nd Floor Reading Room', 'Research Carrels'],
      entrances: [
        {name: 'Main Entrance', coordinates: [17.5683, 78.4359]}
      ]
    }
  ],
  residence: [
    {
      id: 'boys-hostel',
      name: 'Boys Hostel',
      shortName: 'B-Hostel',
      coordinates: [17.5655, 78.4335],
      description: 'Residential blocks 1-4 for male students',
      amenities: ['Common Rooms', 'Laundry', 'Study Areas', 'Recreation Room'],
      address: 'West Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: 'Resident access 24 hours',
      blocks: ['Block 1', 'Block 2', 'Block 3', 'Block 4'],
      capacity: 500,
      warden: 'Dr. Ramesh Kumar',
      entrances: [
        {name: 'Main Gate', coordinates: [17.5657, 78.4333]},
        {name: 'Side Entrance', coordinates: [17.5653, 78.4337]}
      ]
    },
    {
      id: 'girls-hostel',
      name: 'Girls Hostel',
      shortName: 'G-Hostel',
      coordinates: [17.5647, 78.4353],
      description: 'Residential blocks 5-6 for female students',
      amenities: ['Common Rooms', 'Laundry', 'Study Areas', 'Recreation Room'],
      address: 'West Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: 'Resident access 24 hours',
      blocks: ['Block 5', 'Block 6'],
      capacity: 300,
      warden: 'Dr. Sunita Sharma',
      entrances: [
        {name: 'Main Gate', coordinates: [17.5649, 78.4351]}
      ]
    }
  ],
  athletics: [
    {
      id: 'sports-complex',
      name: 'Sports Complex',
      shortName: 'Sports',
      coordinates: [17.5662, 78.4373],
      description: 'Multi-facility sports center with indoor and outdoor amenities',
      amenities: ['Gymnasium', 'Swimming Pool', 'Tennis Courts', 'Athletic Fields'],
      address: 'East Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: '6:00 AM - 9:00 PM',
      facilities: [
        {name: 'Swimming Pool', coordinates: [17.5664, 78.4375]},
        {name: 'Basketball Court', coordinates: [17.5661, 78.4371]},
        {name: 'Tennis Courts', coordinates: [17.5660, 78.4376]}
      ],
      entrances: [
        {name: 'Main Entrance', coordinates: [17.5662, 78.4370]}
      ]
    }
  ],
  dining: [
    {
      id: 'central-canteen',
      name: 'Central Canteen',
      shortName: 'Canteen',
      coordinates: [17.5669, 78.4339],
      description: 'Main dining hall and food court serving diverse cuisine',
      amenities: ['Multiple Food Stalls', 'Seating Area', 'Cafe', 'Convenience Store'],
      address: 'Central Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: '7:00 AM - 10:00 PM',
      cuisines: ['North Indian', 'South Indian', 'Continental', 'Chinese'],
      paymentOptions: ['Cash', 'Card', 'Mobile Payment'],
      entrances: [
        {name: 'Main Entrance', coordinates: [17.5670, 78.4337]},
        {name: 'Side Door', coordinates: [17.5667, 78.4340]}
      ]
    }
  ],
  services: [
    {
      id: 'admin-building',
      name: 'Administration Building',
      shortName: 'Admin',
      coordinates: [17.5678, 78.4342],
      description: 'Houses administrative offices and services for students and faculty',
      amenities: ['Admissions', 'Registrar', 'Finance', 'Human Resources'],
      address: 'Central Campus, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: '9:00 AM - 5:00 PM',
      departments: ['Admissions', 'Registrar', 'Finance', 'HR', 'Student Affairs'],
      floors: 3,
      entrances: [
        {name: 'Main Entrance', coordinates: [17.5679, 78.4340]}
      ]
    }
  ],
  parking: [
    {
      id: 'central-parking',
      name: 'Central Parking Lot',
      shortName: 'Parking',
      coordinates: [17.5685, 78.4330],
      description: 'Main parking facility for students, faculty, and visitors',
      amenities: ['Car Parking', 'Bike Parking', 'EV Charging', 'Security'],
      address: 'Main Entrance, MU',
      image: 'https://res.cloudinary.com/dmny4ymqp/image/upload/v1746258098/MU_Building_2_12_zhpzto.webp',
      accessibility: true,
      hours: 'Open 24 hours',
      capacity: {cars: 200, bikes: 500},
      security: true,
      entrances: [
        {name: 'Main Entry', coordinates: [17.5687, 78.4328]},
        {name: 'Exit', coordinates: [17.5683, 78.4332]}
      ]
    }
  ]
};

// Flatten categories for search and filtering
export const getAllLocations = () => {
  return Object.entries(locations).flatMap(([category, places]) => 
    places.map(place => ({
      ...place,
      category
    }))
  );
};

// Get locations by category
export const getLocationsByCategory = (categoryId) => {
  if (categoryId === 'all') {
    return getAllLocations();
  }
  
  return locations[categoryId]?.map(place => ({
    ...place,
    category: categoryId
  })) || [];
};

// Find location by ID
export const getLocationById = (locationId) => {
  const allLocations = getAllLocations();
  return allLocations.find(location => location.id === locationId);
};

// Find nearest locations to coordinates
export const findNearestLocations = (coords, limit = 5) => {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) {
    return [];
  }
  
  const allLocations = getAllLocations();
  
  // Calculate distances to all places
  const locationsWithDistance = allLocations.map(place => {
    const dx = place.coordinates[0] - coords[0];
    const dy = place.coordinates[1] - coords[1];
    // Simple Euclidean distance
    const distance = Math.sqrt(dx * dx + dy * dy);
    return { ...place, distance };
  });
  
  // Sort by distance and get the closest places
  locationsWithDistance.sort((a, b) => a.distance - b.distance);
  return locationsWithDistance.slice(0, limit);
};

const campusLocations = {
  getAllLocations,
  getLocationsByCategory,
  getLocationById,
  findNearestLocations,
  CAMPUS_CENTER,
  CAMPUS_BOUNDS,
  LOCATION_CATEGORIES
};

export default campusLocations;