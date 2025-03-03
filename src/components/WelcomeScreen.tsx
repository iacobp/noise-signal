import React from 'react';
import { motion } from 'framer-motion';
import { IoArrowForward, IoRocketOutline, IoSearchOutline, IoSparklesOutline } from 'react-icons/io5';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div
        className="text-center max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 12 }}
          className="mb-8"
        >
          <div className="flex justify-center items-center">
            <Image src="/logos/NS icon blue.png" alt="Noise/Signal Logo" width={64} height={64} />
          </div>
          <h1 className="mt-4 text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Noise/Signal
          </h1>
          <div className="mt-2">
            <span className="text-sm bg-blue-200 dark:bg-blue-900 dark:bg-opacity-30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full font-medium border border-blue-300 dark:border-blue-700">
              Beta
            </span>
          </div>
        </motion.div>
        
        {/* Subtitle - moved from Title section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            AI-powered market intelligence that separates signal from noise for strategic decision-making
          </p>
        </motion.div>
        
        {/* Feature Boxes */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
          {/* Signal Box */}
          <motion.div 
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-md"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center mb-3">
              <div className="rounded-full bg-green-100 dark:bg-green-900 dark:bg-opacity-30 p-2 mr-3">
                <FaCircleCheck className="text-green-600 dark:text-green-500 text-lg" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Signal</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              High-impact, verified insights that drive informed strategic decisions
            </p>
          </motion.div>
          
          {/* Noise Box */}
          <motion.div 
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-md"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center mb-3">
              <div className="rounded-full bg-red-100 dark:bg-red-900 dark:bg-opacity-30 p-2 mr-3">
                <FaCircleXmark className="text-red-600 dark:text-red-500 text-lg" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Noise</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Low-relevance information filtered out to focus your decision-making
            </p>
          </motion.div>
          
          {/* Strategic Direction Box */}
          <motion.div 
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-md"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center mb-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30 p-2 mr-3">
                <IoRocketOutline className="text-blue-600 dark:text-blue-500 text-lg" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Strategy</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Clear strategic direction based on comprehensive market analysis
            </p>
          </motion.div>
        </div>
        
        {/* Quick Features */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <IoSearchOutline className="mr-2 text-blue-500" />
            <span>Industry-specific research</span>
          </div>
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <IoSparklesOutline className="mr-2 text-blue-500" />
            <span>AI-powered analysis</span>
          </div>
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <IoRocketOutline className="mr-2 text-blue-500" />
            <span>Market insights</span>
          </div>
        </motion.div>
        
        {/* Get Started Button */}
        <motion.button
          onClick={onStart}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium px-10 py-4 rounded-lg flex items-center justify-center mx-auto transition-colors shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Get Started
          <IoArrowForward className="ml-2" />
        </motion.button>
      </motion.div>
    </div>
  );
} 