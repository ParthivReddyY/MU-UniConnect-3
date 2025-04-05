import React from 'react';

const CollegeHeader = () => {
  return (
    <div className="relative w-full h-[60vh] overflow-hidden">
      <img 
        src="https://mahindraecolecentrale.edu.in/wp-content/uploads/2020/08/MEC-Campus.jpg" 
        alt="Mahindra University Campus" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
      <div className="absolute bottom-0 left-0 p-8 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Mahindra University</h1>
        <p className="text-xl md:text-2xl">Shaping Tomorrow's Leaders</p>
      </div>
    </div>
  );
};

export default CollegeHeader;
