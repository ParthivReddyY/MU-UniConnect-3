import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/faculty.css'; // Now contains only custom animations and effects
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';  

const Faculty = () => {
  // State variables
  const [allFacultyData, setAllFacultyData] = useState([]);
  const [filteredFacultyData, setFilteredFacultyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    schools: [],
    designations: [],
    searchQuery: ''
  });
  
  // Auth context for role-based controls
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const pageSize = 24; // Increased from 12 to 24

  // Fetch faculty data on component mount
  useEffect(() => {
    const fetchFacultyData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/faculty');
        if (response.status !== 200) {
          throw new Error('Network response was not ok');
        }
        const data = response.data;
        setAllFacultyData(data);
        setFilteredFacultyData(data);
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        showError('Failed to load faculty data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  // Navigate to add faculty page
  const handleAddFaculty = () => {
    navigate('/faculty-detail/new');
  };

  // Apply filters to faculty data
  const applyFilters = useCallback(() => {
    let filtered = [...allFacultyData];
    
    // Apply school filters
    if (filters.schools.length > 0) {
      filtered = filtered.filter(faculty => 
        filters.schools.some(school => 
          faculty.department && faculty.department.includes(school)
        )
      );
    }
    
    // Apply designation filters
    if (filters.designations.length > 0) {
      filtered = filtered.filter(faculty => 
        filters.designations.includes(faculty.designation)
      );
    }
    
    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(faculty => {
        const nameMatch = faculty.name && faculty.name.toLowerCase().includes(query);
        const departmentMatch = faculty.department && faculty.department.toLowerCase().includes(query);
        const designationMatch = faculty.designation && faculty.designation.toLowerCase().includes(query);
        const overviewMatch = faculty.overview && faculty.overview.toLowerCase().includes(query);
        
        return nameMatch || departmentMatch || designationMatch || overviewMatch;
      });
    }
    
    // Sort the filtered data
    sortFacultyData(filtered);
    
    setFilteredFacultyData(filtered);
  }, [allFacultyData, filters]);

  // Apply filters when they change
  useEffect(() => {
    if (allFacultyData.length > 0) {
      applyFilters();
    }
  }, [filters, allFacultyData.length, applyFilters]);

  // Handle search input
  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const searchInput = document.getElementById('faculty-search');
      const query = searchInput.value.trim();
      setFilters({...filters, searchQuery: query});
      setCurrentPage(1);
    }
  };

  // Collect filters from checkboxes
  const collectFilters = () => {
    const schoolCheckboxes = document.querySelectorAll('.school-filter:checked');
    const designationCheckboxes = document.querySelectorAll('.designation-filter:checked');
    
    setFilters({
      ...filters,
      schools: Array.from(schoolCheckboxes).map(checkbox => checkbox.value),
      designations: Array.from(designationCheckboxes).map(checkbox => checkbox.value)
    });
    
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Reset all filters
  const resetFilters = () => {
    document.querySelectorAll('.school-filter, .designation-filter')
      .forEach(checkbox => checkbox.checked = false);
    
    document.getElementById('faculty-search').value = '';
    
    setFilters({
      schools: [],
      designations: [],
      searchQuery: ''
    });
    
    setCurrentPage(1);
  };

  // Remove individual filter
  const removeFilter = (type, value) => {
    let newFilters = {...filters};
    
    switch(type) {
      case 'search':
        newFilters.searchQuery = '';
        document.getElementById('faculty-search').value = '';
        break;
      case 'school':
        newFilters.schools = filters.schools.filter(school => school !== value);
        const schoolCheckbox = document.querySelector(`.school-filter[value="${value}"]`);
        if (schoolCheckbox) schoolCheckbox.checked = false;
        break;
      case 'designation':
        newFilters.designations = filters.designations.filter(d => d !== value);
        const designationCheckbox = document.querySelector(`.designation-filter[value="${value}"]`);
        if (designationCheckbox) designationCheckbox.checked = false;
        break;
      default:
        console.warn(`Unknown filter type: ${type}`);
        break;
    }
    
    setFilters(newFilters);
  };

  // Sort faculty data
  const sortFacultyData = (data) => {
    const sortOption = document.getElementById('sort-faculty')?.value || 'name-asc';
    
    switch (sortOption) {
      case 'name-asc':
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        data.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'department':
        data.sort((a, b) => a.department.localeCompare(b.department));
        break;
      case 'designation':
        data.sort((a, b) => a.designation.localeCompare(b.designation));
        break;
      default:
        data.sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  // Handle sort change
  const handleSortChange = (e) => {
    sortFacultyData(filteredFacultyData);
    setFilteredFacultyData([...filteredFacultyData]);
  };

  // Show error message
  const showError = (message) => {
    // You can implement your own error handling logic here
    console.error(message);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredFacultyData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredFacultyData.length);
  const currentPageData = filteredFacultyData.slice(startIndex, endIndex);

  // Consolidate the repeated filter labels by creating a helper component
  const FilterLabel = ({ value, filterClass, label }) => (
    <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600">
      <input type="checkbox" value={value} className={`${filterClass} mr-2`} /> {label || value}
    </label>
  );

  return (
    <div className="text-gray-800 font-sans">
      <main className="w-full">
        <section className="hero-section relative min-h-[493px] py-14 bg-black overflow-hidden w-full">
          <div className="hero-overlay absolute inset-0 z-[1]"></div>
          <div className="std-container relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-10 md:gap-12">
              <div className="hero-text-area flex-1 min-w-[300px] max-w-[45%] flex flex-col justify-center items-start">
                <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-white relative mb-6">
                  FACULTY <span className="text-[#D32F2F]">DIRECTORY</span>
                </h1>
                <p className="text-white text-xl opacity-90 leading-relaxed mb-8 max-w-xl">
                  Connect with Mahindra University's distinguished faculty members across all schools and departments.
                </p>
                <div className="flex flex-wrap gap-5 self-start">
                  <a href="#faculty-grid" className="btn-hero primary">Explore Faculty</a>
                  <a href="#filters-container" 
                     className="btn-hero secondary" 
                     id="open-filters"
                     onClick={(e) => {
                       e.preventDefault();
                       setShowFilters(true);
                       document.getElementById('filters-container').scrollIntoView({behavior: 'smooth'});
                     }}
                  >Advanced Search</a>
                </div>
              </div>
              
              <div className="hero-stats-area w-full max-w-[520px] flex flex-col gap-5">
                {/* Stats cards using Tailwind instead of custom classes */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-black bg-opacity-30 rounded-2xl p-5 shadow-lg text-center border border-white border-opacity-10 backdrop-blur-md transition-all hover:-translate-y-[10px] hover:border-[#D32F2F] hover:bg-black hover:bg-opacity-40">
                    <div className="text-[#D32F2F] text-4xl mb-4">
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <div className="stat-value text-2xl md:text-3xl lg:text-4xl font-bold mb-2 font-['Montserrat']">
                      {allFacultyData.length > 0 ? allFacultyData.length : '150+'}
                    </div>
                    <div className="text-sm uppercase text-white text-opacity-70 tracking-wider">Faculty Members</div>
                  </div>
                  <div className="bg-black bg-opacity-30 rounded-2xl p-5 shadow-lg text-center border border-white border-opacity-10 backdrop-blur-md transition-all hover:-translate-y-[10px] hover:border-[#D32F2F] hover:bg-black hover:bg-opacity-40">
                    <div className="text-[#D32F2F] text-4xl mb-4">
                      <i className="fas fa-graduation-cap"></i>
                    </div>
                    <div className="stat-value text-2xl md:text-3xl lg:text-4xl font-bold mb-2 font-['Montserrat']">11</div>
                    <div className="text-sm uppercase text-white text-opacity-70 tracking-wider">Schools</div>
                  </div>
                </div>
                <div className="bg-black bg-opacity-30 rounded-2xl p-5 shadow-lg text-center border border-white border-opacity-10 backdrop-blur-md transition-all hover:-translate-y-[10px] hover:border-[#D32F2F] hover:bg-black hover:bg-opacity-40">
                  <div className="text-[#D32F2F] text-4xl mb-4">
                    <i className="fas fa-flask"></i>
                  </div>
                  <div className="stat-value text-2xl md:text-3xl lg:text-4xl font-bold mb-2 font-['Montserrat']">200+</div>
                  <div className="text-sm uppercase text-white text-opacity-70 tracking-wider">Research Projects</div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-shape shape-1 absolute w-[200px] h-[200px] top-[-50px] right-[10%] opacity-30 z-0"></div>
          <div className="hero-shape shape-2 absolute w-[300px] h-[300px] bottom-[-80px] left-[5%] opacity-20 z-0"></div>
        </section>
        
        {/* Search and filter section */}
        <section className="bg-gray-50 py-6 shadow-sm">
          <div className="std-container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-5">
              <div className="search-box w-full md:w-2/5 h-[50px] rounded-full bg-white shadow-md transition-all hover:shadow-lg relative overflow-hidden">
                <input 
                  type="text" 
                  id="faculty-search" 
                  placeholder="Search by name, research area, or expertise..."
                  className="w-full h-full px-6 border-none text-base text-gray-700 bg-transparent focus:outline-none"
                  onKeyUp={(e) => e.key === 'Enter' && handleSearch(e)}
                />
                <button 
                  id="search-button" 
                  title="Search"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-9 h-9 rounded-full bg-primary-red text-white flex items-center justify-center transition-colors hover:bg-red-700"
                  onClick={handleSearch}
                >
                  <i className="fas fa-search text-sm"></i>
                </button>
              </div>
              
              {isAdmin() && (
                <button 
                  onClick={handleAddFaculty}
                  className="h-[45px] px-5 rounded-full bg-white shadow-md font-semibold text-gray-700 flex items-center gap-2 cursor-pointer transition-all hover:shadow-lg hover:bg-blue-50 hover:-translate-y-1 w-full md:w-auto md:ml-[20%]"
                  aria-label="Add new faculty member"
                >
                  <i className="fas fa-plus-circle text-primary-red mr-2"></i>
                  <span>Add Faculty</span>
                </button>
              )}
              
              <button 
                className="h-[45px] px-5 rounded-full bg-white shadow-md font-semibold text-gray-700 flex items-center gap-2 cursor-pointer transition-all hover:shadow-lg hover:bg-blue-50 hover:-translate-y-1 w-full md:w-auto"
                id="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="fas fa-sliders-h text-primary-red mr-2"></i> Filters
              </button>
            </div>
            
            <div 
              className={`${showFilters ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} bg-gray-100 rounded-xl p-6 mb-5 overflow-hidden transition-all duration-500`} 
              id="filters-container"
              style={{display: showFilters ? 'block' : 'none'}}
            >
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">School</h3>
                <div className="flex flex-wrap gap-2.5">
                  <FilterLabel value="ECSE" filterClass="school-filter" />
                  <FilterLabel value="SOL" filterClass="school-filter" />
                  <FilterLabel value="SOM" filterClass="school-filter" />
                  <FilterLabel value="IMSOE" filterClass="school-filter" />
                  <FilterLabel value="SDMC" filterClass="school-filter" />
                  <FilterLabel value="SODI" filterClass="school-filter" />
                  <FilterLabel value="SOHM" filterClass="school-filter" />
                  <FilterLabel value="CEI" filterClass="school-filter" />
                  <FilterLabel value="CEE" filterClass="school-filter" />
                  <FilterLabel value="CLS" filterClass="school-filter" />
                  <FilterLabel value="CS" filterClass="school-filter" />
                </div>
              </div>
              
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Designation</h3>
                <div className="flex flex-wrap gap-2.5">
                  <FilterLabel value="Professor" filterClass="designation-filter" />
                  <FilterLabel value="Associate Professor" filterClass="designation-filter" />
                  <FilterLabel value="Assistant Professor" filterClass="designation-filter" />
                  <FilterLabel value="Lecturer" filterClass="designation-filter" />
                  <FilterLabel value="Adjunct Faculty" filterClass="designation-filter" />
                </div>
              </div>
              
              <div className="flex gap-3 mt-5">
                <button 
                  id="apply-filters" 
                  className="px-5 py-2.5 bg-primary-red text-white rounded-md font-medium hover:bg-red-700 transition-colors"
                  onClick={collectFilters}
                >Apply Filters</button>
                <button 
                  id="reset-filters" 
                  className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-md font-medium hover:bg-gray-100 transition-colors"
                  onClick={resetFilters}
                >Reset</button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-6 bg-slate-100">
          <div className="std-container">
            {/* Active filters area - redesigned for better UX */}
            <div className="flex flex-wrap gap-2.5 mb-5" id="active-filters">
              {(filters.searchQuery || filters.schools.length > 0 || filters.designations.length > 0) && (
                <div className="w-full flex flex-wrap items-center gap-2.5 bg-white p-3 rounded-lg shadow-sm mb-2">
                  <span className="text-sm font-medium text-gray-600 mr-1">Active filters:</span>
                  
                  {filters.searchQuery && (
                    <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all hover:bg-blue-100">
                      <i className="fas fa-search text-xs"></i>
                      <span>{filters.searchQuery}</span>
                      <button 
                        onClick={() => removeFilter('search')}
                        className="ml-1.5 w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center hover:bg-blue-300"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  )}
                  
                  {filters.schools.map((school, index) => (
                    <div 
                      className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all hover:bg-purple-100" 
                      key={`school-${index}`}
                    >
                      <i className="fas fa-university text-xs"></i>
                      <span>{school}</span>
                      <button 
                        onClick={() => removeFilter('school', school)}
                        className="ml-1.5 w-5 h-5 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center hover:bg-purple-300"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                  
                  {filters.designations.map((designation, index) => (
                    <div 
                      className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all hover:bg-green-100" 
                      key={`designation-${index}`}
                    >
                      <i className="fas fa-user-tie text-xs"></i>
                      <span>{designation}</span>
                      <button 
                        onClick={() => removeFilter('designation', designation)}
                        className="ml-1.5 w-5 h-5 rounded-full bg-green-200 text-green-800 flex items-center justify-center hover:bg-green-300"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={resetFilters}
                    className="ml-auto px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
                  >
                    <i className="fas fa-broom"></i> Clear all
                  </button>
                </div>
              )}
            </div>
            
            {/* Results count and sort options - enhanced UI */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6">
              <div className="bg-white py-2 px-4 rounded-lg shadow-sm text-gray-500 flex items-center">
                <span className="font-semibold text-primary-red">{filteredFacultyData.length}</span>
                <span className="ml-1.5">faculty members found</span>
                {isLoading && <div className="ml-3 w-4 h-4 border-2 border-primary-red border-t-transparent rounded-full animate-spin"></div>}
              </div>
              
              <div className="flex items-center bg-white py-2 px-4 rounded-lg shadow-sm">
                <label htmlFor="sort-faculty" className="text-gray-500 mr-3 whitespace-nowrap">Sort by:</label>
                <div className="relative">
                  <select 
                    id="sort-faculty" 
                    onChange={handleSortChange}
                    className="pl-3 pr-8 py-1.5 rounded border border-gray-200 bg-gray-50 text-gray-600 appearance-none focus:ring-2 focus:ring-primary-red/25 focus:outline-none"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="department">Department</option>
                    <option value="designation">Designation</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <i className="fas fa-chevron-down text-xs"></i>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Faculty grid - modernized card design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" id="faculty-grid">
              {isLoading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary-red border-t-transparent animate-spin"></div>
                  </div>
                  <p className="mt-6 text-gray-500 font-medium">Loading faculty profiles...</p>
                </div>
              ) : currentPageData.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                    <i className="fas fa-user-slash text-3xl text-gray-400"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-2.5 text-gray-700">No faculty members found</h3>
                  <p className="text-gray-500 max-w-md">We couldn't find any faculty members matching your criteria. Try adjusting your filters or search query.</p>
                  <button 
                    onClick={resetFilters}
                    className="mt-5 px-5 py-2 bg-primary-red text-white font-medium rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-sync-alt"></i> Reset filters
                  </button>
                </div>
              ) : (
                currentPageData.map((faculty, index) => (
                  <Link 
                    to={`/faculty-detail/${faculty._id}`}
                    key={faculty._id || index} 
                    className="group bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative faculty-card animate-fadeIn cursor-pointer"
                    style={{animationDelay: `${index * 50}ms`}}
                  >
                    {/* Department badge - styled by department */}
                    <div className="absolute top-2 right-2 z-10">
                      <span 
                        className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md shadow-sm"
                        style={{ 
                          color: faculty.department === 'ECSE' ? '#1e3a8a' : 
                                faculty.department === 'SOM' ? '#047857' : 
                                faculty.department === 'SOL' ? '#7e22ce' :
                                faculty.department === 'IMSOE' ? '#0369a1' :
                                '#be123c',
                          backgroundColor: faculty.department === 'ECSE' ? 'rgba(30, 58, 138, 0.08)' : 
                                        faculty.department === 'SOM' ? 'rgba(4, 120, 87, 0.08)' : 
                                        faculty.department === 'SOL' ? 'rgba(126, 34, 206, 0.08)' :
                                        faculty.department === 'IMSOE' ? 'rgba(3, 105, 161, 0.08)' :
                                        'rgba(190, 18, 60, 0.08)',
                          borderColor: faculty.department === 'ECSE' ? 'rgba(30, 58, 138, 0.2)' : 
                                      faculty.department === 'SOM' ? 'rgba(4, 120, 87, 0.2)' : 
                                      faculty.department === 'SOL' ? 'rgba(126, 34, 206, 0.2)' :
                                      faculty.department === 'IMSOE' ? 'rgba(3, 105, 161, 0.2)' :
                                      'rgba(190, 18, 60, 0.2)',
                          border: '1px solid'
                        }}
                      >
                        {faculty.department}
                      </span>
                    </div>
                    
                    {/* Enhanced Image Section with modern design */}
                    <div className="relative h-[250px] overflow-hidden faculty-image-container">
                      {/* Stylish overlay gradient with department color accent - Reduced opacity */}
                      <div 
                        className="absolute inset-0 z-[1] opacity-100 group-hover:opacity-80 transition-opacity duration-500"
                        style={{ 
                          background: `linear-gradient(180deg, 
                            rgba(0,0,0,0.01) 0%, 
                            rgba(0,0,0,0.35) 90%),
                            linear-gradient(120deg, 
                            ${faculty.department === 'ECSE' ? 'rgba(30, 58, 138, 0.10)' : 
                              faculty.department === 'SOM' ? 'rgba(4, 120, 87, 0.10)' : 
                              faculty.department === 'SOL' ? 'rgba(126, 34, 206, 0.10)' :
                              faculty.department === 'IMSOE' ? 'rgba(3, 105, 161, 0.10)' :
                              'rgba(190, 18, 60, 0.10)'} 0%, 
                            transparent 80%)`
                        }}
                      ></div>
                      
                      {/* Loading skeleton placeholder - Updated to disappear when image loads */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse skeleton-loader"
                        id={`skeleton-${faculty._id || index}`}
                      >
                        <div className="flex items-center justify-center h-full">
                          <svg className="w-12 h-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      </div>
                      
                      {/* Actual faculty image with enhanced transitions */}
                      <img 
                        src={faculty.image || "/img/default-faculty.png"}
                        alt={faculty.name}
                        className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 opacity-0"
                        onLoad={(e) => {
                          // Fade in image after loading
                          e.target.classList.remove('opacity-0');
                          e.target.classList.add('opacity-100');
                          
                          // Hide the loading skeleton
                          const skeletonId = `skeleton-${faculty._id || index}`;
                          const skeletonEl = document.getElementById(skeletonId);
                          if (skeletonEl) {
                            skeletonEl.style.opacity = '0';
                            setTimeout(() => {
                              skeletonEl.style.display = 'none';
                            }, 300);
                          }
                        }}
                        onError={(e) => {
                          // Show fallback image with department color
                          const deptColor = faculty.department === 'ECSE' ? '1e3a8a' : 
                                           faculty.department === 'SOM' ? '047857' : 
                                           faculty.department === 'SOL' ? '7e22ce' :
                                           faculty.department === 'IMSOE' ? '0369a1' : 'be123c';
                          
                          e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ccircle cx='50' cy='35' r='20' fill='%23${deptColor}' opacity='0.2'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23${deptColor}' opacity='0.4'/%3E%3Ccircle cx='50' cy='35' r='10' fill='%23${deptColor}' opacity='0.7'/%3E%3Crect x='25' y='65' width='50' height='25' rx='10' fill='%23${deptColor}' opacity='0.2'/%3E%3C/svg%3E`;
                          
                          // Hide loading state
                          e.target.classList.remove('opacity-0');
                          e.target.classList.add('opacity-100');
                          
                          // Hide the loading skeleton
                          const skeletonId = `skeleton-${faculty._id || index}`;
                          const skeletonEl = document.getElementById(skeletonId);
                          if (skeletonEl) {
                            skeletonEl.style.opacity = '0';
                            setTimeout(() => {
                              skeletonEl.style.display = 'none';
                            }, 300);
                          }
                        }}
                      />
                      
                      {/* Enhanced name overlay with subtle backdrop blur */}
                      <div className="absolute bottom-0 left-0 w-full p-3 z-[2] transform translate-y-0 transition-transform duration-500 group-hover:translate-y-0">
                        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-md p-1.5 inline-block">
                          <h3 className="text-white text-sm font-bold tracking-tight leading-tight">{faculty.name}</h3>
                        </div>
                      </div>
                      
                      {/* White divider line */}
                      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white opacity-20"></div>
                      
                      {/* Interactive overlay with hover reveal - With reduced opacity */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[3]">
                        {/* Empty div - no icon */}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex flex-col">
                        <h3 className="text-gray-800 font-semibold text-sm mb-1 line-clamp-2">{faculty.name}</h3>
                        <p className="text-primary-red font-semibold text-xs">{faculty.designation}</p>
                        <p className="text-gray-500 text-xs flex items-center mt-0.5 mb-2">
                          <i className="fas fa-university mr-1.5"></i> {faculty.department}
                        </p>
                        {faculty.overview && (
                          <p className="text-gray-600 text-xs mt-1 line-clamp-3">
                            {faculty.overview.replace(/<[^>]*>/g, '').substring(0, 100)}
                            {faculty.overview.replace(/<[^>]*>/g, '').length > 100 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Footer with actions */}
                    <div className="flex items-center justify-between p-3 border-t border-gray-100 bg-gray-50">
                      <div className="flex space-x-1.5">
                        {faculty.email && (
                          <a 
                            href={`mailto:${faculty.email}`} 
                            className="w-7 h-7 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-primary-red hover:text-white hover:-translate-y-1 transition-all shadow-sm hover:shadow-md hover:border-transparent"
                            title={`Email ${faculty.name}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <i className="fas fa-envelope text-xs"></i>
                          </a>
                        )}
                        {faculty.mobileNumber && (
                          <a 
                            href={`tel:${faculty.mobileNumber}`} 
                            className="w-7 h-7 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-primary-red hover:text-white hover:-translate-y-1 transition-all shadow-sm hover:shadow-md hover:border-transparent"
                            title={`Call ${faculty.name}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <i className="fas fa-phone-alt text-xs"></i>
                          </a>
                        )}
                      </div>
                      <span 
                        className="relative overflow-hidden px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 group-hover:bg-primary-red group-hover:text-white group-hover:border-primary-red transition-all duration-300 flex items-center gap-1.5"
                      >
                        <i className="fas fa-user-circle"></i> 
                        <span>View Profile</span>
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            {/* Pagination - Enhanced with modern design */}
            {!isLoading && totalPages > 1 && (
              <div className="flex flex-col items-center justify-center mt-8 mb-6">
                <div className="bg-white shadow-sm rounded-lg p-2 flex items-center">
                  <button 
                    className="h-8 px-2 rounded-l-md border border-gray-200 bg-white flex items-center justify-center transition-all hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    title="First page"
                  >
                    <i className="fas fa-angle-double-left text-gray-400"></i>
                  </button>
                  
                  <button 
                    className="h-8 px-3 border-t border-b border-gray-200 bg-white flex items-center justify-center gap-1 transition-all hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    <i className="fas fa-chevron-left text-xs"></i>
                    <span className="hidden sm:inline text-xs font-medium">Previous</span>
                  </button>
                  
                  <div className="hidden sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        const maxVisiblePages = 5;
                        const halfVisible = Math.floor(maxVisiblePages / 2);
                        return (
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - halfVisible && 
                          page <= currentPage + halfVisible)
                        );
                      })
                      .map((page, index, array) => {
                        if (index > 0 && array[index - 1] !== page - 1) {
                          return (
                            <React.Fragment key={`ellipsis-${page}`}>
                              <span className="h-8 w-8 flex items-center justify-center text-gray-400">...</span>
                              <button 
                                key={page} 
                                className={`h-8 w-8 flex items-center justify-center transition-all border-t border-b border-gray-200 ${
                                  currentPage === page 
                                    ? 'bg-primary-red text-white font-medium' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        }
                        return (
                          <button 
                            key={page} 
                            className={`h-8 w-8 flex items-center justify-center transition-all border-t border-b border-gray-200 ${
                              currentPage === page 
                                ? 'bg-primary-red text-white font-medium' 
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        );
                      })}
                  </div>
                  
                  {/* Mobile page indicator */}
                  <div className="flex sm:hidden h-8 px-3 border-t border-b border-gray-200 bg-white items-center">
                    <span className="text-xs font-medium">{currentPage} <span className="text-gray-400">of</span> {totalPages}</span>
                  </div>
                  
                  <button 
                    className="h-8 px-3 border-t border-b border-gray-200 bg-white flex items-center justify-center gap-1 transition-all hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    <span className="hidden sm:inline text-xs font-medium">Next</span>
                    <i className="fas fa-chevron-right text-xs"></i>
                  </button>
                  
                  <button 
                    className="h-8 px-2 rounded-r-md border border-gray-200 bg-white flex items-center justify-center transition-all hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    title="Last page"
                  >
                    <i className="fas fa-angle-double-right text-gray-400"></i>
                  </button>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Showing <span className="font-medium text-gray-700">{startIndex + 1}-{endIndex}</span> of <span className="font-medium text-gray-700">{filteredFacultyData.length}</span> faculty members
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Faculty;