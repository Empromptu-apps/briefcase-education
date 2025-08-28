import React, { useState, useEffect, useRef } from 'react';
import UploadExtractFlow from './components/UploadExtractFlow';
import ChatbotPanel from './components/ChatbotPanel';
import UploadPromptSummary from './components/UploadPromptSummary';
import DebugPanel from './components/DebugPanel';
import OnboardingTour from './components/OnboardingTour';
import UserProfile from './components/UserProfile';
import ProgressTracker from './components/ProgressTracker';
import NotificationCenter from './components/NotificationCenter';

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [activeView, setActiveView] = useState('dashboard');
  const [apiCalls, setApiCalls] = useState([]);
  const [createdObjects, setCreatedObjects] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('onboardingCompleted');
  });
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : {
      name: '',
      level: '1L',
      preferences: {
        language: 'en',
        difficulty: 'beginner',
        notifications: true
      },
      progress: {
        documentsProcessed: 0,
        casesAnalyzed: 0,
        totalPoints: 0,
        badges: []
      }
    };
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  const logApiCall = (call) => {
    setApiCalls(prev => [...prev, { ...call, timestamp: new Date().toISOString() }]);
  };

  const addCreatedObject = (objectName) => {
    setCreatedObjects(prev => [...new Set([...prev, objectName])]);
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
  };

  const updateUserProgress = (type, increment = 1) => {
    setUserProfile(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [type]: prev.progress[type] + increment,
        totalPoints: prev.progress.totalPoints + (increment * 10)
      }
    }));
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboardingCompleted', 'true');
    addNotification({
      type: 'success',
      title: 'Welcome aboard!',
      message: 'You\'re all set to start your labor law journey.'
    });
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ð ' },
    { id: 'upload-extract', label: 'Document Analysis', icon: 'ð' },
    { id: 'upload-prompt-summary', label: 'AI Assistant', icon: 'ð¤' },
    { id: 'case-studies', label: 'Case Studies', icon: 'âï¸' },
    { id: 'practice', label: 'Practice Tests', icon: 'ð' },
    { id: 'progress', label: 'Progress', icon: 'ð' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour 
          onComplete={completeOnboarding}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
        />
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">âï¸</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  LawLearn AI
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Labor Law Education Assistant
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Progress Indicator */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Level {userProfile.level}
                </span>
                <div className="w-16 h-1 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className="h-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((userProfile.progress.totalPoints % 100), 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                  {userProfile.progress.totalPoints}
                </span>
              </div>

              {/* Notifications */}
              <NotificationCenter 
                notifications={notifications}
                onClearNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
              />
              
              {/* User Profile */}
              <UserProfile 
                userProfile={userProfile}
                setUserProfile={setUserProfile}
              />
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                {darkMode ? 'âï¸' : 'ð'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeView === item.id
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard */}
        {activeView === 'dashboard' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {userProfile.name || 'Student'}! ð
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Continue your labor law education journey
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">ð</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userProfile.progress.documentsProcessed}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Documents Analyzed</p>
              </div>
              
              <div className="card text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">âï¸</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userProfile.progress.casesAnalyzed}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cases Studied</p>
              </div>
              
              <div className="card text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">ð</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userProfile.progress.totalPoints}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
              </div>
              
              <div className="card text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">ðï¸</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userProfile.progress.badges.length}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveView('upload-extract')}
                  className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-400 dark:hover:border-primary-500 transition-colors duration-200 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <span className="text-xl">ð</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Analyze Document
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload and extract key legal information
                      </p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveView('upload-prompt-summary')}
                  className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-400 dark:hover:border-primary-500 transition-colors duration-200 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <span className="text-xl">ð¤</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        AI Assistant
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get personalized analysis and summaries
                      </p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveView('case-studies')}
                  className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-400 dark:hover:border-primary-500 transition-colors duration-200 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                      <span className="text-xl">âï¸</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Study Cases
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Interactive case law research exercises
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              {apiCalls.length > 0 ? (
                <div className="space-y-3">
                  {apiCalls.slice(-3).map((call, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-sm">ð</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {call.endpoint.replace('/', '').replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(call.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent activity. Start by uploading a document or asking the AI assistant a question!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Other Views */}
        {activeView === 'upload-extract' && (
          <UploadExtractFlow 
            onApiCall={logApiCall} 
            onObjectCreated={addCreatedObject}
            onProgress={() => updateUserProgress('documentsProcessed')}
            addNotification={addNotification}
          />
        )}
        
        {activeView === 'upload-prompt-summary' && (
          <UploadPromptSummary 
            onApiCall={logApiCall} 
            onObjectCreated={addCreatedObject}
            onProgress={() => updateUserProgress('documentsProcessed')}
            addNotification={addNotification}
          />
        )}

        {activeView === 'case-studies' && (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">âï¸</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Case Studies Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Interactive case law research exercises with S.D.N.Y. motions and court briefs
            </p>
            <button className="btn-primary">
              Get Notified When Available
            </button>
          </div>
        )}

        {activeView === 'practice' && (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">ð</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Practice Tests Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Gamified assessments with points, badges, and peer collaboration
            </p>
            <button className="btn-primary">
              Get Notified When Available
            </button>
          </div>
        )}

        {activeView === 'progress' && (
          <ProgressTracker userProfile={userProfile} />
        )}
        
        {/* Debug Panel */}
        <DebugPanel 
          apiCalls={apiCalls}
          createdObjects={createdObjects}
          onClearObjects={() => setCreatedObjects([])}
        />
      </main>

      {/* Chatbot Panel */}
      <ChatbotPanel 
        onApiCall={logApiCall} 
        onObjectCreated={addCreatedObject}
        addNotification={addNotification}
      />
    </div>
  );
};

export default App;
