"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, SkipForward } from 'lucide-react';

const MicroChallengeModal = ({ challenge, isOpen, onClose, onComplete }) => {
    if (!challenge) return null;

    const [timeLeft, setTimeLeft] = useState(challenge.time_minutes * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [userSubmission, setUserSubmission] = useState("");
    const [completionMessage, setCompletionMessage] = useState("");

    useEffect(() => {
        if (isOpen) {
            setTimeLeft(challenge.time_minutes * 60);
            setIsTimerRunning(false);
            setUserSubmission("");
            setCompletionMessage("");
        }
    }, [isOpen, challenge]);

    useEffect(() => {
        if (isTimerRunning && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && isTimerRunning) {
            handleComplete();
        }
    }, [isTimerRunning, timeLeft]);
    
    const handleSubmissionChange = (e) => {
        if (!isTimerRunning && !completionMessage) {
            setIsTimerRunning(true);
        }
        setUserSubmission(e.target.value);
    };

    const handleComplete = () => {
        setIsTimerRunning(false);
        let score = 0;
        
        if (challenge.id === 'mc_002') {
            const wordCount = userSubmission.trim().split(/\s+/).filter(Boolean).length;
            score = Math.max(0, 10 - Math.abs(6 - wordCount));
        } else {
            score = userSubmission.trim().length > 10 ? Math.floor(Math.random() * 3) + 8 : Math.floor(Math.random() * 4) + 4;
        }

        setCompletionMessage(`Challenge Complete! You scored ${score}/10.`);

        setTimeout(() => {
            onComplete(challenge.id, userSubmission);
            onClose();
        }, 2000);
    };

    const handleSkip = () => {
        onClose();
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((challenge.time_minutes * 60 - timeLeft) / (challenge.time_minutes * 60)) * 100;

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
                        initial={{ scale: 0.9, y: 30, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 30, opacity: 0 }}
                        className="bg-card/90 border border-primary/20 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-foreground mb-4">Micro-Challenge</h2>
                        <p className="text-lg text-muted-foreground mb-6 text-center p-4 bg-muted/50 rounded-lg">{challenge.text}</p>
                        
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="text-4xl font-mono font-bold text-primary">{formatTime(timeLeft)}</div>
                        </div>

                        <div className="w-full bg-muted/50 rounded-full h-2.5 mb-6">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 1s linear' }}></div>
                        </div>

                        <textarea
                            value={userSubmission}
                            onChange={handleSubmissionChange}
                            className="w-full p-3 rounded-lg bg-background border border-border text-foreground mb-6"
                            placeholder="Start typing to begin the timer..."
                            rows={3}
                            disabled={!!completionMessage}
                        />

                        {completionMessage && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center font-bold text-green-500 mb-4">
                                {completionMessage}
                            </motion.div>
                        )}

                        <div className="flex justify-between items-center">
                            <button onClick={handleSkip} className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground">
                                <SkipForward size={18} /> Skip
                            </button>
                            <button onClick={handleComplete} disabled={!!completionMessage} className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-500">
                                <Check size={20} /> Done
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MicroChallengeModal;