import React from 'react';

const ProjectSubmission = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px]">
      <div className="h-36 bg-success-green flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2">Project Submission</h3>
        <p className="text-medium-gray mb-4 h-24">
          Submit your academic projects, research papers, and assignments through our 
          digital portal with easy tracking and feedback.
        </p>
        <button className="w-full bg-success-green text-white py-2 px-4 rounded hover:bg-green-600 transition-colors">
          Submit Project
        </button>
      </div>
    </div>
  );
};

export default ProjectSubmission;
