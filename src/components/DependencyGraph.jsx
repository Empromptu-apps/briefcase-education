import React from 'react';

const DependencyGraph = ({ graph, cacheConfig, onCacheConfigChange }) => {
  if (!graph) return null;

  const handleToggleCache = (nodeId) => {
    onCacheConfigChange(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const getNodeColor = (type) => {
    switch (type) {
      case 'llm': return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600';
      case 'baml': return 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-600';
      case 'processing': return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-600';
      default: return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'llm': return 'ð¤';
      case 'baml': return 'â¡';
      case 'processing': return 'âï¸';
      default: return 'ð¦';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Pipeline Dependencies
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const allCached = {};
              graph.nodes?.forEach(node => allCached[node.id] = true);
              onCacheConfigChange(allCached);
            }}
            className="px-3 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
          >
            Cache All
          </button>
          <button
            onClick={() => onCacheConfigChange({})}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {graph.nodes?.map((node, index) => (
          <div key={node.id} className="relative">
            <div className={`p-4 rounded-xl border-2 ${getNodeColor(node.type)} transition-all hover:shadow-md`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(node.type)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {node.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {node.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Cache
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cacheConfig[node.id] || false}
                      onChange={() => handleToggleCache(node.id)}
                      className="sr-only peer"
                      aria-label={`Toggle cache for ${node.name}`}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Connection Line */}
            {index < graph.nodes.length - 1 && (
              <div className="flex justify-center py-2">
                <div className="w-0.5 h-4 bg-gray-300 dark:bg-gray-600"></div>
                <div className="absolute mt-1 text-gray-400 text-xs">â</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Node Types:
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
            <span>ð¤</span><span>LLM Call</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
            <span>â¡</span><span>BAML</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
            <span>âï¸</span><span>Processing</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default DependencyGraph;
