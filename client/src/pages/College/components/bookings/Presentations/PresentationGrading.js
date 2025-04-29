import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../../../../utils/axiosConfig';
import { useAuth } from '../../../../../contexts/AuthContext';

const PresentationGrading = ({ presentation, onClose, activeSlotId = null }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [slots, setSlots] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [teamGrades, setTeamGrades] = useState({});
  const [individualGrades, setIndividualGrades] = useState({});
  const [presentationInProgress, setPresentationInProgress] = useState(false);
  const [presentationCompleted, setPresentationCompleted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(null);
  const [gradingMode, setGradingMode] = useState('team'); // 'team' or 'individual'
  const [activeTeamMember, setActiveTeamMember] = useState(null);
  const [isEditingGrades, setIsEditingGrades] = useState(false);

  // Add this line to the component to define criteria
  const criteria = presentation?.customGradingCriteria 
    ? presentation.gradingCriteria 
    : [
      { name: 'Content', weight: 25 },
      { name: 'Delivery', weight: 25 },
      { name: 'Visual Aids', weight: 25 },
      { name: 'Q&A', weight: 25 }
    ];

  // Fetch slots when component mounts or presentation changes
  useEffect(() => {
    if (!presentation) return;
    
    const fetchSlots = async () => {
      try {
        setLoading(true);
        console.log("Fetching slots for presentation:", presentation._id);
        console.log("Current user:", currentUser?.email || "Unknown");
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error("No authentication token found");
          setError("Authentication token missing. Please log in again.");
          toast.error("Authentication error - Please log in again");
          setLoading(false);
          return;
        }
        
        console.log("Using token for request:", token.substring(0, 15) + "...");
        
        // Make API request with explicit headers
        const response = await api.get(`/api/presentations/${presentation._id}/slots`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Slots fetched successfully:", response.data.length);
        setSlots(response.data);
        setError(null);
        
        // If activeSlotId is provided, find and set that slot
        if (activeSlotId) {
          const selectedSlot = response.data.find(slot => 
            slot._id === activeSlotId || slot.id === activeSlotId
          );
          
          if (selectedSlot) {
            setActiveSlot(selectedSlot);
            setPresentationInProgress(selectedSlot.status === 'in-progress');
            setPresentationCompleted(selectedSlot.status === 'completed');
            
            // If the slot is completed, load its grades and feedback
            if (selectedSlot.status === 'completed') {
              if (selectedSlot.grades) {
                setTeamGrades(selectedSlot.grades);
              }
              
              if (selectedSlot.individualGrades) {
                setIndividualGrades(selectedSlot.individualGrades);
              }
              
              setFeedback(selectedSlot.feedback || '');
            }
          }
        } else {
          // Check if there's an active presentation
          const inProgressSlot = response.data.find(slot => slot.status === 'in-progress');
          if (inProgressSlot) {
            setActiveSlot(inProgressSlot);
            setPresentationInProgress(true);
          }
        }
      } catch (error) {
        console.error("Error fetching presentation slots:", error);
        console.error("Response status:", error.response?.status);
        console.error("Error message:", error.response?.data?.message || error.message);
        
        const errorMessage = error.response?.data?.message || 
                            "Failed to load presentation slots. Please try again.";
        
        setError(errorMessage);
        toast.error(errorMessage);
        
        // If it's a permission error, show more details
        if (error.response?.status === 403) {
          console.log("Permission denied - Current user role:", currentUser?.role);
          console.log("Presentation faculty ID:", presentation.faculty);
          console.log("Current user ID:", currentUser?.userId);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSlots();
  }, [presentation, activeSlotId, currentUser]);

  // Handle starting a presentation
  const handleStartPresentation = async (slot) => {
    try {
      setSubmitting(true);
      
      // Use the correct ID field - prefer _id but fall back to id if _id doesn't exist
      const slotIdToUse = slot._id || slot.id;
      console.log("Starting presentation with slot ID:", slotIdToUse);
      
      const response = await api.put(`/api/presentations/slots/${slotIdToUse}/start`);
      
      if (response.data.success) {
        // Update the slot status in the UI
        const updatedSlots = slots.map(s => 
          (s._id === slot._id || s.id === slot.id) 
            ? { ...s, status: 'in-progress', startedAt: new Date() } 
            : s
        );
        
        setSlots(updatedSlots);
        setActiveSlot({ ...slot, status: 'in-progress', startedAt: new Date() });
        setPresentationInProgress(true);
        
        // Initialize grades for all team members
        if (slot.teamMembers && slot.teamMembers.length > 0) {
          const initialIndividualGrades = {};
          slot.teamMembers.forEach(member => {
            initialIndividualGrades[member.email] = {};
          });
          setIndividualGrades(initialIndividualGrades);
          
          // Set the first team member as active
          setActiveTeamMember(slot.teamMembers[0]);
        }
        
        toast.success('Presentation started successfully');
      }
    } catch (error) {
      console.error("Error starting presentation:", error);
      toast.error(error.response?.data?.message || 'Failed to start presentation');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle team grade changes
  const handleTeamGradeChange = (criterionName, value) => {
    setTeamGrades(prev => ({
      ...prev,
      [criterionName]: parseInt(value, 10) || 0
    }));
  };

  // Handle individual grade changes
  const handleIndividualGradeChange = (memberEmail, criterionName, value) => {
    setIndividualGrades(prev => ({
      ...prev,
      [memberEmail]: {
        ...prev[memberEmail],
        [criterionName]: parseInt(value, 10) || 0
      }
    }));
  };

  // Switch between team and individual grading modes
  const switchGradingMode = (mode) => {
    setGradingMode(mode);
  };

  // Set active team member for individual grading
  const selectTeamMember = (member) => {
    setActiveTeamMember(member);
  };

  // Calculate average score for a team member based on their grades
  const calculateMemberScore = (member, gradesObj) => {
    if (!gradesObj || !gradesObj[member.email]) return 0;
    
    const memberGrades = gradesObj[member.email];
    const criteria = presentation.customGradingCriteria ? presentation.gradingCriteria : [
      { name: 'Content', weight: 25 },
      { name: 'Delivery', weight: 25 },
      { name: 'Visual Aids', weight: 25 },
      { name: 'Q&A', weight: 25 }
    ];
    
    let totalScore = 0;
    criteria.forEach(criterion => {
      const rawScore = memberGrades[criterion.name] || 0;
      totalScore += (rawScore * criterion.weight / 100);
    });
    
    // Fix decimal issues with proper rounding
    return Math.round(totalScore * 10) / 10;
  };

  // Handle completing a presentation with grades
  const handleCompletePresentation = async () => {
    if (!activeSlot) return;
    
    // Get the criteria list
    const criteria = presentation.customGradingCriteria ? presentation.gradingCriteria : [
      { name: 'Content', weight: 30 },
      { name: 'Delivery', weight: 30 },
      { name: 'Visual Aids', weight: 20 },
      { name: 'Q&A', weight: 20 }
    ];
    
    // For team grading, validate all team criteria have been graded
    if (gradingMode === 'team') {
      const missingGrades = criteria.filter(criterion => 
        teamGrades[criterion.name] === undefined || teamGrades[criterion.name] === null
      );
      
      if (missingGrades.length > 0) {
        toast.error(`Please grade all team criteria before completing: ${missingGrades.map(c => c.name).join(', ')}`);
        return;
      }
    } else {
      // For individual grading, check if all members have been graded
      if (activeSlot.teamMembers && activeSlot.teamMembers.length > 0) {
        let missingGrades = false;
        
        // Check each team member has grades for each criterion
        for (const member of activeSlot.teamMembers) {
          const memberEmail = member.email;
          if (!individualGrades[memberEmail]) {
            toast.error(`Please grade team member: ${member.name}`);
            missingGrades = true;
            break;
          }
          
          // Check each criterion for this member
          for (const criterion of criteria) {
            if (individualGrades[memberEmail][criterion.name] === undefined) {
              toast.error(`Please grade ${criterion.name} for ${member.name}`);
              missingGrades = true;
              break;
            }
          }
          
          if (missingGrades) break;
        }
        
        if (missingGrades) return;
      }
    }
    
    try {
      setSubmitting(true);
      
      // Calculate team score
      let teamTotalScore = 0;
      if (gradingMode === 'team') {
        teamTotalScore = criteria.reduce((sum, criterion) => {
          const rawScore = teamGrades[criterion.name] || 0;
          const weightedScore = (rawScore * criterion.weight) / 100;
          return sum + weightedScore;
        }, 0);
      } else {
        // If individual grading, calculate average of all member scores
        let totalMemberScores = 0;
        const memberCount = activeSlot.teamMembers ? activeSlot.teamMembers.length : 0;
        
        if (memberCount > 0) {
          activeSlot.teamMembers.forEach(member => {
            totalMemberScores += calculateMemberScore(member, individualGrades);
          });
          
          teamTotalScore = Math.round(totalMemberScores / memberCount);
        }
      }
      
      // Use the correct ID field - prefer _id but fall back to id if _id doesn't exist
      const slotIdToUse = activeSlot._id || activeSlot.id;
      console.log("Completing presentation with slot ID:", slotIdToUse);
      
      const response = await api.put(`/api/presentations/slots/${slotIdToUse}/complete`, {
        grades: teamGrades,
        individualGrades: individualGrades,
        totalScore: teamTotalScore,
        feedback
      });
      
      if (response.data.success) {
        setPresentationInProgress(false);
        setPresentationCompleted(true);
        
        // Update the slot in the slots array
        setSlots(slots.map(s => s._id === activeSlot._id 
          ? { 
              ...s, 
              status: 'completed', 
              grades: teamGrades,
              individualGrades: individualGrades,
              totalScore: teamTotalScore 
            } 
          : s
        ));
        
        toast.success('Presentation graded successfully');
        
        // Reset for next presentation
        setTimeout(() => {
          setActiveSlot(null);
          setPresentationCompleted(false);
          setTeamGrades({});
          setIndividualGrades({});
          setFeedback('');
        }, 3000);
      }
    } catch (error) {
      toast.error('Failed to complete presentation');
    } finally {
      setSubmitting(false);
    }
  };

  // Format time slot for display
  const calculateTimeSlot = (slot) => {
    if (!slot.time) return 'Time not set';
    
    try {
      const scheduleTime = new Date(slot.time);
      const hours = scheduleTime.getHours();
      const minutes = scheduleTime.getMinutes();
      
      const formattedHours = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      return 'Invalid time';
    }
  };

  // Get status badge for slot
  const getSlotStatus = (slot) => {
    switch (slot.status) {
      case 'booked':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Booked</span>;
      case 'in-progress':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">In Progress</span>;
      case 'completed':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Completed</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Not Started</span>;
    }
  };

  // Export grades to CSV
  const exportToCSV = () => {
    // Create array of row objects
    const rows = slots.map(slot => {
      const baseRow = {
        'Slot Time': calculateTimeSlot(slot),
        'Date': new Date(slot.time).toLocaleDateString(),
        'Student/Team': slot.teamMembers?.map(p => p.name).join(', ') || 'Not assigned',
        'Team Name': slot.teamName || 'N/A',
        'Status': slot.status
      };
      
      // Add team grade columns if this is a completed slot
      if (slot.status === 'completed' && slot.grades) {
        Object.keys(slot.grades).forEach(criterion => {
          baseRow[`Team ${criterion}`] = slot.grades[criterion];
        });
        
        baseRow['Team Total Score'] = slot.totalScore || 0;
        
        // Add individual grades if available
        if (slot.individualGrades) {
          slot.teamMembers?.forEach(member => {
            if (slot.individualGrades[member.email]) {
              Object.keys(slot.individualGrades[member.email]).forEach(criterion => {
                baseRow[`${member.name} - ${criterion}`] = slot.individualGrades[member.email][criterion];
              });
              
              // Calculate individual total score
              const memberScore = calculateMemberScore(member, slot.individualGrades);
              baseRow[`${member.name} - Total Score`] = memberScore;
            }
          });
        }
      }
      
      return baseRow;
    });
    
    // Get all unique columns
    const allColumns = new Set();
    rows.forEach(row => {
      Object.keys(row).forEach(key => allColumns.add(key));
    });
    const columns = Array.from(allColumns);
    
    // Create CSV content
    let csvContent = columns.join(',') + '\n';
    
    rows.forEach(row => {
      const rowData = columns.map(column => {
        const value = row[column] !== undefined ? row[column] : '';
        // Escape commas and quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvContent += rowData.join(',') + '\n';
    });
    
    // Download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${presentation.title}_grades.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle edit mode for already completed presentations
  const toggleGradeEditMode = () => {
    if (activeSlot.status === 'completed') {
      setIsEditingGrades(!isEditingGrades);
      
      // Load existing grades into state when entering edit mode
      if (!isEditingGrades) {
        if (activeSlot.grades) {
          setTeamGrades(activeSlot.grades);
        }
        if (activeSlot.individualGrades) {
          setIndividualGrades(activeSlot.individualGrades);
        }
        setFeedback(activeSlot.feedback || '');
      }
    }
  };

  // Handle submitting updated grades for a completed presentation
  const handleSubmitGrades = async () => {
    try {
      setSubmitting(true);
      
      const slotIdToUse = activeSlot._id || activeSlot.id;
      
      // Calculate team score
      let teamTotalScore = 0;
      if (gradingMode === 'team') {
        teamTotalScore = criteria.reduce((sum, criterion) => {
          const score = teamGrades[criterion.name] || 0;
          return sum + (score * criterion.weight / 100);
        }, 0);
      } else {
        // Calculate average of all member scores
        let totalMemberScores = 0;
        const memberCount = activeSlot.teamMembers ? activeSlot.teamMembers.length : 0;
        
        if (memberCount > 0) {
          activeSlot.teamMembers.forEach(member => {
            totalMemberScores += calculateMemberScore(member, individualGrades);
          });
          teamTotalScore = totalMemberScores / memberCount;
        }
      }
      
      const response = await api.put(`/api/presentations/slots/${slotIdToUse}/update-grades`, {
        grades: teamGrades,
        individualGrades: individualGrades,
        totalScore: teamTotalScore,
        feedback
      });
      
      if (response.data.success) {
        // Update the slot in the slots array
        setSlots(slots.map(s => (s._id === activeSlot._id || s.id === activeSlot.id) 
          ? { 
              ...s, 
              grades: teamGrades,
              individualGrades: individualGrades,
              totalScore: teamTotalScore,
              feedback: feedback
            } 
          : s
        ));
        
        // Update active slot
        setActiveSlot({
          ...activeSlot,
          grades: teamGrades,
          individualGrades: individualGrades,
          totalScore: teamTotalScore,
          feedback: feedback
        });
        
        // Exit editing mode
        setIsEditingGrades(false);
        
        toast.success('Grades updated successfully');
      }
    } catch (error) {
      console.error("Error updating grades:", error);
      toast.error(error.response?.data?.message || 'Failed to update grades');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Presentation Grading</h1>
            <p className="text-gray-600 mt-1">{presentation.title}</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
            
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <i className="fas fa-file-export mr-2"></i>
              Export Grades
            </button>
          </div>
        </div>

        {/* Display error message if present */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slots List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Presentation Slots</h2>
            </div>
            
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              {loading ? (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : slots.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No presentation slots found
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {slots.map(slot => (
                    <li
                      key={slot._id || slot.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        activeSlot && (activeSlot._id === slot._id || activeSlot.id === slot.id) ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => !presentationInProgress && slot.status !== 'in-progress' && setActiveSlot(slot)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 font-medium">
                          {calculateTimeSlot(slot)}
                        </span>
                        {getSlotStatus(slot)}
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {slot.teamName || slot.teamMembers?.map(p => p.name).join(', ') || 'Not assigned'}
                        </p>
                      </div>
                      
                      {slot.status === 'completed' && (
                        <div className="mt-2 flex items-center">
                          <span className="text-sm text-gray-600 mr-1">Score:</span>
                          <span className="text-sm font-semibold">
                            {slot.totalScore || 0}/100
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Grading Panel */}
          <div className="lg:col-span-2">
            {!activeSlot ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                  <i className="fas fa-hand-pointer text-gray-500 text-2xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Select a Presentation Slot</h3>
                <p className="text-gray-600">
                  Click on a slot from the list to start grading or view details
                </p>
              </div>
            ) : presentationCompleted ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow"
              >
                <div className="p-6 text-center bg-green-50 border-b border-green-100">
                  <div className="bg-green-100 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                    <i className="fas fa-check-circle text-green-500 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Grading Complete</h3>
                  <p className="text-gray-600">
                    This presentation has been graded successfully with a total score of 
                    <span className="font-bold text-green-600 mx-1">
                      {activeSlot.totalScore || 0}/100
                    </span>
                  </p>
                </div>
                
                <div className="p-6">
                  <h4 className="font-medium text-gray-700 mb-3">Team Grade Breakdown</h4>
                  <div className="space-y-3">
                    {Object.entries(teamGrades || {}).map(([criterion, score]) => (
                      <div key={criterion} className="flex justify-between items-center">
                        <span className="text-gray-600">{criterion}</span>
                        <span className="font-medium">{score}/100</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-medium text-gray-800">Team Total Score</span>
                      <span className="font-bold text-green-600">{activeSlot.totalScore || 0}/100</span>
                    </div>
                  </div>
                  
                  {/* Individual Grades Section */}
                  {activeSlot.individualGrades && Object.keys(activeSlot.individualGrades).length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-700 mb-3">Individual Grade Breakdown</h4>
                      
                      {activeSlot.teamMembers && activeSlot.teamMembers.map((member, idx) => (
                        <div key={idx} className="mb-4 p-3 bg-gray-50 rounded-md">
                          <h5 className="font-medium text-gray-800 mb-2">{member.name}</h5>
                          {activeSlot.individualGrades[member.email] && (
                            <div className="space-y-2">
                              {Object.entries(activeSlot.individualGrades[member.email]).map(([criterion, score]) => (
                                <div key={criterion} className="flex justify-between items-center">
                                  <span className="text-gray-600 text-sm">{criterion}</span>
                                  <span className="font-medium text-sm">{score}/100</span>
                                </div>
                              ))}
                              <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                                <span className="font-medium text-gray-800 text-sm">Total Score</span>
                                <span className="font-bold text-green-600 text-sm">
                                  {calculateMemberScore(member, activeSlot.individualGrades)}/100
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activeSlot.feedback && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-700 mb-2">Feedback</h4>
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                        <p className="text-gray-600 whitespace-pre-wrap">{activeSlot.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : presentationInProgress ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow"
              >
                <div className="p-6 bg-blue-50 border-b border-blue-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">In Progress</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <span className="animate-pulse mr-1.5 h-2 w-2 bg-blue-500 rounded-full"></span>
                      Live
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">
                    {activeSlot.teamMembers?.map(p => p.name).join(', ') || 'Unnamed presentation'} - {calculateTimeSlot(activeSlot)}
                  </p>
                </div>
                
                <div className="p-6">
                  {/* Grading Mode Selector */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Grading Mode</h3>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => switchGradingMode('team')}
                        className={`px-4 py-2 rounded-md ${
                          gradingMode === 'team' 
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-300 border' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <i className="fas fa-users mr-2"></i>
                        Team Grading
                      </button>
                      
                      {activeSlot.teamMembers && activeSlot.teamMembers.length > 0 && (
                        <button
                          onClick={() => switchGradingMode('individual')}
                          className={`px-4 py-2 rounded-md ${
                            gradingMode === 'individual' 
                              ? 'bg-indigo-100 text-indigo-700 border-indigo-300 border' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <i className="fas fa-user mr-2"></i>
                          Individual Grading
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Team Grading Section */}
                  {gradingMode === 'team' && (
                    <div className="space-y-6">
                      <h3 className="font-semibold text-gray-800 mb-4">Grade The Team</h3>
                      
                      {(presentation.customGradingCriteria ? presentation.gradingCriteria : [
                        { name: 'Content', weight: 30 },
                        { name: 'Delivery', weight: 30 },
                        { name: 'Visual Aids', weight: 20 },
                        { name: 'Q&A', weight: 20 }
                      ]).map(criterion => (
                        <div key={criterion.name} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="font-medium text-gray-700">{criterion.name} ({criterion.weight}%)</label>
                            <span className="text-sm text-gray-500">{teamGrades[criterion.name] || 0}/100</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={teamGrades[criterion.name] || 0}
                            onChange={(e) => handleTeamGradeChange(criterion.name, e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Individual Grading Section */}
                  {gradingMode === 'individual' && activeSlot.teamMembers && activeSlot.teamMembers.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="font-semibold text-gray-800 mb-4">Grade Individual Members</h3>
                      
                      {/* Team Member Selector */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {activeSlot.teamMembers.map((member, idx) => (
                          <button
                            key={idx}
                            onClick={() => selectTeamMember(member)}
                            className={`px-3 py-1.5 rounded-full text-sm ${
                              activeTeamMember && activeTeamMember.email === member.email
                                ? 'bg-indigo-100 text-indigo-700 border-indigo-300 border'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {member.name}
                          </button>
                        ))}
                      </div>
                      
                      {/* Active Member Grading Form */}
                      {activeTeamMember && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h4 className="text-md font-medium text-gray-800 mb-4">
                            Grading: {activeTeamMember.name}
                          </h4>
                          
                          <div className="space-y-4">
                            {(presentation.customGradingCriteria ? presentation.gradingCriteria : [
                              { name: 'Content', weight: 30 },
                              { name: 'Delivery', weight: 30 },
                              { name: 'Visual Aids', weight: 20 },
                              { name: 'Q&A', weight: 20 }
                            ]).map(criterion => (
                              <div key={criterion.name} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <label className="font-medium text-gray-700">{criterion.name} ({criterion.weight}%)</label>
                                  <span className="text-sm text-gray-500">
                                    {individualGrades[activeTeamMember.email]?.[criterion.name] || 0}/100
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={individualGrades[activeTeamMember.email]?.[criterion.name] || 0}
                                  onChange={(e) => handleIndividualGradeChange(
                                    activeTeamMember.email, 
                                    criterion.name, 
                                    e.target.value
                                  )}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>
                          
                          {/* Member Score Summary */}
                          <div className="mt-4 pt-4 border-t border-gray-300">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800">Current Score:</span>
                              <span className="font-bold text-indigo-600">
                                {calculateMemberScore(activeTeamMember, individualGrades)}/100
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <label className="block font-medium text-gray-700 mb-2">Feedback (Optional)</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Provide feedback for the presentation..."
                    ></textarea>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleCompletePresentation}
                      disabled={submitting}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle mr-2"></i>
                          Complete Grading
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-user-graduate text-blue-600"></i>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {activeSlot.teamName || activeSlot.teamMembers?.map(p => p.name).join(', ') || 'Unnamed presentation'}
                      </h3>
                      <p className="text-gray-600">{calculateTimeSlot(activeSlot)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">Presentation Details</h4>
                    <div className="bg-gray-50 rounded-md p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium text-gray-800">
                            {activeSlot.status === 'booked' ? 'Ready to start' : activeSlot.status}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Topic</p>
                          <p className="font-medium text-gray-800">
                            {activeSlot.topic || 'Not specified'}
                          </p>
                        </div>
                        {activeSlot.teamName && (
                          <div>
                            <p className="text-sm text-gray-500">Team</p>
                            <p className="font-medium text-gray-800">{activeSlot.teamName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Team Members Section */}
                  {activeSlot.teamMembers && activeSlot.teamMembers.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-2">Team Members</h4>
                      <div className="bg-gray-50 rounded-md p-4">
                        <ul className="divide-y divide-gray-200">
                          {activeSlot.teamMembers.map((member, idx) => (
                            <li key={idx} className="py-2 flex items-start">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="text-indigo-600 font-medium">{member.name.charAt(0).toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{member.name}</p>
                                <p className="text-gray-500 text-sm">{member.email}</p>
                                {member.studentId && <p className="text-gray-500 text-sm">ID: {member.studentId}</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {activeSlot.status === 'booked' && (
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleStartPresentation(activeSlot)}
                        disabled={submitting}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Starting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-play-circle mr-2"></i>
                            Start Presentation
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {activeSlot.status === 'completed' && (
                    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-800">Grading Results</h3>
                        
                        <button
                          onClick={toggleGradeEditMode}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          {isEditingGrades ? 'Cancel Editing' : 'Edit Grades'}
                        </button>
                      </div>
                      
                      {isEditingGrades ? (
                        // Show editable grading form with existing values
                        <div className="space-y-4">
                          {/* Team grading form */}
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Team Grade</h4>
                            {(presentation.customGradingCriteria ? presentation.gradingCriteria : [
                              { name: 'Content', weight: 30 },
                              { name: 'Delivery', weight: 30 },
                              { name: 'Visual Aids', weight: 20 },
                              { name: 'Q&A', weight: 20 }
                            ]).map(criterion => (
                              <div key={criterion.name} className="mb-3 flex flex-col">
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-sm font-medium text-gray-700">{criterion.name} ({criterion.weight}%)</label>
                                  <span className="text-sm text-gray-500">{teamGrades[criterion.name] || 0}/100</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={teamGrades[criterion.name] || 0}
                                  onChange={(e) => handleTeamGradeChange(criterion.name, parseInt(e.target.value))}
                                  className="w-full"
                                />
                              </div>
                            ))}
                          </div>
                          
                          {/* Individual grading form if applicable */}
                          {activeSlot.teamMembers && activeSlot.teamMembers.length > 1 && (
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-700 mb-2">Individual Grades</h4>
                              {/* Add tabs for team members */}
                              <div className="flex gap-2 flex-wrap mb-4">
                                {activeSlot.teamMembers.map((member, idx) => (
                                  <button
                                    key={member.email}
                                    onClick={() => selectTeamMember(member)}
                                    className={`px-3 py-1 rounded text-sm ${
                                      activeTeamMember && activeTeamMember.email === member.email
                                      ? 'bg-indigo-600 text-white' 
                                      : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                  >
                                    {member.name}
                                  </button>
                                ))}
                              </div>

                              {/* Individual member grading */}
                              {activeTeamMember && (
                                <div>
                                  <p className="mb-2 font-medium">Grading: {activeTeamMember.name}</p>
                                  {(presentation.customGradingCriteria ? presentation.gradingCriteria : [
                                    { name: 'Content', weight: 30 },
                                    { name: 'Delivery', weight: 30 },
                                    { name: 'Visual Aids', weight: 20 },
                                    { name: 'Q&A', weight: 20 }
                                  ]).map(criterion => (
                                    <div key={criterion.name} className="mb-3 flex flex-col">
                                      <div className="flex justify-between items-center mb-1">
                                        <label className="text-sm font-medium text-gray-700">{criterion.name} ({criterion.weight}%)</label>
                                        <span className="text-sm text-gray-500">
                                          {individualGrades[activeTeamMember.email]?.[criterion.name] || 0}/100
                                        </span>
                                      </div>
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={individualGrades[activeTeamMember.email]?.[criterion.name] || 0}
                                        onChange={(e) => handleIndividualGradeChange(
                                          activeTeamMember.email, 
                                          criterion.name, 
                                          parseInt(e.target.value)
                                        )}
                                        className="w-full"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Feedback */}
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                            <textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded"
                              rows="4"
                            ></textarea>
                          </div>
                          
                          {/* Save button */}
                          <div className="mt-4">
                            <button
                              onClick={handleSubmitGrades}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Save Updated Grades
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Show readonly grades display
                        <div>
                          {/* Add existing grade display code here */}
                          {/* ... */}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationGrading;
