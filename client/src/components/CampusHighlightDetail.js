import React from 'react';

const CampusHighlightDetail = ({ highlight, onClose }) => {
  if (!highlight) return null;

  // Check if any additional info fields exist
  const hasAdditionalInfo = highlight.category || highlight.location || 
                           highlight.contactPerson || highlight.contactEmail || 
                           highlight.additionalInfo;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="relative">
          {/* Header image section */}
          <div className="relative h-72 md:h-96 overflow-hidden">
            <img 
              src={highlight.image} 
              alt={highlight.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f0f0'/%3E%3Ctext x='400' y='200' font-size='36' text-anchor='middle' fill='%23999'%3EImage not available%3C/text%3E%3C/svg%3E`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white hover:bg-opacity-70 transition-all z-10"
              aria-label="Close"
            >
              <i className="fas fa-times"></i>
            </button>
            
            {/* Icon badge */}
            <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-primary-red flex items-center justify-center z-10">
              <i className={`${highlight.icon || 'fas fa-image'} text-white text-xl`}></i>
            </div>
            
            {/* Title overlay at bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-3xl font-bold text-white">{highlight.title}</h2>
            </div>
          </div>
          
          {/* Content section */}
          <div className="p-6 md:p-8">
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">{highlight.description}</p>
              
              {/* Additional information section - only show if there's data */}
              {hasAdditionalInfo && (
                <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {highlight.category && (
                      <div className="flex items-start">
                        <div className="text-primary-red mr-3">
                          <i className="fas fa-tag"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700">Category</h4>
                          <p className="text-gray-600">{highlight.category}</p>
                        </div>
                      </div>
                    )}
                    
                    {highlight.location && (
                      <div className="flex items-start">
                        <div className="text-primary-red mr-3">
                          <i className="fas fa-map-marker-alt"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700">Location</h4>
                          <p className="text-gray-600">{highlight.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {highlight.contactPerson && (
                      <div className="flex items-start">
                        <div className="text-primary-red mr-3">
                          <i className="fas fa-user"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700">Contact Person</h4>
                          <p className="text-gray-600">{highlight.contactPerson}</p>
                        </div>
                      </div>
                    )}
                    
                    {highlight.contactEmail && (
                      <div className="flex items-start">
                        <div className="text-primary-red mr-3">
                          <i className="fas fa-envelope"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700">Contact Email</h4>
                          <p className="text-gray-600">
                            <a href={`mailto:${highlight.contactEmail}`} className="hover:underline">
                              {highlight.contactEmail}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Additional Text Information - Takes full width if present */}
                  {highlight.additionalInfo && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-2">Additional Details</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{highlight.additionalInfo}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Action buttons at the bottom */}
            <div className="mt-8 flex justify-end border-t border-gray-200 pt-4">
              <button 
                onClick={onClose} 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusHighlightDetail;