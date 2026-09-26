import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { eventService } from '../services';
import {
  LeaderboardTable,
  ParticipantScore,
  TopPerformers,
  CollegeLeaderboard,
  UpdateScoreForm
} from '../components/leaderboard';

const LeaderboardPage = () => {
  const { eventId } = useParams();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch event details if eventId is provided
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        setError(null);

        const eventData = await eventService.getEventById(eventId);
        setEvent(eventData);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // Check if user is registered for this event
  const isUserRegistered = () => {
    if (!isAuthenticated || !user || !event) return false;
    return event.participants?.some(participant => participant === user._id);
  };

  return (
    <div className="pb-12">
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {eventId
              ? (loading ? 'Loading Event Leaderboard...' : `${event?.title || 'Event'} Leaderboard`)
              : 'Leaderboards'}
          </h1>
        </div>
        <div className="p-6">
          {/* Breadcrumbs navigation */}
          <nav className="flex items-center flex-wrap text-sm text-gray-500 mb-4">
            <Link to="/home" className="hover:text-brand-600">Home</Link>
            {eventId ? (
              <>
                <span className="mx-2">/</span>
                <Link to="/events" className="hover:text-brand-600">Events</Link>
                <span className="mx-2">/</span>
                <Link to={`/events/${eventId}`} className="hover:text-brand-600">
                  {loading ? 'Loading...' : event?.title || 'Event'}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">Leaderboard</span>
              </>
            ) : (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">Leaderboards</span>
              </>
            )}
          </nav>

          {/* Page description */}
          {eventId && event && (
            <p className="text-gray-600 mb-4">
              Track scores and rankings for this event
            </p>
          )}

          {/* Error message */}
          {error && (
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
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          )}

          {/* Event-specific leaderboard */}
          {eventId ? (
            !loading && event && (
              <>
                {/* Show participant score if user is registered */}
                {isAuthenticated && isUserRegistered() && (
                  <div className="mb-6">
                    <ParticipantScore eventId={eventId} />
                  </div>
                )}

                {/* Score update form for organizers/admins */}
                {isAuthenticated && user && (user.role === 'admin' || user.role === 'organizer') && (
                  <div className="mb-6">
                    <UpdateScoreForm
                      eventId={eventId}
                      onScoreUpdated={() => {
                        // Refresh the leaderboard when score is updated
                        // This is a placeholder - you would implement a refresh mechanism
                        window.location.reload();
                      }}
                    />
                  </div>
                )}

                {/* Event leaderboard */}
                <LeaderboardTable eventId={eventId} />
              </>
            )
          ) : (
            /* Global leaderboards */
            <div>
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex gap-6">
                  <button
                    onClick={() => setTabValue(0)}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${tabValue === 0 ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Top Performers
                  </button>
                  <button
                    onClick={() => setTabValue(1)}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${tabValue === 1 ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    College Rankings
                  </button>
                </nav>
              </div>

              {tabValue === 0 && <TopPerformers />}
              {tabValue === 1 && <CollegeLeaderboard />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
