import { useState, useEffect } from 'react';
import { adminService } from '../../services';

// The primary admin account's role is locked and can't be changed (enforced server-side too)
const PROTECTED_ADMIN_EMAIL = 'admin@1.com';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleUpdateLoading, setRoleUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserSubmitting, setAddUserSubmitting] = useState(false);
  const [addUserError, setAddUserError] = useState(null);
  const emptyNewUser = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    college: '',
    role: 'participant'
  };
  const [newUser, setNewUser] = useState(emptyNewUser);

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAllUsers();
        setUsers(response.data);
        setFilteredUsers(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  
  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      
      return fullName.includes(lowercasedSearch) || email.includes(lowercasedSearch);
    });
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      setRoleUpdateLoading(true);
      await adminService.updateUserRole(userId, newRole);
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      
      setSuccessMessage(`User role updated successfully to ${newRole}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setRoleUpdateLoading(false);
    }
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddUser = () => {
    setNewUser(emptyNewUser);
    setAddUserError(null);
    setAddUserOpen(true);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserSubmitting(true);
    setAddUserError(null);
    try {
      const response = await adminService.createUser(newUser);
      setUsers(prev => [...prev, response.data]);
      setAddUserOpen(false);
      setSuccessMessage('User created successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setAddUserError(err.message || 'Failed to create user');
    } finally {
      setAddUserSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button
          type="button"
          onClick={handleOpenAddUser}
          className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white py-2 px-4 rounded-md text-sm font-medium transition duration-300"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {/* Search input */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-brand-500 focus:border-brand-500"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {successMessage}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No users found matching your search criteria.
            </div>
          ) : (
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">College</th>
                  <th className="py-3 px-6 text-left">Current Role</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {filteredUsers.map(user => (
                <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="py-3 px-6 text-left">{user.email}</td>
                  <td className="py-3 px-6 text-left">{user.college}</td>
                  <td className="py-3 px-6 text-left">
                    <span className={`py-1 px-3 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-brand-200 text-brand-800' :
                      user.role === 'organizer' ? 'bg-amber-200 text-amber-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      {user.email === PROTECTED_ADMIN_EMAIL ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400" title="The primary admin account's role is locked">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Locked
                        </span>
                      ) : (
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          disabled={roleUpdateLoading}
                        >
                          <option value="participant">Participant</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      )}

      {/* Add User Modal */}
      {addUserOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New User</h3>

              {addUserError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                  {addUserError}
                </div>
              )}

              <form id="add-user-form" onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={newUser.firstName}
                      onChange={handleNewUserChange}
                      required
                      className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={newUser.lastName}
                      onChange={handleNewUserChange}
                      required
                      className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleNewUserChange}
                    required
                    className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleNewUserChange}
                    required
                    minLength={6}
                    className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">College *</label>
                    <input
                      type="text"
                      id="college"
                      name="college"
                      value={newUser.college}
                      onChange={handleNewUserChange}
                      required
                      className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      id="role"
                      name="role"
                      value={newUser.role}
                      onChange={handleNewUserChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    >
                      <option value="participant">Participant</option>
                      <option value="organizer">Organizer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-3">
              <button
                type="submit"
                form="add-user-form"
                disabled={addUserSubmitting}
                className="bg-brand-600 hover:bg-brand-700 text-white py-2 px-4 rounded-md transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {addUserSubmitting ? 'Creating...' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={() => setAddUserOpen(false)}
                disabled={addUserSubmitting}
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

export default UserManagement;