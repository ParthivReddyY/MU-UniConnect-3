import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../../contexts/AuthContext';
import PresentationManagement from './PresentationManagement';

// Academic structure data
const academicStructure = {
  'École Centrale School of Engineering(ECSE)': {
    'Engineering': ['Computer Science', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering'],
  },
  'School Of Law(SOL)': {
    'Law': ['Constitutional Law', 'Corporate Law', 'Criminal Law', 'International Law'],
  },
  'School of Management(SOM)': {
    'Management': ['Finance', 'Marketing', 'Human Resources', 'Operations Management'],
  },
  'Indira Mahindra School of Education(IMSOE)': {
    'Education': ['Early Childhood Education', 'Educational Leadership', 'Special Education', 'Curriculum & Instruction'],
  },
  'School of Digital Media and Communication(SDMC)': {
    'Media': ['Journalism', 'Digital Media', 'Film Studies', 'Communication Studies'],
  },
  'School of Design Innovation(SODI)': {
    'Design': ['Graphic Design', 'Product Design', 'UI/UX Design', 'Fashion Design'],
  },
  'School of Hospitality Management(SOHM)': {
    'Hospitality': ['Hotel Management', 'Event Management', 'Tourism Management', 'Food & Beverage Management'],
  }
};

const HostPresentation = () => {
  const navigate = useNavigate();
  const { currentUser, isFaculty, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('presentations');
  const [isSaving, setIsSaving] = useState(false);
  const [targetAudienceSettings, setTargetAudienceSettings] = useState({
    year: [],
    school: [],
    department: []
  });

  // Check if the user is faculty or admin
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/college/bookings/host-presentation' } });
      return;
    }

    // Only faculty and admin can host presentations
    if (!isFaculty() && !isAdmin()) {
      toast.error("You don't have permission to host presentations");
      navigate('/college/bookings');
      return;
    }

    // Load saved target audience settings if available
    loadTargetAudienceSettings();
    
    setLoading(false);
  }, [currentUser, isFaculty, isAdmin, navigate]);

  // Load target audience settings from localStorage or API
  const loadTargetAudienceSettings = () => {
    try {
      const savedSettings = localStorage.getItem('presentation_target_audience_settings');
      if (savedSettings) {
        setTargetAudienceSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading target audience settings:', error);
    }
  };

  // Save target audience settings
  const saveTargetAudienceSettings = async (settings) => {
    setIsSaving(true);
    try {
      // Save to localStorage for persistence
      localStorage.setItem('presentation_target_audience_settings', JSON.stringify(settings));
      
      // Update state
      setTargetAudienceSettings(settings);
      
      toast.success('Target audience settings saved successfully');
    } catch (error) {
      console.error('Error saving target audience settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center mb-2">
              <Link 
                to="/college/bookings"
                className="mr-3 bg-white rounded-md p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <i className="fas fa-arrow-left"></i>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Host Presentations</h1>
            </div>
            <p className="text-gray-600">Create and manage presentation events for students</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-4 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'presentations'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('presentations')}
              >
                Presentation Events
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'presentations' && <PresentationManagement />}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
              <i className="fas fa-chart-bar text-indigo-500 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-gray-500 mb-6">
              Track participation, grades, and other metrics for your presentation events.
            </p>
            <p className="text-gray-400 italic">Coming soon</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <TargetAudienceSettings 
            settings={targetAudienceSettings} 
            onSave={saveTargetAudienceSettings} 
            isSaving={isSaving} 
          />
        )}
      </div>
    </div>
  );
};

