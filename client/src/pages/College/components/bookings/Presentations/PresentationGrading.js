import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../../../../utils/axiosConfig';
import { useAuth } from '../../../../../contexts/AuthContext';

const PresentationGrading = ({ presentation, onClose }) => {
  useAuth(); // Access auth context but don't extract unused variables
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [slots, setSlots] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [grades, setGrades] = useState({});
  const [presentationInProgress, setPresentationInProgress] = useState(false);
  const [presentationCompleted, setPresentationCompleted] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!presentation) return;
    
    const fetchSlots = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/presentations/${presentation._id}/slots`);
        setSlots(response.data);
        
        // Check if there's an active presentation
        const inProgressSlot = response.data.find(slot => slot.status === 'in-progress');
        if (inProgressSlot) {
          setActiveSlot(inProgressSlot);
          setPresentationInProgress(true);
        }
      } catch (error) {
        console.error('Error fetching presentation slots:', error);
        toast.error('Failed to load presentation slots');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSlots();
  }, [presentation]); // Removed fetchSlots from dependency array

  const handleStartPresentation = async (slot) => {
    try {
      setSubmitting(true);
      const response = await api.put(`/api/presentations/slots/${slot._id}/start`);
      
      if (response.data.success) {
        setActiveSlot(slot);
        setPresentationInProgress(true);
        
        // Update the slot in the slots array
        setSlots(slots.map(s => s._id === slot._id ? { ...s, status: 'in-progress' } : s));
        
        toast.success('Presentation started successfully');
      }
    } catch (error) {
      console.error('Error starting presentation:', error);
      toast.error('Failed to start presentation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeChange = (criterionName, value) => {
    setGrades(prev => ({
      ...prev,
      [criterionName]: parseInt(value, 10) || 0
    }));
  };

  const handleCompletePresentation = async () => {
    if (!activeSlot) return;
    
    // Validate all criteria have been graded
    const criteria = presentation.customGradingCriteria ? presentation.gradingCriteria : [
      { name: 'Content', weight: 30 },
      { name: 'Delivery', weight: 30 },
      { name: 'Visual Aids', weight: 20 },
      { name: 'Q&A', weight: 20 }
    ];
    
    const missingGrades = criteria.filter(criterion => 
      grades[criterion.name] === undefined || grades[criterion.name] === null
    );
    
    if (missingGrades.length > 0) {
      toast.error(`Please grade all criteria before completing: ${missingGrades.map(c => c.name).join(', ')}`);
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Calculate weighted score
      const totalScore = criteria.reduce((sum, criterion) => {
        const rawScore = grades[criterion.name] || 0;
        const weightedScore = (rawScore * criterion.weight) / 100;
        return sum + weightedScore;
      }, 0);
      
      const response = await api.put(`/api/presentations/slots/${activeSlot._id}/complete`, {
        grades,
        totalScore,
        feedback
      });
      
      if (response.data.success) {
        setPresentationInProgress(false);
        setPresentationCompleted(true);
        
        // Update the slot in the slots array
        setSlots(slots.map(s => s._id === activeSlot._id ? { ...s, status: 'completed', grades, totalScore } : s));
        
        toast.success('Presentation graded successfully');
        
        // Reset for next presentation
        setTimeout(() => {
          setActiveSlot(null);
          setPresentationCompleted(false);
          setGrades({});
          setFeedback('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error completing presentation:', error);
      toast.error('Failed to complete presentation');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTimeSlot = (slot) => {
    if (!slot.scheduleTime) return 'Time not set';
    
    try {
      const scheduleTime = new Date(slot.scheduleTime);
      const hours = scheduleTime.getHours();
      const minutes = scheduleTime.getMinutes();
      
      const formattedHours = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      return 'Invalid time';
    }
  };

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

  const exportToCSV = () => {
    // Create array of row objects
    const rows = slots.map(slot => {
      const baseRow = {
        'Slot Time': calculateTimeSlot(slot),
        'Student/Team': slot.participants?.map(p => p.name).join(', ') || 'Not assigned',
        'Status': slot.status
      };
      
      // Add grade columns if this is a completed slot
      if (slot.status === 'completed' && slot.grades) {
        Object.keys(slot.grades).forEach(criterion => {
          baseRow[criterion] = slot.grades[criterion];
        });
        
        baseRow['Total Score'] = slot.totalScore || 0;
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
      const csvRow = columns.map(column => {
        const value = row[column] !== undefined ? row[column] : '';
        // Escape commas and quotes
        const escapedValue = typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        return escapedValue;
      }).join(',');
      csvContent += csvRow + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `presentation-grades-${presentation.title.replace(/[^a-zA-Z0-9]/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
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
                      key={slot._id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        activeSlot?._id === slot._id ? 'bg-indigo-50' : ''
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
                          {slot.participants?.map(p => p.name).join(', ') || 'Not assigned'}
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
                  <h4 className="font-medium text-gray-700 mb-3">Grade Breakdown</h4>
                  <div className="space-y-3">
                    {Object.entries(grades).map(([criterion, score]) => (
                      <div key={criterion} className="flex justify-between items-center">
                        <span className="text-gray-600">{criterion}</span>
                        <span className="font-medium">{score}/100</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-medium text-gray-800">Total Score</span>
                      <span className="font-bold text-green-600">{activeSlot.totalScore || 0}/100</span>
                    </div>
                  </div>
                  
                  {feedback && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-700 mb-2">Feedback</h4>
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                        <p className="text-gray-600 whitespace-pre-wrap">{feedback}</p>
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
                    {activeSlot.participants?.map(p => p.name).join(', ') || 'Unnamed presentation'} - {calculateTimeSlot(activeSlot)}
                  </p>
                </div>
                
                <div className="p-6">
                  <h4 className="font-medium text-gray-700 mb-4">Grading Criteria</h4>
                  
                  <div className="space-y-6">
                    {(presentation.customGradingCriteria ? presentation.gradingCriteria : [
                      { name: 'Content', weight: 30 },
                      { name: 'Delivery', weight: 30 },
                      { name: 'Visual Aids', weight: 20 },
                      { name: 'Q&A', weight: 20 }
                    ]).map(criterion => (
                      <div key={criterion.name} className="space-y-2">
                        <div className="flex justify-between">
                          <label className="block font-medium text-gray-700">
                            {criterion.name} <span className="text-sm text-gray-500">({criterion.weight}%)</span>
                          </label>
                          <span className="text-sm font-medium text-gray-700">
                            {grades[criterion.name] || 0}/100
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={grades[criterion.name] || 0}
                          onChange={(e) => handleGradeChange(criterion.name, e.target.value)}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0</span>
                          <span>25</span>
                          <span>50</span>
                          <span>75</span>
                          <span>100</span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-gray-200">
                      <label className="block font-medium text-gray-700 mb-2">
                        Feedback (optional)
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Provide feedback for the presentation..."
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleCompletePresentation}
                      disabled={submitting}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
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
                          <i className="fas fa-save mr-2"></i>
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
                        {activeSlot.participants?.map(p => p.name).join(', ') || 'Unnamed presentation'}
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
                    <div className="pt-4">
                      <h4 className="font-medium text-gray-700 mb-3">Grade Breakdown</h4>
                      <div className="space-y-3">
                        {Object.entries(activeSlot.grades || {}).map(([criterion, score]) => (
                          <div key={criterion} className="flex justify-between items-center">
                            <span className="text-gray-600">{criterion}</span>
                            <span className="font-medium">{score}/100</span>
                          </div>
                        ))}
                        <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                          <span className="font-medium text-gray-800">Total Score</span>
                          <span className="font-bold text-green-600">{activeSlot.totalScore || 0}/100</span>
                        </div>
                      </div>
                      
                      {activeSlot.feedback && (
                        <div className="mt-6">
                          <h4 className="font-medium text-gray-700 mb-2">Feedback</h4>
                          <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <p className="text-gray-600 whitespace-pre-wrap">{activeSlot.feedback}</p>
                          </div>
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
