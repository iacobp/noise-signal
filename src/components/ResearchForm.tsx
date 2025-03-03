import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoSend, IoSparklesOutline } from 'react-icons/io5';
import { FaChevronDown } from 'react-icons/fa';
import ExampleQueries from './ExampleQueries';

interface ResearchFormProps {
  onSubmit: (query: string) => Promise<void>;
  isLoading: boolean;
}

export default function ResearchForm({ onSubmit, isLoading }: ResearchFormProps) {
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [showExampleQueries, setShowExampleQueries] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Combine query with industry for better context
    await onSubmit(`${query} in the ${industry} industry`);
  };
  
  const industries = [
    'Technology', 
    'Healthcare', 
    'Finance', 
    'Retail', 
    'Manufacturing',
    'Energy',
    'Education',
    'Entertainment',
    'Real Estate',
    'Transportation'
  ];

  const handleExampleQuerySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
    setShowExampleQueries(false);
  };
  
  return (
    <motion.div
      className="mb-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-center mb-3">
        <div className="inline-flex items-center bg-blue-600 dark:bg-blue-700 rounded-full px-4 py-1.5 text-white">
          <IoSparklesOutline className="mr-1.5 text-sm" />
          <span className="font-medium text-sm">Market Intelligence</span>
        </div>
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-2 px-1 justify-start">
            {/* Industry Dropdown */}
            <div className="relative">
              <select
                id="industry-select"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-md px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
              >
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <FaChevronDown className="h-3 w-3" />
              </div>
            </div>
            
            {/* Example Queries Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExampleQueries(!showExampleQueries)}
                className="flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <span className="mr-1">💡</span>
                Example Queries
                <FaChevronDown className="h-2.5 w-2.5 ml-1.5" />
              </button>
              
              {showExampleQueries && (
                <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-xl z-10">
                  <div className="p-2">
                    <ExampleQueries onSelectQuery={handleExampleQuerySelect} industry={industry} />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Query Input */}
          <div className="relative">
            <input
              id="query-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about technology industry trends... (processing takes ~30 seconds)"
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10 text-sm"
              disabled={isLoading}
            />
            
            {/* Submit Button */}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-md p-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!query.trim() || isLoading}
              aria-label="Submit query"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <IoSend className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
} 