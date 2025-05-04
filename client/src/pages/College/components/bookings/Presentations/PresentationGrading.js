import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import api from '../../../../../utils/axiosConfig';
import LoadingSpinner from '../../../../../components/LoadingSpinner';

const PresentationGrading = ({ presentation, activeSlotId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [error, setError] = useState(null);
  const [teamGrades, setTeamGrades] = useState({});
  const [individualGrades, setIndividualGrades] = useState({});
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'criteria', 'members', 'feedback'
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  
  // Get the grading criteria from the presentation or use default
  const gradingCriteria = useMemo(() => {
    // Default grading criteria if not specified by presentation
    const defaultGradingCriteria = [
      { name: 'Content', weight: 30 },
      { name: 'Delivery', weight: 30 },
      { name: 'Visual Aids', weight: 20 },
      { name: 'Q&A', weight: 20 }
    ];
    
    if (!presentation) return defaultGradingCriteria;
    return presentation.gradingCriteria && presentation.gradingCriteria.length > 0 
      ? presentation.gradingCriteria 
      : defaultGradingCriteria;
  }, [presentation]);
  
  // Get the active slot data when component mounts
  useEffect(() => {
    const fetchSlotData = async () => {
      if (!activeSlotId || !presentation) {
        setError('Missing slot or presentation data');
        setLoading(false);
        return;
      }
      
      try {
        const response = await api.get(`/api/presentations/slots/${activeSlotId}`);
        
        if (!response.data) {
          throw new Error('Slot not found');
        }
        
        setActiveSlot(response.data);
        
        // Initialize grading form with existing data if it's already graded
        if (response.data.grades) {
          setTeamGrades(response.data.grades);
        } else {
          // Initialize with empty grades for each criterion
          const initialGrades = {};
          gradingCriteria.forEach(criterion => {
            initialGrades[criterion.name] = 0;
          });
          setTeamGrades(initialGrades);
        }
        
        // Initialize individual grades if they exist
        if (response.data.individualGrades) {
          setIndividualGrades(response.data.individualGrades);
        } else if (response.data.teamMembers?.length > 0) {
          // Initialize with empty grades for each team member
          const initialIndividualGrades = {};
          response.data.teamMembers.forEach(member => {
            if (member.email) {
              initialIndividualGrades[member.email] = {};
              gradingCriteria.forEach(criterion => {
                initialIndividualGrades[member.email][criterion.name] = 0;
              });
            }
          });
          setIndividualGrades(initialIndividualGrades);
        }
        
        // Initialize feedback
        setFeedback(response.data.feedback || '');
        
        // Set the first team member as the selected member for individual grading
        if (response.data.teamMembers && response.data.teamMembers.length > 0) {
          setSelectedTeamMember(response.data.teamMembers[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching slot data:', err);
        
        // Improved error handling
        if (err.response?.status === 403) {
          setError('You do not have permission to view or grade this presentation');
        } else {
          setError(err.response?.data?.message || 'Failed to load presentation slot data');
        }
        setLoading(false);
      }
    };
    
    fetchSlotData();
  }, [activeSlotId, presentation, gradingCriteria]);
  
  // Handle team grade change for a specific criterion
  const handleGradeChange = useCallback((criterionName, value) => {
    setTeamGrades(prev => ({
      ...prev,
      [criterionName]: Math.max(0, Math.min(100, parseInt(value) || 0))
    }));
  }, []);
  
  // Handle individual grade change for specific team member and criterion
  const handleIndividualGradeChange = useCallback((memberEmail, criterionName, value) => {
    setIndividualGrades(prev => {
      const updatedGrades = { ...prev };
      if (!updatedGrades[memberEmail]) {
        updatedGrades[memberEmail] = {};
      }
      
      updatedGrades[memberEmail][criterionName] = Math.max(0, Math.min(100, parseInt(value) || 0));
      return updatedGrades;
    });
  }, []);
  
  // Calculate team's overall score based on criteria weights
  const calculateTotalScore = useCallback(() => {
    if (!teamGrades || Object.keys(teamGrades).length === 0) return 0;
    
    let weightedSum = 0;
    let validWeightSum = 0;
    
    gradingCriteria.forEach(criterion => {
      if (teamGrades[criterion.name] !== undefined) {
        weightedSum += (teamGrades[criterion.name] * criterion.weight);
        validWeightSum += criterion.weight;
      }
    });
    
    if (validWeightSum === 0) return 0;
    return Math.round(weightedSum / validWeightSum);
  }, [teamGrades, gradingCriteria]);
  
  // Calculate individual score for a team member
  const calculateIndividualScore = useCallback((memberEmail) => {
    if (!individualGrades[memberEmail]) return 0;
    
    let weightedSum = 0;
    let validWeightSum = 0;
    
    gradingCriteria.forEach(criterion => {
      if (individualGrades[memberEmail][criterion.name] !== undefined) {
        weightedSum += (individualGrades[memberEmail][criterion.name] * criterion.weight);
        validWeightSum += criterion.weight;
      }
    });
    
    if (validWeightSum === 0) return 0;
    return Math.round(weightedSum / validWeightSum);
  }, [individualGrades, gradingCriteria]);

  // Copy team grades to individual grades for selected member
  const copyTeamGradesToIndividual = useCallback((memberEmail) => {
    if (!memberEmail || !teamGrades) return;

    setIndividualGrades(prev => {
      const updatedGrades = { ...prev };
      if (!updatedGrades[memberEmail]) {
        updatedGrades[memberEmail] = {};
      }
      
      gradingCriteria.forEach(criterion => {
        updatedGrades[memberEmail][criterion.name] = teamGrades[criterion.name] || 0;
      });
      
      return updatedGrades;
    });
    
    toast.info('Team grades copied to individual');
  }, [teamGrades, gradingCriteria]);
  
  // Handle form submission
  const handleSubmit = async () => {
    if (submitting) return;
    
    // Calculate scores
    const totalScore = calculateTotalScore();
    
    try {
      setSubmitting(true);
      
      // Submit grades to the server
      const response = await api.post(`/api/presentations/slots/${activeSlotId}/grades`, {
        grades: teamGrades,
        individualGrades,
        feedback,
        totalScore
      });
      
      if (response.status === 200) {
        toast.success('Presentation graded successfully!');
        onClose();
      }
    } catch (err) {
      console.error('Error submitting grades:', err);
      
      // Improved error handling
      if (err.response?.status === 403) {
        toast.error('You do not have permission to grade this presentation');
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit grades');
      }
      setSubmitting(false);
    }
  };
  
  // Render loading spinner while fetching data
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Render error message if there's an error
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-circle text-4xl"></i>
          </div>
          <h2 className="text-xl font-bold mb-4">{error}</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  // Render no slot data message
  if (!activeSlot) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <div className="text-amber-500 mb-4">
            <i className="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <h2 className="text-xl font-bold mb-4">No presentation slot data found</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Grade Presentation</h2>
            <p className="text-blue-100">{presentation.title}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100 mb-1">
              {new Date(activeSlot.time).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="text-lg font-medium">
              {new Date(activeSlot.time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          <button
            className={`px-4 py-3 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'overview' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-info-circle mr-2"></i>
            Overview
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'criteria' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('criteria')}
          >
            <i className="fas fa-list-ul mr-2"></i>
            Team Grading
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'members' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('members')}
          >
            <i className="fas fa-users mr-2"></i>
            Individual Grading
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm border-b-2 focus:outline-none ${
              activeTab === 'feedback' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('feedback')}
          >
            <i className="fas fa-comment-alt mr-2"></i>
            Feedback
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-6">
              {/* Left column - Presentation Info */}
              <div className="md:w-1/2 bg-white p-5 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">Presentation Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-gray-600 w-24 flex-shrink-0">Topic:</span>
                    <span className="font-medium text-gray-800">{activeSlot.topic || 'Not specified'}</span>
                  </div>
                  {activeSlot.teamName && (
                    <div className="flex items-start">
                      <span className="text-gray-600 w-24 flex-shrink-0">Team Name:</span>
                      <span className="font-medium text-gray-800">{activeSlot.teamName}</span>
                    </div>
                  )}
                  <div className="flex items-start">
                    <span className="text-gray-600 w-24 flex-shrink-0">Booked on:</span>
                    <span className="font-medium text-gray-800">
                      {activeSlot.bookedAt ? new Date(activeSlot.bookedAt).toLocaleString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Right column - Team Score */}
              <div className="md:w-1/2 bg-white p-5 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">Current Score Summary</h3>
                <div className="flex justify-center items-center mb-4">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                      />
                      {/* Progress circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeDasharray={`${calculateTotalScore()}, 100`}
                        strokeLinecap="round"
                      />
                      {/* Main score number */}
                      <text 
                        x="18" 
                        y="17" 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="#10B981"
                        fontSize="10px"
                        fontWeight="bold"
                      >
                        {calculateTotalScore()}
                      </text>
                      {/* /100 label */}
                      <text 
                        x="18" 
                        y="24" 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="#6B7280"
                        fontSize="3.5px"
                      >
                        /100
                      </text>
                    </svg>
                  </div>
                </div>
                <div className="text-center text-gray-700">Team Overall Score</div>
                
                {/* Individual scores summary */}
                {activeSlot.teamMembers && activeSlot.teamMembers.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Individual Scores</h4>
                    <div className="space-y-2">
                      {activeSlot.teamMembers.map((member, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm">{member.name}</span>
                          <span className="font-medium text-sm">
                            {calculateIndividualScore(member.email)}/100
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Team Members Section */}
            <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Team Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSlot.teamMembers && activeSlot.teamMembers.map((member, idx) => (
                  <div key={idx} className="flex items-start p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-semibold mr-3">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{member.name}</div>
                      <div className="text-sm text-gray-600">{member.email}</div>
                      {member.rollNumber && (
                        <div className="text-sm text-gray-500">Roll: {member.rollNumber}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Score Summary by Criteria */}
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Grading Progress</h3>
              <div className="space-y-4">
                {gradingCriteria.map((criterion, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {criterion.name} ({criterion.weight}%)
                      </span>
                      <span className="text-sm text-gray-600">{teamGrades[criterion.name] || 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${teamGrades[criterion.name] || 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Team Grading Tab */}
        {activeTab === 'criteria' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-800">Team Evaluation</h3>
              <div className="text-3xl font-bold text-blue-600">{calculateTotalScore()}/100</div>
            </div>
            
            <div className="space-y-8">
              {gradingCriteria.map((criterion, idx) => (
                <div key={idx} className="bg-white p-5 rounded-lg shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-800">{criterion.name}</h4>
                      <p className="text-sm text-gray-500">Weight: {criterion.weight}% of total</p>
                    </div>
                    <div className="mt-2 md:mt-0 font-bold text-blue-600 text-xl">
                      {teamGrades[criterion.name] || 0}/100
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={teamGrades[criterion.name] || 0}
                      onChange={(e) => handleGradeChange(criterion.name, e.target.value)}
                      className="flex-1 h-2 accent-blue-600"
                    />
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={teamGrades[criterion.name] || 0}
                      onChange={(e) => handleGradeChange(criterion.name, e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  
                  <div className="grid grid-cols-5 text-xs text-gray-500 mt-2">
                    <div className="text-left">Poor (0-20)</div>
                    <div className="text-center">Fair (21-40)</div>
                    <div className="text-center">Good (41-60)</div>
                    <div className="text-center">Very Good (61-80)</div>
                    <div className="text-right">Excellent (81-100)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Individual Grading Tab */}
        {activeTab === 'members' && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-6">Individual Member Evaluation</h3>
            
            {/* Member selection tabs */}
            {activeSlot.teamMembers && activeSlot.teamMembers.length > 1 ? (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
                  {activeSlot.teamMembers.map((member, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTeamMember(member)}
                      className={`
                        px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${selectedTeamMember && selectedTeamMember.email === member.email 
                          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}
                      `}
                    >
                      {member.name}
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        ({calculateIndividualScore(member.email)}/100)
                      </span>
                    </button>
                  ))}
                </div>
                
                {/* Individual grading content for selected member */}
                {selectedTeamMember && (
                  <div className="mt-6">
                    <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-3">
                            {selectedTeamMember.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 mb-1">{selectedTeamMember.name}</h4>
                            <p className="text-sm text-gray-600">{selectedTeamMember.email}</p>
                            {selectedTeamMember.rollNumber && (
                              <p className="text-sm text-gray-500 mb-3">Roll Number: {selectedTeamMember.rollNumber}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <div className="text-3xl font-bold text-blue-600">
                            {calculateIndividualScore(selectedTeamMember.email)}/100
                          </div>
                          <button 
                            onClick={() => copyTeamGradesToIndividual(selectedTeamMember.email)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Copy team grades to this member
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {gradingCriteria.map((criterion, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-lg shadow-sm">
                          <div className="flex justify-between mb-4">
                            <div>
                              <h4 className="font-medium text-gray-800">{criterion.name}</h4>
                              <p className="text-sm text-gray-500">Weight: {criterion.weight}% of total</p>
                            </div>
                            <div className="font-bold text-blue-600 text-xl">
                              {(selectedTeamMember.email && 
                               individualGrades[selectedTeamMember.email] && 
                               individualGrades[selectedTeamMember.email][criterion.name]) || 0}/100
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={
                                (selectedTeamMember.email && 
                                individualGrades[selectedTeamMember.email] && 
                                individualGrades[selectedTeamMember.email][criterion.name]) || 0
                              }
                              onChange={(e) => handleIndividualGradeChange(
                                selectedTeamMember.email, 
                                criterion.name, 
                                e.target.value
                              )}
                              className="flex-1 h-2 accent-blue-600"
                            />
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              value={
                                (selectedTeamMember.email && 
                                individualGrades[selectedTeamMember.email] && 
                                individualGrades[selectedTeamMember.email][criterion.name]) || 0
                              }
                              onChange={(e) => handleIndividualGradeChange(
                                selectedTeamMember.email, 
                                criterion.name, 
                                e.target.value
                              )}
                              className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                            />
                          </div>
                          
                          <div className="grid grid-cols-5 text-xs text-gray-500 mt-2">
                            <div className="text-left">Poor (0-20)</div>
                            <div className="text-center">Fair (21-40)</div>
                            <div className="text-center">Good (41-60)</div>
                            <div className="text-center">Very Good (61-80)</div>
                            <div className="text-right">Excellent (81-100)</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <p className="text-yellow-700">
                  <i className="fas fa-info-circle mr-2"></i>
                  This is a single presenter. Individual grading is not necessary.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Feedback & Comments</h3>
            
            <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provide constructive feedback for the presentation:
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your feedback here..."
              ></textarea>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>
                  <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                  Tip: Include specific points about what was done well and areas for improvement.
                </p>
              </div>
            </div>
            
            {/* Final score summary */}
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Final Score Summary</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Team weighted average based on the grading criteria
                  </p>
                </div>
                <div className="flex items-center mt-4 md:mt-0">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                      />
                      {/* Progress circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeDasharray={`${calculateTotalScore()}, 100`}
                        strokeLinecap="round"
                      />
                      {/* Main score number */}
                      <text 
                        x="18" 
                        y="17" 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="#10B981"
                        fontSize="10px"
                        fontWeight="bold"
                      >
                        {calculateTotalScore()}
                      </text>
                      {/* /100 label */}
                      <text 
                        x="18" 
                        y="24" 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="#6B7280"
                        fontSize="3.5px"
                      >
                        /100
                      </text>
                    </svg>
                  </div>
                </div>
              </div>
              
              {activeSlot.teamMembers && activeSlot.teamMembers.length > 1 && (
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Individual Scores</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeSlot.teamMembers.map((member, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-md border border-blue-100">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold mr-2">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{member.name}</span>
                        </div>
                        <span className="text-xl font-bold text-blue-600">
                          {calculateIndividualScore(member.email)}<span className="text-sm text-gray-400">/100</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with action buttons */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </div>
          ) : (
            <>
              Submit Grading
              <i className="fas fa-check ml-2"></i>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PresentationGrading;
