// src/app/components/tabs/newbie/QuizModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Eye, Check, Repeat, Share2, Star } from 'lucide-react';

const QuizModal = ({ isOpen, onClose, onAskFloatChat }) => {
  const [quizSets, setQuizSets] = useState([]);
  const [currentSet, setCurrentSet] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizState, setQuizState] = useState('welcome'); // welcome, active, summary

  useEffect(() => {
    if (isOpen) {
        fetch('/quiz_sets_v1.json')
            .then(response => response.json())
            .then(data => {
                setQuizSets(data);
                setQuizState('welcome');
                setCurrentSet(null);
                setScore(0);
            });
    }
  }, [isOpen]);

  const startQuiz = () => {
    if (quizSets.length === 0) return;
    const randomSet = quizSets[Math.floor(Math.random() * quizSets.length)];
    setCurrentSet(randomSet);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowHint(false);
    setShowExplanation(false);
    setQuizState('active');
  };

  const handleOptionSelect = (index) => {
    if (showExplanation) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;

    if (selectedOption === currentSet.questions[currentQuestionIndex].correct_index) {
      setScore(prev => prev + 1);
    }
    setShowExplanation(true);

    setTimeout(() => {
      if (currentQuestionIndex < currentSet.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowHint(false);
        setShowExplanation(false);
      } else {
        setQuizState('summary');
      }
    }, 2500);
  };

  const handleAskFloatChat = () => {
    const question = currentQuestion?.question;
    const explanation = currentQuestion?.explanation;
    if (question && explanation) {
        onAskFloatChat(question, explanation);
    }
  };

  const currentQuestion = currentSet ? currentSet.questions[currentQuestionIndex] : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-card/90 border border-primary/20 rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full z-10">
              <X size={20} />
            </button>

            {quizState === 'welcome' && (
              <div className="text-center p-4">
                <h2 className="text-2xl font-bold text-foreground mb-2">Ocean Quick Quiz</h2>
                <p className="text-muted-foreground mb-6">Five multiple-choice questions. Pick the best answer. You can ask FloatChat for a hint or the full explanation.</p>
                <button onClick={startQuiz} className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-all">Start Quiz</button>
              </div>
            )}

            {quizState === 'active' && currentQuestion && (
              <div>
                <div className="flex items-center mb-4 pb-3 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">Question {currentQuestionIndex + 1} of {currentSet.questions.length}</h3>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 ml-auto">
                    <Star size={16} className="text-yellow-400" />
                    <span className="text-sm font-semibold text-foreground">Score: {score}</span>
                  </div>
                </div>

                <p className="text-xl font-medium text-foreground mb-6 min-h-[60px]">{currentQuestion.question}</p>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                        selectedOption === index
                          ? 'border-cyan-400 bg-cyan-100 dark:bg-cyan-900/20' // Explicit cyan border, light cyan background for light mode
                          : 'border-border hover:border-primary/50'
                      }`}
                      disabled={showExplanation}
                    >
                      <span className="font-medium">{option}</span>
                      {selectedOption === index && <Check size={20} className="text-cyan-400" />}
                    </button>
                  ))}
                </div>

                {showHint && <p className="mt-4 text-sm italic text-muted-foreground bg-muted/50 p-3 rounded-lg">{currentQuestion.hint}</p>}
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 text-sm p-3 rounded-lg ${selectedOption === currentQuestion.correct_index ? 'bg-green-500/10 text-green-700 dark:text-green-300' : 'bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                    <p className="font-bold">{selectedOption === currentQuestion.correct_index ? 'Correct!' : 'Not quite.'}</p>
                    <p>{currentQuestion.explanation}</p>
                  </motion.div>
                )}

                <div className="flex justify-between items-center mt-6">
                  <div className="flex gap-2">
                    <button onClick={() => setShowHint(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50" disabled={showHint || showExplanation}><HelpCircle size={16} /> Hint</button>
                    <button onClick={handleAskFloatChat} className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><Eye size={16} /> Ask FloatChat</button>
                  </div>
                  <button onClick={handleSubmit} disabled={selectedOption === null || showExplanation} className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-all disabled:bg-muted disabled:cursor-not-allowed">Submit Answer</button>
                </div>
              </div>
            )}

            {quizState === 'summary' && (
              <div className="text-center p-4">
                <h2 className="text-2xl font-bold text-foreground mb-2">Nice work!</h2>
                <p className="text-4xl font-bold text-primary mb-6">{score}/{currentSet.questions.length}</p>
                <div className="flex justify-center gap-4">
                  <button onClick={startQuiz} className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><Repeat size={16} /> Retake Quiz</button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><Share2 size={16} /> Share Result</button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuizModal;