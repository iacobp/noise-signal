import React from 'react';
import { motion } from 'framer-motion';
import { IoSearch } from 'react-icons/io5';

interface ExampleQueriesProps {
  onSelectQuery: (query: string) => void;
  industry: string;
}

export default function ExampleQueries({ onSelectQuery, industry }: ExampleQueriesProps) {
  // Example queries customized by industry
  const exampleQueriesByIndustry: Record<string, string[]> = {
    Technology: [
      "What are the emerging AI governance frameworks?",
      "How is quantum computing affecting cybersecurity?",
      "What's the impact of extended reality on remote work?"
    ],
    Healthcare: [
      "Which personalized medicine breakthroughs are expected?",
      "How are biosensors transforming preventative healthcare?",
      "What advances in gene editing are shaping healthcare?"
    ],
    Finance: [
      "How is decentralized finance disrupting traditional banking?",
      "What are the emerging central bank digital currencies?",
      "How are AI-driven risk models changing investment strategies?"
    ],
    Retail: [
      "How is metaverse shopping transforming retail?",
      "What circular economy practices are retailers adopting?",
      "How is hyper-personalization changing customer loyalty?"
    ],
    Manufacturing: [
      "How is additive manufacturing scaling in industry?",
      "What digital twin implementations are driving efficiency?",
      "How are cobots transforming manufacturing workforce?"
    ],
    Energy: [
      "What breakthroughs in energy storage are impacting renewables?",
      "How is fusion energy progressing commercially?",
      "What carbon capture technologies are scaling?"
    ],
    Education: [
      "How are AI tutors transforming personalized learning?",
      "What microlearning platforms are gaining traction?",
      "How is extended reality changing classroom education?"
    ],
    Entertainment: [
      "How is AI-generated content transforming creative industries?",
      "What metaverse experiences are gaining mainstream adoption?",
      "How are NFTs evolving for digital content monetization?"
    ],
    "Real Estate": [
      "How is tokenized real estate changing property investment?",
      "What sustainable building technologies are becoming standard?",
      "How is remote work permanently affecting commercial real estate?"
    ],
    Transportation: [
      "What's the state of autonomous vehicle legislation?",
      "How are urban air mobility services developing?",
      "What hydrogen fuel infrastructure exists for transportation?"
    ]
  };

  // Default to Technology if the selected industry doesn't have examples
  const queries = exampleQueriesByIndustry[industry] || exampleQueriesByIndustry.Technology;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-2"
    >
      {queries.map((query, index) => (
        <button
          key={index}
          onClick={() => onSelectQuery(query)}
          className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center"
        >
          <IoSearch className="mr-2 text-gray-500 dark:text-gray-400" />
          {query}
        </button>
      ))}
    </motion.div>
  );
} 