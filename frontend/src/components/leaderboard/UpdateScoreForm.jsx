import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { leaderboardService, eventService } from "../../services";

// Common achievement options
const achievementOptions = [
  "First Place",
  "Second Place",
  "Third Place",
  "Best Presenter",
  "Best Innovation",
  "Best Design",
  "Best Technical Implementation",
  "Best Team Player",
  "Most Creative",
  "Audience Choice",
  "Perfect Attendance",
  "Early Bird",
  "Problem Solver",
  "Quick Learner",
  "Outstanding Contribution",
];

const UpdateScoreForm = ({ eventId, onScoreUpdated }) => {
  const { user } = useSelector((state) => state.auth);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newAchievement, setNewAchievement] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    userId: "",
    score: "",
    achievements: [],
  });

  // Fetch event participants
  useEffect(() => {
    const fetchEventParticipants = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        setError(null);

        // Try to get detailed participant data first
        try {
          const participantsData = await eventService.getEventParticipants(
            eventId
          );
          // console.log("Participants data from API:", participantsData);
          if (participantsData && participantsData.length > 0) {
            // Format participants from the dedicated participants endpoint
            const formattedParticipants = participantsData.map((p) => {
              // Handle different participant data structures
              if (typeof p === "string") {
                return {
                  _id: p,
                  name: "Unknown",
                  email: "No email",
                  college: "Unknown",
                };
              } else if (p.userId) {
                // Get college directly from the participant object
                return {
                  _id: p.userId,
                  name: p.name || "Unknown",
                  email: p.email || "No email",
                  college: p.college || "Unknown",
                };
              } else {
                // Direct user object
                return {
                  _id: p._id || p.id || p,
                  name:
                    p.name ||
                    `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
                    "Unknown",
                  email: p.email || "No email",
                  college: p.college || "Unknown",
                };
              }
            });

            setParticipants(formattedParticipants);
            setLoading(false);
            return; // Exit early if we got the data
          }
        } catch (participantError) {
          console.log(
            "Falling back to event data for participants:",
            participantError
          );
          // Continue to fallback method if this fails
        }

        // Fallback: get participants from event data
        const eventData = await eventService.getEventById(eventId);
        // console.log("Event data from API:", eventData);
        if (eventData && eventData.participants) {
          // console.log("Participants from event data:", eventData.participants);
          // Format participants from event data
          const formattedParticipants = eventData.participants.map((p) => {
            if (typeof p === "object") {
              if (p.userId) {
                // Get college directly from the participant object
                return {
                  _id: p.userId,
                  name: p.name || "Unknown",
                  email: p.email || "No email",
                  college: p.college || "Unknown",
                };
              } else {
                // Direct user object
                return {
                  _id: p._id,
                  name:
                    `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
                    "Unknown",
                  email: p.email || "No email",
                  college: p.college || "Unknown",
                };
              }
            } else {
              return {
                _id: p,
                name: "Unknown",
                email: "No email",
                college: "Unknown",
              };
            }
          });

          setParticipants(formattedParticipants);
        }
      } catch (err) {
        console.error("Error fetching event participants:", err);
        setError("Failed to load participants. Please try again.");
        // Log more details about the error for debugging
        if (err.response) {
          console.error("Error response:", err.response.data);
          console.error("Error status:", err.response.status);
        } else if (err.request) {
          console.error("Error request:", err.request);
        } else {
          console.error("Error message:", err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEventParticipants();
  }, [eventId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle an achievement pill on/off
  const toggleAchievement = (achievement) => {
    setFormData((prev) => {
      const alreadySelected = prev.achievements.includes(achievement);
      return {
        ...prev,
        achievements: alreadySelected
          ? prev.achievements.filter((a) => a !== achievement)
          : [...prev.achievements, achievement],
      };
    });
  };

  // Add custom achievement
  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      // Add to form data
      setFormData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()],
      }));

      setNewAchievement("");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.userId) {
      setError("Please select a participant");
      return;
    }

    if (
      formData.score === "" ||
      isNaN(formData.score) ||
      Number(formData.score) < 0
    ) {
      setError("Please enter a valid score (must be a positive number)");
      return;
    }

    // Find selected participant
    const selectedParticipant = participants.find(
      (p) => p._id === formData.userId
    );
    if (!selectedParticipant) {
      setError("Selected participant data not found");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      // Construct full score payload
      const scoreData = {
        points: Number(formData.score), // Note: backend expects 'points'
        achievements: formData.achievements,
        userName: selectedParticipant.name,
        // Send the college name exactly as it appears in the user's profile without any modifications
        college: selectedParticipant.college || "Unknown",
      };

      // Log the exact college value being sent to help with debugging
      // console.log("Updating score with college:", scoreData.college);

      // Update participant score
      await leaderboardService.updateParticipantScore(
        eventId,
        formData.userId,
        scoreData
      );

      // Reset form
      setFormData({
        userId: "",
        score: "",
        achievements: [],
      });

      setSuccess("Score updated successfully!");
      if (onScoreUpdated) {
        onScoreUpdated();
      }
    } catch (err) {
      console.error("Error updating score:", err);
      setError(err.message || "Failed to update score. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if user has permission to update scores
  const hasPermission = () => {
    if (!user) return false;
    return user.role === "admin" || user.role === "organizer";
  };

  if (!hasPermission()) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
        <div className="flex">
          <svg className="h-5 w-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              You don't have permission to update participant scores.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Update Participant Score
      </h3>

      <hr className="my-4 border-gray-200" />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
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

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="participant-select" className="block text-sm font-medium text-gray-700 mb-1">
              Participant
            </label>
            <select
              id="participant-select"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              disabled={submitting}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            >
              <option value="" disabled>
                Select a participant
              </option>
              {participants.length === 0 ? (
                <option disabled>No participants found</option>
              ) : (
                participants.map((participant) => (
                  <option key={participant._id} value={participant._id}>
                    {participant.name} ({participant.college || "No college"})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
              Score
            </label>
            <input
              id="score"
              type="number"
              name="score"
              min="0"
              value={formData.score}
              onChange={handleChange}
              disabled={submitting}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Achievements
            </label>
            <div className="flex flex-wrap gap-2">
              {achievementOptions.map((achievement) => {
                const selected = formData.achievements.includes(achievement);
                return (
                  <button
                    type="button"
                    key={achievement}
                    onClick={() => toggleAchievement(achievement)}
                    disabled={submitting}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${selected ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {achievement}
                  </button>
                );
              })}
              {formData.achievements
                .filter((a) => !achievementOptions.includes(a))
                .map((achievement) => (
                  <button
                    type="button"
                    key={achievement}
                    onClick={() => toggleAchievement(achievement)}
                    disabled={submitting}
                    className="px-3 py-1.5 rounded-full text-sm font-medium border transition bg-brand-600 text-white border-brand-600"
                  >
                    {achievement}
                  </button>
                ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder="Add a custom achievement"
                disabled={submitting}
                className="flex-1 border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleAddAchievement}
                disabled={submitting}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md text-sm"
              >
                Add
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-600 hover:bg-brand-700 text-white py-2 px-4 rounded-md transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-3"
          >
            {submitting ? "Updating..." : "Update Score"}
          </button>
        </form>
      )}
    </div>
  );
};

export default UpdateScoreForm;
