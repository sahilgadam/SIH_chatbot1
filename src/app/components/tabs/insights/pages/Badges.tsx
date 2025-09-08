"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, BrainCircuit } from 'lucide-react';

const badges = [
  {
    icon: <Award className="w-16 h-16 text-yellow-500" />,
    title: "Ocean Explorer",
    description: "Completed your first micro-challenge."
  },
  {
    icon: <BookOpen className="w-16 h-16 text-blue-500" />,
    title: "Curious Mind",
    description: "Generated 5 insights."
  },
  {
    icon: <BrainCircuit className="w-16 h-16 text-green-500" />,
    title: "Data Wizard",
    description: "Used the compare feature to analyze data."
  }
];

export default function Badges({ onBack }) {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Badges</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {badges.map((badge, index) => (
          <motion.div
            key={index}
            className="p-4 bg-white rounded-lg shadow text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-center mb-2">{badge.icon}</div>
            <h3 className="font-bold">{badge.title}</h3>
            <p className="text-sm text-gray-600">{badge.description}</p>
          </motion.div>
        ))}
      </div>
      <button onClick={onBack} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">Back to Insights</button>
    </div>
  );
}