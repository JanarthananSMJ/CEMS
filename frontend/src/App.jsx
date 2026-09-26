import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import {
  LoginPage,
  HomePage,
  AdminDashboardPage,
  OrganizerDashboardPage,
  EventsPage,
  EventDetailPage,
  CreateEventPage,
  EditEventPage,
  ProfilePage,
  AnnouncementsPage,
  CreateAnnouncementPage,
  EditAnnouncementPage,
  LeaderboardPage,
  SystemSettingsPage
} from './pages';
import { ProtectedRoute } from './components/auth';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Redirect root to login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Protected routes with layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<h1 className="text-4xl font-bold mb-6">Dashboard</h1>} />
            {/* Add more routes here as you develop the application */}
          </Route>
          
          {/* Admin Dashboard */}
          <Route path="/admindashboard" element={<Layout />}>
            <Route index element={<AdminDashboardPage />} />
          </Route>
          
          {/* Organizer Dashboard */}
          <Route path="/organizerdashboard" element={<Layout />}>
            <Route index element={<OrganizerDashboardPage />} />
          </Route>
          
          {/* Event Routes */}
          <Route path="/events/" element={<Layout />}>
            <Route index element={<EventsPage />} />
            <Route path=":eventId" element={<EventDetailPage />} />
            <Route path="create" element={<CreateEventPage />} />
            <Route path=":eventId/edit" element={<EditEventPage />} />
          </Route>
          
          {/* Profile Route */}
          <Route path="/profile" element={<Layout />}>
            <Route index element={<ProfilePage />} />
          </Route>
          
          {/* Announcement Routes */}
          <Route path="/announcements" element={<Layout />}>
            <Route index element={<AnnouncementsPage />} />
            <Route path="create" element={<CreateAnnouncementPage />} />
            <Route path="edit/:id" element={<EditAnnouncementPage />} />
          </Route>
          
          {/* Leaderboard Routes */}
          <Route path="/leaderboard" element={<Layout />}>
            <Route index element={<LeaderboardPage />} />
            <Route path=":eventId" element={<LeaderboardPage />} />
          </Route>
          
          {/* System Settings Routes - Admin Only */}
          <Route path="/system-settings" element={<Layout />}>
            <Route index element={<SystemSettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
