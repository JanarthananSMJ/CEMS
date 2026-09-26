import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { announcementService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const priorityBadgeClasses = {
  low: 'bg-cyan-100 text-cyan-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const priorityIconClasses = {
  low: 'text-cyan-500',
  medium: 'text-yellow-500',
  high: 'text-red-500'
};

const BellIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const BellOffIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
  </svg>
);

const EditIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const AnnouncementList = ({ eventId, showControls = false }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer';
  const canModify = isAdmin || isOrganizer;

  useEffect(() => {
    fetchAnnouncements();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (eventId) {
        response = await announcementService.getAnnouncementsByEvent(eventId);
      } else {
        response = await announcementService.getAllAnnouncements();
      }
      setAnnouncements(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    navigate(`/announcements/edit/${announcement._id}`, { state: { announcement } });
  };

  const handleDelete = (announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await announcementService.deleteAnnouncement(selectedAnnouncement._id);
      setAnnouncements(announcements.filter(a => a._id !== selectedAnnouncement._id));
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete announcement');
      setDeleteDialogOpen(false);
    }
  };

  const togglePublishStatus = async (announcement) => {
    try {
      const updatedAnnouncement = await announcementService.updateAnnouncement(
        announcement._id,
        { isPublished: !announcement.isPublished }
      );
      setAnnouncements(announcements.map(a =>
        a._id === announcement._id ? updatedAnnouncement.data : a
      ));
    } catch (err) {
      setError(err.message || 'Failed to update announcement');
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
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
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

  if (announcements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No announcements available.</p>
      </div>
    );
  }

  return (
    <div>
      {announcements.map((announcement) => (
        <div
          key={announcement._id}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 p-6 mb-4 relative"
        >
          {!announcement.isPublished && (
            <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase">
              Unpublished
            </span>
          )}

          {/* Title + Icon */}
          <div className="flex items-center gap-2 mb-2 pr-24">
            <BellIcon className={`h-5 w-5 flex-shrink-0 ${priorityIconClasses[announcement.priority]}`} />
            <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
          </div>

          {/* Content */}
          <p className="text-gray-600 whitespace-pre-wrap">{announcement.content}</p>

          <hr className="my-3 border-gray-200" />

          {/* Footer Row */}
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${priorityBadgeClasses[announcement.priority]}`}>
                {announcement.priority}
              </span>
              <span className="text-xs text-gray-500">
                By {announcement.creatorName} •{' '}
                {formatDistanceToNow(new Date(announcement.createdAt), {
                  addSuffix: true
                })}
              </span>
            </div>

            {/* Controls */}
            {showControls && canModify && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => togglePublishStatus(announcement)}
                  title={announcement.isPublished ? 'Unpublish' : 'Publish'}
                  className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition"
                >
                  {announcement.isPublished ? <BellIcon /> : <BellOffIcon />}
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(announcement)}
                  title="Edit"
                  className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition"
                >
                  <EditIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(announcement)}
                  title="Delete"
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <TrashIcon />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Announcement</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the announcement "{selectedAnnouncement?.title}"? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-300"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementList;
