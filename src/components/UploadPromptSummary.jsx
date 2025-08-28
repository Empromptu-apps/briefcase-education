import React, { useState, useRef } from 'react';
import { API_CONFIG } from '../utils/api';

const UploadPromptSummary = ({ onApiCall, onObjectCreated, onProgress, addNotification }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const promptSuggestions = [
    "Summarize the key legal arguments and identify any labor law violations mentioned.",
    "Extract all case citations and legal precedents referenced in this document.",
    "Identify the parties involved, important dates, and legal outcomes.",
    "Analyze the document for compliance with S.D.N.Y. court procedures.",
    "Extract key facts and legal issues for case study purposes."
  ];

  const handleFileUpload = async (file) => {
    setUploadedFile(file);
    setUploadProgress(0);
    setError(null);

    addNotification({
      type: 'info',
      title: 'Upload Started',
      message: `Uploading ${file.name}...`
    });

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const content = await readFileContent(file);
      
      // API Call: Upload document
      const uploadCall = {
        endpoint: '/input_data',
        method: 'POST',
        body: {
          created_object_name: 'uploaded_document',
          data_type: 'strings',
          input_data: [content]
        }
      };

      onApiCall(uploadCall);

      const response = await fetch(`${API_CONFIG.BASE_URL}/input_data`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(uploadCall.body)
      });

      if (!response.ok) throw new Error('Upload failed');
      
      onObjectCreated('uploaded_document');
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      addNotification({
        type: 'success',
        title: 'Upload Complete',
        message: `${file.name} uploaded successfully!`
      });
    } catch (err) {
      setError(err.message);
      setUploadProgress(0);
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: err.message
      });
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const runAnalysis = async () => {
    if (!uploadedFile || !prompt.trim()) return;

    setLoading(true);
    setError(null);
    setSummary('');

    addNotification({
      type: 'info',
      title: 'Analysis Started',
      message: 'AI is analyzing your document...'
    });

    try {
      // API Call: Apply prompt to document
      const analysisCall = {
        endpoint: '/apply_prompt',
        method: 'POST',
        body: {
          created_object_names: ['analysis_result'],
          prompt_string: `${prompt.trim()}\n\nDocument content: {uploaded_document}`,
          inputs: [{
            input_object_name: 'uploaded_document',
            mode: 'combine_events'
          }]
        }
      };

      onApiCall(analysisCall);

      const response = await fetch(`${API_CONFIG.BASE_URL}/apply_prompt`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(analysisCall.body)
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      onObjectCreated('analysis_result');

      // API Call: Get results
      const resultCall = {
        endpoint: '/return_data',
        method: 'POST',
        body: {
          object_name: 'analysis_result',
          return_type: 'pretty_html'
        }
      };

      onApiCall(resultCall);

      const resultResponse = await fetch(`${API_CONFIG.BASE_URL}/return_data`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(resultCall.body)
      });

      if (!resultResponse.ok) throw new Error('Failed to get results');
      
      const resultData = await resultResponse.json();
      setSummary(resultData.value || 'No analysis generated');
      
      // Update progress and notify
      onProgress();
      addNotification({
        type: 'success',
        title: 'Analysis Complete! ð',
        message: 'Your document has been analyzed successfully.'
      });
    } catch (err) {
      setError(err.message);
      addNotification({
        type: 'error',
        title: 'Analysis Failed',
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setPrompt('');
    setSummary('');
    setError(null);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Document Assistant ð¤
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a document, provide instructions, and get AI-powered analysis
        </p>
      </div>

      {/* Three Column Layout - Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-sm">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Upload Document
            </h3>
          </div>
          
          <div className="card">
            {!uploadedFile ? (
              <div
                className="upload-zone cursor-pointer group"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Upload document"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Drop file here
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      or click to browse
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                
                {uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
                
                <button onClick={reset} className="btn-secondary w-full">
                  Upload Different File
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Prompt Column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-sm">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Enter Instructions
            </h3>
          </div>
          
          <div className="card">
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter instructions for analyzing the document..."
                className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                aria-describedby="char-count"
              />
              
              {/* Prompt Suggestions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quick suggestions:
                </p>
                <div className="space-y-1">
                  {promptSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(suggestion)}
                      className="w-full text-left text-xs p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 transition-colors duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p id="char-count" className="text-xs text-gray-500 dark:text-gray-400">
                  {prompt.length} characters
                </p>
                
                <button
                  onClick={runAnalysis}
                  disabled={!uploadedFile || !prompt.trim() || loading}
                  className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Run Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-sm">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Analysis
            </h3>
          </div>
          
          <div className="card min-h-[400px]">
            {!summary && !loading && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium mb-2">Ready for Analysis</p>
                <p className="text-sm">Upload a document and enter instructions to see the AI analysis here.</p>
              </div>
            )}
            
            {loading && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Analyzing Document</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This may take a few moments...</p>
              </div>
            )}
            
            {summary && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 text-xl">â</span>
                    <span className="font-medium text-gray-900 dark:text-white">Analysis Complete</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(summary.replace(/<[^>]*>/g, ''));
                      addNotification({
                        type: 'success',
                        title: 'Copied!',
                        message: 'Analysis copied to clipboard.'
                      });
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Copy Text
                  </button>
                </div>
                <div 
                  className="prose dark:prose-invert max-w-none text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                  dangerouslySetInnerHTML={{ __html: summary }}
                  aria-describedby="summary-description"
                />
                <p id="summary-description" className="sr-only">
                  AI-generated analysis of the uploaded document
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Analysis Error</p>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPromptSummary;
