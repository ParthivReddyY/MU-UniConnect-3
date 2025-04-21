import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';
import { calculateAcademicProgress, formatAcademicYear } from '../utils/academicUtils';

const StudentProfile = () => {
  const { studentId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [academicInfo, setAcademicInfo] = useState(null);

  // Load student data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) {
        setError('Student ID is required');
        setLoading(false);
        return;
      }
      
      try {
        const response = await api.get(`/api/students/${studentId}`);
        
        if (response.data.success) {
          setStudent(response.data.student);
          
          // Calculate academic progress
          if (response.data.student.yearOfJoining) {
            const progress = calculateAcademicProgress(response.data.student.yearOfJoining);
            setAcademicInfo(progress);
          }
        } else {
          setError('Failed to load student profile');
        }
      } catch (err) {
        console.error('Error fetching student:', err);
        setError(err.response?.data?.message || 'An error occurred while loading the student profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [studentId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Profile</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Student Not Found</h2>
          <p className="text-yellow-600 mb-4">The requested student profile could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 h-48 relative">
        <div className="absolute inset-0 bg-opacity-50 bg-black"></div>
        
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          {/* Profile Header with Avatar */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row">
              {/* Profile Image */}
              <div className="mx-auto sm:mx-0 mb-4 sm:mb-0">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                  {student.profileImage ? (
                    <img 
                      src={student.profileImage} 
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="sm:ml-6 text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold text-gray-800">{student.name}</h1>
                <p className="text-indigo-600 font-medium">{student.department || 'Student'}</p>
                
                <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs flex items-center">
                    <i className="fas fa-id-card mr-1"></i>
                    {student.studentId || 'No ID'}
                  </span>
                  
                  {student.yearOfJoining && (
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs flex items-center">
                      <i className="fas fa-calendar mr-1"></i>
                      Joined {formatAcademicYear(student.yearOfJoining)}
                    </span>
                  )}
                  
                  {academicInfo && academicInfo.isValidCalculation && (
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs flex items-center">
                      <i className="fas fa-graduation-cap mr-1"></i>
                      {academicInfo.year}{academicInfo.yearSuffix} Year
                    </span>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="mt-4 sm:mt-0 flex flex-col gap-2 sm:items-end">
                {currentUser && currentUser._id !== student._id && (
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
                  >
                    <i className="fas fa-comment mr-2"></i>
                    Message
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Academic Information */}
          {academicInfo && academicInfo.isValidCalculation && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-graduation-cap text-indigo-500 mr-2"></i>
                Academic Status
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Current Year</div>
                  <div className="font-medium">{academicInfo.year}{academicInfo.yearSuffix} Year</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Current Semester</div>
                  <div className="font-medium">{academicInfo.currentSemester}{academicInfo.semesterSuffix} Semester</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Program Progress</div>
                  <div className="font-medium">{academicInfo.progressPercentage}% Complete</div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${academicInfo.progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Start</span>
                  <span>Semester {academicInfo.completedSemesters}/{academicInfo.totalSemesters}</span>
                  <span>Graduation</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Bio Section */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-user text-indigo-500 mr-2"></i>
              About
            </h2>
            
            <div className="prose max-w-none text-gray-700">
              {student.bio ? (
                <p className="whitespace-pre-line">{student.bio}</p>
              ) : (
                <p className="text-gray-400 italic">No bio provided.</p>
              )}
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-address-card text-indigo-500 mr-2"></i>
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Email</div>
                <div className="flex items-center">
                  <i className="fas fa-envelope text-gray-400 mr-2"></i>
                  <span className="font-medium text-gray-800">{student.email}</span>
                </div>
              </div>
              
              {student.mobileNumber && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Phone</div>
                  <div className="flex items-center">
                    <i className="fas fa-phone text-gray-400 mr-2"></i>
                    <span className="font-medium text-gray-800">{student.mobileNumber}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Social Links */}
            {student.socialLinks && Object.values(student.socialLinks).some(link => link) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500 mb-3">Social Profiles</div>
                <div className="flex gap-3">
                  {student.socialLinks.linkedin && (
                    <a 
                      href={student.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                      title="LinkedIn Profile"
                    >
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  )}
                  
                  {student.socialLinks.twitter && (
                    <a 
                      href={student.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-50 text-blue-400 hover:bg-blue-400 hover:text-white h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                      title="Twitter Profile"
                    >
                      <i className="fab fa-twitter"></i>
                    </a>
                  )}
                  
                  {student.socialLinks.github && (
                    <a 
                      href={student.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 text-white h-10 w-10 rounded-full flex items-center justify-center transition-colors hover:bg-black"
                      title="GitHub Profile"
                    >
                      <i className="fab fa-github"></i>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
