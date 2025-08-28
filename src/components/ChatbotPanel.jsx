import React, { useState, useRef, useEffect } from 'react';
import { API_CONFIG } from '../utils/api';

const ChatbotPanel = ({ onApiCall, onObjectCreated, addNotification }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentId, setAgentId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickQuestions = [
    "What are the key principles of labor law?",
    "How do I analyze a legal case?",
    "What should I include in a motion draft?",
    "Explain employment discrimination laws",
    "Help me understand collective bargaining"
  ];

  useEffect(() => {
    if (isOpen && !agentId) {
      initializeAgent();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeAgent = async () => {
    try {
      const createCall = {
        endpoint: '/create-agent',
        method: 'POST',
        body: {
          instructions: 'You are an expert labor law education assistant. Help law students understand labor law concepts, analyze cases, and practice legal writing. Provide clear explanations suitable for 1L, 2L, and 3L students. Always be encouraging and supportive.',
          agent_name: 'Labor Law Tutor'
        }
      };

      onApiCall(createCall);

      const response = await fetch(`${API_CONFIG.BASE_URL}/create-agent`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(createCall.body)
      });

      if (!response.ok) throw new Error('Failed to create agent');
      
      const data = await response.json();
      setAgentId(data.agent_id);
      
      setMessages([{
        type: 'assistant',
        content: 'Hello! I\'m your AI labor law tutor. I can help you understand legal concepts, analyze cases, and practice legal writing. What would you like to learn about today? ðâï¸'
      }]);
    } catch (error) {
      console.error('Failed to initialize agent:', error);
      addNotification({
        type: 'error',
        title: 'Chat Error',
        message: 'Failed to initialize AI assistant.'
      });
    }
  };

  const sendMessage = async (messageText = null) => {
    const userMessage = messageText || inputValue.trim();
    if (!userMessage || loading || !agentId) return;

    setInputValue('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const chatCall = {
        endpoint: '/chat',
        method: 'POST',
        body: {
          agent_id: agentId,
          message: userMessage
        }
      };

      onApiCall(chatCall);

      const response = await fetch(`${API_CONFIG.BASE_URL}/chat`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(chatCall.body)
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      setMessages(prev => [...prev, { type: 'assistant', content: data.response }]);
      
      addNotification({
        type: 'info',
        title: 'AI Response',
        message: 'Your question has been answered!'
      });
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
      addNotification({
        type: 'error',
        title: 'Chat Error',
        message: 'Failed to get AI response.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Mobile Full Screen */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-white dark:bg-gray-900">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-600 to-blue-600">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-sm">ð¤</span>
                </div>
                <div>
                  <span className="text-white font-medium">AI Tutor</span>
                  <p className="text-xs text-blue-100">Labor Law Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 p-2"
                aria-label="Close chat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-blue-100 dark:from-primary-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">ð¤</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Ask me anything about labor law!
                  </p>
                  <div className="space-y-2">
                    {quickQuestions.slice(0, 3).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(question)}
                        className="block w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-br-md' 
                      : message.type === 'error'
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-bl-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about labor law..."
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={loading}
                  aria-label="Type your message"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !inputValue.trim()}
                  className="p-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-full hover:from-primary-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  aria-label="Send message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Panel */}
      <div className={`hidden md:block fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isOpen ? 'w-96 h-[500px]' : 'w-auto h-auto'
      }`}>
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white px-4 py-3 rounded-full shadow-lg flex items-center space-x-3 transition-all duration-200 group"
            aria-label="Open chat help"
          >
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-sm">ð¤</span>
            </div>
            <div className="text-left">
              <span className="font-medium block">AI Tutor</span>
              <span className="text-xs text-blue-100">Ask me anything!</span>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </button>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-600 to-blue-600 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-xs">ð¤</span>
                </div>
                <div>
                  <span className="text-white font-medium text-sm">AI Tutor</span>
                  <p className="text-xs text-blue-100">Labor Law Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 p-1"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite">
              {messages.length === 0 && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-blue-100 dark:from-primary-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">ð¤</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Quick questions:
                  </p>
                  <div className="space-y-1">
                    {quickQuestions.slice(0, 2).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(question)}
                        className="block w-full text-left p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-br-md' 
                      : message.type === 'error'
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-bl-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={loading}
                  aria-label="Type your message"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !inputValue.trim()}
                  className="p-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-full hover:from-primary-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed bottom-4 right-4 z-50 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200"
          aria-label="Open chat help"
        >
          <div className="relative">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-sm">ð¤</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </button>
      )}
    </>
  );
};

export default ChatbotPanel;
