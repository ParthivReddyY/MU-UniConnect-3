import React from 'react';
import { Link } from 'react-router-dom';

function ClubsEvents() {
  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold text-dark-gray mb-4">Clubs & Events</h1>
      <p className="mb-4">Discover and connect with various clubs and upcoming events at our university</p>
      
      <section className="bg-gray-100 p-5 rounded-lg mb-8 shadow-sm">
        <h2 className="text-xl font-semibold text-dark-gray mb-4 pb-2 border-b border-gray-200">Get Involved on Campus</h2>
        <p>
          Participation in clubs and events is an essential part of the university experience. 
          MU-UniConnect helps you stay informed about all the exciting opportunities available on campus.
          Join clubs to meet like-minded peers, develop new skills, and build lasting friendships.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-dark-gray mb-4 pb-2 border-b border-gray-200">Campus Clubs</h2>
        <p className="mb-4">Our university hosts a diverse range of clubs catering to different interests and passions. Find the perfect fit for you!</p>
        <div className="flex flex-wrap gap-5">
          <div className="bg-white rounded-lg shadow-sm p-5 flex-1 min-w-[250px] transition-transform hover:translate-y-[-5px]">
            <h3 className="font-semibold mb-2">Tech Club</h3>
            <p className="mb-2">For tech enthusiasts to collaborate on innovative projects</p>
            <p className="mb-3">Meeting: Every Tuesday, 5 PM, Tech Center Room 101</p>
            <button className="bg-gray-100 text-dark-gray border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors mt-2">Join Club</button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 flex-1 min-w-[250px] transition-transform hover:translate-y-[-5px]">
            <h3 className="font-semibold mb-2">Arts Society</h3>
            <p className="mb-2">Express your creativity through various art forms</p>
            <p className="mb-3">Meeting: Wednesdays, 4 PM, Arts Building Studio</p>
            <button className="bg-gray-100 text-dark-gray border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors mt-2">Join Club</button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 flex-1 min-w-[250px] transition-transform hover:translate-y-[-5px]">
            <h3 className="font-semibold mb-2">Sports Club</h3>
            <p className="mb-2">Join various sports teams and stay active</p>
            <p className="mb-3">Practice: Weekends, 9 AM, University Sports Complex</p>
            <button className="bg-gray-100 text-dark-gray border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors mt-2">Join Club</button>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-dark-gray mb-4 pb-2 border-b border-gray-200">Upcoming Events</h2>
        <p className="mb-4">Stay updated on the latest campus events and mark your calendar for these exciting opportunities!</p>
        <div className="flex flex-wrap gap-5">
          <div className="bg-white rounded-lg shadow-sm p-5 flex-1 min-w-[250px] transition-transform hover:translate-y-[-5px]">
            <h3 className="font-semibold mb-2">Tech Symposium</h3>
            <p className="mb-1">Date: October 15, 2023</p>
            <p className="mb-1">Location: Main Auditorium</p>
            <p className="mb-3">A gathering of industry experts and students to discuss the latest in technology.</p>
            <button className="bg-gray-100 text-dark-gray border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors mt-2">Register</button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 flex-1 min-w-[250px] transition-transform hover:translate-y-[-5px]">
            <h3 className="font-semibold mb-2">Cultural Fest</h3>
            <p className="mb-1">Date: November 5-7, 2023</p>
            <p className="mb-1">Location: University Grounds</p>
            <p className="mb-3">Three days of cultural performances, food, and celebrations from around the world.</p>
            <button className="bg-gray-100 text-dark-gray border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors mt-2">Register</button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 flex-1 min-w-[250px] transition-transform hover:translate-y-[-5px]">
            <h3 className="font-semibold mb-2">Career Fair</h3>
            <p className="mb-1">Date: September 25, 2023</p>
            <p className="mb-1">Location: Student Center</p>
            <p className="mb-3">Connect with potential employers and explore internship and job opportunities.</p>
            <button className="bg-gray-100 text-dark-gray border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors mt-2">Register</button>
          </div>
        </div>
      </section>
      
      <div className="mt-10 p-5 bg-gray-100 rounded-lg text-center">
        <h3 className="font-semibold mb-4">Quick Navigation</h3>
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          <Link to="/" className="inline-block py-2 px-5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Home</Link>
          <Link to="/faculty" className="inline-block py-2 px-5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Faculty Directory</Link>
          <Link to="/college" className="inline-block py-2 px-5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">College Information</Link>
        </div>
      </div>
    </div>
  );
}

export default ClubsEvents;
