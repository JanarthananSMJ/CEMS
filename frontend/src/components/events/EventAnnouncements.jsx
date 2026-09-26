import React, { useState, useEffect } from 'react';
import { announcementService } from '../../services';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const priorityBadgeClasses = {
  low: 'bg-cyan-100 text-cyan-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const priorityBorderClasses = {
  low: 'border-cyan-500',
  medium: 'border-yellow-500',
  high: 'border-red-500'
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

const PlusIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
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

// eslint-disable-next-line no-unused-vars
const EventAnnouncements = ({ eventId, eventTitle }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    eventId: null
  });
  const [editMode, setEditMode] = useState(false);
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const { user } = useAuth();

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
      const response = await announcementService.getAnnouncementsByEvent(eventId);
      setAnnouncements(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'medium',
      eventId
    });
    setEditMode(false);
    setCurrentAnnouncementId(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editMode && currentAnnouncementId) {
        await announcementService.updateAnnouncement(currentAnnouncementId, formData);
      } else {
        await announcementService.createAnnouncement(formData);
      }
      handleCloseDialog();
      fetchAnnouncements();
    } catch (err) {
      setError(err.message || 'Failed to save announcement');
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      eventId: announcement.eventId
    });
    setEditMode(true);
    setCurrentAnnouncementId(announcement._id);
    setOpenDialog(true);
  };

  const handleDelete = (announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await announcementService.deleteAnnouncement(selectedAnnouncement._id);
      setDeleteDialogOpen(false);
      fetchAnnouncements();
    } catch (err) {
      setError(err.message || 'Failed to delete announcement');
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Announcements</h2>
        {canModify && (
          <button
            type="button"
            onClick={handleOpenDialog}
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white py-1.5 px-3 rounded-md text-sm transition duration-300"
          >
            <PlusIcon className="h-4 w-4" />
            New Announcement
          </button>
        )}
      </div>

      <hr className="mb-6 border-gray-200" />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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

      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No announcements for this event yet.</p>
        </div>
      ) : (
        <div>
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className={`bg-gray-50 rounded-lg border-l-4 p-4 mb-3 ${priorityBorderClasses[announcement.priority] || priorityBorderClasses.low}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <BellIcon className={`h-5 w-5 flex-shrink-0 ${priorityIconClasses[announcement.priority] || priorityIconClasses.low}`} />
                  <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                </div>
                {canModify && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(announcement)}
                      title="Edit"
                      className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(announcement)}
                      title="Delete"
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-700 whitespace-pre-wrap mb-3">{announcement.content}</p>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Posted by {announcement.creatorName} • {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${priorityBadgeClasses[announcement.priority]}`}>
                  {announcement.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Announcement Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {editMode ? 'Edit Announcement' : 'Create New Announcement'}
              </h3>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div>
                  <label htmlFor="ea-title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    id="ea-title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="ea-content" className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                  <textarea
                    id="ea-content"
                    name="content"
                    rows={4}
                    value={formData.content}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="ea-priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    id="ea-priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-brand-600 hover:bg-brand-700 text-white py-2 px-4 rounded-md transition duration-300"
              >
                {editMode ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCloseDialog}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

export default EventAnnouncements;
