import React, { useState } from 'react';
import { API_CONFIG } from '../utils/api';

const DebugPanel = ({ apiCalls, createdObjects, onClearObjects }) => {
  const [showDebug, setShowDebug] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [rawData, setRawData] = useState('');
  const [loading, setLoading] = useState(false);

  const showRawApiData = async () => {
    setLoading(true);
    setShowRawData(true);
    
    try {
      let allData = {};
      
      for (const objectName of createdObjects) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/return_data`, {
            method: 'POST',
            headers: API_CONFIG.HEADERS,
            body: JSON.stringify({
              object_name: objectName,
              return_type: 'raw_text'
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            allData[objectName] = data.value;
          }
        } catch (error) {
          allData[objectName] = `Error: ${error.message}`;
        }
      }
      
      setRawData(JSON.stringify({
        apiCalls: apiCalls,
        objectData: allData
      }, null, 2));
    } catch (error) {
      setRawData(`Error fetching data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteAllObjects = async () => {
    setLoading(true);
    
    try {
      for (const objectName of createdObjects) {
        try {
          await fetch(`${API_CONFIG.BASE_URL}/objects/${objectName}`, {
            method: 'DELETE',
            headers: API_CONFIG.HEADERS
          });
        } catch (error) {
          console.error(`Failed to delete ${objectName}:`, error);
        }
      }
      onClearObjects();
    } catch (error) {
      console.error('Failed to delete objects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 space-y-4">
      {/* Control Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="btn-secondary"
        >
          {showDebug ? 'Hide' : 'Show'} Debug Info
        </button>
        
        <button
          onClick={showRawApiData}
          disabled={loading || createdObjects.length === 0}
          className="btn-success"
        >
          {loading ? 'Loading...' : 'Show Raw API Data'}
        </button>
        
        <button
          onClick={deleteAllObjects}
          disabled={loading || createdObjects.length === 0}
          className="btn-danger"
        >
          {loading ? 'Deleting...' : `Delete All Objects (${createdObjects.length})`}
        </button>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Debug Information
          </h3>
          
          <div className="space-y-6">
            {/* Created Objects */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Created Objects ({createdObjects.length})
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                {createdObjects.length > 0 ? (
                  <ul className="space-y-1">
                    {createdObjects.map((obj, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                        â¢ {obj}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No objects created yet</p>
                )}
              </div>
            </div>

            {/* API Calls */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Recent API Calls ({apiCalls.length})
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 max-h-64 overflow-y-auto">
                {apiCalls.length > 0 ? (
                  <div className="space-y-3">
                    {apiCalls.slice(-5).map((call, index) => (
                      <div key={index} className="text-xs">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            {call.method}
                          </span>
                          <span className="font-mono text-gray-700 dark:text-gray-300">
                            {call.endpoint}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {new Date(call.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <pre className="bg-white dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(call.body, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No API calls made yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Raw Data Modal */}
      {showRawData && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Raw API Input/Output Data
              </h3>
              <button
                onClick={() => setShowRawData(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
                {rawData}
              </pre>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(rawData);
                }}
                className="btn-secondary"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
