import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/faculty.css'; // Now contains only custom animations and effects
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';  

const Faculty = () => {
  // State variables
  const [allFacultyData, setAllFacultyData] = useState([]);
  const [filteredFacultyData, setFilteredFacultyData] = useState([]);
  const [uniqueResearchAreas, setUniqueResearchAreas] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    schools: [],
    designations: [],
    researchAreas: [],
    searchQuery: ''
  });
  
  // Auth context for role-based controls
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const pageSize = 12;

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
        
        // Extract unique research areas
        const areas = new Set();
        data.forEach(faculty => {
          if (faculty.research) {
            faculty.research
              .split(/[,;\n]/)
              .map(area => area.trim())
              .filter(area => area.length > 0)
              .forEach(area => areas.add(area));
          }
        });
        setUniqueResearchAreas(areas);
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
    
    // Apply research area filters
    if (filters.researchAreas.length > 0) {
      filtered = filtered.filter(faculty => 
        filters.researchAreas.some(area => 
          faculty.research && faculty.research.includes(area)
        )
      );
    }
    
    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(faculty => {
        const nameMatch = faculty.name && faculty.name.toLowerCase().includes(query);
        const departmentMatch = faculty.department && faculty.department.toLowerCase().includes(query);
        const designationMatch = faculty.designation && faculty.designation.toLowerCase().includes(query);
        const researchMatch = faculty.research && faculty.research.toLowerCase().includes(query);
        const overviewMatch = faculty.overview && faculty.overview.toLowerCase().includes(query);
        
        return nameMatch || departmentMatch || designationMatch || researchMatch || overviewMatch;
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
    const researchCheckboxes = document.querySelectorAll('.research-filter:checked');
    
    setFilters({
      ...filters,
      schools: Array.from(schoolCheckboxes).map(checkbox => checkbox.value),
      designations: Array.from(designationCheckboxes).map(checkbox => checkbox.value),
      researchAreas: Array.from(researchCheckboxes).map(checkbox => checkbox.value)
    });
    
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Reset all filters
  const resetFilters = () => {
    document.querySelectorAll('.school-filter, .designation-filter, .research-filter')
      .forEach(checkbox => checkbox.checked = false);
    
    document.getElementById('faculty-search').value = '';
    
    setFilters({
      schools: [],
      designations: [],
      researchAreas: [],
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
      case 'research':
        newFilters.researchAreas = filters.researchAreas.filter(area => area !== value);
        const researchCheckbox = document.querySelector(`.research-filter[value="${value}"]`);
        if (researchCheckbox) researchCheckbox.checked = false;
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

  return (
    <div className="text-gray-800 font-sans">
      <main className="w-full">
        <section className="hero-section relative min-h-[620px] py-20 bg-black overflow-hidden w-full">
          <div className="hero-overlay absolute inset-0 z-[1]"></div>
          <div className="container w-full max-w-7xl mx-auto px-5 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-12 md:gap-15">
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
        <section className="bg-gray-50 py-8 shadow-sm">
          <div className="container max-w-7xl mx-auto px-5">
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
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="ECSE" className="school-filter mr-2" /> ECSE</label>
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="SOL" className="school-filter mr-2" /> SOL</label>
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="SOM" className="school-filter mr-2" /> SOM</label>
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="IMSOE" className="school-filter mr-2" /> IMSOE</label>
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="SDMC" className="school-filter mr-2" /> SDMC</label>
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="SODI" className="school-filter mr-2" /> SODI</label>
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="SOHM" className="school-filter mr-2" /> SOHM</label>
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="CEI" className="school-filter mr-2" /> CEI</label>
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="CEE" className="school-filter mr-2" /> CEE</label>
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="CLS" className="school-filter mr-2" /> CLS</label>
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="CS" className="school-filter mr-2" /> CS</label>
                </div>
              </div>
              
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Designation</h3>
                <div className="flex flex-wrap gap-2.5">
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="Professor" className="designation-filter mr-2" /> Professor</label>
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="Associate Professor" className="designation-filter mr-2" /> Associate Professor</label>
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="Assistant Professor" className="designation-filter mr-2" /> Assistant Professor</label>
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="Lecturer" className="designation-filter mr-2" /> Lecturer</label>
                  <label className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value="Adjunct Faculty" className="designation-filter mr-2" /> Adjunct Faculty</label>
                </div>
              </div>
              
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Research Areas</h3>
                <div className="flex flex-wrap gap-2.5">
                  {Array.from(uniqueResearchAreas).sort().map((area, index) => (
                    <label key={index} className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors text-gray-600"><input type="checkbox" value={area} className="research-filter mr-2" /> {area}</label>
                  ))}
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

        <section className="py-10 bg-slate-100">
          <div className="container max-w-7xl mx-auto px-5">
            {/* Active filters area */}
            <div className="flex flex-wrap gap-2.5 mb-5" id="active-filters">
              {filters.searchQuery && (
                <div className="bg-red-50 bg-opacity-10 text-primary-red px-3 py-1.5 rounded-full text-sm flex items-center">
                  <span>Search: {filters.searchQuery}</span>
                  <i className="fas fa-times ml-2 cursor-pointer" onClick={() => removeFilter('search')}></i>
                </div>
              )}
              
              {filters.schools.map((school, index) => (
                <div className="bg-red-50 bg-opacity-10 text-primary-red px-3 py-1.5 rounded-full text-sm flex items-center" key={`school-${index}`}>
                  <span>School: {school}</span>
                  <i className="fas fa-times ml-2 cursor-pointer" onClick={() => removeFilter('school', school)}></i>
                </div>
              ))}
              
              {filters.designations.map((designation, index) => (
                <div className="bg-red-50 bg-opacity-10 text-primary-red px-3 py-1.5 rounded-full text-sm flex items-center" key={`designation-${index}`}>
                  <span>Designation: {designation}</span>
                  <i className="fas fa-times ml-2 cursor-pointer" onClick={() => removeFilter('designation', designation)}></i>
                </div>
              ))}
              
              {filters.researchAreas.map((area, index) => (
                <div className="bg-red-50 bg-opacity-10 text-primary-red px-3 py-1.5 rounded-full text-sm flex items-center" key={`area-${index}`}>
                  <span>Research: {area}</span>
                  <i className="fas fa-times ml-2 cursor-pointer" onClick={() => removeFilter('research', area)}></i>
                </div>
              ))}
            </div>
            
            {/* Results count and sort options */}
            <div className="flex items-center justify-between gap-2.5 mb-4">
              <div className="text-gray-500">
                <span className="font-semibold text-primary-red">{filteredFacultyData.length}</span> faculty members found
              </div>
              
              <div className="flex items-center">
                <label htmlFor="sort-faculty" className="text-gray-500 mr-2">Sort by:</label>
                <select 
                  id="sort-faculty" 
                  onChange={handleSortChange}
                  className="px-3 py-2 rounded border border-gray-300 bg-gray-50 text-gray-500"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="department">Department</option>
                  <option value="designation">Designation</option>
                </select>
              </div>
            </div>
            
            {/* Faculty grid - converted to use Tailwind where possible */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="faculty-grid">
              {isLoading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-10">
                  <div className="w-[50px] h-[50px] border-4 border-[rgba(195,55,55,0.1)] border-l-[#c33737] rounded-full animate-spin mb-4"></div>
                  <p className="mt-4 text-gray-500">Loading faculty profiles...</p>
                </div>
              ) : currentPageData.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500">
                  <i className="fas fa-search text-5xl text-[#D32F2F] opacity-50 mb-4"></i>
                  <h3 className="text-xl mb-2.5">No faculty members found</h3>
                  <p>Try adjusting your filters or search query</p>
                </div>
              ) : (
                currentPageData.map((faculty, index) => (
                  <div 
                    key={index} 
                    className="relative overflow-hidden bg-gray-100 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
                  >
                    {/* Department indicator */}
                    <div className="absolute top-3 right-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-white bg-opacity-85 shadow-sm z-10 backdrop-blur-sm" 
                      style={{ 
                        color: faculty.department === 'ECSE' ? '#1e3a8a' : 
                              faculty.department === 'SOM' ? '#047857' : 
                              faculty.department === 'SOL' ? '#7e22ce' :
                              faculty.department === 'IMSOE' ? '#0369a1' :
                              '#be123c'
                      }}>
                      {faculty.department}
                    </div>
                    
                    {/* Image header */}
                    <div className="relative h-[180px] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-[1]"></div>
                      <img 
                        src={faculty.image || "/img/default-faculty.png"}
                        alt={faculty.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23c0c0c0'/%3E%3Cpath d='M30,80 Q50,60 70,80' fill='%23c0c0c0'/%3E%3C/svg%3E`;
                        }}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-1 font-['Montserrat']">{faculty.name}</h3>
                      <p className="text-[#D32F2F] font-semibold text-sm mb-1">{faculty.designation}</p>
                      <p className="text-gray-500 text-xs flex items-center mb-3">
                        <i className="fas fa-university mr-1.5 opacity-70"></i> {faculty.department}
                      </p>
                      
                      {/* Research interests */}
                      {faculty.research && (
                        <div className="text-xs text-gray-600 italic border-t border-gray-100 pt-3 mt-2 line-clamp-2">
                          <i className="fas fa-flask mr-1.5"></i> {faculty.research.substring(0, 80)}...
                        </div>
                      )}
                    </div>
                    
                    {/* Footer with actions */}
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                      <div className="flex space-x-3">
                        {faculty.email && (
                          <a 
                            href={`mailto:${faculty.email}`} 
                            className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-[#D32F2F] hover:text-white hover:-translate-y-1 transition-all shadow-sm hover:shadow-md"
                            title={`Email ${faculty.name}`}
                          >
                            <i className="fas fa-envelope"></i>
                          </a>
                        )}
                        {faculty.mobileNumber && (
                          <a 
                            href={`tel:${faculty.mobileNumber}`} 
                            className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-[#D32F2F] hover:text-white hover:-translate-y-1 transition-all shadow-sm hover:shadow-md"
                            title={`Call ${faculty.name}`}
                          >
                            <i className="fas fa-phone"></i>
                          </a>
                        )}
                      </div>
                      <Link 
                        to={`/faculty-detail/${faculty._id}`} 
                        className="px-4 py-2 rounded-full text-sm font-medium bg-[#D32F2F]/10 text-[#D32F2F] border border-[#D32F2F]/20 hover:bg-[#D32F2F] hover:text-white hover:shadow-md transition-all"
                      >
                        <i className="fas fa-user-circle mr-1.5"></i> View Profile
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 my-8" id="faculty-pagination">
                <button 
                  className="min-w-[40px] h-10 rounded border border-gray-300 bg-white flex items-center justify-center px-4 transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <i className="fas fa-chevron-left mr-1"></i> Prev
                </button>
                
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
                          <span className="mx-1">...</span>
                          <button 
                            key={page} 
                            className={`min-w-[40px] h-10 rounded border flex items-center justify-center transition-all ${
                              currentPage === page 
                                ? 'bg-primary-red text-white border-primary-red' 
                                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
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
                        className={`min-w-[40px] h-10 rounded border flex items-center justify-center transition-all ${
                          currentPage === page 
                            ? 'bg-primary-red text-white border-primary-red' 
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                
                <button 
                  className="min-w-[40px] h-10 rounded border border-gray-300 bg-white flex items-center justify-center px-4 transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next <i className="fas fa-chevron-right ml-1"></i>
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Faculty;