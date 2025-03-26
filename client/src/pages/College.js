import React from 'react';
import { Link } from 'react-router-dom';

function College() {
  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold text-dark-gray mb-4">Our College</h1>
      <p className="mb-4">Learn about our prestigious institution, facilities, and resources</p>
      
      <section className="bg-gray-100 p-5 rounded-lg mb-8 shadow-sm">
        <h2 className="text-xl font-semibold text-dark-gray mb-4 pb-2 border-b border-gray-200">Welcome to Excellence</h2>
        <p>
          At our university, we believe in providing a holistic educational experience that goes beyond textbooks.
          Our campus is designed to foster learning, innovation, and personal growth in a supportive environment.
          With state-of-the-art facilities and dedicated faculty, we are committed to helping our students achieve their full potential.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-dark-gray mb-4 pb-2 border-b border-gray-200">About Us</h2>
        <p className="mb-3">
          Founded in 1980, our university has been at the forefront of education and research.
          We are committed to providing quality education and nurturing the next generation of leaders.
        </p>
        <p className="mb-4">
          Over the decades, we have grown into a premier institution known for academic excellence and innovative research.
          Our graduates have made significant contributions to various fields and industries around the world.
          We continue to evolve and adapt to meet the changing needs of society and prepare our students for the challenges of tomorrow.
        </p>
        <button className="bg-gray-100 text-dark-gray border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors">Read Our History</button>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-dark-gray mb-4 pb-2 border-b border-gray-200">Campus Facilities</h2>
        <p className="mb-4">Our campus offers a wide range of facilities to support your academic journey and extracurricular interests.</p>
        <div className="flex flex-wrap gap-5">
          <div className="bg-white rounded-lg shadow-sm p-5 flex-1 min-w-[250px] transition-transform hover:translate-y-[-5px]">
            <h3 className="font-semibold mb-2">Library</h3>
            <p className="mb-2">A vast collection of books, journals, and digital resources</p>
            <p className="mb-3">Open Hours: Monday-Saturday, 8 AM-10 PM</p>
            <button className="bg-gray-100 text-dark-gray border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors mt-2">Explore Library</button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-5 flex-1 min-w-[250px] transition-transform hover:translate-y-[-5px]">
            <h3 className="font-semibold mb-2">Sports Complex</h3>
            <p className="mb-2">State-of-the-art facilities for various sports and fitness activities</p>
            <p className="mb-3">Open Hours: Daily, 6 AM-9 PM</p>
            <button className="bg-gray-100 text-dark-gray border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors mt-2">View Facilities</button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-5 flex-1 min-w-[250px] transition-transform hover:translate-y-[-5px]">
            <h3 className="font-semibold mb-2">Research Labs</h3>
            <p className="mb-2">Cutting-edge laboratories for advanced research</p>
            <p className="mb-3">Available for undergraduate and graduate research projects</p>
            <button className="bg-gray-100 text-dark-gray border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors mt-2">Explore Labs</button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-5 flex-1 min-w-[250px] transition-transform hover:translate-y-[-5px]">
            <h3 className="font-semibold mb-2">Student Center</h3>
            <p className="mb-2">A hub for student activities, dining, and relaxation</p>
            <p className="mb-3">Open Hours: Daily, 7 AM-11 PM</p>
            <button className="bg-gray-100 text-dark-gray border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors mt-2">Visit Center</button>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-dark-gray mb-4 pb-2 border-b border-gray-200">Academic Programs</h2>
        <p className="mb-4">We offer a diverse range of academic programs to cater to various interests and career aspirations.</p>
        <ul className="ml-5 space-y-2 list-disc list-inside mb-4">
          <li>Undergraduate Programs - Bachelor's degrees across multiple disciplines</li>
          <li>Graduate Programs - Master's programs for advanced specialization</li>
          <li>Doctoral Studies - Ph.D. programs for research-oriented careers</li>
          <li>Certificate Courses - Short-term specialized training programs</li>
        </ul>
        <button className="bg-gray-100 text-dark-gray border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors">View All Programs</button>
      </section>
      
      <div className="mt-10 p-5 bg-gray-100 rounded-lg text-center">
        <h3 className="font-semibold mb-4">Quick Navigation</h3>
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          <Link to="/" className="inline-block py-2 px-5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Home</Link>
          <Link to="/clubs-events" className="inline-block py-2 px-5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Clubs & Events</Link>
          <Link to="/faculty" className="inline-block py-2 px-5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Faculty Directory</Link>
        </div>
      </div>
    </div>
  );
}

export default College;
