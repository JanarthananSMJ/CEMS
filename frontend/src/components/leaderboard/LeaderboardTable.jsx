import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../../services';

const LeaderboardTable = ({ eventId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await leaderboardService.getEventLeaderboard(eventId);
        setLeaderboard(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchLeaderboard();
    }
  }, [eventId]);

  // Function to get medal color based on rank
  const getMedalColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800'; // Gold
      case 2: return 'bg-gray-200 text-gray-700'; // Silver
      case 3: return 'bg-orange-100 text-orange-800'; // Bronze
      default: return 'bg-gray-100 text-gray-600';
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

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No leaderboard data available for this event yet.
      </div>
    );
  }

  return (
    <div className="w-full mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Event Leaderboard
      </h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Achievements</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <tr key={entry._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${getMedalColor(entry.rank)}`}>
                      {entry.rank}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.userName}</td>
                <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">{entry.college || 'N/A'}</td>
                <td className="py-3 px-4 whitespace-nowrap text-right">
                  <span className="font-bold text-gray-900">{entry.score}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {entry.achievements && entry.achievements.length > 0 ? (
                      entry.achievements.map((achievement, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-800 mr-1 mb-1"
                        >
                          {achievement}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">None</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
