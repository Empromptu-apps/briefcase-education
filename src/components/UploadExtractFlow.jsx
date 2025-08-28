import React, { useState, useRef } from 'react';
import { API_CONFIG } from '../utils/api';

const UploadExtractFlow = ({ onApiCall, onObjectCreated, onProgress, addNotification }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [extractedData, setExtractedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFiles) => {
    setFiles(Array.from(selectedFiles));
    setCurrentStep(2);
    processFiles(Array.from(selectedFiles));
    
    addNotification({
      type: 'info',
      title: 'Processing Started',
      message: `Processing ${selectedFiles.length} document${selectedFiles.length !== 1 ? 's' : ''}...`
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const processFiles = async (fileList) => {
    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      const processedData = [];
      
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setProgress(((i + 1) / fileList.length) * 50);

        // Read file content
        const content = await readFileContent(file);
        
        // API Call 1: Input data
        const inputCall = {
          endpoint: '/input_data',
          method: 'POST',
          body: {
            created_object_name: 'legal_documents',
            data_type: 'strings',
            input_data: [content]
          }
        };
        
        onApiCall(inputCall);
        
        const inputResponse = await fetch(`${API_CONFIG.BASE_URL}/input_data`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify(inputCall.body)
        });

        if (!inputResponse.ok) throw new Error('Failed to upload document');
        
        onObjectCreated('legal_documents');
        setProgress(((i + 1) / fileList.length) * 75);

        // API Call 2: Extract key information
        const extractCall = {
          endpoint: '/apply_prompt',
          method: 'POST',
          body: {
            created_object_names: ['extracted_info'],
            prompt_string: 'Extract key labor law concepts, case citations, important dates, parties involved, and legal principles from: {legal_documents}. Format as structured data with clear categories.',
            inputs: [{
              input_object_name: 'legal_documents',
              mode: 'use_individually'
            }]
          }
        };

        onApiCall(extractCall);

        const extractResponse = await fetch(`${API_CONFIG.BASE_URL}/apply_prompt`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify(extractCall.body)
        });

        if (!extractResponse.ok) throw new Error('Failed to extract data');
        
        onObjectCreated('extracted_info');
        setProgress(((i + 1) / fileList.length) * 90);

        // API Call 3: Get extracted data
        const returnCall = {
          endpoint: '/return_data',
          method: 'POST',
          body: {
            object_name: 'extracted_info',
            return_type: 'json'
          }
        };

        onApiCall(returnCall);

        const returnResponse = await fetch(`${API_CONFIG.BASE_URL}/return_data`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify(returnCall.body)
        });

        if (!returnResponse.ok) throw new Error('Failed to retrieve data');
        
        const returnData = await returnResponse.json();
        
        try {
          const parsedData = JSON.parse(returnData.value || '[]');
          processedData.push({
            fileName: file.name,
            data: Array.isArray(parsedData) ? parsedData : [parsedData]
          });
        } catch (parseError) {
          processedData.push({
            fileName: file.name,
            data: [{ content: returnData.value || 'No data extracted' }]
          });
        }
      }

      setExtractedData(processedData);
      setProgress(100);
      setCurrentStep(3);
      
      // Update progress and notify
      onProgress();
      addNotification({
        type: 'success',
        title: 'Processing Complete! ð',
        message: `Successfully processed ${fileList.length} document${fileList.length !== 1 ? 's' : ''} and extracted key legal information.`
      });
      
    } catch (err) {
      setError(err.message);
      addNotification({
        type: 'error',
        title: 'Processing Failed',
        message: err.message
      });
    } finally {
      setLoading(false);
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

  const downloadCSV = () => {
    const csvContent = extractedData.flatMap(file => 
      file.data.map(item => ({
        fileName: file.fileName,
        ...item
      }))
    );

    const headers = Object.keys(csvContent[0] || {});
    const csvString = [
      headers.join(','),
      ...csvContent.map(row => 
        headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_legal_data.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    addNotification({
      type: 'success',
      title: 'Download Complete',
      message: 'CSV file has been downloaded successfully.'
    });
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setFiles([]);
    setExtractedData([]);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[
          { step: 1, label: 'Upload', icon: 'ð' },
          { step: 2, label: 'Process', icon: 'âï¸' },
          { step: 3, label: 'Results', icon: 'ð' }
        ].map(({ step, label, icon }) => (
          <div key={step} className="flex items-center">
            <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              currentStep >= step 
                ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {currentStep > step ? 'â' : icon}
              {currentStep === step && loading && (
                <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              )}
            </div>
            <div className="ml-2 text-center">
              <p className={`text-sm font-medium ${
                currentStep >= step ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {label}
              </p>
            </div>
            {step < 3 && (
              <div className={`w-16 h-1 mx-4 transition-all duration-300 ${
                currentStep > step ? 'bg-gradient-to-r from-primary-500 to-blue-500' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Enhanced File Upload */}
      {currentStep === 1 && (
        <div className="card max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-blue-100 dark:from-primary-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">ð</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Upload Legal Documents
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Upload PDFs, Word docs, or text files to extract key legal information
            </p>
          </div>
          
          <div
            className="upload-zone cursor-pointer group"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload files by clicking or dragging"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Supports PDF, TXT, DOC, DOCX files â¢ Max 10MB per file
                </p>
              </div>
              <button className="btn-primary group-hover:scale-105 transition-transform duration-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Choose Files
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.doc,.docx"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            aria-hidden="true"
          />

          {/* File Type Info */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { ext: 'PDF', icon: 'ð', color: 'text-red-600' },
              { ext: 'DOC', icon: 'ð', color: 'text-blue-600' },
              { ext: 'TXT', icon: 'ð', color: 'text-gray-600' },
              { ext: 'DOCX', icon: 'ð', color: 'text-blue-600' }
            ].map(({ ext, icon, color }) => (
              <div key={ext} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`text-2xl mb-1 ${color}`}>{icon}</div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{ext}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Enhanced Processing */}
      {currentStep === 2 && (
        <div className="card max-w-2xl mx-auto text-center">
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-2xl">âï¸</span>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Extracting Legal Data
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI is analyzing your documents and extracting key legal information
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-center space-x-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                    <span className="text-sm">ð</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-20">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-blue-500 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Processing {files.length} file{files.length !== 1 ? 's' : ''}...
                  </span>
                  <span className="font-medium text-primary-600 dark:text-primary-400">
                    {progress.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Processing Steps */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { label: 'Upload', icon: 'ð¤', active: progress > 0 },
                  { label: 'Analyze', icon: 'ð', active: progress > 50 },
                  { label: 'Extract', icon: 'ð', active: progress > 90 }
                ].map(({ label, icon, active }) => (
                  <div key={label} className={`p-3 rounded-lg transition-all duration-300 ${
                    active ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    <div className="text-xl mb-1">{icon}</div>
                    <p className="text-xs font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {loading && (
              <button
                onClick={() => {
                  setLoading(false);
                  resetFlow();
                }}
                className="btn-secondary"
              >
                Cancel Processing
              </button>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-red-600 text-xl">â</span>
                <p className="text-red-800 dark:text-red-200 font-medium">Processing Failed</p>
              </div>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
              <button onClick={resetFlow} className="btn-primary mt-3">
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Enhanced Results */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">ð</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Extraction Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Successfully processed {files.length} document{files.length !== 1 ? 's' : ''} and extracted key legal information
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <button onClick={downloadCSV} className="btn-success">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Download CSV
            </button>
            <button onClick={resetFlow} className="btn-secondary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Process More Files
            </button>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">
                      ð File Name
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">
                      ð Extracted Content
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {extractedData.map((file, fileIndex) => (
                    file.data.map((item, itemIndex) => (
                      <tr key={`${fileIndex}-${itemIndex}`} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                        <td className="py-4 px-4 text-gray-900 dark:text-white">
                          {itemIndex === 0 && (
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">ð</span>
                              <span className="font-medium">{file.fileName}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                          <div className="max-w-md">
                            {typeof item === 'object' ? (
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                <pre className="text-xs whitespace-pre-wrap font-mono">
                                  {JSON.stringify(item, null, 2)}
                                </pre>
                              </div>
                            ) : (
                              <span className="text-sm">{item}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadExtractFlow;
