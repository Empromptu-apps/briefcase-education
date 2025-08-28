import React from 'react';

const ProgressTracker = ({ userProfile }) => {
  const achievements = [
    { id: 'first_doc', name: 'First Document', description: 'Analyzed your first legal document', icon: 'ð', earned: userProfile.progress.documentsProcessed > 0 },
    { id: 'doc_master', name: 'Document Master', description: 'Analyzed 10 documents', icon: 'ð', earned: userProfile.progress.documentsProcessed >= 10 },
    { id: 'case_analyst', name: 'Case Analyst', description: 'Studied your first case', icon: 'âï¸', earned: userProfile.progress.casesAnalyzed > 0 },
    { id: 'point_collector', name: 'Point Collector', description: 'Earned 100 points', icon: 'ð', earned: userProfile.progress.totalPoints >= 100 },
    { id: 'scholar', name: 'Legal Scholar', description: 'Earned 500 points', icon: 'ð', earned: userProfile.progress.totalPoints >= 500 },
    { id: 'expert', name: 'Labor Law Expert', description: 'Earned 1000 points', icon: 'ð¨ââï¸', earned: userProfile.progress.totalPoints >= 1000 }
  ];

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const nextLevelPoints = Math.ceil(userProfile.progress.totalPoints / 100) * 100;
  const currentLevelProgress = userProfile.progress.totalPoints % 100;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Progress ð
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Overall Progress */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Overall Progress
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Level Progress */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Level Progress
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentLevelProgress}/100 to next level
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${currentLevelProgress}%` }}
              />
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.progress.totalPoints}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">points</span>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Activity Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Documents Processed</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {userProfile.progress.documentsProcessed}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cases Analyzed</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {userProfile.progress.casesAnalyzed}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {achievements.filter(a => a.earned).length}/{achievements.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Achievements & Badges
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                achievement.earned
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <div className="text-center space-y-2">
                <div className={`text-3xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                <h4 className={`font-medium ${
                  achievement.earned 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {achievement.name}
                </h4>
                <p className={`text-xs ${
                  achievement.earned 
                    ? 'text-green-600 dark:text-green-300' 
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {achievement.description}
                </p>
                {achievement.earned && (
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    â Earned
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Learning Goals
        </h3>
        
        <div className="space-y-6">
          {/* Documents Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ð Process 25 Documents
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {userProfile.progress.documentsProcessed}/25
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(userProfile.progress.documentsProcessed, 25)}%` }}
              />
            </div>
          </div>

          {/* Cases Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                âï¸ Analyze 10 Cases
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {userProfile.progress.casesAnalyzed}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(userProfile.progress.casesAnalyzed, 10)}%` }}
              />
            </div>
          </div>

          {/* Points Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ð Earn 1000 Points
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {userProfile.progress.totalPoints}/1000
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(userProfile.progress.totalPoints, 1000)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
