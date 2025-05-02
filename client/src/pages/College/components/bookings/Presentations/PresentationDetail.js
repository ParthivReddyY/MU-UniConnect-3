import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../../../utils/axiosConfig';
import { useAuth } from '../../../../../contexts/AuthContext';
import PresentationCreationForm from './PresentationCreationForm';
import PresentationGrading from './PresentationGrading';
import LoadingSpinner from '../../../../../components/LoadingSpinner';
import { CSVLink } from 'react-csv';
import { exportPresentationToPdf } from '../../../../../utils/pdfUtils';
import 'jspdf-autotable';

const PresentationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  useAuth(); // Keep the hook but don't destructure if not using any values
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showGrading, setShowGrading] = useState(false);
  const [showStartConfirmation, setShowStartConfirmation] = useState(false);

  // Fetch presentation details on component mount
  useEffect(() => {
    const fetchPresentationDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/presentations/${id}`);
        
        // Process the presentation data with proper date handling
        const processedPresentation = {
          ...response.data,
          // Make sure all dates are properly formatted as Date objects
          registrationPeriod: {
            start: response.data.registrationPeriod?.start ? new Date(response.data.registrationPeriod.start) : null,
            end: response.data.registrationPeriod?.end ? new Date(response.data.registrationPeriod.end) : null
          },
          presentationPeriod: {
            start: response.data.presentationPeriod?.start ? new Date(response.data.presentationPeriod.start) : null,
            end: response.data.presentationPeriod?.end ? new Date(response.data.presentationPeriod.end) : null
          },
          // Process slots to ensure all dates are properly formatted
          slots: Array.isArray(response.data.slots) ? response.data.slots.map(slot => ({
            ...slot,
            // Ensure each slot has an id and properly formatted dates
            id: slot.id || (slot._id ? slot._id.toString() : null),
            _id: slot._id ? slot._id.toString() : slot.id,
            time: slot.time ? new Date(slot.time) : null,
            bookedAt: slot.bookedAt ? new Date(slot.bookedAt) : null,
            startedAt: slot.startedAt ? new Date(slot.startedAt) : null,
            completedAt: slot.completedAt ? new Date(slot.completedAt) : null
          })) : []
        };
        
        setPresentation(processedPresentation);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You don\'t have permission to view this presentation details.');
          toast.error('Access denied: You don\'t have permission to view this presentation');
        } else {
          const errorMessage = err.response?.data?.message || 
                              'Failed to load presentation details. Please try again.';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPresentationDetails();
  }, [id]);

  // Handle edit mode toggle
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle presentation update
  const handleUpdatePresentation = async (updatedPresentation) => {
    try {
      setLoading(true);
      
      const response = await api.put(`/api/presentations/${id}`, updatedPresentation);
      
      if (response.data && response.status === 200) {
        // Fetch the updated presentation
        const updatedResponse = await api.get(`/api/presentations/${id}`);
        
        setPresentation(updatedResponse.data);
        toast.success('Presentation details updated successfully');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating presentation:', err);
      
      // Improved error handling with specific messages
      if (err.response?.status === 403) {
        toast.error('You do not have permission to update this presentation');
      } else {
        toast.error(err.response?.data?.message || 'Failed to update presentation details');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setIsEditing(false);
  };

  // Handle starting a presentation
  const handleStartPresentation = () => {
    if (!selectedSlot) {
      toast.error('Please select a slot first');
      return;
    }
    
    // Show confirmation dialog
    setShowStartConfirmation(true);
  };

  // Confirm and start presentation
  const confirmStartPresentation = async () => {
    try {
      const slotIdToUse = selectedSlot._id || selectedSlot.id;
      
      const response = await api.put(`/api/presentations/slots/${slotIdToUse}/start`);
      
      if (response.status === 200) {
        toast.success('Presentation started successfully');
        
        // Refresh data
        const updatedPresentation = await api.get(`/api/presentations/${id}`);
        setPresentation(updatedPresentation.data);
        
        // Switch to grading view
        setShowGrading(true);
      }
    } catch (error) {
      console.error('Error starting presentation:', error);
      
      // Improved error handling
      if (error.response?.status === 403) {
        toast.error('You do not have permission to start this presentation');
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to start presentation';
        toast.error(errorMessage);
      }
    } finally {
      setShowStartConfirmation(false);
    }
  };

  // Handle grading completion
  const handleGradingComplete = async () => {
    try {
      const response = await api.get(`/api/presentations/${id}`);
      setPresentation(response.data);
      setShowGrading(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error refreshing presentation data:', error);
      toast.error('Failed to refresh presentation data');
    }
  };

  // Format date for display
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get appropriate status badge for slot
  const getStatusBadge = (status) => {
    switch(status) {
      case 'available':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Available</span>;
      case 'booked':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Booked</span>;
      case 'in-progress':
        return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">In Progress</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Completed</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Unknown</span>;
    }
  };

  // Open comprehensive slot view
  const openSlotDetailView = (slot) => {
    setSelectedSlot(slot);
    document.body.classList.add('overflow-hidden'); // Prevent scrolling
  };

  // Close comprehensive slot view
  const closeSlotDetailView = () => {
    setSelectedSlot(null);
    document.body.classList.remove('overflow-hidden'); // Restore scrolling
  };

  // Calculate average score for a team member based on their grades
  const calculateMemberScore = useCallback((member, individualGrades) => {
    if (!individualGrades || !member?.email || !individualGrades[member.email]) return 0;
    
    const criteria = presentation?.customGradingCriteria ? presentation.gradingCriteria : [
      { name: 'Content', weight: 30 },
      { name: 'Delivery', weight: 30 },
      { name: 'Visual Aids', weight: 20 },
      { name: 'Q&A', weight: 20 }
    ];
    
    let totalScore = 0;
    let totalWeight = 0;
    
    criteria.forEach(criterion => {
      const score = individualGrades[member.email][criterion.name] || 0;
      totalScore += (score * criterion.weight);
      totalWeight += criterion.weight;
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }, [presentation]);

  // Calculate statistics from presentation data
  const statistics = useMemo(() => {
    if (!presentation?.slots) return {
      total: 0,
      booked: 0,
      inProgress: 0,
      completed: 0,
      available: 0
    };
    
    return {
      total: presentation.slots.length || 0,
      booked: presentation.slots.filter(slot => slot.status === 'booked').length || 0,
      inProgress: presentation.slots.filter(slot => slot.status === 'in-progress').length || 0,
      completed: presentation.slots.filter(slot => slot.status === 'completed').length || 0,
      available: presentation.slots.filter(slot => !slot.booked).length || 0,
    };
  }, [presentation]);

  // Prepare edit data when switching to edit mode
  const prepareEditData = useCallback(() => {
    if (!presentation) return null;
    
    // Fix date format issues - ensure consistent datetime formats for the server
    // For registration period, use ISO string format but truncate to minute precision
    const registrationStart = presentation?.registrationPeriod?.start ? 
      new Date(presentation.registrationPeriod.start).toISOString().substring(0, 16) : '';
    
    const registrationEnd = presentation?.registrationPeriod?.end ? 
      new Date(presentation.registrationPeriod.end).toISOString().substring(0, 16) : '';
    
    // For presentation period, use date-only format (YYYY-MM-DD)
    const presentationStart = presentation?.presentationPeriod?.start ? 
      new Date(presentation.presentationPeriod.start).toISOString().split('T')[0] : '';
    
    const presentationEnd = presentation?.presentationPeriod?.end ? 
      new Date(presentation.presentationPeriod.end).toISOString().split('T')[0] : '';
    
    console.log('Preparing presentation data for edit:', {
      registrationStart,
      registrationEnd,
      presentationStart,
      presentationEnd
    });
    
    return {
      ...presentation,
      _id: presentation._id, // Ensure ID is included for updates
      registrationPeriod: {
        start: registrationStart,
        end: registrationEnd
      },
      presentationPeriod: {
        start: presentationStart,
        end: presentationEnd
      },
      customGradingCriteria: !!presentation.customGradingCriteria,
      gradingCriteria: presentation.gradingCriteria || [
        { name: 'Content', weight: 30 },
        { name: 'Delivery', weight: 30 },
        { name: 'Visual Aids', weight: 20 },
        { name: 'Q&A', weight: 20 }
      ]
    };
  }, [presentation]);

  // Calculate grading statistics
  const calculateGradingStatistics = useCallback(() => {
    if (!presentation?.slots) return null;
    
    // Get all completed slots with grades
    const completedSlots = presentation.slots.filter(slot => 
      slot.status === 'completed' && slot.totalScore !== undefined
    );
    
    if (completedSlots.length === 0) return null;
    
    // Calculate statistics
    const scores = completedSlots.map(slot => slot.totalScore || 0);
    const totalScores = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScores / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    
    // Count score ranges
    const excellent = scores.filter(score => score >= 90).length;
    const veryGood = scores.filter(score => score >= 80 && score < 90).length;
    const good = scores.filter(score => score >= 70 && score < 80).length;
    const average = scores.filter(score => score >= 60 && score < 70).length;
    const belowAverage = scores.filter(score => score < 60).length;
    
    return {
      totalGraded: completedSlots.length,
      averageScore: Math.round(averageScore * 10) / 10,
      highestScore,
      lowestScore,
      excellent,
      veryGood,
      good,
      average,
      belowAverage
    };
  }, [presentation]);

  // Prepare export data
  const prepareExportData = useCallback(() => {
    if (!presentation?.slots) return [];
    
    const completedSlots = presentation.slots.filter(slot => 
      slot.status === 'completed'
    );
    
    return completedSlots.map(slot => {
      // Basic slot info
      const baseInfo = {
        Date: new Date(slot.time).toLocaleDateString(),
        Time: new Date(slot.time).toLocaleTimeString(),
        Topic: slot.topic || 'N/A',
        TeamName: slot.teamName || 'Individual',
        TotalScore: slot.totalScore || 0
      };
      
      // Add individual grades if available
      let rowData = { ...baseInfo };
      
      // Add criteria grades
      if (slot.grades) {
        Object.entries(slot.grades).forEach(([criterion, score]) => {
          rowData[`Team_${criterion}`] = score;
        });
      }
      
      // If team has individual grades, add those
      if (slot.teamMembers && slot.teamMembers.length > 0 && slot.individualGrades) {
        slot.teamMembers.forEach(member => {
          if (slot.individualGrades[member.email]) {
            rowData[`${member.name}_Score`] = calculateMemberScore(member, slot.individualGrades);
            
            // Add individual criteria scores
            Object.entries(slot.individualGrades[member.email]).forEach(([criterion, score]) => {
              rowData[`${member.name}_${criterion}`] = score;
            });
          }
        });
      }
      
      return rowData;
    });
  }, [presentation, calculateMemberScore]);

  // Update the exportToPDF function to use the direct export function
  const exportToPDF = useCallback(() => {
    if (!presentation) return;
    
    const stats = calculateGradingStatistics();
    const exportData = prepareExportData();
    
    const success = exportPresentationToPdf(
      presentation,
      stats,
      exportData,
      formatDate,
      `${presentation.title}_Grading_Report.pdf`
    );
    
    if (!success) {
      toast.error('Failed to generate PDF. Please try again.');
    }
  }, [presentation, formatDate, calculateGradingStatistics, prepareExportData]);

  // Render presentation information section
  const renderPresentationInfo = () => {
    if (!presentation) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Presentation Information */}
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <i className="fas fa-info-circle mr-2 text-blue-500"></i>
            Basic Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="text-gray-600 w-24 flex-shrink-0">Host:</span>
              <span className="font-medium text-gray-800">{presentation.facultyName}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-600 w-24 flex-shrink-0">Department:</span>
              <span className="font-medium text-gray-800">{presentation.hostDepartment || 'Not specified'}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-600 w-24 flex-shrink-0">Venue:</span>
              <span className="font-medium text-gray-800">{presentation.venue}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-600 w-24 flex-shrink-0">Type:</span>
              <span className="font-medium text-gray-800">
                {presentation.participationType === 'individual' ? 'Individual' : 
                `Team (${presentation.teamSizeMin}-${presentation.teamSizeMax} members)`}
              </span>
            </div>
          </div>
        </div>
        
        {/* Time Information */}
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <i className="fas fa-calendar-alt mr-2 text-green-500"></i>
            Schedule Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="text-gray-600 w-24 flex-shrink-0">Registration:</span>
              <span className="font-medium text-gray-800">
                {formatDate(presentation.registrationPeriod?.start)} - {formatDate(presentation.registrationPeriod?.end)}
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-600 w-24 flex-shrink-0">Presentation:</span>
              <span className="font-medium text-gray-800">
                {formatDate(presentation.presentationPeriod?.start)} - {formatDate(presentation.presentationPeriod?.end)}
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-600 w-24 flex-shrink-0">Duration:</span>
              <span className="font-medium text-gray-800">
                {presentation.slotConfig?.duration} min (with {presentation.slotConfig?.buffer} min buffer)
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-600 w-24 flex-shrink-0">Hours:</span>
              <span className="font-medium text-gray-800">
                {presentation.slotConfig?.startTime} - {presentation.slotConfig?.endTime}
              </span>
            </div>
          </div>
        </div>
        
        {/* Target Audience */}
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <i className="fas fa-users mr-2 text-purple-500"></i>
            Target Audience
          </h3>
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="text-gray-600 w-24 flex-shrink-0">Year:</span>
              <div className="flex flex-wrap">
                {presentation.targetAudience?.year?.map(year => (
                  <span key={year} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                    Year {year}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-gray-600 w-24 flex-shrink-0">School:</span>
              <div className="flex flex-wrap">
                {presentation.targetAudience?.school?.map(school => {
                  const shortName = school.split('(')[1]?.replace(')', '') || school;
                  return (
                    <span key={school} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                      {shortName}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-gray-600 w-24 flex-shrink-0">Department:</span>
              <div className="flex flex-wrap">
                {presentation.targetAudience?.department?.map(dept => (
                  <span key={dept} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render statistics section
  const renderStatistics = () => {
    if (!presentation) return null;
    
    const stats = calculateGradingStatistics();
    
    return (
      <div className="bg-white rounded-lg shadow-md p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <i className="fas fa-chart-pie mr-2 text-blue-500"></i>
          Slot Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-800">{statistics.total}</div>
            <div className="text-sm text-gray-500">Total Slots</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{statistics.booked}</div>
            <div className="text-sm text-blue-700">Booked</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{statistics.inProgress}</div>
            <div className="text-sm text-orange-700">In Progress</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{statistics.completed}</div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{statistics.available}</div>
            <div className="text-sm text-purple-700">Available</div>
          </div>
        </div>
        
        {statistics.total > 0 && (
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="flex h-full">
                <div 
                  className="bg-blue-500 h-full" 
                  style={{ width: `${(statistics.booked / statistics.total) * 100}%` }}
                ></div>
                <div 
                  className="bg-orange-500 h-full" 
                  style={{ width: `${(statistics.inProgress / statistics.total) * 100}%` }}
                ></div>
                <div 
                  className="bg-green-500 h-full" 
                  style={{ width: `${(statistics.completed / statistics.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Add Grading Statistics Section */}
        {stats && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-chart-line mr-2 text-green-500"></i>
              Grading Statistics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 p-3 rounded-lg text-center shadow-sm">
                <div className="text-xl font-bold text-blue-600">{stats.totalGraded}</div>
                <div className="text-sm text-gray-700">Total Graded</div>
              </div>
              <div className="bg-white border border-gray-200 p-3 rounded-lg text-center shadow-sm">
                <div className="text-xl font-bold text-green-600">{stats.averageScore}</div>
                <div className="text-sm text-gray-700">Average Score</div>
              </div>
              <div className="bg-white border border-gray-200 p-3 rounded-lg text-center shadow-sm">
                <div className="text-xl font-bold text-purple-600">{stats.highestScore}</div>
                <div className="text-sm text-gray-700">Highest Score</div>
              </div>
              <div className="bg-white border border-gray-200 p-3 rounded-lg text-center shadow-sm">
                <div className="text-xl font-bold text-orange-600">{stats.lowestScore}</div>
                <div className="text-sm text-gray-700">Lowest Score</div>
              </div>
            </div>
            
            <h4 className="font-medium text-gray-700 mb-3">Score Distribution</h4>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="flex h-8">
                <div 
                  className="bg-green-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${stats.excellent / stats.totalGraded * 100}%` }}
                >
                  {stats.excellent > 0 ? `${stats.excellent}` : ''}
                </div>
                <div 
                  className="bg-teal-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${stats.veryGood / stats.totalGraded * 100}%` }}
                >
                  {stats.veryGood > 0 ? `${stats.veryGood}` : ''}
                </div>
                <div 
                  className="bg-blue-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${stats.good / stats.totalGraded * 100}%` }}
                >
                  {stats.good > 0 ? `${stats.good}` : ''}
                </div>
                <div 
                  className="bg-yellow-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${stats.average / stats.totalGraded * 100}%` }}
                >
                  {stats.average > 0 ? `${stats.average}` : ''}
                </div>
                <div 
                  className="bg-red-500 h-full flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${stats.belowAverage / stats.totalGraded * 100}%` }}
                >
                  {stats.belowAverage > 0 ? `${stats.belowAverage}` : ''}
                </div>
              </div>
              <div className="grid grid-cols-5 text-xs text-center py-1 bg-gray-50 border-t border-gray-200">
                <div>Excellent<br/>90-100</div>
                <div>Very Good<br/>80-89</div>
                <div>Good<br/>70-79</div>
                <div>Average<br/>60-69</div>
                <div>Below Avg<br/>&lt;60</div>
              </div>
            </div>
            
            {/* Export buttons */}
            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <CSVLink
                data={prepareExportData()}
                filename={`${presentation.title}_Grades.csv`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
              >
                <i className="fas fa-file-csv mr-2"></i>
                Export to CSV
              </CSVLink>
              
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center"
              >
                <i className="fas fa-file-pdf mr-2"></i>
                Export to PDF
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render slots section
  const renderSlots = () => {
    if (!presentation?.slots || presentation.slots.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No slots available for this presentation
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {presentation.slots.map(slot => (
          <div
            key={slot.id || slot._id}
            className={`
              rounded-lg overflow-hidden border shadow-sm transition-all hover:shadow-md
              ${slot.status === 'completed' ? 'border-green-200 bg-green-50' : 
                slot.status === 'in-progress' ? 'border-orange-200 bg-orange-50' : 
                slot.booked ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
              }
            `}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    {new Date(slot.time).toLocaleDateString()}
                  </div>
                  <div className="text-base font-bold text-gray-800">
                    {formatTime(slot.time)}
                  </div>
                </div>
                {getStatusBadge(slot.status)}
              </div>
              
              <div className="mt-3">
                {slot.booked ? (
                  <div>
                    <div className="text-sm mb-1">
                      {slot.teamMembers && slot.teamMembers.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {slot.teamMembers.map((participant, i) => (
                            <span 
                              key={i} 
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
                            >
                              {participant.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-600">{slot.studentName || 'Student'}</span>
                      )}
                    </div>
                    {slot.teamName && (
                      <div className="text-xs text-gray-500 mt-1">
                        Team: {slot.teamName}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Available</div>
                )}
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <div className="text-sm text-gray-600 truncate max-w-[150px]">
                  {slot.topic || '-'}
                </div>
                <div>
                  {slot.status === 'completed' && (
                    <span className="text-green-600 font-medium text-sm">{(slot.totalScore || 0).toFixed(1)}/100</span>
                  )}
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => openSlotDetailView(slot)}
                  className="w-full py-1.5 px-3 text-center rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  View Details
                </button>
              </div>
              
              {slot.status === 'booked' && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setSelectedSlot(slot);
                      setShowStartConfirmation(true);
                    }}
                    className="w-full py-1.5 px-3 text-center rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                  >
                    Start Presentation
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 mb-4">
          <i className="fas fa-exclamation-circle text-4xl"></i>
        </div>
        <h2 className="text-xl font-bold mb-2 text-center">{error}</h2>
        <button 
          className="mt-4 bg-primary-red text-white px-4 py-2 rounded hover:bg-secondary-red transition-colors"
          onClick={() => navigate('/college/bookings/host-presentation')}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!presentation) return <div>No presentation found</div>;

  if (isEditing) {
    const initialEditData = prepareEditData();
    
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6">Edit Presentation</h2>
        <PresentationCreationForm 
          initialData={initialEditData}
          onPresentationCreated={handleUpdatePresentation}
          onCancel={handleCancel}
          isEditMode={true}
        />
      </div>
    );
  }

  if (showGrading && selectedSlot) {
    return (
      <PresentationGrading 
        presentation={presentation} 
        activeSlotId={selectedSlot._id || selectedSlot.id}
        onClose={handleGradingComplete}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{presentation.title}</h1>
        <button 
          onClick={handleEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <i className="fas fa-edit mr-2"></i>
          Edit
        </button>
      </div>

      {renderStatistics()}
      {renderPresentationInfo()}

      {/* Slots Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Slot Management</h3>
        {renderSlots()}
      </div>

      {/* Comprehensive Slot Detail Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <i className="fas fa-calendar-day mr-2"></i>
                Presentation Slot Details
              </h3>
              <button
                onClick={closeSlotDetailView}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-6">
              {/* Slot Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-gray-200 mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <i className="fas fa-clock text-blue-600"></i>
                    </div>
                    <h4 className="ml-3 text-xl font-bold text-gray-800">
                      {formatTime(selectedSlot.time)}
                    </h4>
                  </div>
                  <p className="text-gray-600">
                    {new Date(selectedSlot.time).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <span className={`h-2 w-2 rounded-full mr-2 ${
                      selectedSlot.status === 'completed' ? 'bg-green-500' :
                      selectedSlot.status === 'in-progress' ? 'bg-orange-500' :
                      selectedSlot.status === 'booked' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></span>
                    {selectedSlot.status === 'booked' ? 'Booked' :
                     selectedSlot.status === 'in-progress' ? 'In Progress' :
                     selectedSlot.status === 'completed' ? 'Completed' : 'Available'}
                  </div>
                </div>
              </div>
              
              {/* Slot Content */}
              {selectedSlot.booked ? (
                <div className="space-y-6">
                  {/* Presentation Info */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Presentation Information</h4>
                    <div className="bg-gray-50 rounded-md p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Topic</p>
                          <p className="font-medium text-gray-800">{selectedSlot.topic || 'Not specified'}</p>
                        </div>
                        {selectedSlot.teamName && (
                          <div>
                            <p className="text-sm text-gray-500">Team Name</p>
                            <p className="font-medium text-gray-800">{selectedSlot.teamName}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500">Booking Time</p>
                          <p className="font-medium text-gray-800">
                            {selectedSlot.bookedAt ? new Date(selectedSlot.bookedAt).toLocaleString() : 'Unknown'}
                          </p>
                        </div>
                        {selectedSlot.status === 'completed' && (
                          <div>
                            <p className="text-sm text-gray-500">Total Score</p>
                            <p className="font-medium text-green-600">
                              {selectedSlot.totalScore || 0}/100
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Team Members */}
                  {selectedSlot.teamMembers && selectedSlot.teamMembers.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        {selectedSlot.teamMembers.length > 1 ? 'Team Members' : 'Presenter'}
                      </h4>
                      <div className="bg-gray-50 rounded-md p-4">
                        <ul className="divide-y divide-gray-200">
                          {selectedSlot.teamMembers.map((member, idx) => (
                            <li key={idx} className="py-3 first:pt-0 last:pb-0">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                  <span className="text-indigo-600 font-medium">{member.name?.charAt(0).toUpperCase() || 'U'}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{member.name}</p>
                                  <p className="text-gray-500 text-sm">{member.email}</p>
                                </div>
                                
                                {/* Show individual score if completed and has individual grades */}
                                {selectedSlot.status === 'completed' && selectedSlot.individualGrades && selectedSlot.individualGrades[member.email] && (
                                  <div className="ml-auto">
                                    <div className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-medium">
                                      Score: {calculateMemberScore(member, selectedSlot.individualGrades)}/100
                                    </div>
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* Grades Section (if completed) */}
                  {selectedSlot.status === 'completed' && selectedSlot.grades && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Grade Breakdown</h4>
                      <div className="bg-gray-50 rounded-md p-4">
                        <div className="space-y-3">
                          {Object.entries(selectedSlot.grades).map(([criterion, score]) => (
                            <div key={criterion} className="flex justify-between">
                              <span className="text-gray-700">{criterion}</span>
                              <span className="font-medium">{score}/100</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Feedback Section (if completed) */}
                  {selectedSlot.status === 'completed' && selectedSlot.feedback && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Feedback</h4>
                      <div className="bg-gray-50 rounded-md p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedSlot.feedback}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={closeSlotDetailView}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    
                    {selectedSlot.status === 'booked' && (
                      <button
                        onClick={() => {
                          closeSlotDetailView();
                          handleStartPresentation();
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                      >
                        <i className="fas fa-play-circle mr-2"></i>
                        Start Presentation
                      </button>
                    )}
                    
                    {selectedSlot.status === 'in-progress' && (
                      <button
                        onClick={() => {
                          closeSlotDetailView();
                          setShowGrading(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                      >
                        <i className="fas fa-clipboard-check mr-2"></i>
                        Go to Grading
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-calendar-times text-gray-400 text-xl"></i>
                  </div>
                  <h5 className="text-lg font-medium text-gray-800 mb-2">Slot Not Booked</h5>
                  <p className="text-gray-500 text-center max-w-md mb-6">
                    This time slot is still available for booking. Students can book this slot through the presentation booking interface.
                  </p>
                  <button
                    onClick={closeSlotDetailView}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Start Presentation Confirmation Modal */}
      {showStartConfirmation && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-play text-blue-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start Presentation</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to start this presentation? This will mark the slot as in-progress and allow grading.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setShowStartConfirmation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStartPresentation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Start Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationDetail;
