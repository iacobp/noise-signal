'use client';

import React, { useState } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { FaChevronUp } from 'react-icons/fa';
import Image from 'next/image';

import WelcomeScreen from '@/components/WelcomeScreen';
import ResearchForm from '@/components/ResearchForm';
import DataDisplay from '@/components/DataDisplay';
import AboutModal from '@/components/AboutModal';
import ThemeToggle from '@/components/ThemeToggle';
import { fetchResearchData } from '@/services/researchService';
import { classifyData } from '@/services/openaiService';
import { ClassifiedData, ResearchData } from '@/types';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClassifiedData | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [allSources, setAllSources] = useState<ResearchData[]>([]);

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  // Add scroll event listener
  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = () => {
    setShowWelcome(false);
  };

  const handleSubmit = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentQuery(query);
      
      // First, fetch all research data
      const allResearchData = await fetchResearchData(query);
      setAllSources(allResearchData);
      
      // Then process the research data without fetching it again
      console.log('[PAGE] Classifying already fetched research data...');
      const classifiedData = await classifyData(allResearchData, query);
      setResult(classifiedData);
    } catch (err) {
      console.error('Error processing query:', err);
      setError('An error occurred while processing your query. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {showWelcome ? (
          <WelcomeScreen onStart={handleStart} />
        ) : (
          <>
            {/* Header with logo, about button and theme toggle */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <Image src="/logos/NS icon blue.png" alt="Noise/Signal Logo" width={40} height={40} className="mr-3" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Noise/Signal</h1>
                <div className="flex items-center ml-2">
                  <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-1.5 py-0.5 rounded">
                    BETA
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full shadow-md transition-colors"
                  aria-label="About Noise/Signal"
                >
                  <IoInformationCircleOutline className="text-gray-600 dark:text-gray-300 text-xl" />
                </button>
                <ThemeToggle />
              </div>
            </div>
            
            {/* Research Form */}
            <ResearchForm onSubmit={handleSubmit} isLoading={isLoading} />
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-100 dark:bg-red-900 dark:bg-opacity-30 border border-red-300 dark:border-red-700 dark:border-opacity-50 text-red-700 dark:text-red-300 p-4 rounded-md mb-8">
                {error}
              </div>
            )}
            
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 border-4 border-blue-500 dark:border-blue-600 border-t-blue-300 dark:border-t-blue-400 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700 dark:text-gray-300 text-center max-w-md">
                  Processing your query using multiple research sources. This typically takes about 30 seconds...
                </p>
              </div>
            )}
            
            {/* Results */}
            {!isLoading && result && (
              <DataDisplay
                signals={result.signals}
                noise={result.noise}
                strategicDecision={result.strategicDecision}
                query={currentQuery}
                allOriginalSources={allSources}
              />
            )}
            
            {/* Scroll to top button */}
            {showScrollTop && (
              <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-3 rounded-full shadow-lg transition-colors z-10 animate-fade-in"
                aria-label="Scroll to top"
              >
                <FaChevronUp className="text-gray-600 dark:text-gray-300 text-sm" />
              </button>
            )}
            
            {/* About Modal */}
            <AboutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          </>
        )}
      </div>
    </main>
  );
} 