import React, { useState } from 'react';

const OnboardingTour = ({ onComplete, userProfile, setUserProfile }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: userProfile.name || '',
    level: userProfile.level || '1L',
    language: userProfile.preferences?.language || 'en',
    difficulty: userProfile.preferences?.difficulty || 'beginner'
  });

  const steps = [
    {
      title: "Welcome to LawLearn AI! ð",
      content: "Your AI-powered labor law education assistant is here to help you master complex legal concepts, analyze cases, and practice legal writing.",
      action: "Get Started"
    },
    {
      title: "Tell us about yourself",
      content: "Let's personalize your learning experience",
      action: "Continue"
    },
    {
      title: "Choose your preferences",
      content: "We'll tailor the content difficulty and language to match your needs",
      action: "Continue"
    },
    {
      title: "You're all set! ð",
      content: "Start by uploading a legal document or asking our AI assistant a question. You'll earn points and badges as you learn!",
      action: "Start Learning"
    }
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      // Save basic info
      setUserProfile(prev => ({
        ...prev,
        name: formData.name,
        level: formData.level
      }));
    } else if (currentStep === 2) {
      // Save preferences
      setUserProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          language: formData.language,
          difficulty: formData.difficulty
        }
      }));
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Progress Bar */}
        <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Skip
            </button>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {steps[currentStep].title}
          </h2>
          
          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {steps[currentStep].content}
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl mb-2">ð</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Document Analysis</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl mb-2">ð¤</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">AI Assistant</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl mb-2">âï¸</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Case Studies</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {steps[currentStep].content}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What's your name?
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What's your law school level?
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="1L">1L (First Year)</option>
                    <option value="2L">2L (Second Year)</option>
                    <option value="3L">3L (Third Year)</option>
                    <option value="Graduate">Graduate/Professional</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {steps[currentStep].content}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="beginner">Beginner - Clear explanations</option>
                    <option value="intermediate">Intermediate - Balanced detail</option>
                    <option value="advanced">Advanced - Complex analysis</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {steps[currentStep].content}
              </p>
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {formData.name.charAt(0).toUpperCase() || 'S'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formData.name || 'Student'} â¢ {formData.level}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.difficulty} level â¢ {formData.language.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-between items-center mt-6">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn-secondary"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="btn-primary ml-auto"
              disabled={currentStep === 1 && !formData.name.trim()}
            >
              {steps[currentStep].action}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
