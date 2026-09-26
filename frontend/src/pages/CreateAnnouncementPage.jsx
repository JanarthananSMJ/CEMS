import React from 'react';
import { Link } from 'react-router-dom';
import { AnnouncementForm } from '../components/announcements';

const CreateAnnouncementPage = () => {
  return (
    <div className="pb-12">
      <nav className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/home" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/announcements" className="hover:text-brand-600">Announcements</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Create</span>
      </nav>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Create Announcement</h1>
        </div>
        <div className="p-6">
          <AnnouncementForm />
        </div>
      </div>
    </div>
  );
};

export default CreateAnnouncementPage;
