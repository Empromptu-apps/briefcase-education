import React, { useState } from 'react';

const ResultsView = ({ results }) => {
  const [selectedResult, setSelectedResult] = useState(null);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  const sortedResults = [...results].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'timestamp') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const downloadCSV = () => {
    if (results.length === 0) return;
    
    const headers = ['Timestamp', 'Execution Time (ms)', 'Cache Hits', 'Cache Misses', 'Latency (ms)', 'Cost ($)', 'Accuracy'];
    const csvData = results.map(result => [
      new Date(result.timestamp).toLocaleString(),
      result.execution_time,
      result.cache_hits,
      result.cache_misses,
      result.performance_metrics?.latency || 'N/A',
      result.performance_metrics?.cost || 'N/A',
      result.performance_metrics?.accuracy || 'N/A'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aansh_eval_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Test Results
        </h3>
        {results.length > 0 && (
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center space-x-2"
            aria-label="Download results as CSV"
          >
            <span>ð¥</span>
            <span>Download CSV</span>
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">ð</div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No test results yet
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            Run a test to see performance metrics and results here
          </p>
        </div>
      ) : (
        <>
          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="table table-hover w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th 
                    className="text-left py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('timestamp')}
                    aria-label="Sort by timestamp"
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</span>
                      {sortBy === 'timestamp' && (
                        <span className="text-xs">{sortOrder === 'asc' ? 'â' : 'â'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('execution_time')}
                    aria-label="Sort by execution time"
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</span>
                      {sortBy === 'execution_time' && (
                        <span className="text-xs">{sortOrder === 'asc' ? 'â' : 'â'}</span>
                      )}
                    </div>
                  </th>
                  <th className="text-left py-3 px-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cache</span>
                  </th>
                  <th className="text-left py-3 px-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Performance</span>
                  </th>
                  <th className="text-left py-3 px-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result) => (
                  <tr key={result.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(result.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.execution_time}ms
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <span className="text-green-600 dark:text-green-400">{result.cache_hits}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-red-600 dark:text-red-400">{result.cache_misses}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        hits/misses
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-xs space-y-1">
                        {result.performance_metrics?.latency && (
                          <div className="text-gray-600 dark:text-gray-400">
                            Latency: {result.performance_metrics.latency}ms
                          </div>
                        )}
                        {result.performance_metrics?.cost && (
                          <div className="text-gray-600 dark:text-gray-400">
                            Cost: ${result.performance_metrics.cost}
                          </div>
                        )}
                        {result.performance_metrics?.accuracy && (
                          <div className="text-gray-600 dark:text-gray-400">
                            Accuracy: {result.performance_metrics.accuracy}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => setSelectedResult(result)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                        aria-label="View detailed results"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed Result Modal */}
          {selectedResult && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Test Result Details
                    </h4>
                    <button
                      onClick={() => setSelectedResult(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
                      aria-label="Close details"
                    >
                      Ã
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Function Outputs
                      </h5>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {JSON.stringify(selectedResult.function_outputs, null, 2)}
                        </pre>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Performance Metrics
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <div className="text-sm text-blue-600 dark:text-blue-400">Execution Time</div>
                          <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                            {selectedResult.execution_time}ms
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <div className="text-sm text-green-600 dark:text-green-400">Cache Efficiency</div>
                          <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                            {Math.round((selectedResult.cache_hits / (selectedResult.cache_hits + selectedResult.cache_misses)) * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResultsView;
