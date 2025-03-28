import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../CSS/faculty.css'; // Keep importing the CSS for custom animations and complex styles
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';  // Using our configured axios instance

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
    <div className="faculty-page">
      <main className="main-content">
        <section className="hero-section">
          <div className="hero-overlay"></div>
          <div className="container">
            <div className="hero-content">
              <div className="hero-text-area">
                <h1 className="hero-title">FACULTY <span className="accent">DIRECTORY</span></h1>
                <p className="hero-description">Connect with Mahindra University's distinguished faculty members across all schools and departments.</p>
                <div className="hero-actions">
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
                  {/* Remove the Add Faculty button from here */}
                </div>
              </div>
              <div className="hero-stats-area">
                <div className="stat-card" aria-label="Faculty Statistics">
                  <div className="stat-icon"><i className="fas fa-user-tie"></i></div>
                  <div className="stat-value" id="total-faculty-count">
                    {allFacultyData.length > 0 ? allFacultyData.length : '150+'}
                  </div>
                  <div className="stat-label">Faculty Members</div>
                </div>
                <div className="stat-card" aria-label="Schools Statistics">
                  <div className="stat-icon"><i className="fas fa-graduation-cap"></i></div>
                  <div className="stat-value">11</div>
                  <div className="stat-label">Schools</div>
                </div>
                <div className="stat-card" aria-label="Research Projects Statistics">
                  <div className="stat-icon"><i className="fas fa-flask"></i></div>
                  <div className="stat-value">200+</div>
                  <div className="stat-label">Research Projects</div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
        </section>
        
        <section className="bg-off-white py-8 shadow-light">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-5">
              <div className="search-box w-full md:w-2/5">
                <input 
                  type="text" 
                  id="faculty-search" 
                  placeholder="Search by name, research area, or expertise..."
                  className="w-full h-full border-none text-base text-dark-gray bg-transparent"
                  onKeyUp={(e) => e.key === 'Enter' && handleSearch(e)}
                />
                <button 
                  id="search-button" 
                  title="Search"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-9 h-9 rounded-full bg-primary-red text-white flex items-center justify-center transition-colors hover:bg-secondary-red"
                  onClick={handleSearch}
                >
                  <i className="fas fa-search text-sm"></i>
                </button>
              </div>
              
              {/* Add Faculty button positioned between search and filters */}
              {isAdmin() && (
                <button 
                  onClick={handleAddFaculty}
                  className="filter-toggle w-full md:w-auto md:ml-[20%]"
                  aria-label="Add new faculty member"
                >
                  <i className="fas fa-plus-circle text-primary-red mr-2"></i>
                  <span>Add Faculty</span>
                </button>
              )}
              
              <button 
                className="filter-toggle w-full md:w-auto"
                id="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="fas fa-sliders-h text-primary-red mr-2"></i> Filters
              </button>
            </div>
            
            <div 
              className={`filters-container ${showFilters ? 'active' : ''}`} 
              id="filters-container"
              style={{display: showFilters ? 'block' : 'none'}}
            >
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-3 text-dark-gray">School</h3>
                <div className="filter-options school-filters">
                  <label className="cursor-pointer"><input type="checkbox" value="ECSE" className="school-filter mr-2" /> ECSE</label>
                  <label className="cursor-pointer"><input type="checkbox" value="SOL" className="school-filter mr-2" /> SOL</label>
                  <label className="cursor-pointer"><input type="checkbox" value="SOM" className="school-filter mr-2" /> SOM</label>
                  <label className="cursor-pointer"><input type="checkbox" value="IMSOE" className="school-filter mr-2" /> IMSOE</label>
                  <label className="cursor-pointer"><input type="checkbox" value="SDMC" className="school-filter mr-2" /> SDMC</label>
                  <label className="cursor-pointer"><input type="checkbox" value="SODI" className="school-filter mr-2" /> SODI</label>
                  <label className="cursor-pointer"><input type="checkbox" value="SOHM" className="school-filter mr-2" /> SOHM</label>
                  <label className="cursor-pointer"><input type="checkbox" value="CEI" className="school-filter mr-2" /> CEI</label>
                  <label className="cursor-pointer"><input type="checkbox" value="CEE" className="school-filter mr-2" /> CEE</label>
                  <label className="cursor-pointer"><input type="checkbox" value="CLS" className="school-filter mr-2" /> CLS</label>
                  <label className="cursor-pointer"><input type="checkbox" value="CS" className="school-filter mr-2" /> CS</label>
                </div>
              </div>
              
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-3 text-dark-gray">Designation</h3>
                <div className="filter-options">
                  <label className="cursor-pointer"><input type="checkbox" value="Professor" className="designation-filter mr-2" /> Professor</label>
                  <label className="cursor-pointer"><input type="checkbox" value="Associate Professor" className="designation-filter mr-2" /> Associate Professor</label>
                  <label className="cursor-pointer"><input type="checkbox" value="Assistant Professor" className="designation-filter mr-2" /> Assistant Professor</label>
                  <label className="cursor-pointer"><input type="checkbox" value="Lecturer" className="designation-filter mr-2" /> Lecturer</label>
                  <label className="cursor-pointer"><input type="checkbox" value="Adjunct Faculty" className="designation-filter mr-2" /> Adjunct Faculty</label>
                </div>
              </div>
              
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-3 text-dark-gray">Research Areas</h3>
                <div className="filter-options research-filters">
                  {Array.from(uniqueResearchAreas).sort().map((area, index) => (
                    <label key={index} className="cursor-pointer"><input type="checkbox" value={area} className="research-filter mr-2" /> {area}</label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 mt-5">
                <button 
                  id="apply-filters" 
                  className="btn-primary"
                  onClick={collectFilters}
                >Apply Filters</button>
                <button 
                  id="reset-filters" 
                  className="btn-secondary"
                  onClick={resetFilters}
                >Reset</button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container">
            <div className="flex flex-wrap gap-2.5 mb-5" id="active-filters">
              {filters.searchQuery && (
                <div className="filter-tag bg-opacity-10 bg-primary-red text-primary-red px-3 py-1.5 rounded-full text-sm flex items-center">
                  <span>Search: {filters.searchQuery}</span>
                  <i className="fas fa-times ml-2 cursor-pointer" onClick={() => removeFilter('search')}></i>
                </div>
              )}
              
              {filters.schools.map((school, index) => (
                <div className="filter-tag bg-opacity-10 bg-primary-red text-primary-red px-3 py-1.5 rounded-full text-sm flex items-center" key={`school-${index}`}>
                  <span>School: {school}</span>
                  <i className="fas fa-times ml-2 cursor-pointer" onClick={() => removeFilter('school', school)}></i>
                </div>
              ))}
              
              {filters.designations.map((designation, index) => (
                <div className="filter-tag bg-opacity-10 bg-primary-red text-primary-red px-3 py-1.5 rounded-full text-sm flex items-center" key={`designation-${index}`}>
                  <span>Designation: {designation}</span>
                  <i className="fas fa-times ml-2 cursor-pointer" onClick={() => removeFilter('designation', designation)}></i>
                </div>
              ))}
              
              {filters.researchAreas.map((area, index) => (
                <div className="filter-tag bg-opacity-10 bg-primary-red text-primary-red px-3 py-1.5 rounded-full text-sm flex items-center" key={`area-${index}`}>
                  <span>Research: {area}</span>
                  <i className="fas fa-times ml-2 cursor-pointer" onClick={() => removeFilter('research', area)}></i>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between gap-2.5 mb-4">
              {/* Add faculty count on the left */}
              <div id="faculty-count" className="text-medium-gray">
                <span className="font-semibold text-primary-red">{filteredFacultyData.length}</span> faculty members found
              </div>
              
              {/* Only show sort controls - remove the Add Faculty button from here */}
              <div className="flex items-center">
                <label htmlFor="sort-faculty" className="text-medium-gray mr-2">Sort by:</label>
                <select 
                  id="sort-faculty" 
                  onChange={handleSortChange}
                  className="px-3 py-2 rounded border border-light-gray bg-off-white text-medium-gray"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="department">Department</option>
                  <option value="designation">Designation</option>
                </select>
              </div>
            </div>
            
            <div className="faculty-grid" id="faculty-grid">
              {isLoading ? (
                <div className="loader col-span-full flex flex-col items-center justify-center py-10">
                  <div className="spinner"></div>
                  <p className="mt-4 text-medium-gray">Loading faculty profiles...</p>
                </div>
              ) : currentPageData.length === 0 ? (
                <div className="no-results flex flex-col items-center justify-center py-10 col-span-full text-medium-gray">
                  <i className="fas fa-search text-5xl text-primary-red opacity-50 mb-4"></i>
                  <h3 className="text-xl mb-2.5">No faculty members found</h3>
                  <p>Try adjusting your filters or search query</p>
                </div>
              ) : (
                currentPageData.map((faculty, index) => (
                  <div className="faculty-card bg-white rounded-lg overflow-hidden shadow-light transition-all hover:translate-y-[-5px] hover:shadow-medium" key={index}>
                    <div className="faculty-image h-50 overflow-hidden">
                      <img 
                        src={faculty.image || "../img/default-faculty.png"}
                        alt={faculty.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {e.target.src = "../img/default-faculty.png"}}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-1 text-dark-gray">{faculty.name}</h3>
                      <p className="text-sm text-primary-red mb-1">{faculty.designation}</p>
                      <p className="text-xs text-medium-gray mb-2.5">{faculty.department}</p>
                      <div className="flex items-center justify-between mt-2.5">
                        {faculty.email ? (
                          <a href={`mailto:${faculty.email}`} className="text-lg text-medium-gray transition-colors hover:text-primary-red" title={`Email ${faculty.name}`}>
                            <i className="fas fa-envelope"></i>
                          </a>
                        ) : <span></span>}
                        <Link 
                          to={`/faculty-detail/${faculty._id}`} 
                          className="bg-red-light bg-opacity-100 text-primary-red px-3 py-1.5 rounded text-sm font-medium hover:bg-opacity-20 transition-colors"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 my-8" id="faculty-pagination">
                <button 
                  className="min-w-[40px] h-10 rounded border border-light-gray bg-white flex items-center justify-center px-4 transition-all hover:bg-light-gray disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <i className="fas fa-chevron-left mr-1"></i> Prev
                </button>
                
                {/* Calculate visible page buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, and pages around current page
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
                    // Add ellipsis when there are gaps
                    if (index > 0 && array[index - 1] !== page - 1) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <span className="mx-1">...</span>
                          <button 
                            key={page} 
                            className={`min-w-[40px] h-10 rounded border flex items-center justify-center transition-all ${
                              currentPage === page 
                                ? 'bg-primary-red text-white border-primary-red' 
                                : 'bg-white text-dark-gray border-light-gray hover:bg-light-gray'
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
                            : 'bg-white text-dark-gray border-light-gray hover:bg-light-gray'
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                
                <button 
                  className="min-w-[40px] h-10 rounded border border-light-gray bg-white flex items-center justify-center px-4 transition-all hover:bg-light-gray disabled:opacity-50 disabled:cursor-not-allowed"
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