import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../../../utils/axiosConfig'; // Fixed import path
import { useAuth } from '../../../../../contexts/AuthContext';
import PresentationGrading from './PresentationGrading';
import LoadingSpinner from '../../../../../components/LoadingSpinner';

const SlotDetailPage = () => {
  const { presentationId, slotId } = useParams();
  const navigate = useNavigate();
  useAuth(); // Keep the hook if authentication is needed for API calls
  
  const [presentation, setPresentation] = useState(null);
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGrading, setShowGrading] = useState(false);
  const [showStartConfirmation, setShowStartConfirmation] = useState(false);

  // Fetch presentation and slot data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First get the presentation
        const presResponse = await api.get(`/api/presentations/${presentationId}`);
        setPresentation(presResponse.data);
        
        // Find the specific slot
        if (presResponse.data && presResponse.data.slots) {
          const matchingSlot = presResponse.data.slots.find(s => 
            (s._id === slotId || s.id === slotId)
          );
          
          if (matchingSlot) {
            setSlot(matchingSlot);
          } else {
            toast.error("Slot not found");
            navigate(`/college/bookings/presentation/${presentationId}`);
          }
        }
      } catch (error) {
        console.error("Error fetching slot details:", error);
        toast.error("Failed to load presentation details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [presentationId, slotId, navigate]);
  
  // Handle start presentation
  const handleStartPresentation = async () => {
    if (!slot) return;
    
    try {
      const slotIdToUse = slot._id || slot.id;
      const response = await api.put(`/api/presentations/slots/${slotIdToUse}/start`, {});
      
      if (response.status === 200) {
        toast.success("Presentation started successfully");
        
        // Update slot with updated data
        setSlot({
          ...slot,
          status: 'in-progress',
          startedAt: new Date()
        });
        
        // Show grading view
        setShowGrading(true);
      }
    } catch (error) {
      console.error("Error starting presentation:", error);
      toast.error("Failed to start presentation");
    } finally {
      setShowStartConfirmation(false);
    }
  };
  
  // Handle grading completion
  const handleGradingComplete = async () => {
    try {
      // Refresh the data
      const response = await api.get(`/api/presentations/${presentationId}`);
      setPresentation(response.data);
      
      // Find updated slot data
      const updatedSlot = response.data.slots.find(s => 
        (s._id === slotId || s.id === slotId)
      );
      
      if (updatedSlot) {
        setSlot(updatedSlot);
      }
      
      setShowGrading(false);
      toast.success("Presentation graded successfully");
    } catch (error) {
      console.error("Error refreshing data after grading:", error);
    }
  };
  
  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Calculate scores for a team member
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
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (showGrading && slot) {
    return (
      <PresentationGrading 
        presentation={presentation}
        activeSlotId={slot._id || slot.id}
        onClose={handleGradingComplete}
      />
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-6 mb-8 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{presentation?.title || 'Presentation'}</h1>
              <p className="text-blue-200">{presentation?.venue || 'Venue not specified'}</p>
            </div>
            <button 
              onClick={() => navigate(`/college/bookings/presentation/${presentationId}`)}
              className="bg-white/20 hover:bg-white/30 transition-colors text-white px-4 py-2 rounded-md flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back to Presentation
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Slot Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <i className="fas fa-clock mr-3 text-blue-300"></i>
                  {formatTime(slot?.time)}
                </h2>
                <p className="text-gray-300 mt-1">
                  {new Date(slot?.time).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="flex items-center">
                <div className={`
                  px-4 py-2 rounded-full font-medium text-sm
                  ${slot?.status === 'completed' ? 'bg-green-500' :
                    slot?.status === 'in-progress' ? 'bg-orange-500' :
                    slot?.status === 'booked' ? 'bg-blue-500' : 'bg-gray-500'
                  }
                `}>
                  {slot?.status === 'booked' ? 'Booked' :
                   slot?.status === 'in-progress' ? 'In Progress' :
                   slot?.status === 'completed' ? 'Completed' : 'Available'}
                </div>
                
                {/* Action buttons for different states */}
                {slot?.status === 'booked' && (
                  <button
                    onClick={() => setShowStartConfirmation(true)}
                    className="ml-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    <i className="fas fa-play mr-2"></i>
                    Start Presentation
                  </button>
                )}
                
                {slot?.status === 'in-progress' && (
                  <button
                    onClick={() => setShowGrading(true)}
                    className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    <i className="fas fa-clipboard-check mr-2"></i>
                    Go to Grading
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Details Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Presentation Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Topic */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Presentation Topic</h3>
                  <p className="text-gray-700">{slot?.topic || 'No topic specified'}</p>
                </div>
                
                {/* Team Information */}
                {slot?.teamName && (
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Team Information</h3>
                    <p className="font-medium text-gray-800 mb-1">Team Name: <span className="text-indigo-700">{slot.teamName}</span></p>
                    <p className="text-gray-600 text-sm">Booked on: {slot.bookedAt ? new Date(slot.bookedAt).toLocaleString() : 'Unknown'}</p>
                  </div>
                )}
                
                {/* Team Members */}
                {slot?.teamMembers && slot.teamMembers.length > 0 && (
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {slot.teamMembers.length > 1 ? 'Team Members' : 'Presenter'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {slot.teamMembers.map((member, idx) => (
                        <div 
                          key={member.email || idx} 
                          className="bg-white p-4 rounded-md shadow-sm border border-gray-100"
                        >
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold mr-3">
                              {member.name.substring(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{member.name}</p>
                              <p className="text-gray-500 text-sm">{member.email}</p>
                            </div>
                          </div>
                          
                          {/* Individual Grades if available */}
                          {slot.status === 'completed' && slot.individualGrades && slot.individualGrades[member.email] && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm font-medium text-gray-700">
                                Individual Score: 
                                <span className="ml-1 text-green-600 font-bold">
                                  {calculateMemberScore(member, slot.individualGrades)}/100
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column - Grading Information */}
              <div className="space-y-6">
                {/* Slot Status Card */}
                <div className={`
                  p-5 rounded-lg text-white
                  ${slot?.status === 'completed' ? 'bg-gradient-to-br from-green-600 to-emerald-700' :
                    slot?.status === 'in-progress' ? 'bg-gradient-to-br from-orange-500 to-amber-700' :
                    'bg-gradient-to-br from-blue-600 to-indigo-700'
                  }
                `}>
                  <h3 className="text-lg font-semibold mb-2">Status Information</h3>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span>Current Status:</span>
                      <span className="font-medium">
                        {slot?.status === 'booked' ? 'Booked & Ready' :
                         slot?.status === 'in-progress' ? 'In Progress' :
                         slot?.status === 'completed' ? 'Completed' : 'Available'}
                      </span>
                    </p>
                    
                    {slot?.startedAt && (
                      <p className="flex justify-between">
                        <span>Started At:</span>
                        <span className="font-medium">
                          {new Date(slot.startedAt).toLocaleString()}
                        </span>
                      </p>
                    )}
                    
                    {slot?.completedAt && (
                      <p className="flex justify-between">
                        <span>Completed At:</span>
                        <span className="font-medium">
                          {new Date(slot.completedAt).toLocaleString()}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Grading Results */}
                {slot?.status === 'completed' && (
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Grading Results</h3>
                    
                    {/* Team Score */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Overall Score</span>
                        <span className="text-2xl font-bold text-green-600">{slot.totalScore || 0}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
                          style={{ width: `${slot.totalScore || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Criteria Breakdown */}
                    {slot.grades && (
                      <div className="space-y-2 mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">Grade Breakdown</h4>
                        {Object.entries(slot.grades).map(([criterion, score]) => (
                          <div key={criterion} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{criterion}</span>
                            <span className="text-sm font-medium text-gray-800">{score}/100</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Feedback */}
                    {slot.feedback && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700 mb-2">Feedback</h4>
                        <div className="bg-gray-50 p-3 rounded text-gray-700 whitespace-pre-wrap text-sm">
                          {slot.feedback}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Start Presentation Confirmation Dialog */}
      {showStartConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Start Presentation?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to start this presentation? This will mark the slot as in-progress and allow grading.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStartConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStartPresentation}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Start Presentation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotDetailPage;
