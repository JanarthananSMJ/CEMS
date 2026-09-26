import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services';
import EventCard from '../components/events/EventCard';
import { useAuth } from '../context/AuthContext';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      // console.log('Fetched data from getAllEvents:', data);

      // Get events data, ensuring we have an array
      let eventsData = Array.isArray(data) ? data : data.data || [];

      // Filter out sample events (events with titles containing 'sample' or 'test')
      // This is a temporary solution to remove sample events from the home page
      eventsData = eventsData.filter(event => {
        const title = event.title.toLowerCase();
        return !title.includes('sample') && !title.includes('test');
      });

      setEvents(eventsData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError("We couldn't load events right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events based on selected filter
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    
    if (filter === 'upcoming') {
      return eventDate >= today;
    } else if (filter === 'past') {
      return eventDate < today;
    }
    return true; // 'all' filter
  });

  // Only admins can create events
  const canCreateEvent = user && user.role === 'admin';

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          {canCreateEvent && (
            <Link 
              to="/events/create" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              Create Event
            </Link>
          )}
        </div>

        {/* Filter controls */}
        <div className="mt-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all' ? 'bg-brand-100 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'upcoming' ? 'bg-brand-100 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'past' ? 'bg-brand-100 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-gray-500 text-lg">{error}</p>
            <button
              onClick={fetchEvents}
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              Try again
            </button>
          </div>
        )}

        {/* Events grid */}
        {!loading && !error && (
          <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <EventCard key={event._id} event={event} onUpdate={fetchEvents} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  {filter === 'all' 
                    ? 'No events found.' 
                    : filter === 'upcoming' 
                      ? 'No upcoming events found.' 
                      : 'No past events found.'}
                </p>
                {canCreateEvent && (
                  <Link 
                    to="/events/create" 
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-brand-700 bg-brand-100 hover:bg-brand-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                  >
                    Create your first event
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;