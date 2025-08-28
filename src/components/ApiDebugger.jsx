import React, { useState } from 'react';

const ApiDebugger = ({ apiCalls, createdObjects }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return 'â';
      case 'error': return 'â';
      default: return 'â³';
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <div 
        className="p-4 cursor-pointer flex items-center justify-between border-b border-gray-200 dark:border-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            API Debug Console
          </h3>
          <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs">
            {apiCalls.length} calls
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
            ð Raw Data
          </button>
          <span className="text-gray-400">
            {isExpanded ? 'â¼' : 'â¶'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {/* Created Objects */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Created Objects ({createdObjects.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {createdObjects.map((objectName) => (
                <span
                  key={objectName}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-mono"
                >
                  {objectName}
                </span>
              ))}
              {createdObjects.length === 0 && (
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  No objects created yet
                </span>
              )}
            </div>
          </div>

          {/* API Calls */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recent API Calls
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {apiCalls.map((call) => (
                <div
                  key={call.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setSelectedCall(call)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{getStatusIcon(call.status)}</span>
                      <span className="font-mono text-sm text-gray-900 dark:text-white">
                        {call.method} {call.endpoint}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${getStatusColor(call.status)}`}>
                        {call.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(call.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {apiCalls.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No API calls yet. Upload code to start debugging.
                </div>
              )}
            </div>
          </div>

          {/* Detailed Call Modal */}
          {selectedCall && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      API Call Details
                    </h4>
                    <button
                      onClick={() => setSelectedCall(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
                      aria-label="Close API call details"
                    >
                      Ã
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Request</h5>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="text-sm font-mono text-gray-700 dark:text-gray-300 mb-2">
                          {selectedCall.method} {selectedCall.endpoint}
                        </div>
                        <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {JSON.stringify(selectedCall.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Response</h5>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {JSON.stringify(selectedCall.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiDebugger;
