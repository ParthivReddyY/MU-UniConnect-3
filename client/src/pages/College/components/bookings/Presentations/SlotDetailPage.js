import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../../../utils/axiosConfig';
import { useAuth } from '../../../../../contexts/AuthContext';
import PresentationGrading from './PresentationGrading';
import LoadingSpinner from '../../../../../components/LoadingSpinner';

const SlotDetailPage = () => {
  const { presentationId, slotId } = useParams();
  const navigate = useNavigate();
  useAuth();
  
  const [presentation, setPresentation] = useState(null);
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGrading, setShowGrading] = useState(false);
  const [showStartConfirmation, setShowStartConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Fetch presentation and slot data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the presentation data
        const presentationResponse = await api.get(`/api/presentations/${presentationId}`);
        setPresentation(presentationResponse.data);
        
        // Find the slot in the presentation data
        const foundSlot = presentationResponse.data.slots.find(s => 
          (s._id === slotId || s.id === slotId)
        );
        
        if (foundSlot) {
          setSlot(foundSlot);
        } else {
          // If slot wasn't found in presentation data, try to fetch it directly
          const slotResponse = await api.get(`/api/presentations/slots/${slotId}`);
          setSlot(slotResponse.data);
        }
      } catch (error) {
        console.error("Error fetching presentation or slot data:", error);
        toast.error(error.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [presentationId, slotId]);

  // Handle starting a presentation
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
        
        // Show grading view immediately
        setShowGrading(true);
      }
    } catch (error) {
      console.error("Error starting presentation:", error);
      
      // Improved error handling
      if (error.response?.status === 403) {
        toast.error("You do not have permission to start this presentation");
      } else {
        toast.error(error.response?.data?.message || "Failed to start presentation");
      }
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
        // Auto-switch to grades tab after grading is completed
        setActiveTab('grades');
      } else {
        console.warn("Could not find updated slot data");
      }
      
      setShowGrading(false);
      toast.success("Presentation graded successfully");
    } catch (error) {
      console.error("Error refreshing data after grading:", error);
      toast.error("Failed to refresh presentation data");
    }
  };
  
  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Calculate individual score for a team member
  const calculateMemberScore = (member, individualGrades) => {
    if (!individualGrades || !member || !member.email || !individualGrades[member.email]) return 0;
    
    // Get criteria from presentation or use default
    const criteria = presentation?.gradingCriteria || [
      { name: 'Content', weight: 30 },
      { name: 'Delivery', weight: 30 },
      { name: 'Visual Aids', weight: 20 },
      { name: 'Q&A', weight: 20 }
    ];
    
    let totalScore = 0;
    let totalWeight = 0;
    
    criteria.forEach(criterion => {
      const rawScore = individualGrades[member.email][criterion.name] || 0;
      totalScore += (rawScore * criterion.weight / 100);
      totalWeight += criterion.weight;
    });
    
    if (totalWeight === 0) return 0;
    return Math.round(totalScore * 10) / 10;
  };

  // Render team members table with roll numbers
  const renderTeamMembersTable = () => {
    if (!slot?.teamMembers || slot.teamMembers.length === 0) {
      return <div className="text-gray-500 italic">No team members information available</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {slot.teamMembers.map((member, idx) => (
              <tr key={idx} className={idx === 0 ? "bg-blue-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4 font-medium text-gray-900">{member.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {member.rollNumber ? member.rollNumber : 'Not specified'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {idx === 0 ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                      Team Lead
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                      Member
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render individual grades table with roll numbers
  const renderIndividualGrades = () => {
    if (!slot?.teamMembers || !slot.individualGrades) return null;

    return (
      <div className="mt-6">
        <h4 className="font-medium text-gray-700 mb-3">Individual Scores</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {slot.teamMembers.map((member, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3 text-sm font-medium text-gray-900">{member.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {member.rollNumber ? member.rollNumber : 'Not specified'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span className="text-lg font-semibold text-gray-900">
                      {calculateMemberScore(member, slot.individualGrades)}
                    </span>
                    <span className="text-gray-500 text-sm">/100</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
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
              <p className="text-blue-200 mt-1">
                {slot?.time ? new Date(slot.time).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric', 
                  month: 'short',
                  day: 'numeric'
                }) : ''}
                <span className="mx-2">•</span>
                <span className="font-medium">
                  {slot?.time ? formatTime(slot.time) : ''}
                </span>
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/college/bookings/presentation/${presentationId}/details`)}
                className="px-4 py-2 bg-white/20 rounded-md hover:bg-white/30 transition"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Presentation
              </button>
              
              {/* Action buttons for different states - Simplified access to grading */}
              {slot?.status === 'booked' && (
                <button
                  onClick={() => setShowStartConfirmation(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                  <i className="fas fa-play mr-2"></i>
                  Start Presentation
                </button>
              )}
              
              {(slot?.status === 'in-progress' || slot?.status === 'completed') && (
                <button
                  onClick={() => setShowGrading(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                  <i className="fas fa-clipboard-check mr-2"></i>
                  {slot?.status === 'completed' ? 'Edit Grading' : 'Grade Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    
      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                  activeTab === 'details' 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('details')}
              >
                <i className="fas fa-info-circle mr-2"></i>
                Details
              </button>
              
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                  activeTab === 'members' 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('members')}
              >
                <i className="fas fa-users mr-2"></i>
                Team Members
              </button>
              
              {slot?.status === 'completed' && (
                <button
                  className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                    activeTab === 'grades' 
                      ? 'border-b-2 border-blue-500 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('grades')}
                >
                  <i className="fas fa-star mr-2"></i>
                  Grades
                </button>
              )}
            </div>
          </div>
          
          {/* Content Panel */}
          <div className="p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Basic Information Card */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Presentation Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Topic</h4>
                      <p className="text-gray-700 bg-white p-3 rounded-md border border-gray-200">
                        {slot?.topic || 'No topic specified'}
                      </p>
                    </div>
                    
                    {slot?.teamName && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">Team Name</h4>
                        <p className="text-gray-700 bg-white p-3 rounded-md border border-gray-200">
                          {slot.teamName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Status Information */}
                <div className={`
                  p-5 rounded-lg text-white
                  ${slot?.status === 'completed' ? 'bg-gradient-to-br from-green-600 to-emerald-700' :
                    slot?.status === 'in-progress' ? 'bg-gradient-to-br from-orange-500 to-amber-700' :
                    'bg-gradient-to-br from-blue-600 to-indigo-700'
                  }
                `}>
                  <h3 className="text-lg font-semibold mb-4">Status Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-white/80 text-sm mb-1">Current Status</h4>
                      <p className="font-medium">
                        {slot?.status === 'booked' ? 'Booked & Ready' :
                         slot?.status === 'in-progress' ? 'In Progress' :
                         slot?.status === 'completed' ? 'Completed' : 'Available'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-white/80 text-sm mb-1">Booking Time</h4>
                      <p className="font-medium">
                        {slot?.bookedAt ? new Date(slot.bookedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    
                    {slot?.startedAt && (
                      <div>
                        <h4 className="text-white/80 text-sm mb-1">Started At</h4>
                        <p className="font-medium">
                          {new Date(slot.startedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    {slot?.completedAt && (
                      <div>
                        <h4 className="text-white/80 text-sm mb-1">Completed At</h4>
                        <p className="font-medium">
                          {new Date(slot.completedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    {slot?.status === 'completed' && (
                      <div className="md:col-span-2 mt-2 pt-4 border-t border-white/20">
                        <h4 className="text-white/80 text-sm mb-1">Overall Score</h4>
                        <div className="flex items-end">
                          <span className="text-4xl font-bold">{slot.totalScore || 0}</span>
                          <span className="text-xl text-white/80 mb-1">/100</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {renderTeamMembersTable()}
              </div>
            )}
            
            {/* Team Members Tab */}
            {activeTab === 'members' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {slot?.teamMembers?.length > 1 ? 'Team Members' : 'Presenter'} Information
                </h3>
                
                {slot?.teamMembers && slot.teamMembers.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {slot.teamMembers.map((member, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start">
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl mr-4">
                            {member.name ? member.name.substring(0, 1).toUpperCase() : 'U'}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-800">{member.name}</h4>
                            <p className="text-gray-600 mb-2">{member.email}</p>
                            {member.rollNumber && (
                              <p className="text-sm text-gray-500 mb-3">Roll Number: {member.rollNumber}</p>
                            )}
                            
                            {idx === 0 && slot.teamMembers.length > 1 && (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Team Lead
                              </span>
                            )}
                            
                            {/* Individual score if completed */}
                            {slot.status === 'completed' && slot.individualGrades && slot.individualGrades[member.email] && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-700">Individual Score:</span>
                                  <span className="text-xl font-bold text-green-600">
                                    {calculateMemberScore(member, slot.individualGrades)}/100
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-yellow-700">
                      <i className="fas fa-exclamation-circle mr-2"></i>
                      No team member information is available for this presentation.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Grades Tab */}
            {activeTab === 'grades' && slot?.status === 'completed' && (
              <div className="space-y-6">
                {/* Team Score Card */}
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-4">Team Score</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {/* Circle Progress */}
                    <div className="md:w-1/3 flex justify-center">
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
                            strokeDasharray={`${slot.totalScore || 0}, 100`}
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
                            {slot.totalScore || 0}
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
                    
                    {/* Criteria Breakdown */}
                    <div className="md:w-2/3">
                      <h4 className="font-medium text-gray-700 mb-3">Criteria Breakdown</h4>
                      {slot.grades && Object.entries(slot.grades).map(([criterion, score]) => (
                        <div key={criterion} className="mb-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{criterion}</span>
                            <span className="text-sm text-gray-600">{score}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {renderIndividualGrades()}
                
                {/* Feedback Card */}
                {slot.feedback && (
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3">Feedback</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap">
                      {slot.feedback}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Start Presentation Confirmation Dialog */}
      {showStartConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-play text-green-600 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Start Presentation?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to start this presentation? This will mark the slot as in-progress and allow grading.
              </p>
              <div className="flex justify-center space-x-3">
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
        </div>
      )}
    </div>
  );
};

export default SlotDetailPage;
