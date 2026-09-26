import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnnouncementList } from '../components/announcements';

const TAB_LABELS = ['All Announcements', 'General Announcements', 'Event Announcements'];

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [publishedFilter, setPublishedFilter] = useState('all');

  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer';
  const canCreateAnnouncement = isAdmin || isOrganizer;

  const handleTabChange = (newValue) => setTabValue(newValue);
  const handleCreateAnnouncement = () => navigate('/announcements/create');

  const getFilterParams = () => {
    const params = {};
    if (priorityFilter !== 'all') params.priority = priorityFilter;
    if (publishedFilter !== 'all' && (isAdmin || isOrganizer)) {
      params.isPublished = publishedFilter === 'published';
    }
    return params;
  };

  return (
    <div className="pb-12">
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Announcements</h1>
          {canCreateAnnouncement && (
            <button
              type="button"
              onClick={handleCreateAnnouncement}
              className="inline-flex items-center gap-2 bg-white text-orange-700 hover:bg-orange-50 py-2 px-4 rounded-md font-semibold transition duration-300 shadow-sm"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex gap-6 overflow-x-auto">
              {TAB_LABELS.map((label, index) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => handleTabChange(index)}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${tabValue === index ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </span>

            <div className="flex items-center gap-2">
              <label htmlFor="priorityFilter" className="text-sm text-gray-600">Priority</label>
              <select
                id="priorityFilter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-300 rounded-md shadow-sm px-3 py-1.5 text-sm focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {(isAdmin || isOrganizer) && (
              <div className="flex items-center gap-2">
                <label htmlFor="statusFilter" className="text-sm text-gray-600">Status</label>
                <select
                  id="statusFilter"
                  value={publishedFilter}
                  onChange={(e) => setPublishedFilter(e.target.value)}
                  className="border border-gray-300 rounded-md shadow-sm px-3 py-1.5 text-sm focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </div>
            )}
          </div>

          {/* Announcement List */}
          <div>
            {tabValue === 0 && (
              <AnnouncementList showControls filters={getFilterParams()} />
            )}
            {tabValue === 1 && (
              <AnnouncementList showControls filters={{ ...getFilterParams(), eventId: null }} />
            )}
            {tabValue === 2 && (
              <AnnouncementList showControls filters={{ ...getFilterParams(), hasEvent: true }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
