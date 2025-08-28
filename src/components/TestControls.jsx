import React, { useState } from 'react';

const TestControls = ({ dependencyGraph, cacheConfig, onCacheConfigChange, onRunTest, isRunning }) => {
  const [testConfig, setTestConfig] = useState({
    testName: 'Pipeline Test',
    dataSnapshot: 'latest',
    iterations: 1,
    timeout: 30000
  });

  const handleRunTest = () => {
    onRunTest(testConfig);
  };

  const getCacheStats = () => {
    if (!dependencyGraph?.nodes) return { cached: 0, total: 0 };
    
    const total = dependencyGraph.nodes.length;
    const cached = dependencyGraph.nodes.filter(node => cacheConfig[node.id]).length;
    
    return { cached, total };
  };

  const stats = getCacheStats();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Test Configuration
      </h3>

      {/* Test Settings */}
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="test-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Test Name
          </label>
          <input
            id="test-name"
            type="text"
            value={testConfig.testName}
            onChange={(e) => setTestConfig(prev => ({ ...prev, testName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="data-snapshot" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Data Snapshot
          </label>
          <select
            id="data-snapshot"
            value={testConfig.dataSnapshot}
            onChange={(e) => setTestConfig(prev => ({ ...prev, dataSnapshot: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="latest">Latest</option>
            <option value="snapshot_1">Snapshot 1</option>
            <option value="snapshot_2">Snapshot 2</option>
            <option value="baseline">Baseline</option>
          </select>
        </div>

        <div>
          <label htmlFor="iterations" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Iterations
          </label>
          <input
            id="iterations"
            type="number"
            min="1"
            max="10"
            value={testConfig.iterations}
            onChange={(e) => setTestConfig(prev => ({ ...prev, iterations: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cache Configuration
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {stats.cached} of {stats.total} functions cached
          </span>
          <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${stats.total > 0 ? (stats.cached / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Cached functions will use stored results, uncached will execute fresh
        </div>
      </div>

      {/* Quick Cache Presets */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quick Presets
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const config = {};
              dependencyGraph?.nodes?.forEach(node => {
                config[node.id] = node.type !== 'llm';
              });
              onCacheConfigChange(config);
            }}
            className="px-3 py-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            Cache Non-LLM
          </button>
          <button
            onClick={() => {
              const config = {};
              dependencyGraph?.nodes?.forEach(node => {
                config[node.id] = node.type === 'processing';
              });
              onCacheConfigChange(config);
            }}
            className="px-3 py-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            Cache Processing
          </button>
        </div>
      </div>

      {/* Run Test Button */}
      <button
        onClick={handleRunTest}
        disabled={isRunning || !dependencyGraph}
        className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
        aria-label="Run pipeline test"
      >
        {isRunning ? (
          <>
            <div className="spinner"></div>
            <span>Running Test...</span>
          </>
        ) : (
          <>
            <span>â¶ï¸</span>
            <span>Run Test</span>
          </>
        )}
      </button>

      {/* Estimated Cost/Time */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="text-xs text-yellow-700 dark:text-yellow-300">
          <div className="flex justify-between">
            <span>Estimated Time:</span>
            <span>{stats.cached > 0 ? '~2s' : '~15s'}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Cost:</span>
            <span>${(0.05 * (stats.total - stats.cached)).toFixed(3)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestControls;
