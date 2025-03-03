import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseOutline } from 'react-icons/io5';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { LuLightbulb } from 'react-icons/lu';
import { HiOutlineBookOpen } from 'react-icons/hi';
import { MdOutlineAutoGraph } from 'react-icons/md';
import { VscGithubAlt } from 'react-icons/vsc';
import Image from 'next/image';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 dark:bg-black dark:bg-opacity-80 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
                  <Image src="/logos/NS icon blue.png" alt="Logo" width={32} height={32} className="mr-3" />
                  About Noise/Signal
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <IoCloseOutline size={24} />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                  A market analysis tool that helps you separate verified, high-impact insights from less relevant information.
                </p>
                
                {/* Status Box */}
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-900 dark:bg-opacity-20 border border-amber-200 dark:border-amber-700 rounded-lg p-5 mb-8">
                  <h3 className="text-amber-700 dark:text-amber-400 font-medium text-lg flex items-center mb-3">
                    <LuLightbulb className="mr-2 text-xl" /> Demo App Status
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    This is a prototype showcasing the thought mechanism behind the full app. When deployed, the Actionable Insight will function as an AI agent acting on your behalf.
                  </p>
                </div>
                
                {/* How It Works Section */}
                <div className="mb-8">
                  <h3 className="text-gray-900 dark:text-white font-medium text-lg mb-4 flex items-center">
                    <MdOutlineAutoGraph className="mr-2 text-blue-500" /> How It Works
                  </h3>
                  <ol className="text-gray-600 dark:text-gray-300 space-y-4 mb-4 pl-6 list-decimal">
                    <li className="pl-2">Enter your market research query and select an industry</li>
                    <li className="pl-2">Our AI analyzes multiple sources and research data</li>
                    <li className="pl-2">Results are categorized into Signal (high-impact) and Noise (less relevant)</li>
                    <li className="pl-2">An actionable strategic insight is generated to guide decision-making</li>
                  </ol>
                </div>
                
                {/* Signal and Noise Explanation */}
                <div className="mb-8">
                  <h3 className="text-gray-900 dark:text-white font-medium text-lg mb-4">Data Classification</h3>
                  
                  {/* Boxes Container */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Signal Box */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="rounded-full bg-green-100 dark:bg-green-900 dark:bg-opacity-30 p-2 mr-3">
                          <FaCircleCheck className="text-green-600 dark:text-green-500 text-lg" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-lg">Signal</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 pl-2">
                        Verified, high-impact insights that provide actionable intelligence
                      </p>
                    </div>
                    
                    {/* Noise Box */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-red-200 dark:border-red-800 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="rounded-full bg-red-100 dark:bg-red-900 dark:bg-opacity-30 p-2 mr-3">
                          <FaCircleXmark className="text-red-600 dark:text-red-500 text-lg" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-lg">Noise</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 pl-2">
                        Less relevant or unverified information with limited strategic value
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Research Sources Section */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-lg p-5 mb-8">
                  <h3 className="text-blue-700 dark:text-blue-400 font-medium text-lg flex items-center mb-3">
                    <HiOutlineBookOpen className="mr-2 text-xl" /> Research Sources
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We currently integrate with Perplexity and Exa research tools to gather diverse market data. 
                    As we move into full development, we plan to incorporate a wide range of research providers to deliver the most comprehensive market analysis possible.
                  </p>
                </div>
                
                <div className="text-sm text-center text-gray-500 dark:text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                  Noise/Signal © {new Date().getFullYear()} | Beta Version
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 