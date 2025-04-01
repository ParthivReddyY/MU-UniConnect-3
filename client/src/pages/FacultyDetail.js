import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';
import FacultyView from '../components/FacultyView';
import ImageUploader from '../components/ImageUploader';
import RichTextEditor from '../components/RichTextEditor';

const FacultyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAdmin, deleteFaculty } = useAuth();
  const isNewFaculty = id === 'new';
  
  // State variables
  const [faculty, setFaculty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(isNewFaculty);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [imageData, setImageData] = useState(null);
  // Add delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form handling
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm();
  
  // Projects field array
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: "projects"
  });
  
  // Email field array
  const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({
    control,
    name: "emails"
  });

  // Check if user has edit permissions
  const hasEditPermission = () => {
    if (isAdmin()) return true;
    if (!currentUser || !faculty) return false;
    return currentUser.email === faculty.email;
  };

  // Handle image change from ImageUploader component
  const handleImageChange = (data) => {
    setImageData(data);
  };

  // Fetch faculty data
  useEffect(() => {
    const fetchFacultyData = async () => {
      if (isNewFaculty) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await api.get(`/api/faculty/${id}`);
        setFaculty(response.data);
        
        // Set form values
        reset({
          name: response.data.name,
          designation: response.data.designation,
          school: response.data.department,
          cabinLocation: response.data.cabinLocation || '',
          freeTimings: response.data.freeTimings || '',
          overview: response.data.overview || '',
          mobileNumber: response.data.mobileNumber || '',
          emails: response.data.emails?.length ? 
            response.data.emails.map(email => ({ value: email })) : 
            [{ value: response.data.email || '' }],
          education: response.data.education || '',
          workExperience: response.data.workExperience || '',
          publications: response.data.publications || '',
          research: response.data.research || '',
          projects: response.data.projects?.length ? 
            response.data.projects : []
        });
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        setError('Failed to load faculty details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFacultyData();
  }, [id, isNewFaculty, reset]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Check if emails array exists and has at least one non-empty email
      if (!data.emails || data.emails.length === 0 || !data.emails[0].value.trim()) {
        setError('At least one email address is required');
        return;
      }
      
      // Format data for API
      const formattedData = {
        ...data,
        emails: data.emails.map(email => email.value.trim()).filter(email => email), // Filter out empty emails
        department: data.school
      };
      
      // Handle image data
      if (imageData) {
        if (imageData.type === 'url' && imageData.url) {
          formattedData.image = imageData.url;
        } else if (imageData.type === 'file' && imageData.dataUrl) {
          // For file uploads, send the data URL directly
          // In a production app, you might want to upload to a storage service first
          formattedData.image = imageData.dataUrl;
        }
      }
      
      let response;
      
      if (isNewFaculty) {
        // Validate password for new faculty
        if (!data.password) {
          setError('Please provide a password for the faculty account');
          return;
        }
        
        if (data.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }
        
        // Create new faculty with password
        response = await api.post('/api/faculty', formattedData);
        
        // Show success message
        setSuccess(`Faculty added successfully! A user account has been created for ${response.data.email}`);
        
        // Navigate to the newly created faculty page
        setTimeout(() => {
          navigate(`/faculty-detail/${response.data._id}`);
        }, 2000);
      } else {
        // Update existing faculty
        response = await api.put(`/api/faculty/${id}`, formattedData);
        setFaculty(response.data);
        setSuccess('Faculty details updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving faculty data:', error);
      setError(error.response?.data?.message || 'Failed to save faculty details.');
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel editing - reset form to original values
      if (faculty) {
        reset({
          name: faculty.name,
          designation: faculty.designation,
          school: faculty.department,
          cabinLocation: faculty.cabinLocation || '',
          freeTimings: faculty.freeTimings || '',
          overview: faculty.overview || '',
          mobileNumber: faculty.mobileNumber || '',
          emails: faculty.emails?.length ? 
            faculty.emails.map(email => ({ value: email })) : 
            [{ value: faculty.email || '' }],
          education: faculty.education || '',
          workExperience: faculty.workExperience || '',
          publications: faculty.publications || '',
          research: faculty.research || '',
          projects: faculty.projects?.length ? faculty.projects : []
        });
      }
      // Reset image data
      setImageData(null);
    }
    setIsEditing(!isEditing);
  };
  
  // Handle delete faculty
  const handleDeleteFaculty = async () => {
    if (!isAdmin() || isNewFaculty) return;
    
    try {
      setIsDeleting(true);
      const result = await deleteFaculty(id);
      
      if (result.success) {
        setShowDeleteModal(false);
        navigate('/faculty', { 
          state: { 
            notification: {
              type: 'success',
              message: `${faculty?.name || 'Faculty member'} has been successfully deleted.`
            }
          }
        });
      } else {
        setError(result.message);
        setShowDeleteModal(false);
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting faculty:', error);
      setError('An unexpected error occurred. Please try again.');
      setShowDeleteModal(false);
      setIsDeleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto pt-24 p-4 min-h-screen">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-16 h-16 border-4 border-primary-red border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-medium-gray">Loading faculty details...</p>
        </div>
      </div>
    );
  }

  // Remove the simple textarea render function and replace it with a rich text render function
  const renderRichTextArea = ({ field }, placeholder) => {
    const { onChange, value } = field;
    return (
      <RichTextEditor
        value={value || ''}
        onChange={onChange}
        readOnly={!isEditing}
        placeholder={placeholder}
        height={350}
      />
    );
  };

  return (
    <div className="w-full">
      {/* Use higher top padding to avoid navbar overlap */}
      <div className="pt-28">
        {/* Page content container */}
        <div className="max-w-full px-4 md:px-8 mx-auto">
          {/* Back button and actions row */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 max-w-7xl mx-auto">
            <button
              onClick={() => navigate('/faculty')}
              className="flex items-center px-5 py-3 rounded-md bg-white border-2 border-primary-red text-primary-red hover:bg-light-red hover:translate-x-[-5px] transition-all duration-300 ease-in-out shadow-sm font-medium text-base w-full md:w-auto mb-4 md:mb-0"
              aria-label="Back to Faculty Directory"
            >
              <i className="fas fa-arrow-left mr-3"></i> Back to Faculty Directory
            </button>
            
            {/* Action buttons container */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Edit button - only show when not adding new faculty and user has permission */}
              {!isNewFaculty && hasEditPermission() && (
                <button 
                  onClick={toggleEditMode}
                  className={`px-5 py-3 rounded-md font-medium transition-all ${
                    isEditing 
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                      : 'bg-primary-red text-white hover:bg-secondary-red'
                  } shadow-md w-full sm:w-auto`}
                >
                  <i className={`fas ${isEditing ? 'fa-times mr-2' : 'fa-edit mr-2'}`}></i>
                  {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
              )}
              
              {/* Delete button - only show for admin and when not adding new faculty */}
              {!isNewFaculty && isAdmin() && !isEditing && (
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="px-5 py-3 rounded-md font-medium transition-all bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 shadow-md w-full sm:w-auto"
                >
                  <i className="fas fa-trash mr-2"></i>Delete Faculty
                </button>
              )}
            </div>
          </div>

          {/* View/Edit Mode Toggle */}
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-100 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 mx-auto">
              {/* Tab navigation - hide unnecessary tabs for new faculty */}
              <div className="flex flex-wrap border-b border-gray-300 mb-6 overflow-x-auto whitespace-nowrap">
                <button
                  type="button"
                  className={`py-3 px-4 font-medium transition-colors ${activeTab === 'basic' ? 'border-b-2 border-primary-red text-primary-red' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('basic')}
                >
                  <i className="fas fa-user mr-2"></i>Basic Details
                </button>
                <button
                  type="button"
                  className={`py-3 px-4 font-medium transition-colors ${activeTab === 'education' ? 'border-b-2 border-primary-red text-primary-red' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('education')}
                >
                  <i className="fas fa-graduation-cap mr-2"></i>Education
                </button>
                <button
                  type="button"
                  className={`py-3 px-4 font-medium transition-colors ${activeTab === 'publications' ? 'border-b-2 border-primary-red text-primary-red' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('publications')}
                >
                  <i className="fas fa-book mr-2"></i>Publications
                </button>
                <button
                  type="button"
                  className={`py-3 px-4 font-medium transition-colors ${activeTab === 'projects' ? 'border-b-2 border-primary-red text-primary-red' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('projects')}
                >
                  <i className="fas fa-tasks mr-2"></i>Projects
                </button>
                <button
                  type="button"
                  className={`py-3 px-4 font-medium transition-colors ${activeTab === 'contact' ? 'border-b-2 border-primary-red text-primary-red' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('contact')}
                >
                  <i className="fas fa-address-card mr-2"></i>Contact
                </button>
              </div>
              
              {/* Tab content */}
              <div className="tab-content py-4">
                {/* Basic Details Tab */}
                <div className={`${activeTab === 'basic' ? 'block' : 'hidden'}`}>
                  {/* Image upload section */}
                  <div className="mb-8 border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Profile Image</h3>
                    <div className="flex justify-center">
                      <ImageUploader 
                        initialImage={faculty?.image} 
                        onImageChange={handleImageChange}
                        defaultImage="/img/default-faculty.png"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Name</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                        placeholder="Faculty Name"
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Designation</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                        placeholder="e.g. Professor, Associate Professor"
                        {...register('designation', { required: 'Designation is required' })}
                      />
                      {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation.message}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">School/Department</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                        {...register('school', { required: 'School is required' })}
                      >
                        <option value="">Select School</option>
                        <option value="ECSE">ECSE - School of Computer Science & Engineering</option>
                        <option value="SOL">SOL - School of Law</option>
                        <option value="SOM">SOM - School of Management</option>
                        <option value="IMSOE">IMSOE - Indira Mahindra School of Education</option>
                        <option value="SDMC">SDMC - School of Design, Media & Creative Arts</option>
                        <option value="SODI">SODI - School of Design & Innovation</option>
                        <option value="SOHM">SOHM - School of Humanities & Mathematics</option>
                        <option value="CEI">CEI - Center for Entrepreneurship & Innovation</option>
                        <option value="CEE">CEE - Center for Executive Education</option>
                        <option value="CLS">CLS - Center for Liberal Studies</option>
                        <option value="CS">CS - Center for Sustainability</option>
                      </select>
                      {errors.school && <p className="text-red-500 text-sm mt-1">{errors.school.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Cabin Location</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                        placeholder="e.g. Room 202, Academic Block A"
                        {...register('cabinLocation')}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Free Timings</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                      placeholder="e.g. Mon-Wed: 2-4 PM, Fri: 10-11 AM"
                      {...register('freeTimings')}
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Overview</label>
                    <Controller
                      name="overview"
                      control={control}
                      defaultValue=""
                      render={(field) => renderRichTextArea(field, "Enter an overview of your background, expertise, and research interests")}
                    />
                  </div>
                </div>
  
                {/* Education Tab - SIMPLIFIED */}
                <div className={`${activeTab === 'education' ? 'block' : 'hidden'}`}>
                  <h2 className="text-xl font-semibold mb-4">Education & Experience</h2>
                  
                  {/* Education Section - Simplified */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Academic Qualifications</h3>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Education Details
                      </label>
                      <Controller
                        name="education"
                        control={control}
                        defaultValue=""
                        render={(field) => renderRichTextArea(field, "Enter your education details (degrees, institutions, years, etc.)")}
                      />
                    </div>
                  </div>
                  
                  {/* Work Experience Section - Simplified */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Work Experience</h3>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Professional Experience
                      </label>
                      <Controller
                        name="workExperience"
                        control={control}
                        defaultValue=""
                        render={(field) => renderRichTextArea(field, "Enter your work experience details (positions, organizations, durations, responsibilities, etc.)")}
                      />
                    </div>
                  </div>
                </div>
  
                {/* Publications Tab - SIMPLIFIED */}
                <div className={`${activeTab === 'publications' ? 'block' : 'hidden'}`}>
                  <h2 className="text-xl font-semibold mb-4">Publications & Research</h2>
                  
                  {/* Publications Section - Simplified */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Academic Publications</h3>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Publications
                      </label>
                      <Controller
                        name="publications"
                        control={control}
                        defaultValue=""
                        render={(field) => renderRichTextArea(field, "Enter your publications (journal articles, conference papers, books, etc.)")}
                      />
                    </div>
                  </div>
                  
                  {/* Research Interests Section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Research Interests</h3>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Current Research Areas
                      </label>
                      <Controller
                        name="research"
                        control={control}
                        defaultValue=""
                        render={(field) => renderRichTextArea(field, "Describe your current research interests, areas of focus, and any ongoing research projects")}
                      />
                    </div>
                  </div>
                </div>
  
                {/* Projects Tab */}
                <div className={`${activeTab === 'projects' ? 'block' : 'hidden'}`}>
                  <h2 className="text-xl font-semibold mb-4">Current Projects</h2>
                  
                  {projectFields.map((field, index) => (
                    <div key={field.id} className="mb-6 border-b pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium">Project #{index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeProject(index)}
                          className="text-primary-red hover:text-secondary-red transition-colors"
                        >
                          <i className="fas fa-trash-alt"></i> Remove
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Project Title</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          {...register(`projects.${index}.title`, { required: 'Project title is required' })}
                        />
                        {errors.projects?.[index]?.title && 
                          <p className="text-red-500 text-sm mt-1">{errors.projects[index].title.message}</p>}
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Description</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          rows={3}
                          {...register(`projects.${index}.description`)}
                        ></textarea>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Status</label>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            {...register(`projects.${index}.status`)}
                          >
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Planning">Planning</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Timeline</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="e.g. Jan 2023 - Dec 2023"
                            {...register(`projects.${index}.timeline`)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => appendProject({ title: '', description: '', status: 'In Progress', timeline: '' })}
                    className="px-4 py-2 bg-primary-red text-white rounded hover:bg-secondary-red transition-colors shadow-sm hover:shadow-md"
                  >
                    <i className="fas fa-plus mr-2"></i> Add Project
                  </button>
                </div>
  
                {/* Contact Tab */}
                <div className={`${activeTab === 'contact' ? 'block' : 'hidden'}`}>
                  <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Email Addresses</label>
                    
                    {emailFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 mb-2">
                        <input 
                          type="email" 
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="email@mahindrauniversity.edu.in"
                          {...register(`emails.${index}.value`, { 
                            required: index === 0 ? 'Email is required' : false,
                            pattern: {
                              value: /^\S+@\S+\.\S+$/,
                              message: 'Invalid email format'
                            }
                          })}
                        />
                        
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeEmail(index)}
                            className="px-2 py-2 text-red-500"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {errors.emails && errors.emails[0]?.value && 
                      <p className="text-red-500 text-sm mt-1">{errors.emails[0].value.message}</p>}
                    
                    <button
                      type="button"
                      onClick={() => appendEmail({ value: '' })}
                      className="mt-2 text-blue-500 hover:text-blue-700"
                    >
                      <i className="fas fa-plus mr-1"></i> Add another email
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Mobile Number (Optional)</label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="+91 XXXXXXXXXX"
                      {...register('mobileNumber')}
                    />
                  </div>

                  {isNewFaculty && (
                    <div className="mb-6 mt-6 border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Account Information</h3>
                      
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                          Account Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input 
                            type="password" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Create a secure password for faculty login"
                            {...register('password', { 
                              required: isNewFaculty ? 'Password is required' : false,
                              minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters long'
                              }
                            })}
                          />
                          {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          The faculty will use this password to log in. They will be required to change it on first login.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
  
              {/* Form Actions */}
              <div className="mt-8 pt-6 border-t border-gray-300 flex justify-end gap-4 sticky bottom-0 bg-gray-100">
                <button
                  type="button"
                  onClick={toggleEditMode}
                  className="px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <i className="fas fa-times mr-2"></i>Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary-red text-white rounded-md hover:bg-secondary-red transition-colors shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-save mr-2"></i>{isNewFaculty ? 'Create Faculty' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            /* Render faculty view using the new component */
            <FacultyView faculty={faculty} />
          )}
          
          {/* Delete confirmation modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all mx-4">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Faculty Profile</h3>
                  <p className="text-gray-600">
                    Are you sure you want to delete {faculty?.name}'s faculty profile? This action cannot be undone.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    className="px-5 py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-5 py-3 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition-colors"
                    onClick={handleDeleteFaculty}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Deleting...
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-trash-alt mr-2"></i>
                        Delete Faculty
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Error and success messages */}
          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6 max-w-7xl mx-auto" role="alert">
              <strong className="font-medium">Error!</strong>
              <span className="block sm:inline"> {error}</span>
              <button 
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={() => setError('')}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-6 max-w-7xl mx-auto" role="alert">
              <strong className="font-medium">Success!</strong>
              <span className="block sm:inline"> {success}</span>
              <button 
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={() => setSuccess('')}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
          
          {/* Add even more space at the bottom of the page */}
          <div className="h-24"></div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDetail;
