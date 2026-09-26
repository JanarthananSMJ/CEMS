import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../../services';

const TopPerformers = () => {
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopPerformers = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await leaderboardService.getTopPerformers();
        setTopPerformers(data);
      } catch (err) {
        console.error('Error fetching top performers:', err);
        setError(err.message || 'Failed to load top performers');
      } finally {
        setLoading(false);
      }
    };

    fetchTopPerformers();
  }, []);

  // Function to get avatar background color based on rank
  const getAvatarColor = (index) => {
    switch (index) {
      case 0: return 'bg-yellow-100 text-yellow-800'; // Gold
      case 1: return 'bg-gray-200 text-gray-700'; // Silver
      case 2: return 'bg-orange-100 text-orange-800'; // Bronze
      default: return 'bg-brand-100 text-brand-700'; // Default blue
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <div className="flex">
          <svg className="h-5 w-5 text-red-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!topPerformers || topPerformers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No top performers data available yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-2">
        <svg className="h-6 w-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-800">
          Top Performers
        </h2>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Participants with the highest cumulative scores across all events
      </p>

      <div className="divide-y divide-gray-100">
        {topPerformers.map((performer, index) => (
          <div key={performer._id} className="py-4 flex items-start gap-4 hover:bg-gray-50 px-2 rounded-lg transition">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${getAvatarColor(index)}`}>
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{performer.userName}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422A12.083 12.083 0 0118 20.417a12.083 12.083 0 01-6.16-1.833L12 14z" />
                  </svg>
                  {performer.college || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {performer.eventCount} {performer.eventCount === 1 ? 'Event' : 'Events'}
                </span>
              </div>
              <p className="text-lg font-bold text-brand-600 mt-1">{performer.totalScore} pts</p>
              {performer.achievements?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {performer.achievements.map((achievement, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-800">
                      {achievement}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPerformers;
