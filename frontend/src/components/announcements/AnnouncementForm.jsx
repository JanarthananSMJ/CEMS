import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { announcementService, eventService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const AnnouncementForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  // Initialize with data from location state if available (for edit mode)
  const initialData = location.state?.announcement || {
    title: '',
    content: '',
    eventId: null,
    priority: 'medium',
    isPublished: true
  };

  const [formData, setFormData] = useState(initialData);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If in edit mode and no state was passed, fetch the announcement
    if (isEditMode && !location.state?.announcement) {
      fetchAnnouncement();
    }

    // Fetch events for the dropdown
    fetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAnnouncement = async () => {
    setLoading(true);
    try {
      const response = await announcementService.getAnnouncementById(id);
      setFormData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch announcement');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await eventService.getAllEvents();
      setEvents(response.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    // Handle checkbox fields
    if (name === 'isPublished') {
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEventChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, eventId: newValue?._id || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      if (isEditMode) {
        await announcementService.updateAnnouncement(id, formData);
      } else {
        await announcementService.createAnnouncement(formData);
      }

      setSuccess(true);

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/announcements');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save announcement');
    } finally {
      setSubmitting(false);
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
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          Announcement {isEditMode ? 'updated' : 'created'} successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">{formData.title.length}/100 characters</p>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
          <textarea
            id="content"
            name="content"
            rows={6}
            value={formData.content}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">Related Event (Optional)</label>
            <select
              id="eventId"
              value={formData.eventId || ''}
              onChange={(e) => handleEventChange(e, events.find(ev => ev._id === e.target.value) || null)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            >
              <option value="">— General announcement —</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>{event.title}</option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">Leave empty for general announcements</p>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">Set the importance level of this announcement</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={formData.isPublished}
              onClick={() => handleChange({ target: { name: 'isPublished', type: 'checkbox', checked: !formData.isPublished } })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${formData.isPublished ? 'bg-brand-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm font-medium text-gray-700">Publish immediately</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {formData.isPublished
              ? 'Announcement will be visible to all users'
              : 'Announcement will be saved as draft'}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/announcements')}
            disabled={submitting}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-600 hover:bg-brand-700 text-white py-2 px-4 rounded-md transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[9rem]"
          >
            {submitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : isEditMode ? (
              'Update Announcement'
            ) : (
              'Create Announcement'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnnouncementForm;
