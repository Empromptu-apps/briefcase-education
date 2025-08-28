import React, { useState } from 'react';

const UserProfile = ({ userProfile, setUserProfile }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(userProfile);

  const handleSave = () => {
    setUserProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(userProfile);
    setIsEditing(false);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'S';
  };

  const getLevelColor = (level) => {
    switch (level) {
      case '1L': return 'bg-green-500';
      case '2L': return 'bg-blue-500';
      case '3L': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setShowProfile(!showProfile)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        aria-label="User profile"
      >
        <div className={`w-8 h-8 ${getLevelColor(userProfile.level)} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
          {getInitials(userProfile.name)}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {userProfile.name || 'Student'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {userProfile.level}
          </p>
        </div>
      </button>

      {/* Profile Dropdown */}
      {showProfile && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-6">
            {!isEditing ? (
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 ${getLevelColor(userProfile.level)} rounded-full flex items-center justify-center text-white text-xl font-bold`}>
                    {getInitials(userProfile.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {userProfile.name || 'Student'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {userProfile.level} Law Student
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-12 h-1 bg-gray-200 dark:bg-gray-600 rounded-full">
                        <div 
                          className="h-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full"
                          style={{ width: `${Math.min((userProfile.progress.totalPoints % 100), 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {userProfile.progress.totalPoints} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {userProfile.progress.documentsProcessed}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Documents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {userProfile.progress.casesAnalyzed}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Cases</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {userProfile.progress.badges.length}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Badges</p>
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Preferences</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Language: {userProfile.preferences?.language?.toUpperCase() || 'EN'}</p>
                    <p>Difficulty: {userProfile.preferences?.difficulty || 'Beginner'}</p>
                    <p>Notifications: {userProfile.preferences?.notifications ? 'On' : 'Off'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary flex-1"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowProfile(false)}
                    className="btn-secondary flex-1"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Profile
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Level
                    </label>
                    <select
                      value={editForm.level}
                      onChange={(e) => setEditForm(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="1L">1L (First Year)</option>
                      <option value="2L">2L (Second Year)</option>
                      <option value="3L">3L (Third Year)</option>
                      <option value="Graduate">Graduate/Professional</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Language
                    </label>
                    <select
                      value={editForm.preferences?.language || 'en'}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, language: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={editForm.preferences?.difficulty || 'beginner'}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, difficulty: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={editForm.preferences?.notifications || false}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, notifications: e.target.checked }
                      }))}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="notifications" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Enable notifications
                    </label>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button onClick={handleSave} className="btn-success flex-1">
                    Save Changes
                  </button>
                  <button onClick={handleCancel} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
