import React from 'react';

const NewsUpdates = () => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-dark-gray">Latest College News & Updates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* News Card 1 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px]">
          <img 
            src="https://picsum.photos/seed/news1/500/300" 
            alt="News" 
            className="w-full h-48 object-cover"
          />
          <div className="p-5">
            <span className="inline-block bg-red-light text-primary-red text-xs font-medium px-2 py-1 rounded mb-3">
              Announcement
            </span>
            <h3 className="text-xl font-semibold mb-2">New Research Center Inauguration</h3>
            <p className="text-medium-gray mb-3 line-clamp-3">
              Mahindra University is proud to announce the inauguration of our new Advanced Research Center for Innovation 
              which will focus on cutting-edge technology and interdisciplinary research.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-medium-gray">October 15, 2023</span>
              <button className="text-primary-red hover:underline text-sm font-medium" aria-label="Read more about New Research Center Inauguration">Read More</button>
            </div>
          </div>
        </div>
        
        {/* News Card 2 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px]">
          <img 
            src="https://picsum.photos/seed/news2/500/300" 
            alt="News" 
            className="w-full h-48 object-cover"
          />
          <div className="p-5">
            <span className="inline-block bg-teal-light text-primary-teal text-xs font-medium px-2 py-1 rounded mb-3">
              Academic
            </span>
            <h3 className="text-xl font-semibold mb-2">International Conference on AI & ML</h3>
            <p className="text-medium-gray mb-3 line-clamp-3">
              The School of Computer Science is hosting an international conference on Artificial Intelligence 
              and Machine Learning with renowned speakers from around the world.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-medium-gray">October 10, 2023</span>
              <button className="text-primary-red hover:underline text-sm font-medium" aria-label="Read more about International Conference on AI & ML">Read More</button>
            </div>
          </div>
        </div>
        
        {/* News Card 3 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px]">
          <img 
            src="https://picsum.photos/seed/news3/500/300" 
            alt="News" 
            className="w-full h-48 object-cover"
          />
          <div className="p-5">
            <span className="inline-block bg-gold-light text-accent-gold text-xs font-medium px-2 py-1 rounded mb-3">
              Campus Life
            </span>
            <h3 className="text-xl font-semibold mb-2">Annual Cultural Fest 2023</h3>
            <p className="text-medium-gray mb-3 line-clamp-3">
              Mark your calendars for the most awaited event of the year! The Annual Cultural Fest will take place 
              from November 5-7 with exciting performances, competitions, and celebrity guests.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-medium-gray">October 8, 2023</span>
              <button className="text-primary-red hover:underline text-sm font-medium" aria-label="Read more about Annual Cultural Fest 2023">Read More</button>
            </div>
          </div>
        </div>
        
        {/* News Card 4 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px]">
          <img 
            src="https://picsum.photos/seed/news4/500/300" 
            alt="News" 
            className="w-full h-48 object-cover"
          />
          <div className="p-5">
            <span className="inline-block bg-green-light text-success-green text-xs font-medium px-2 py-1 rounded mb-3">
              Placement
            </span>
            <h3 className="text-xl font-semibold mb-2">Record Placements for Class of 2023</h3>
            <p className="text-medium-gray mb-3 line-clamp-3">
              Mahindra University is proud to announce a record placement season with over 95% of eligible students 
              receiving offers from top companies with the highest package touching 45 LPA.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-medium-gray">October 5, 2023</span>
              <button className="text-primary-red hover:underline text-sm font-medium" aria-label="Read more about Record Placements for Class of 2023">Read More</button>
            </div>
          </div>
        </div>
        
        {/* News Card 5 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px]">
          <img 
            src="https://picsum.photos/seed/news5/500/300" 
            alt="News" 
            className="w-full h-48 object-cover"
          />
          <div className="p-5">
            <span className="inline-block bg-red-light text-primary-red text-xs font-medium px-2 py-1 rounded mb-3">
              Infrastructure
            </span>
            <h3 className="text-xl font-semibold mb-2">New Sports Complex Opening</h3>
            <p className="text-medium-gray mb-3 line-clamp-3">
              Mahindra University is excited to announce the opening of our state-of-the-art sports complex with 
              Olympic-sized swimming pool, indoor courts, and fitness center.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-medium-gray">October 2, 2023</span>
              <button className="text-primary-red hover:underline text-sm font-medium" aria-label="Read more about New Sports Complex Opening">Read More</button>
            </div>
          </div>
        </div>
        
        {/* News Card 6 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px]">
          <img 
            src="https://picsum.photos/seed/news6/500/300" 
            alt="News" 
            className="w-full h-48 object-cover"
          />
          <div className="p-5">
            <span className="inline-block bg-teal-light text-primary-teal text-xs font-medium px-2 py-1 rounded mb-3">
              Research
            </span>
            <h3 className="text-xl font-semibold mb-2">Faculty Research Published in Nature Journal</h3>
            <p className="text-medium-gray mb-3 line-clamp-3">
              Prof. Sharma and his team's groundbreaking research on sustainable energy solutions has been published 
              in the prestigious Nature journal, marking a significant achievement for Mahindra University.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-medium-gray">September 28, 2023</span>
              <button className="text-primary-red hover:underline text-sm font-medium" aria-label="Read more about Faculty Research Published in Nature Journal">Read More</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button className="btn-primary inline-flex items-center">
          View All News
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default NewsUpdates;
