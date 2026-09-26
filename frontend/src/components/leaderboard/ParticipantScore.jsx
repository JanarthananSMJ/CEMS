import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { leaderboardService } from '../../services';

const ParticipantScore = ({ eventId }) => {
  const { user } = useSelector((state) => state.auth);
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipantScore = async () => {
      if (!user || !eventId) return;

      try {
        setLoading(true);
        setError(null);

        const data = await leaderboardService.getParticipantScore(eventId, user._id);
        setScoreData(data);
      } catch (err) {
        console.error('Error fetching participant score:', err);
        setError(err.message || 'Failed to load your score');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipantScore();
  }, [eventId, user]);

  // Function to get medal color based on rank
  const getMedalColor = (rank) => {
    switch (rank) {
      case 1: return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' }; // Gold
      case 2: return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }; // Silver
      case 3: return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' }; // Bronze
      default: return { bg: 'bg-brand-50', text: 'text-brand-600', border: 'border-brand-200' }; // Default blue
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
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

  if (!scoreData) {
    return (
      <div className="text-center py-8 text-gray-500">
        You don't have a score for this event yet.
      </div>
    );
  }

  const medalColor = getMedalColor(scoreData.rank);

  return (
    <div className={`bg-white rounded-lg shadow p-6 border ${medalColor.border}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Your Performance
      </h3>

      <hr className="my-4 border-gray-200" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${medalColor.bg} mb-2`}>
            <svg className={`h-10 w-10 ${medalColor.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">{scoreData.score}</p>
          <p className="text-sm text-gray-500">Total Score</p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${medalColor.bg} mb-2`}>
            <svg className={`h-10 w-10 ${medalColor.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">{scoreData.rank}</p>
          <p className="text-sm text-gray-500">Current Rank</p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${medalColor.bg} mb-2`}>
            <svg className={`h-10 w-10 ${medalColor.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">{scoreData.achievements?.length || 0}</p>
          <p className="text-sm text-gray-500">Achievements</p>
        </div>
      </div>

      {scoreData.achievements && scoreData.achievements.length > 0 && (
        <>
          <hr className="my-4 border-gray-200" />

          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Your Achievements
          </h4>

          <div className="flex flex-wrap gap-2 mt-1">
            {scoreData.achievements.map((achievement, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800"
              >
                {achievement}
              </span>
            ))}
          </div>
        </>
      )}

      <p className="text-sm text-gray-500 mt-4 italic">
        Last updated: {new Date(scoreData.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
};

export default ParticipantScore;
