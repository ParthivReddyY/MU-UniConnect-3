import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../utils/axiosConfig';

const HostPresentation = () => {
  const navigate = useNavigate();
  const { currentUser, isFaculty, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [facultyPresentations, setFacultyPresentations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    presentationType: 'Academic',
    maxParticipants: 1
  });

  // Check if the user is faculty or admin
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/college/bookings/host-presentation' } });
      return;
    }

    if (!isFaculty() && !isAdmin()) {
      navigate('/unauthorized');
      return;
    }

    // Load existing presentations created by this faculty member
    const fetchFacultyPresentations = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/presentations/faculty');
        setFacultyPresentations(response.data);
      } catch (err) {
        console.error('Error fetching faculty presentations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyPresentations();
  }, [currentUser, isFaculty, isAdmin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/presentations', formData);
      
      if (response.data.success) {
        // Add the new presentation to the list
        setFacultyPresentations([...facultyPresentations, response.data.presentation]);
        
        // Reset form and hide it
        setFormData({
          title: '',
          description: '',
          date: '',
          startTime: '',
          endTime: '',
          location: '',
          presentationType: 'Academic',
          maxParticipants: 1
        });
        setShowForm(false);
        alert('Presentation slot created successfully!');
      }
    } catch (err) {
      console.error('Error creating presentation slot:', err);
      alert(err.response?.data?.message || 'Failed to create presentation slot');
    } finally {
      setLoading(false);
    }
  };

  const cancelPresentation = async (id) => {
    if (window.confirm('Are you sure you want to cancel this presentation slot?')) {
      try {
        const response = await api.delete(`/api/presentations/${id}`);
        
        if (response.data.success) {
          // Remove the presentation from the list
          setFacultyPresentations(facultyPresentations.filter(p => p._id !== id));
          alert('Presentation slot cancelled successfully.');
        }
      } catch (err) {
        console.error('Error cancelling presentation slot:', err);
        alert(err.response?.data?.message || 'Failed to cancel presentation slot');
      }
    }
  };

  return (
    <div className="px-6 py-10 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Host Presentation Slots</h2>
            <p className="text-gray-600 max-w-2xl">
              Create and manage presentation slots for student presentations, project defenses, or demonstrations
            </p>
          </div>
          <div className="flex mt-4 md:mt-0 space-x-4">
            <button 
              onClick={() => setShowForm(!showForm)}
              className={`${showForm ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white py-2 px-4 rounded-md transition-colors flex items-center`}
            >
              <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'} mr-2`}></i>
              {showForm ? 'Cancel' : 'Create New Slot'}
            </button>
            <Link 
              to="/college/bookings"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition-colors flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Bookings
            </Link>
          </div>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Create New Presentation Slot</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title/Purpose
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g., Final Project Presentation"
                    />
                  </div>

                  <div>
                    <label htmlFor="presentationType" className="block text-sm font-medium text-gray-700 mb-1">
                      Presentation Type
                    </label>
                    <select
                      id="presentationType"
                      name="presentationType"
                      value={formData.presentationType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Project Defense">Project Defense</option>
                      <option value="Thesis">Thesis</option>
                      <option value="Research">Research</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g., Room 301, ECSE Building"
                    />
                  </div>

                  <div>
                    <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Participants
                    </label>
                    <input
                      type="number"
                      id="maxParticipants"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Additional details about the presentation slot..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="mr-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-6 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-md transition-colors flex items-center"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin inline-block h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-calendar-plus mr-2"></i>
                        Create Slot
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Your Presentation Slots</h3>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : facultyPresentations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-times text-indigo-600 text-2xl"></i>
              </div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">No Presentation Slots Created</h4>
              <p className="text-gray-600">
                You haven't created any presentation slots yet. Click "Create New Slot" to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facultyPresentations.map(presentation => (
                <motion.div 
                  key={presentation._id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="bg-indigo-600 h-2"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-medium py-1 px-2 rounded">
                        {presentation.presentationType}
                      </span>
                      <span className={`text-xs font-medium py-1 px-2 rounded ${
                        presentation.booked 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {presentation.booked ? 'Booked' : 'Available'}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{presentation.title}</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start">
                        <i className="fas fa-calendar-day mt-1 mr-3 text-gray-400"></i>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="text-gray-800">
                            {new Date(presentation.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fas fa-clock mt-1 mr-3 text-gray-400"></i>
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="text-gray-800">
                            {new Date(presentation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(presentation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fas fa-map-marker-alt mt-1 mr-3 text-gray-400"></i>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="text-gray-800">{presentation.location}</p>
                        </div>
                      </div>
                      {presentation.booked && presentation.bookedBy && (
                        <div className="flex items-start">
                          <i className="fas fa-user mt-1 mr-3 text-gray-400"></i>
                          <div>
                            <p className="text-sm text-gray-500">Booked By</p>
                            <p className="text-gray-800">{presentation.bookedBy.name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => cancelPresentation(presentation._id)}
                      disabled={loading}
                      className={`w-full py-3 rounded-lg flex items-center justify-center font-medium transition-colors ${
                        presentation.booked
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      <i className="fas fa-calendar-times mr-2"></i>
                      {presentation.booked ? 'Cancel Appointment' : 'Remove Slot'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostPresentation;