// TargetAudienceSettings Component
const TargetAudienceSettings = ({ settings, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    year: [...settings.year],
    school: [...settings.school],
    department: [...settings.department]
  });
  
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const departmentDropdownRef = React.useRef(null);
  
  // School and academic data - structured for consistent reuse
  const schoolOptions = [
    { value: 'École Centrale School of Engineering(ECSE)', label: 'École Centrale School of Engineering' },
    { value: 'School Of Law(SOL)', label: 'School of Law' },
    { value: 'School of Management(SOM)', label: 'School of Management' },
    { value: 'Indira Mahindra School of Education(IMSOE)', label: 'Indira Mahindra School of Education' },
    { value: 'School of Digital Media and Communication(SDMC)', label: 'School of Digital Media & Communication' },
    { value: 'School of Design Innovation(SODI)', label: 'School of Design Innovation' },
    { value: 'School of Hospitality Management(SOHM)', label: 'School of Hospitality Management' }
  ];
  
  const yearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
    { value: '5', label: '5th Year' }
  ];
  
  // Format departments from academicStructure
  const formatDepartments = (school) => {
    if (!school || !academicStructure[school]) return [];
    
    const departments = [];
    
    Object.values(academicStructure[school]).forEach(depts => {
      depts.forEach(dept => {
        if (!departments.some(d => d.value === dept)) {
          departments.push({ value: dept, label: dept });
        }
      });
    });
    
    return departments;
  };
  
  // Map academicStructure to the format expected 
  const academicData = Object.keys(academicStructure).reduce((acc, school) => {
    acc[school] = formatDepartments(school);
    return acc;
  }, {});

  // Handle clicks outside department dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [departmentDropdownRef]);
  
  const handleCheckboxChange = (field, value, checked) => {
    setFormData(prev => {
      let updatedValues = [...prev[field]];
      
      if (checked) {
        updatedValues.push(value);
      } else {
        updatedValues = updatedValues.filter(item => item !== value);
      }
      
      return {
        ...prev,
        [field]: updatedValues
      };
    });
  };
  
  // Get available departments based on selected schools
  const getAvailableDepartments = () => {
    if (formData.school.length === 0) {
      return [];
    }
    
    let availableDepts = [];
    formData.school.forEach(school => {
      const depts = academicData[school] || [];
      availableDepts = [...availableDepts, ...depts];
    });
    
    return availableDepts;
  };
  
  const handleAddDepartment = (value) => {
    // Check if department's school is selected
    const deptSchool = Object.entries(academicData).find(([school, depts]) => 
      depts.some(dept => dept.value === value)
    )?.[0];
    
    if (deptSchool && !formData.school.includes(deptSchool)) {
      setFormData(prev => ({
        ...prev,
        school: [...prev.school, deptSchool]
      }));
    }
    
    if (!formData.department.includes(value)) {
      setFormData(prev => ({
        ...prev,
        department: [...prev.department, value]
      }));
    }
    
    // Close dropdown after selection
    setShowDepartmentDropdown(false);
  };
  
  const handleRemoveDepartment = (value) => {
    setFormData(prev => ({
      ...prev,
      department: prev.department.filter(dept => dept !== value)
    }));
  };
  
  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 text-left">Target Audience Settings</h3>
        
        <div className="space-y-8 text-left">
          {/* Academic Year Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {yearOptions.map(option => (
                <div 
                  key={option.value}
                  className={`
                    relative flex items-center p-3 border rounded-md cursor-pointer
                    ${formData.year.includes(option.value) 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-300 hover:bg-gray-50'}
                  `}
                  onClick={() => handleCheckboxChange('year', option.value, !formData.year.includes(option.value))}
                >
                  <input 
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={formData.year.includes(option.value)}
                    onChange={(e) => handleCheckboxChange('year', option.value, e.target.checked)}
                  />
                  <span className="ml-2 text-sm">{option.label}</span>
                  {formData.year.includes(option.value) && (
                    <span className="absolute top-1 right-1 text-blue-500">
                      <i className="fas fa-check-circle text-xs"></i>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* School Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {schoolOptions.map(option => (
                <div 
                  key={option.value}
                  className={`
                    relative flex items-center p-3 border rounded-md cursor-pointer
                    ${formData.school.includes(option.value) 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-300 hover:bg-gray-50'}
                  `}
                  onClick={() => handleCheckboxChange('school', option.value, !formData.school.includes(option.value))}
                >
                  <input 
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={formData.school.includes(option.value)}
                    onChange={(e) => handleCheckboxChange('school', option.value, e.target.checked)}
                  />
                  <span className="ml-2 text-sm">{option.label}</span>
                  {formData.school.includes(option.value) && (
                    <span className="absolute top-1 right-1 text-blue-500">
                      <i className="fas fa-check-circle text-xs"></i>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Department Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
            {formData.school.length > 0 ? (
              <div className="space-y-3">
                {formData.department.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.department.map(deptValue => {
                      const deptObj = getAvailableDepartments().find(d => d.value === deptValue);
                      return (
                        <div 
                          key={deptValue}
                          className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{deptObj ? deptObj.label : deptValue}</span>
                          <button 
                            type="button"
                            className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                            onClick={() => handleRemoveDepartment(deptValue)}
                          >
                            <i className="fas fa-times-circle"></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="relative" ref={departmentDropdownRef}>
                  <input
                    type="text"
                    value={departmentSearchQuery}
                    onChange={(e) => setDepartmentSearchQuery(e.target.value)}
                    onFocus={() => setShowDepartmentDropdown(true)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search and select departments"
                  />
                  
                  {showDepartmentDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {getAvailableDepartments().filter(dept => 
                        dept.label.toLowerCase().includes(departmentSearchQuery.toLowerCase())
                      ).map(dept => (
                        <div 
                          key={dept.value}
                          className={`
                            p-2 cursor-pointer hover:bg-blue-50 flex items-center justify-between
                            ${formData.department.includes(dept.value) ? 'bg-blue-50' : ''}
                          `}
                          onClick={() => handleAddDepartment(dept.value)}
                        >
                          <span className="text-sm">{dept.label}</span>
                          {formData.department.includes(dept.value) && (
                            <i className="fas fa-check text-blue-500"></i>
                          )}
                        </div>
                      ))}
                      {getAvailableDepartments().filter(dept => 
                        dept.label.toLowerCase().includes(departmentSearchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="p-2 text-gray-500 text-sm">No departments found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                <i className="fas fa-exclamation-circle mr-2"></i>
                Please select at least one school to view available departments
              </div>
            )}
          </div>
          
          {/* Save button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                <>Save Default Settings</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostPresentation;
