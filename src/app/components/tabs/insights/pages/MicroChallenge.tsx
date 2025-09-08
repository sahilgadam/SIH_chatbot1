"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const questions = [
  {
    question: "What does an Argo float primarily measure?",
    options: ["Temperature and Salinity", "Acidity and Oxygen", "Water Color and Clarity", "Fish Population"],
    answer: "Temperature and Salinity"
  },
  {
    question: "What is a thermocline?",
    options: ["A deep-sea current", "A layer of rapid temperature change", "A type of underwater volcano", "A migration path for whales"],
    answer: "A layer of rapid temperature change"
  },
  {
    question: "What does PSU stand for in oceanography?",
    options: ["Practical Salinity Unit", "Pressure Scale Unit", "Pacific Sea Union", "Photosynthetic Usable Unit"],
    answer: "Practical Salinity Unit"
  },
  {
    question: "On average, how long does an Argo float's dive cycle take?",
    options: ["10 days", "24 hours", "30 days", "1 year"],
    answer: "10 days"
  }
];

export default function MicroChallenge({ onBack }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (option) => {
    setSelectedAnswer(option);
    if (option === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Challenge Complete!</h2>
        <p className="text-lg">You scored {score} out of {questions.length}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">Back to Insights</button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{questions[currentQuestionIndex].question}</h2>
      <div className="space-y-2">
        {questions[currentQuestionIndex].options.map(option => (
          <motion.button
            key={option}
            onClick={() => handleAnswer(option)}
            className={`w-full text-left p-3 rounded-lg border ${selectedAnswer === option ? 'bg-blue-200' : 'bg-white'}`}
            whileHover={{ scale: 1.02 }}
          >
            {option}
          </motion.button>
        ))}
      </div>
      {selectedAnswer && (
        <button onClick={nextQuestion} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          {currentQuestionIndex < questions.length - 1 ? "Next" : "Finish"}
        </button>
      )}
    </div>
  );
}