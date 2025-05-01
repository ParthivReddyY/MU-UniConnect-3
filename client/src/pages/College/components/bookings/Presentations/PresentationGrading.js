import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import api from '../../../../../utils/axiosConfig';
import LoadingSpinner from '../../../../../components/LoadingSpinner';

const PresentationGrading = ({ presentation, activeSlotId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState('team'); // team, individual, feedback
  const [teamGrades, setTeamGrades] = useState({});
  const [individualGrades, setIndividualGrades] = useState({});
  const [feedback, setFeedback] = useState('');
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
  
  // Navigate to next step in the grading process
  const handleNextStep = () => {
    if (activeStep === 'team') {
      // If there's only one team member, skip individual grading
      if (!activeSlot.teamMembers || activeSlot.teamMembers.length <= 1) {
        setActiveStep('feedback');
      } else {
        setActiveStep('individual');
        setSelectedTeamMember(activeSlot.teamMembers[0]);
      }
    } else if (activeStep === 'individual') {
      setActiveStep('feedback');
    }
  };
  
  // Navigate to previous step in the grading process
  const handlePreviousStep = () => {
    if (activeStep === 'feedback') {
      // If there's only one team member, skip individual grading
      if (!activeSlot.teamMembers || activeSlot.teamMembers.length <= 1) {
        setActiveStep('team');
      } else {
        setActiveStep('individual');
      }
    } else if (activeStep === 'individual') {
      setActiveStep('team');
    }
  };
  
  // Navigate to a specific team member in individual grading step
  const handleSelectTeamMember = (member) => {
    setSelectedTeamMember(member);
  };
  
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
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Grade Presentation</h2>
          <p className="text-gray-600">{presentation.title}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm text-gray-600 mb-1">
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
      
      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center 
              ${activeStep === 'team' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}
            `}>
              1
            </div>
            <span className="ml-2 font-medium">Team Score</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200 relative">
            <div className={`absolute inset-0 bg-blue-600 ${
              activeStep === 'team' ? 'w-0' : activeStep === 'individual' ? 'w-1/2' : 'w-full'
            }`}></div>
          </div>
          <div className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center 
              ${activeStep === 'individual' ? 'bg-blue-600 text-white' : 
                activeStep === 'feedback' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-500'}
            `}>
              2
            </div>
            <span className={`ml-2 font-medium ${
              activeStep === 'team' ? 'text-gray-500' : 'text-gray-800'
            }`}>Individual Score</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200 relative">
            <div className={`absolute inset-0 bg-blue-600 ${
              activeStep === 'feedback' ? 'w-full' : 'w-0'
            }`}></div>
          </div>
          <div className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center 
              ${activeStep === 'feedback' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
            `}>
              3
            </div>
            <span className={`ml-2 font-medium ${
              activeStep === 'feedback' ? 'text-gray-800' : 'text-gray-500'
            }`}>Feedback</span>
          </div>
        </div>
      </div>
      
      {/* Team Information Section */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Presentation Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600 text-sm">Topic:</span>
            <p className="font-medium">{activeSlot.topic || 'Not specified'}</p>
          </div>
          
          {activeSlot.teamMembers && activeSlot.teamMembers.length > 0 && (
            <div>
              <span className="text-gray-600 text-sm">Team Members:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {activeSlot.teamMembers.map((member, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {member.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {activeSlot.teamName && (
            <div>
              <span className="text-gray-600 text-sm">Team Name:</span>
              <p className="font-medium">{activeSlot.teamName}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Team Grading Form */}
      {activeStep === 'team' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Team Score</h3>
            <div className="text-3xl font-bold text-blue-600">{calculateTotalScore()}/100</div>
          </div>
          
          <div className="space-y-6">
            {gradingCriteria.map((criterion, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between">
                  <label className="block font-medium text-gray-700">
                    {criterion.name} <span className="text-gray-500 font-normal">({criterion.weight}%)</span>
                  </label>
                  <div className="font-medium text-blue-600">
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
                <div className="grid grid-cols-5 text-xs text-gray-500 mt-1">
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
      
      {/* Individual Grading Form */}
      {activeStep === 'individual' && activeSlot.teamMembers && activeSlot.teamMembers.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Individual Scores</h3>
            {selectedTeamMember && (
              <div className="text-3xl font-bold text-blue-600">
                {calculateIndividualScore(selectedTeamMember.email)}/100
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {activeSlot.teamMembers.map((member, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectTeamMember(member)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium
                  ${selectedTeamMember && selectedTeamMember.email === member.email 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
                `}
              >
                {member.name}
              </button>
            ))}
          </div>
          
          {selectedTeamMember && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Grading: {selectedTeamMember.name}</h4>
                <p className="text-sm text-gray-600">{selectedTeamMember.email}</p>
              </div>
              
              {gradingCriteria.map((criterion, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between">
                    <label className="block font-medium text-gray-700">
                      {criterion.name} <span className="text-gray-500 font-normal">({criterion.weight}%)</span>
                    </label>
                    <div className="font-medium text-blue-600">
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
                  <div className="grid grid-cols-5 text-xs text-gray-500 mt-1">
                    <div className="text-left">Poor (0-20)</div>
                    <div className="text-center">Fair (21-40)</div>
                    <div className="text-center">Good (41-60)</div>
                    <div className="text-center">Very Good (61-80)</div>
                    <div className="text-right">Excellent (81-100)</div>
                  </div>
                </div>
              ))}
              
              {/* Individual member navigation */}
              <div className="flex justify-between pt-4">
                {(() => {
                  const currentIdx = activeSlot.teamMembers.findIndex(
                    m => m.email === selectedTeamMember.email
                  );
                  const prevMember = currentIdx > 0 ? activeSlot.teamMembers[currentIdx - 1] : null;
                  const nextMember = currentIdx < activeSlot.teamMembers.length - 1 
                    ? activeSlot.teamMembers[currentIdx + 1] 
                    : null;
                  
                  return (
                    <>
                      {prevMember ? (
                        <button
                          onClick={() => handleSelectTeamMember(prevMember)}
                          className="px-4 py-2 text-blue-600 flex items-center hover:bg-blue-50 rounded-md"
                        >
                          <i className="fas fa-arrow-left mr-2"></i>
                          Previous Member
                        </button>
                      ) : <div></div>}
                      
                      {nextMember ? (
                        <button
                          onClick={() => handleSelectTeamMember(nextMember)}
                          className="px-4 py-2 text-blue-600 flex items-center hover:bg-blue-50 rounded-md"
                        >
                          Next Member
                          <i className="fas fa-arrow-right ml-2"></i>
                        </button>
                      ) : <div></div>}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Feedback Form */}
      {activeStep === 'feedback' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Feedback</h3>
          </div>
          
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Provide constructive feedback for the presentation (optional):
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your feedback here..."
            ></textarea>
          </div>
          
          {/* Final score summary */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Final Score</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Team weighted average based on the grading criteria
                </p>
              </div>
              <div className="text-4xl font-bold text-blue-600">
                {calculateTotalScore()}/100
              </div>
            </div>
            
            {activeSlot.teamMembers && activeSlot.teamMembers.length > 1 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Individual Scores</h5>
                <div className="space-y-2">
                  {activeSlot.teamMembers.map((member, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm">{member.name}</span>
                      <span className="font-medium">
                        {calculateIndividualScore(member.email)}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Navigation buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <div>
          {activeStep !== 'team' && (
            <button
              onClick={handlePreviousStep}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Previous
            </button>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          
          {activeStep !== 'feedback' ? (
            <button
              onClick={handleNextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
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
                  Submit Grades
                  <i className="fas fa-check ml-2"></i>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresentationGrading;
