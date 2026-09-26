import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../../services';

const CollegeLeaderboard = () => {
  const [collegeData, setCollegeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollegeLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await leaderboardService.getCollegeLeaderboard();
        // console.log('College leaderboard data:', data);

        // Log each college entry to help with debugging
        // if (data && data.length > 0) {
        //   // console.log('College entries:');
        //   data.forEach((college, index) => {
        //     console.log(`${index + 1}. ${college.college} - ${college.participantCount} participants, ${college.totalScore} points`);
        //   });
        // }

        setCollegeData(data);
      } catch (err) {
        console.error('Error fetching college leaderboard:', err);
        setError(err.message || 'Failed to load college leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeLeaderboard();
  }, []);

  // Function to get color based on rank
  const getRankColor = (index) => {
    switch (index) {
      case 0: return 'bg-yellow-100 text-yellow-800'; // Gold
      case 1: return 'bg-gray-200 text-gray-700'; // Silver
      case 2: return 'bg-orange-100 text-orange-800'; // Bronze
      default: return 'bg-brand-100 text-brand-700'; // Default blue
    }
  };

  // Function to get text color for score (rank-based highlight)
  const getRankTextColor = (index) => {
    switch (index) {
      case 0: return 'text-yellow-800';
      case 1: return 'text-gray-700';
      case 2: return 'text-orange-800';
      default: return 'text-gray-900';
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

  if (!collegeData || collegeData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No college leaderboard data available yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <svg className="h-6 w-6 mr-2 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422A12.083 12.083 0 0118 20.417a12.083 12.083 0 01-6.16-1.833L12 14z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-800">
          College Leaderboard
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {collegeData.map((college, index) => (
              <tr key={college.college} className="hover:bg-gray-50">
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${getRankColor(index)}`}>
                    {index + 1}
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className={index < 3 ? 'font-bold text-gray-900' : 'font-normal text-gray-900'}>
                    {college.college}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-right">
                  <span className={`font-bold ${index < 3 ? getRankTextColor(index) : 'text-gray-900'}`}>
                    {college.totalScore}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-right text-sm text-gray-500">{college.participantCount}</td>
                <td className="py-3 px-4 whitespace-nowrap text-right text-sm text-gray-500">{college.eventCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollegeLeaderboard;
