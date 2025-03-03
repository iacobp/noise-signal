import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { LuRocket } from 'react-icons/lu';
import { IoSearch, IoChevronDown, IoChevronUp, IoLink, IoInformationCircleOutline } from 'react-icons/io5';
import { MdOutlineKeyboardArrowRight, MdOutlineLink } from 'react-icons/md';
import { VscBook } from 'react-icons/vsc';
import { RiTestTubeFill } from 'react-icons/ri';

import { ResearchData } from '@/types';

interface DataDisplayProps {
  signals: ResearchData[];
  noise: ResearchData[];
  strategicDecision: string;
  query?: string;
  allOriginalSources?: ResearchData[];
}

// Add custom CSS to hide scrollbars at the start of the component
const scrollbarHideStyles = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;

// Add custom CSS to style scrollbars
const scrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.5);
  }
  
  .signal-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(5, 150, 105, 0.2);
  }
  
  .signal-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(5, 150, 105, 0.4);
  }
  
  .noise-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(239, 68, 68, 0.2);
  }
  
  .noise-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(239, 68, 68, 0.4);
  }
`;

export default function DataDisplay({ 
  signals, 
  noise, 
  strategicDecision, 
  query,
  allOriginalSources = []
}: DataDisplayProps) {
  const [signalExpanded, setSignalExpanded] = useState(true);
  const [noiseExpanded, setNoiseExpanded] = useState(true);
  const [sourcesExpanded, setSourcesExpanded] = useState(true);
  
  // Process strategic decision to ensure proper paragraph formatting
  const formattedDecision = strategicDecision
    .split('\n\n')
    .map((paragraph, i) => (
      <p key={i} className="mb-3 last:mb-0">
        {paragraph}
      </p>
    ));

  // Helper function to format content for display
  const formatContent = (content: string | undefined) => {
    if (!content) return [];

    // Clean up the content by removing references to sources and markdown characters
    const cleanedContent = content
      .replace(/sources:?\s*perplexity/gi, '')
      .replace(/sources:?\s*exa/gi, '')
      .replace(/according to perplexity,?\s*/gi, '')
      .replace(/according to exa,?\s*/gi, '')
      .replace(/perplexity (reports|indicates|states|says|suggests|notes),?\s*/gi, '')
      .replace(/exa (reports|indicates|states|says|suggests|notes),?\s*/gi, '')
      .replace(/research (shows|indicates|suggests|demonstrates|reveals),?\s*/gi, '')
      .replace(/studies (show|indicate|suggest|demonstrate|reveal),?\s*/gi, '')
      .replace(/it is (important|worth noting|notable|significant) (that|to note)?,?\s*/gi, '')
      .replace(/notably,?\s*/gi, '')
      .replace(/in conclusion,?\s*/gi, '')
      .replace(/to summarize,?\s*/gi, '')
      .replace(/in summary,?\s*/gi, '')
      // Remove markdown formatting characters
      .replace(/\*\*/g, '') // Remove bold formatting
      .replace(/\*/g, '')   // Remove italic formatting
      .replace(/#{1,6}\s/g, '') // Remove heading markers
      .replace(/`/g, '');   // Remove code ticks

    // Split content by newlines to preserve deliberate bullet points/paragraphs
    const paragraphs = cleanedContent.split(/\n+/).filter(p => p.trim().length > 0);
    
    // Convert content to properly formatted bullet points
    const bulletPoints = [];
    
    for (const paragraph of paragraphs) {
      // If it's already a bullet point, preserve it
      if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('• ') || paragraph.trim().startsWith('* ')) {
        const bulletContent = paragraph.replace(/^\s*[-•*]\s/, '').trim();
        if (bulletContent.length > 0) {
          // Make sure the bullet point ends with proper punctuation
          let formattedBullet = bulletContent;
          if (!formattedBullet.match(/[.!?]$/)) {
            formattedBullet += '.';
          }
          bulletPoints.push(`• ${formattedBullet}`);
        }
      } else {
        // For regular paragraphs, keep them as single bullet points
        // instead of splitting into sentences
        const trimmed = paragraph.trim();
        if (trimmed.length > 10) { // Only include substantive paragraphs
          let formattedParagraph = trimmed;
          if (!formattedParagraph.match(/[.!?]$/)) {
            formattedParagraph += '.';
          }
          bulletPoints.push(`• ${formattedParagraph}`);
        }
      }
    }
    
    // If we have very few bullet points, try to extract more from the content
    if (bulletPoints.length <= 1 && cleanedContent.length > 100) {
      // Try to create meaningful bullet points from longer content by splitting on commas and semicolons
      const fragments = cleanedContent.split(/[;,]\s+/);
      if (fragments.length > 1) {
        return fragments.map(fragment => {
          const trimmed = fragment.trim();
          if (trimmed.length > 15) { // Only include substantial fragments
            let formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
            if (!formatted.match(/[.!?]$/)) {
              formatted += '.';
            }
            return `• ${formatted}`;
          }
          return null;
        }).filter(Boolean) as string[];
      }
    }
    
    return bulletPoints;
  };
  
  // Helper function to condense a bullet point or sentence
  const condenseBulletPoint = (text: string): string => {
    // Remove common filler phrases
    let condensed = text
      .replace(/(?:it is|there is|there are) (important|worth noting|notable|significant) that\s+/gi, '')
      .replace(/it (can|should|may|might|could) be noted that\s+/gi, '')
      .replace(/(?:additionally|furthermore|moreover|in addition|besides),?\s+/gi, '')
      .replace(/(?:specifically|particularly|especially|in particular),?\s+/gi, '')
      .replace(/(?:generally|typically|usually|commonly|frequently|often),?\s+/gi, '')
      .replace(/(?:for example|for instance|such as),?\s+/gi, '')
      .replace(/\b(?:very|extremely|significantly|substantially|considerably)\s+/gi, '')
      .replace(/\bin order to\b/gi, 'to')
      .replace(/\bin the context of\b/gi, 'in')
      .replace(/\bwith (regards|respect) to\b/gi, 'regarding')
      .replace(/\bon the (basis|grounds) of\b/gi, 'based on')
      .replace(/\bat this (time|point in time|moment|juncture)\b/gi, 'now')
      .replace(/\bin the event that\b/gi, 'if')
      .replace(/\bin spite of the fact that\b/gi, 'although')
      .replace(/\bdue to the fact that\b/gi, 'because')
      .replace(/\bin the near future\b/gi, 'soon');
    
    // Make sure we don't cut off in the middle of a sentence
    if (condensed.length > 130) {
      // Try to find a sensible cutting point
      const cutPoint = Math.max(
        condensed.lastIndexOf('. ', 130),
        condensed.lastIndexOf('? ', 130),
        condensed.lastIndexOf('! ', 130),
        condensed.lastIndexOf(', ', 120)
      );
      
      if (cutPoint > 60) {
        // If we have a sentence or clause boundary, cut there
        if (condensed.charAt(cutPoint) === '.') {
          condensed = condensed.substring(0, cutPoint + 1);
        } else {
          condensed = condensed.substring(0, cutPoint + 1) + '...';
        }
      } else {
        // If no good cutting point, just truncate with ellipsis
        condensed = condensed.substring(0, 130) + '...';
      }
    }
    
    // Make sure sentences end with proper punctuation
    if (!condensed.match(/[.!?]$/)) {
      condensed += '.';
    }
    
    return condensed;
  };
  
  // Determine which sources to use - use allOriginalSources if provided, otherwise fall back to signals + noise
  const usedSources = allOriginalSources.length > 0 
    ? allOriginalSources 
    : [...signals, ...noise];
  
  // Prepare all sources in a single array, sorted by confidence
  const allSources = usedSources
    .sort((a, b) => b.confidence - a.confidence)
    .map((source, index) => ({
      ...source,
      sourceIndex: index + 1, // 1-based index for display
    }));
  
  // Create a lookup map to find source index by URL and content
  const sourceIndexMap = new Map();
  
  // Assign sequential numbers to all sources
  allSources.forEach((source, index) => {
    // Use URL as primary key if available, otherwise use content
    const key = source.url || source.content;
    if (key) {
      sourceIndexMap.set(key, index + 1);
    }
  });
  
  // Helper function to get the source index for a specific item
  const getSourceIndex = (item: ResearchData) => {
    // Try to find by URL first
    if (item.url && sourceIndexMap.has(item.url)) {
      return sourceIndexMap.get(item.url);
    }
    
    // Then try by content
    if (sourceIndexMap.has(item.content)) {
      return sourceIndexMap.get(item.content);
    }
    
    // If not found, return the index from the sorted array
    const foundIndex = allSources.findIndex(
      source => source.url === item.url || source.content === item.content
    );
    
    return foundIndex !== -1 ? foundIndex + 1 : '?';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Add style tag for scrollbar hiding */}
      <style>{scrollbarHideStyles}</style>

      {/* Add style tag for scrollbar styling */}
      <style>{scrollbarStyles}</style>

      {/* Query Display */}
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5">
        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
          <IoSearch className="mr-2" />
          <span className="text-sm">Your search query</span>
        </div>
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
          {query || 'Market Intelligence Query'}
        </h2>
      </div>
      
      {/* Main Title for Noise/Signal */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Noise/Signal</h1>
      </div>
      
      {/* Signal and Noise sections side by side */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Signals Section */}
        <div className="md:w-1/2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg overflow-hidden">
          <div 
            className="flex justify-between items-center p-5 cursor-pointer bg-green-100/50 dark:bg-green-800/30"
            onClick={() => setSignalExpanded(!signalExpanded)}
          >
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 dark:bg-green-700 p-1.5 mr-3">
                <FaCircleCheck className="text-green-600 dark:text-green-400" size={18} />
              </div>
              <h2 className="text-xl font-medium text-green-800 dark:text-green-300">Signal</h2>
              <div className="ml-3 px-2.5 py-1 bg-green-100 dark:bg-green-700/40 rounded-full">
                <span className="text-xs font-medium text-green-700 dark:text-green-300">{signals.length} items</span>
              </div>
            </div>
            <div>
              {signalExpanded ? (
                <IoChevronUp className="text-green-600 dark:text-green-400" />
              ) : (
                <IoChevronDown className="text-green-600 dark:text-green-400" />
              )}
            </div>
          </div>
          
          {signalExpanded && (
            <div className="p-5 bg-white dark:bg-gray-900 max-h-[500px] overflow-y-auto custom-scrollbar signal-scrollbar">
              {/* All Signal Analysis Text First */}
              <div className="mb-6">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">Key Insights:</h4>
                {signals.map((signal, index) => (
                  <div key={index} className="mb-4 pb-4 border-b border-green-100 dark:border-green-800/30 last:border-0 last:pb-0">
                    <div className="text-gray-700 dark:text-gray-300">
                      {formatContent(signal.content).map((part, i) => {
                        // All content is now bullet points
                        return (
                          <div key={i} className="flex items-start mb-2 last:mb-0">
                            <MdOutlineKeyboardArrowRight className="flex-shrink-0 mt-0.5 text-green-600" />
                            <span className="pl-1">{part.replace(/^•\s/, '')}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2">
                      <span className="text-green-600/70 dark:text-green-400/70">
                        Confidence: {Math.round(signal.confidence * 100)}%
                      </span>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        Source #{getSourceIndex(signal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Noise Section */}
        <div className="md:w-1/2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg overflow-hidden">
          <div 
            className="flex justify-between items-center p-5 cursor-pointer bg-red-100/50 dark:bg-red-800/30"
            onClick={() => setNoiseExpanded(!noiseExpanded)}
          >
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 dark:bg-red-700 p-1.5 mr-3">
                <FaCircleXmark className="text-red-600 dark:text-red-400" size={18} />
              </div>
              <h2 className="text-xl font-medium text-red-800 dark:text-red-300">Noise</h2>
              <div className="ml-3 px-2.5 py-1 bg-red-100 dark:bg-red-700/40 rounded-full">
                <span className="text-xs font-medium text-red-700 dark:text-red-300">{noise.length} items</span>
              </div>
            </div>
            <div>
              {noiseExpanded ? (
                <IoChevronUp className="text-red-600 dark:text-red-400" />
              ) : (
                <IoChevronDown className="text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
          
          {noiseExpanded && (
            <div className="p-5 bg-white dark:bg-gray-900 max-h-[500px] overflow-y-auto custom-scrollbar noise-scrollbar">
              {/* All Noise Analysis Text First */}
              <div className="mb-6">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-3">Less Relevant Information:</h4>
                {noise.map((item, index) => (
                  <div key={index} className="mb-4 pb-4 border-b border-red-100 dark:border-red-800/30 last:border-0 last:pb-0">
                    <div className="text-gray-700 dark:text-gray-300 prose prose-sm max-w-none">
                      {item.content && item.content.split('\n\n').map((paragraph, i) => (
                        <p key={i} className="mb-3 last:mb-0 leading-relaxed text-base">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2">
                      <span className="text-red-600/70 dark:text-red-400/70">
                        Confidence: {Math.round(item.confidence * 100)}%
                      </span>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        Source #{getSourceIndex(item)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Sources Section */}
      <motion.div
        className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div 
          className="flex justify-between items-center p-5 cursor-pointer bg-gray-100 dark:bg-gray-800"
          onClick={() => setSourcesExpanded(!sourcesExpanded)}
        >
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 dark:bg-blue-800/50 p-1.5 mr-3">
              <VscBook className="text-blue-600 dark:text-blue-400" size={18} />
            </div>
            <h2 className="text-xl font-medium text-gray-800 dark:text-gray-300">Sources</h2>
            <div className="ml-3 px-2.5 py-1 bg-blue-100 dark:bg-blue-700/40 rounded-full">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{allSources.length} sources</span>
            </div>
          </div>
          <div>
            {sourcesExpanded ? (
              <IoChevronUp className="text-gray-600 dark:text-gray-400" />
            ) : (
              <IoChevronDown className="text-gray-600 dark:text-gray-400" />
            )}
          </div>
        </div>
        
        {sourcesExpanded && (
          <div className="p-5 bg-white dark:bg-gray-900 max-h-[500px] overflow-y-auto custom-scrollbar">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Sources are ordered by relevance and confidence level.
            </p>
            <div className="space-y-4">
              {allSources.map((source, index) => (
                <div 
                  key={index} 
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center mb-3">
                    <div className={`
                      w-7 h-7 rounded-full flex items-center justify-center mr-3 text-white 
                      ${source.confidence > 0.7 
                        ? 'bg-blue-600 dark:bg-blue-700' 
                        : source.confidence > 0.4 
                          ? 'bg-yellow-500 dark:bg-yellow-600' 
                          : 'bg-gray-500 dark:bg-gray-600'
                      }
                    `}>
                      <span className="text-xs font-medium">{source.sourceIndex}</span>
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">{source.source}</h3>
                    <div className={`
                      ml-auto px-2 py-0.5 rounded-full text-xs font-medium
                      ${source.confidence > 0.7 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                        : source.confidence > 0.4 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }
                    `}>
                      Confidence: {Math.round(source.confidence * 100)}%
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {source.content.length > 150 
                      ? `${source.content.substring(0, 147)}...` 
                      : source.content}
                  </div>
                  
                  {source.url && (
                    <div className="flex items-center text-xs">
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                      >
                        <IoLink className="mr-1" />
                        <span className="truncate max-w-md">
                          {source.url.length > 60 
                            ? `${source.url.substring(0, 57)}...` 
                            : source.url}
                        </span>
                      </a>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {source.fetchedBy && `Provider: ${source.fetchedBy.charAt(0).toUpperCase() + source.fetchedBy.slice(1)}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Strategic Direction - BOTTOM SECTION */}
      <motion.div
        className="bg-gradient-to-r from-yellow-50 to-yellow-100/40 dark:from-yellow-900/30 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700/30 rounded-lg p-6 shadow-lg mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center mb-4">
          <div className="mr-3 bg-yellow-100 dark:bg-yellow-800/50 p-2 rounded-full">
            <LuRocket className="text-yellow-700 dark:text-yellow-300 text-xl" />
          </div>
          <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-300">Strategic Direction</h2>
        </div>
        <div className="text-gray-800 dark:text-yellow-100 leading-relaxed">
          {formattedDecision}
        </div>
        <div className="text-xs text-yellow-700/70 dark:text-yellow-400/70 mt-4 pt-3 border-t border-yellow-200 dark:border-yellow-700/30">
          Based on analysis of {signals.length} signal{signals.length !== 1 ? 's' : ''} and {noise.length} noise item{noise.length !== 1 ? 's' : ''}
        </div>
      </motion.div>
    </motion.div>
  );
} 